/* =============================================================================
   FOOTER band (OGL) — the relocated Stroke motif. A denser horizontal band of
   dots flowing along the inline axis (reversed in RTL) with a gentle vertical
   wobble, ~4% green. Same budgets/gating/dispose as the hero; paused until in
   view; static SVG band remains underneath as the fallback.
   ========================================================================== */
import { Renderer, Geometry, Program, Mesh } from "ogl";
import { readFieldColors } from "./colors";

const MAX_POINTS = 12000;

const vertex = /* glsl */ `
attribute vec2 position;
attribute float a_rand;
attribute float a_green;
uniform float u_time;
uniform float u_flow;     // +1 LTR-leftward / -1 RTL-rightward
uniform float u_size;
uniform float u_dpr;
varying float v_green;
void main(){
  vec2 p = position;
  // Flow along inline axis, wrapping seamlessly across the band.
  float x = mod(p.x + 1.0 + u_time * 0.06 * u_flow, 2.0) - 1.0;
  // Gentle vertical wobble.
  float y = p.y + sin(u_time * 0.9 + p.x * 6.0 + a_rand * 6.2831) * 0.06;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = u_size * u_dpr * (a_green > 0.5 ? 1.25 : 1.0);
  v_green = a_green;
}
`;

const fragment = /* glsl */ `
precision mediump float;
uniform vec3 u_color;
uniform vec3 u_green;
varying float v_green;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = dot(uv, uv);
  if(d > 0.25) discard;
  vec3 col = mix(u_color, u_green, step(0.5, v_green));
  float edge = smoothstep(0.25, 0.16, d);
  gl_FragColor = vec4(col, 0.85 * edge);
}
`;

export function initFooterBand(canvas: HTMLCanvasElement) {
  const renderer = new Renderer({
    canvas,
    alpha: true,
    premultipliedAlpha: false,
    dpr: Math.min(1.75, window.devicePixelRatio || 1),
    webgl: 1,
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const rtl = document.documentElement.dir === "rtl";
  const colors = readFieldColors();
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    uniforms: {
      u_time: { value: 0 },
      u_flow: { value: rtl ? -1 : 1 },
      u_size: { value: 2.0 },
      u_dpr: { value: Math.min(1.75, window.devicePixelRatio || 1) },
      u_color: { value: colors.point },
      u_green: { value: colors.green },
    },
  });

  let mesh: Mesh | null = null;
  const measure = () => {
    const el = canvas.parentElement ?? canvas;
    const r = el.getBoundingClientRect();
    return { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
  };
  const build = () => {
    const { w, h } = measure();
    const gap = Math.max(6, Math.sqrt((w * h) / MAX_POINTS));
    const cols = Math.max(2, Math.floor(w / gap));
    const rows = Math.max(2, Math.floor(h / gap));
    const count = Math.min(MAX_POINTS, cols * rows);

    const positions = new Float32Array(count * 2);
    const rand = new Float32Array(count);
    const green = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions[i * 2] = ((col + 0.5) / cols) * 2 - 1;
      positions[i * 2 + 1] = 1 - ((row + 0.5) / rows) * 2;
      rand[i] = Math.random();
      green[i] = Math.random() < 0.04 ? 1 : 0;
    }
    mesh = new Mesh(gl, {
      geometry: new Geometry(gl, {
        position: { size: 2, data: positions },
        a_rand: { size: 1, data: rand },
        a_green: { size: 1, data: green },
      }),
      program,
      mode: gl.POINTS,
    });
  };

  const resize = () => {
    const { w, h } = measure();
    renderer.setSize(w, h);
    build();
  };

  const themeObserver = new MutationObserver(() => {
    const c = readFieldColors();
    program.uniforms.u_color.value = c.point;
    program.uniforms.u_green.value = c.green;
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  let raf = 0;
  let running = false;
  let warm = false;
  const frame = (t: number) => {
    program.uniforms.u_time.value = t * 0.001;
    if (mesh) renderer.render({ scene: mesh, frustumCull: false, sort: false });
    if (!warm) {
      warm = true;
      canvas.dataset.warm = "true";
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Paused until scrolled into view.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
    { threshold: 0 },
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );

  const dispose = () => {
    stop();
    io.disconnect();
    themeObserver.disconnect();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
  window.addEventListener("pagehide", dispose, { once: true });

  window.addEventListener("resize", resize);
  resize();
}
