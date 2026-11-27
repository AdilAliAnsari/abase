"use client"

import * as React from "react"
import { Platform, View, StyleSheet } from "react-native"
import Svg, { Defs, RadialGradient as SvgRadialGradient, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg'

/**
 * Velvet Haze — an out-of-focus silver-and-violet light leak on black film.
 *
 * One full-screen fragment pass. The light is a few broad gaussian lobes — a
 * silver haze high on the left, a violet bloom bleeding in at the top right, a
 * warm ember between them — cut by two shadows: a silk fold that sweeps the
 * light off the bottom of the frame, and a dark ribbon that curls in from the
 * right. Everything is domain-warped by slow fbm so the folds breathe, then a
 * film-grain pass re-rolls at its own frame rate with a little gate weave, which
 * is where the "jitter" lives.
 *
 * The pointer drags the silk: the haze gathers under it, smears along the
 * gesture and pushes the shadow back. A click sends a refractive ring through
 * it.
 *
 * Self-contained: raw WebGL2, React is the only import. No textures, no image
 * assets, no CSS file. The canvas sizes itself from its own box, never the
 * window, and releases every GL object on unmount.
 */

export type HazeParams = {
  // the light
  /** Where the silver haze is brightest, 0..1 with y down. */
  lightX: number
  lightY: number
  /** Overall exposure of the haze. */
  exposure: number
  /** How much violet bleeds in at the top right. */
  bloom: number
  /** The warm band between the violet and the shadow. */
  ember: number
  // the shadows
  /** Strength of the shadow that curls in from the right. */
  shadow: number
  /** Height of the silk fold that cuts the light off, 0..1 (y down). */
  fold: number
  /** How soft the fold's edge is. Low reads as fabric, high as fog. */
  softness: number
  // motion
  /** How far the slow fbm pushes the folds around. */
  flow: number
  speed: number
  // film
  /** Grain amplitude. The reference sits around 0.08. */
  grain: number
  /** Grain cell in CSS px. 1 is fine film, 2–3 is high-ISO. */
  grainSize: number
  /** Grain re-rolls per second. 24 reads as film; 60 as video noise. */
  grainFps: number
  /** Gate weave per grain frame, in CSS px. */
  jitter: number
  vignette: number
  // the pointer
  /** How hard the haze gathers under the pointer. */
  lens: number
  /** How far a fast gesture smears the silk. */
  drag: number
  /** Pointer reach, as a fraction of the box's short side. */
  reach: number
  // palette, dark to bright
  inkColor: string
  shadowColor: string
  emberColor: string
  violetColor: string
  lavenderColor: string
  silverColor: string
}

export const HAZE_DEFAULTS: HazeParams = {
  lightX: 0.34,
  lightY: 0.2,
  exposure: 1,
  bloom: 1,
  ember: 0.7,

  shadow: 1,
  fold: 0.5,
  softness: 1,

  flow: 1,
  speed: 1,

  grain: 0.085,
  grainSize: 1,
  grainFps: 24,
  jitter: 0.6,
  vignette: 0.5,

  lens: 0.6,
  drag: 1,
  reach: 0.42,

  inkColor: "#111112",
  shadowColor: "#060506",
  emberColor: "#86705f",
  violetColor: "#9a4fb0",
  lavenderColor: "#b6acd6",
  silverColor: "#d2d1d6",
}

/** Overlays on the defaults. Named for the light, not the numbers. */
export const HAZE_PRESETS: Record<string, Partial<HazeParams>> = {
  velvet: {},
  chrome: {
    bloom: 0.15, ember: 0.2, lavenderColor: "#c4c7cf", violetColor: "#7d8796",
    emberColor: "#6f6f72", grain: 0.07,
  },
  rose: {
    violetColor: "#c4507e", lavenderColor: "#d8b4c4", emberColor: "#8a5a4a",
    silverColor: "#ddd3d3", lightX: 0.42,
  },
  aqua: {
    violetColor: "#2f8fa8", lavenderColor: "#a8c6d4", emberColor: "#4f6a64",
    silverColor: "#cfd8da", inkColor: "#0b0e10", shadowColor: "#040607",
  },
  ember: {
    violetColor: "#c8582a", lavenderColor: "#d6b9a0", emberColor: "#8a4a2a",
    silverColor: "#dcd4cb", inkColor: "#100c0a", bloom: 1.2, ember: 1,
  },
}

const MAX_RIPPLES = 4

type Kind = "f" | "c"
type Slot = [keyof HazeParams, Kind]

/** Which parameters reach the shader, and as what. `c` is a hex colour. */
const UNIFORMS: Slot[] = [
  ["lightX", "f"], ["lightY", "f"], ["exposure", "f"], ["bloom", "f"], ["ember", "f"],
  ["shadow", "f"], ["fold", "f"], ["softness", "f"],
  ["flow", "f"],
  ["grain", "f"], ["grainSize", "f"], ["jitter", "f"], ["vignette", "f"],
  ["lens", "f"], ["drag", "f"], ["reach", "f"],
  ["inkColor", "c"], ["shadowColor", "c"], ["emberColor", "c"],
  ["violetColor", "c"], ["lavenderColor", "c"], ["silverColor", "c"],
]

const uName = (k: string) => "u" + k[0].toUpperCase() + k.slice(1)
const declare = (slots: Slot[]) =>
  slots.map(([k, kind]) => "uniform " + (kind === "c" ? "vec3" : "float") + " " + uName(k) + ";").join("\n")

const VERT = `#version 300 es
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uFrame;
uniform vec2 uLamp;
uniform float uLampOn;
uniform vec2 uSmear;
uniform vec4 uRipple[${MAX_RIPPLES}];
${declare(UNIFORMS)}
out vec4 frag;

float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++){
    v += a * noise(p);
    p = r * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}
// An axis-aligned gaussian lobe: 1 at c, falling off over s.
float lobe(vec2 q, vec2 c, vec2 s){
  vec2 d = (q - c) / s;
  return exp(-dot(d, d));
}

void main(){
  vec2 px = gl_FragCoord.xy / max(uDpr, 1.0);
  vec2 cssRes = uRes / max(uDpr, 1.0);
  float aspect = uRes.x / uRes.y;
  vec2 asp = vec2(aspect, 1.0);
  float t = uTime;

  // Gate weave: the whole frame shivers a fraction of a pixel per grain frame.
  vec2 weave = (vec2(hash12(vec2(uFrame, 3.1)), hash12(vec2(7.7, uFrame))) - 0.5) * uJitter / cssRes;
  vec2 uv = gl_FragCoord.xy / uRes + weave;
  uv.y = 1.0 - uv.y;

  // ---- the pointer drags the silk ------------------------------------------
  vec2 q = uv;
  vec2 dm = (q - uLamp) * asp;
  float reach = max(uReach, 0.02);
  float fall = exp(-dot(dm, dm) / (reach * reach));
  q += (uLamp - q) * fall * uLens * 0.32 * uLampOn;
  q -= uSmear * fall * uDrag;

  // A click: a refractive ring, gone in a second and a half.
  float ring = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++){
    vec4 r = uRipple[i];
    if (r.w <= 0.0) continue;
    float age = t - r.z;
    if (age < 0.0 || age > 2.0) continue;
    vec2 rd = (q - r.xy) * asp;
    float dist = length(rd);
    float w = exp(-pow((dist - age * 0.55) / 0.06, 2.0)) * exp(-age * 1.8) * r.w;
    q += (rd / max(dist, 1e-4)) / asp * w * 0.03;
    ring += w;
  }

  // ---- slow silk flow ------------------------------------------------------
  float ts = t * 0.06;
  vec2 warp = vec2(fbm(q * 1.4 + vec2(0.0, ts)), fbm(q * 1.4 + vec2(5.2, 1.3 - ts * 0.8))) - 0.5;
  q += warp * 0.2 * uFlow;
  float sway = sin(q.x * 3.3 + t * 0.21) * 0.025 + sin(q.x * 7.1 - t * 0.13) * 0.01;

  // ---- light ---------------------------------------------------------------
  vec2 lc = vec2(uLightX, uLightY);
  // The fold: where the silk turns away from the light. Low on the left, dips
  // under the light, rides back up into the shadow on the right.
  float edge = uFold - 0.05 + 0.2 * smoothstep(0.02, 0.5, q.x) - 0.1 * smoothstep(0.45, 1.0, q.x) + sway;
  float soft = mix(0.03, 0.12, smoothstep(0.0, 0.8, q.x)) * uSoftness + 0.004;
  float folded = smoothstep(edge + soft, edge - soft, q.y);

  float haze = lobe(q, lc, vec2(0.75, 0.52));
  // The silk underneath the fold catches a little light of its own.
  float under = lobe(q, lc + vec2(0.1, 0.36), vec2(0.24, 0.1)) * 0.34;
  float silver = (min(haze * 1.18, 1.0) * folded + under) * uExposure;

  float violet = lobe(q, vec2(0.7, 0.0), vec2(0.27, 0.24)) * uBloom;
  float lavender = lobe(q, vec2(0.5, 0.02), vec2(0.3, 0.24));
  float ember = lobe(q, vec2(0.66, 0.28), vec2(0.18, 0.09)) * uEmber;

  vec3 col = uInkColor;
  vec3 lightCol = mix(uSilverColor, uLavenderColor, lavender * 0.8);
  col = mix(col, lightCol, clamp(silver, 0.0, 1.0));
  col = mix(col, uVioletColor, clamp(violet, 0.0, 1.0) * 0.72);
  col = mix(col, uEmberColor, clamp(ember, 0.0, 1.0) * 0.75);

  // ---- shadow --------------------------------------------------------------
  // A dark mass curls in from the right along a diagonal that climbs toward
  // the violet; the lamp pushes it back.
  float push = 1.0 - fall * 0.55 * uLampOn;
  vec2 sn = vec2(0.874, 0.486);
  float sd = dot(q - vec2(0.6, 0.37), sn) + sway * 0.8;
  float mass = smoothstep(-0.14, 0.26, sd);
  float shade = clamp(mass * uShadow * push, 0.0, 1.0);
  col = mix(col, uShadowColor, shade * 0.97);
  // Where the silk turns back into the shadow it catches a thin sheen.
  col += uSilverColor * lobe(q, vec2(0.67, 0.53), vec2(0.13, 0.05)) * 0.14 * uExposure;

  // The bottom of the frame is unlit film.
  col = mix(col, uInkColor, smoothstep(0.62, 0.92, uv.y) * 0.8);

  // ---- lamp, ring, vignette ------------------------------------------------
  col += uSilverColor * (fall * 0.08 * uLampOn + ring * 0.07);
  vec2 v = (uv - vec2(0.36, 0.3)) * vec2(1.0, 1.1);
  col = mix(col, uInkColor * 0.85, uVignette * smoothstep(0.45, 1.1, length(v)));

  // ---- film grain: re-rolled at its own rate, not the display's --------------
  vec2 gp = floor(px / max(uGrainSize, 0.5));
  float g = hash12(gp + uFrame * vec2(17.13, 31.71)) - 0.5;
  float g2 = hash12(floor(gp * 0.5) + uFrame * vec2(5.3, 9.7)) - 0.5;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += (g * 0.8 + g2 * 0.35) * uGrain * (0.55 + 0.9 * sqrt(lum));

  frag = vec4(clamp(col, 0.0, 1.0), 1.0);
}`

// #region film
/** "#f0a" / "#ff00aa" → [r, g, b] in 0..1. Anything unparsable is black. */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0]
  const v = parseInt(h, 16)
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

/**
 * Which grain frame a clock time falls on. Grain re-rolls at `fps`, not at the
 * display rate, so 24 reads as film on a 120 Hz screen too. 0 freezes it.
 */
export function grainFrame(seconds: number, fps: number) {
  if (!(fps > 0) || !Number.isFinite(seconds)) return 0
  return Math.floor(seconds * Math.min(fps, 120)) % 4096
}

/** The idle lamp: drifts around the light on incommensurate sines. */
export function driftPos(t: number) {
  const x = 0.42 + 0.22 * Math.sin(t * 0.19) + 0.08 * Math.sin(t * 0.071 + 1.3)
  const y = 0.38 + 0.16 * Math.cos(t * 0.15) + 0.06 * Math.cos(t * 0.047 + 4.2)
  return [Math.min(Math.max(x, 0.08), 0.92), Math.min(Math.max(y, 0.08), 0.92)]
}

// #endregion

export type VelvetHazeProps = {
  /**
   * Explicit height. The canvas fills this box, so it must be a definite
   * length — "100%" only works if every ancestor has one too.
   */
  height?: string
  /** A named palette, layered over the defaults. */
  preset?: keyof typeof HAZE_PRESETS
  /** Overrides layered over the preset. */
  params?: Partial<HazeParams>
  /** Pointer drags the silk and pushes the shadow back; click sends a ring. */
  interactive?: boolean
  /** Device-pixel-ratio cap. Grain is per-pixel, so 2 is plenty. */
  maxDpr?: number
  /** Content laid over the haze. Pointer events pass through unless opted in. */
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties | any
}

export default function VelvetHaze({
  height = "100svh",
  preset = "velvet",
  params,
  interactive = true,
  maxDpr = 2,
  children,
  className = "",
  style,
}: VelvetHazeProps) {
  // Defaults < preset < explicit params.
  const P = React.useMemo<HazeParams>(
    () => ({ ...HAZE_DEFAULTS, ...(HAZE_PRESETS[preset] ?? {}), ...(params ?? {}) }),
    [preset, params],
  )

  // -------------------------------------------------------------
  // Native (iOS / Android) Fallback with matching gradient layers
  // -------------------------------------------------------------
  if (Platform.OS !== "web") {
    return (
      <View style={[{ flex: 1, backgroundColor: P.inkColor, position: 'relative' }, style]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Violet Bloom top right + Silver Haze top left + Warm Ember */}
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgRadialGradient id="violetBloom" cx="85%" cy="0%" rx="60%" ry="60%">
                <Stop offset="0%" stopColor="#9a4fb0" stopOpacity="0.45" />
                <Stop offset="50%" stopColor="#9a4fb0" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#9a4fb0" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="silverHaze" cx="25%" cy="15%" rx="55%" ry="55%">
                <Stop offset="0%" stopColor="#d2d1d6" stopOpacity="0.22" />
                <Stop offset="50%" stopColor="#b6acd6" stopOpacity="0.12" />
                <Stop offset="100%" stopColor="#b6acd6" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgLinearGradient id="warmEmber" x1="50%" y1="25%" x2="80%" y2="50%">
                <Stop offset="0%" stopColor="#86705f" stopOpacity="0" />
                <Stop offset="50%" stopColor="#86705f" stopOpacity="0.18" />
                <Stop offset="100%" stopColor="#86705f" stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#violetBloom)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#silverHaze)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#warmEmber)" />
          </Svg>
        </View>
        {children ? (
          <View style={{ flex: 1, zIndex: 10 }}>{children}</View>
        ) : null}
      </View>
    );
  }

  // -------------------------------------------------------------
  // Web: Raw WebGL2 Canvas implementation
  // -------------------------------------------------------------
  const rootRef = React.useRef<HTMLElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = React.useState(false)
  const [generation, setGeneration] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (!mq) return
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // The loop reads through a ref, so tuning a value never restarts WebGL.
  const paramsRef = React.useRef(P)
  paramsRef.current = P

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: "high-performance",
    })
    if (!gl) {
      setFailed(true)
      return
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("velvet-haze:", gl.getShaderInfoLog(s))
        gl.deleteShader(s)
        return null
      }
      return s
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    const program = vs && fs ? gl.createProgram() : null
    if (!program || !vs || !fs) {
      setFailed(true)
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("velvet-haze:", gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      setFailed(true)
      return
    }

    const loc = (n: string) => gl.getUniformLocation(program, n)
    const tuned = UNIFORMS.map(([k, kind]) => [loc(uName(k)), k, kind] as const)
    const U = {
      res: loc("uRes"), dpr: loc("uDpr"), time: loc("uTime"), frame: loc("uFrame"),
      lamp: loc("uLamp"), lampOn: loc("uLampOn"), smear: loc("uSmear"), ripple: loc("uRipple"),
    }
    const vao = gl.createVertexArray()

    // ---- sizing, from the element rather than the window --------------------
    let cssW = 1
    let cssH = 1
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(maxDpr, 0.5))
      cssW = Math.max(canvas.clientWidth, 1)
      cssH = Math.max(canvas.clientHeight, 1)
      const w = Math.floor(cssW * dpr)
      const h = Math.floor(cssH * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      if (reduced) paint()
    }

    // Reduced motion freezes the clock — and the grain — on one frame.
    const FROZEN = 9
    const t0 = performance.now()
    const clock = () => (reduced ? FROZEN : ((performance.now() - t0) / 1000) * paramsRef.current.speed)
    const wall = () => (reduced ? FROZEN : (performance.now() - t0) / 1000)
    let lastClock = 0

    // ---- the pointer --------------------------------------------------------
    let targetX = 0.5
    let targetY = 0.4
    let lampX = 0.5
    let lampY = 0.4
    let smearX = 0
    let smearY = 0
    let lampOn = 0
    let inside = false
    let lastTouched = -1e9
    const ripples = new Float32Array(MAX_RIPPLES * 4)
    let rippleNext = 0

    const toUv = (e: PointerEvent): [number, number] => {
      const r = canvas.getBoundingClientRect()
      return [
        Math.min(Math.max((e.clientX - r.left) / Math.max(r.width, 1), 0), 1),
        Math.min(Math.max((e.clientY - r.top) / Math.max(r.height, 1), 0), 1),
      ]
    }
    const onMove = (e: PointerEvent) => {
      if (!interactive) return
      ;[targetX, targetY] = toUv(e)
      inside = true
      lastTouched = performance.now() / 1000
    }
    const onLeave = () => {
      inside = false
    }
    const onDown = (e: PointerEvent) => {
      if (!interactive || e.button > 0) return
      // Let buttons and links in the overlay keep their clicks.
      if ((e.target as HTMLElement | null)?.closest("a,button,input,textarea,select,label,[role=button]")) return
      const [x, y] = toUv(e)
      targetX = x
      targetY = y
      inside = true
      lastTouched = performance.now() / 1000
      if (reduced) return
      ripples.set([x, y, clock(), 1], rippleNext * 4)
      rippleNext = (rippleNext + 1) % MAX_RIPPLES
    }

    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerdown", onDown)
    root.addEventListener("pointerleave", onLeave)
    root.addEventListener("pointercancel", onLeave)

    let raf = 0
    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onRestored = () => setGeneration((g) => g + 1)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    // ---- one frame ----------------------------------------------------------
    const paint = () => {
      const p = paramsRef.current
      const t = clock()
      const dt = Math.min(Math.max(t - lastClock, 0), 0.1)
      lastClock = t

      // With no hand on it the lamp drifts on its own, so the silk never sits
      // dead — and a still capture of it still shows a fold being pulled.
      const idle = !inside || performance.now() / 1000 - lastTouched > 5
      const [gx, gy] = driftPos(t)
      const wantX = idle ? gx : targetX
      const wantY = idle ? gy : targetY
      const k = reduced ? 1 : 1 - Math.exp(-dt * (idle ? 1.2 : 6))
      const nx = lampX + (wantX - lampX) * k
      const ny = lampY + (wantY - lampY) * k
      // The smear trails the lamp's velocity and relaxes back to nothing.
      if (!reduced && dt > 0) {
        const vx = Math.max(Math.min((nx - lampX) / dt, 3), -3)
        const vy = Math.max(Math.min((ny - lampY) / dt, 3), -3)
        const ks = 1 - Math.exp(-dt * 5)
        smearX += (vx * 0.06 - smearX) * ks
        smearY += (vy * 0.06 - smearY) * ks
      }
      lampX = nx
      lampY = ny
      const onTarget = interactive && !reduced ? (idle ? 0.5 : 1) : 0
      lampOn += (onTarget - lampOn) * (reduced ? 1 : 1 - Math.exp(-dt * 3))

      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      for (const [l, key, kind] of tuned) {
        const v = p[key]
        if (kind === "c") gl.uniform3fv(l, hexToRgb(v as string))
        else gl.uniform1f(l, v as number)
      }
      gl.uniform2f(U.res, canvas.width, canvas.height)
      gl.uniform1f(U.dpr, canvas.width / cssW)
      gl.uniform1f(U.time, t)
      gl.uniform1f(U.frame, grainFrame(wall(), p.grainFps))
      gl.uniform2f(U.lamp, lampX, lampY)
      gl.uniform1f(U.lampOn, lampOn)
      gl.uniform2f(U.smear, smearX, smearY)
      gl.uniform4fv(U.ripple, ripples)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // ---- loop, paused whenever nobody can see it -----------------------------
    let visible = true
    const frame = () => {
      raf = 0
      paint()
      if (visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting)
      wake()
    })
    io.observe(root)
    document.addEventListener("visibilitychange", wake)

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // Paint before the first rAF so nothing ever flashes an empty canvas.
    paint()
    if (!reduced) wake()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", wake)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerdown", onDown)
      root.removeEventListener("pointerleave", onLeave)
      root.removeEventListener("pointercancel", onLeave)
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
    }
  }, [interactive, reduced, generation, maxDpr])

  return (
    <section
      ref={rootRef}
      className={
        "relative w-full overflow-hidden " + (interactive ? "cursor-crosshair touch-pan-y " : "") + className
      }
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        height,
        background: P.inkColor,
        ...(style || {}),
      }}
      aria-label="A soft silver and violet light leak on grainy black film"
    >
      {failed ? (
        // No WebGL2: a still picture of the same light beats a black box.
        <div
          className="absolute inset-0"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(40% 30% at 74% 0%, " + P.violetColor + " 0%, transparent 70%)," +
              "linear-gradient(160deg, transparent 52%, " + P.shadowColor + " 70%)," +
              "radial-gradient(60% 50% at 34% 26%, " + P.silverColor + " 0%, " + P.lavenderColor + " 30%, transparent 72%)," +
              P.inkColor,
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
      )}
      {children ? (
        <div
          className="relative z-10 flex h-full w-full flex-col pointer-events-none"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              flex: 1,
              pointerEvents: "auto",
            }}
          >
            {children}
          </div>
        </div>
      ) : null}
    </section>
  )
}

