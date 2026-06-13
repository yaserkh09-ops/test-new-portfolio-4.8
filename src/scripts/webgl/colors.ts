/* Read point + green colours from the live CSS tokens so the WebGL fields retint
   on theme switch (greens stay mode-locked because --accent is mode-locked). */
export type RGB = [number, number, number];

function hexToRGB(hex: string): RGB {
  const h = hex.trim().replace("#", "");
  const full =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function readFieldColors(): { point: RGB; green: RGB } {
  const cs = getComputedStyle(document.documentElement);
  const dark = document.documentElement.dataset.theme === "dark";
  // ink points on paper (light) / paper points on surface (dark)
  const point = hexToRGB(cs.getPropertyValue(dark ? "--paper" : "--ink") || (dark ? "#F8F6F1" : "#111111"));
  const green = hexToRGB(cs.getPropertyValue("--accent") || (dark ? "#3FBF7F" : "#0B7A40"));
  return { point, green };
}
