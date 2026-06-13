/* =============================================================================
   HERO field (OGL). ~20k points on the brand grid (~8px, cap 40k, DPR<=1.75),
   displaced by curl noise. ~4% are signal green with a centred-gravity breathe +
   slow tangential orbit, and ~10 CPU-animated gravity wells orbit near centre and
   "boil" nearby ink/paper points. Cursor proximity repels (springy, CPU-lerped).
   Pauses when hidden/offscreen; disposes on pagehide; retints on theme switch.
   ========================================================================== */
import { Renderer, Geometry, Program, Mesh } from "ogl";
import { NOISE_GLSL } from "./noise";
import { readFieldColors } from "./colors";

const WELLS = 10;
const MAX_POINTS = 40000;
const TARGET_POINTS = 20000;

const vertex = /* glsl */ `
attribute vec2 position;
attribute float a_rand;
attribute float a_green;
uniform float u_time;
uniform vec2  u_pointer;
uniform float u_pointerActive;
uniform vec2  u_aspect;
uniform vec2  u_wells[${WELLS}];
uniform float u_size;
uniform float u_dpr;
varying float v_green;
${NOISE_GLSL}
void main(){
  vec2 p = position;
  vec2 disp = curlNoise(p * 1.3 + vec2(u_time * 0.03, -u_time * 0.025)) * 0.012;

  // Gravity wells boil nearby points (green ones resist a touch).
  for(int i = 0; i < ${WELLS}; i++){
    vec2 d = (p - u_wells[i]) * u_aspect;
    float dist = length(d);
    float fall = exp(-dist * 6.0);
    float osc = sin(u_time * 1.5 + float(i) * 1.7 + a_rand * 6.2831);
    disp += normalize(d + 1e-4) * fall * 0.018 * osc * (a_green > 0.5 ? 0.5 : 1.0);
  }

  // Green points: breathe toward canvas centre + slow tangential orbit.
  if(a_green > 0.5){
    disp += (-p) * 0.020 * (0.5 + 0.5 * sin(u_time * 0.8 + a_rand * 6.2831));
    disp += normalize(vec2(-p.y, p.x) + 1e-4) * 0.010 * sin(u_time * 0.4 + a_rand * 6.2831);
  }

  // Cursor repel (u_pointer is CPU-lerped for spring).
  vec2 pd = (p - u_pointer) * u_aspect;
  float rep = smoothstep(0.45, 0.0, length(pd)) * u_pointerActive;
  disp += normalize(pd + 1e-4) * rep * 0.06;

  gl_Position = vec4(p + disp, 0.0, 1.0);
  gl_PointSize = u_size * u_dpr * (a_green > 0.5 ? 1.3 : 1.0);
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
  gl_FragColor = vec4(col, 0.9 * edge);
}
`;

export function initHeroField(canvas: HTMLCanvasElement) {
  const renderer = new Renderer({
    canvas,
    alpha: true,
    premultipliedAlpha: false,
    dpr: Math.min(1.75, window.devicePixelRatio || 1),
    powerPreference: "high-performance",
    webgl: 1,
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const colors = readFieldColors();
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    uniforms: {
      u_time: { value: 0 },
      u_pointer: { value: [0, 0] },
      u_pointerActive: { value: 0 },
      u_aspect: { value: [1, 1] },
      u_wells: { value: new Float32Array(WELLS * 2) },
      u_size: { value: 2.1 },
      u_dpr: { value: Math.min(1.75, window.devicePixelRatio || 1) },
      u_color: { value: colors.point },
      u_green: { value: colors.green },
    },
  });

  let mesh: Mesh | null = null;

  // Measure the parent (canvas gets inline px size from OGL.setSize, so reading
  // the canvas itself would go stale after the first resize).
  const measure = () => {
    const el = canvas.parentElement ?? canvas;
    const r = el.getBoundingClientRect();
    return { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
  };

  const build = () => {
    const { w, h } = measure();
    // ~8px gap, but grow it so the count stays within budget.
    const gap = Math.max(8, Math.sqrt((w * h) / MAX_POINTS));
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
      green[i] = Math.random() < 0.04 ? 1 : 0; // ~4% signal green
    }

    const geometry = new Geometry(gl, {
      position: { size: 2, data: positions },
      a_rand: { size: 1, data: rand },
      a_green: { size: 1, data: green },
    });
    mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });
  };

  const resize = () => {
    const { w, h } = measure();
    renderer.setSize(w, h);
    const aspect = w >= h ? [w / h, 1] : [1, h / w];
    (program.uniforms.u_aspect.value as number[])[0] = aspect[0];
    (program.uniforms.u_aspect.value as number[])[1] = aspect[1];
    build();
  };

  // --- Pointer (springy repel) ----------------------------------------
  const target = { x: 0, y: 0, active: 0 };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    target.y = 1 - ((e.clientY - r.top) / r.height) * 2;
    target.active = 1;
  };
  const onLeave = () => (target.active = 0);
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerleave", onLeave);

  // --- Theme retint ----------------------------------------------------
  const themeObserver = new MutationObserver(() => {
    const c = readFieldColors();
    program.uniforms.u_color.value = c.point;
    program.uniforms.u_green.value = c.green;
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // --- Loop with visibility + offscreen pausing -----------------------
  let raf = 0;
  let running = false;
  let warm = false;
  const wells = program.uniforms.u_wells.value as Float32Array;
  const ptr = program.uniforms.u_pointer.value as number[];

  const frame = (t: number) => {
    const time = t * 0.001;
    program.uniforms.u_time.value = time;

    // 10 wells orbit near centre.
    for (let i = 0; i < WELLS; i++) {
      const a = time * (0.15 + i * 0.02) + i * 1.7;
      const rad = 0.18 + 0.12 * Math.sin(time * 0.2 + i);
      wells[i * 2] = Math.cos(a) * rad;
      wells[i * 2 + 1] = Math.sin(a * 1.1) * rad * 0.8;
    }

    // Spring the pointer toward target.
    ptr[0] += (target.x - ptr[0]) * 0.1;
    ptr[1] += (target.y - ptr[1]) * 0.1;
    program.uniforms.u_pointerActive.value +=
      (target.active - (program.uniforms.u_pointerActive.value as number)) * 0.08;

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

  // Pause when offscreen.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0 },
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );

  // Dispose GL on pagehide.
  const dispose = () => {
    stop();
    io.disconnect();
    themeObserver.disconnect();
    window.removeEventListener("pointermove", onMove);
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  };
  window.addEventListener("pagehide", dispose, { once: true });

  window.addEventListener("resize", resize);
  resize();
  start();
}
