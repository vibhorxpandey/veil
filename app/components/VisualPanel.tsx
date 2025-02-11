"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MermaidViz   = { type: "mermaid"; code: string }
export type ChartViz     = { type: "chart"; chartType: "bar"|"line"|"pie"|"scatter"|"doughnut"; title: string; labels: string[]; datasets: { label: string; data: number[]; color?: string }[] }
export type MindmapViz   = { type: "mindmap"; center: string; branches: { label: string; color?: string; items: string[] }[] }
export type PhysicsViz   = { type: "physics"; scene: "projectile"|"pendulum"|"wave"|"spring"; params?: Record<string, number> }
export type FuncViz      = { type: "function"; expression: string; xMin?: number; xMax?: number; title?: string }
export type HologramViz  = { type: "hologram"; shape: "sphere"|"dna"|"neural"|"torus"|"crystal"|"molecule"; title?: string; color?: string }
export type ParticleViz  = { type: "particles"; pattern: "galaxy"|"vortex"|"wave"|"field"|"nebula"; title?: string; color?: string }
export type AnyViz       = MermaidViz | ChartViz | MindmapViz | PhysicsViz | FuncViz | HologramViz | ParticleViz

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parseVisual(text: string): { cleanText: string; visual: AnyViz | null } {
  const match = text.match(/VEIL_VIZ_START\s*([\s\S]*?)\s*VEIL_VIZ_END/)
  if (!match) return { cleanText: text, visual: null }
  try {
    const visual = JSON.parse(match[1].trim()) as AnyViz
    const cleanText = text.replace(/\n*VEIL_VIZ_START[\s\S]*?VEIL_VIZ_END\n*/g, "").trim()
    return { cleanText, visual }
  } catch {
    return { cleanText: text, visual: null }
  }
}

export function detectDomain(input: string): string {
  const l = input.toLowerCase()
  if (/\b(3d|hologram|holographic|rotate|rotating|sphere|dna|helix|molecule|molecular|protein structure|neural.*3d|3d.*neural|crystal|torus|animate.*3d|3d.*anim)\b/.test(l)) return "hologram"
  if (/\b(particle|galaxy|nebula|vortex|field|quantum|cosmos|universe|star|simulation|fluid|flow field)\b/.test(l)) return "particles"
  if (/\b(sort|algorithm|bubble|merge|quicksort|bfs|dfs|dijkstra|flowchart|flow chart|process flow|step[s]?\b|workflow|procedure|pseudocode)\b/.test(l)) return "flowchart"
  if (/\b(graph|chart|plot|data|statistic|compare|comparison|trend|percentage|distribution|dataset|regression|correlation|histogram|bar chart)\b/.test(l)) return "chart"
  if (/\b(function|equation|formula|sin|cos|tan|derivative|integral|curve|polynomial|calculus|f\(x\)|y\s*=)\b/.test(l)) return "function"
  if (/\b(projectile|pendulum|wave|oscillat|spring|gravity|velocity|acceleration|force|momentum|physics simulation)\b/.test(l)) return "physics"
  if (/\b(explain|concept|overview|what is|how does|mind map|summariz|breakdown|relationship between|components of)\b/.test(l)) return "mindmap"
  if (/\b(code|implement|write a|program|function that|class|method|logic)\b/.test(l)) return "flowchart"
  return "none"
}

export function buildVisualPrompt(domain: string): string {
  if (domain === "none") return ""
  const specs: Record<string, object> = {
    flowchart: { type:"mermaid", code:"graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Process]\n  B -->|No| D[Alternative]\n  C --> E[End]\n  D --> E" },
    chart:     { type:"chart", chartType:"bar", title:"Comparison", labels:["Item A","Item B","Item C","Item D"], datasets:[{ label:"Value", data:[42,71,28,55] }] },
    function:  { type:"function", expression:"Math.sin(x)", xMin:-6.28, xMax:6.28, title:"Function Plot" },
    physics:   { type:"physics", scene:"projectile", params:{ angle:45, velocity:30, gravity:9.8 } },
    mindmap:   { type:"mindmap", center:"Main Concept", branches:[{ label:"Branch 1", color:"#8b5cf6", items:["Sub A","Sub B"] },{ label:"Branch 2", color:"#3b82f6", items:["Sub C","Sub D"] },{ label:"Branch 3", color:"#10b981", items:["Sub E","Sub F"] }] },
  }
  const example = specs[domain] ?? specs.mindmap
  return `\n\nAt the very end of your response, append a visualization spec tailored to this specific content. Use EXACTLY this format:\n\nVEIL_VIZ_START\n${JSON.stringify(example, null, 2)}\nVEIL_VIZ_END\n\nReplace the example values with REAL values from your actual response. For mermaid, write valid Mermaid syntax with actual steps/decisions from the content. For charts, use real data labels and values from your answer. For mindmaps, use the real concepts you explain. Make it specific and accurate — not just the example.`
}

// ─── Mermaid View ─────────────────────────────────────────────────────────────

function MermaidView({ code }: { code: string }) {
  const ref  = useRef<HTMLDivElement>(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    if (!ref.current) return
    import("mermaid").then(m => {
      const mermaid = m.default
      mermaid.initialize({ theme: "dark", themeVariables: { primaryColor: "#8b5cf6", primaryTextColor: "#ededff", primaryBorderColor: "#8b5cf6", lineColor: "#7878a8", secondaryColor: "#0f0f1c", tertiaryColor: "#050508", background: "#0a0a14", mainBkg: "#0f0f1c", nodeBorder: "#8b5cf6", clusterBkg: "#0f0f1c", titleColor: "#ededff", edgeLabelBackground: "#0f0f1c" }, fontFamily: "system-ui, sans-serif", fontSize: 13 })
      const id = "veil-mermaid-" + Math.random().toString(36).slice(2)
      mermaid.render(id, code).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg
      }).catch(e => setErr(String(e)))
    }).catch(() => setErr("Mermaid failed to load"))
  }, [code])

  if (err) return <div style={{ color: "#ef4444", fontSize: "13px", padding: "16px" }}>Could not render diagram: {err}</div>
  return <div ref={ref} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }} />
}

// ─── Chart View ───────────────────────────────────────────────────────────────

const PALETTE = ["#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4"]

function ChartView({ viz }: { viz: ChartViz }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (!canvasRef.current) return
    import("chart.js/auto").then(m => {
      const Chart = m.default
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
      const datasets = viz.datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: viz.chartType === "line"
          ? `${PALETTE[i % PALETTE.length]}33`
          : ds.data.map((_, j) => PALETTE[j % PALETTE.length]),
        borderColor: PALETTE[i % PALETTE.length],
        borderWidth: 2,
        borderRadius: viz.chartType === "bar" ? 6 : 0,
        tension: 0.4,
        fill: viz.chartType === "line",
        pointBackgroundColor: PALETTE[i % PALETTE.length],
        pointRadius: 4,
      }))
      chartRef.current = new Chart(canvasRef.current!, {
        type: viz.chartType,
        data: { labels: viz.labels, datasets },
        options: {
          responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
          plugins: {
            legend: { labels: { color: "#ededff", font: { size: 12 } }, position: "top" },
            title: { display: !!viz.title, text: viz.title, color: "#ededff", font: { size: 14, weight: "bold" } },
            tooltip: { backgroundColor: "#0f0f1c", titleColor: "#ededff", bodyColor: "#7878a8", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 },
          },
          scales: viz.chartType === "pie" || viz.chartType === "doughnut" ? {} : {
            x: { ticks: { color: "#7878a8" }, grid: { color: "rgba(255,255,255,0.06)" } },
            y: { ticks: { color: "#7878a8" }, grid: { color: "rgba(255,255,255,0.06)" } },
          },
        },
      })
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [viz])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
}

// ─── Function Plotter ─────────────────────────────────────────────────────────

function FuncView({ viz }: { viz: FuncViz }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; if (!ctx) return
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth; const h = canvas.offsetHeight
    const xMin = viz.xMin ?? -10; const xMax = viz.xMax ?? 10
    const toX = (x: number) => ((x - xMin) / (xMax - xMin)) * w
    const samples = 800; const ys: number[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = (x: number): number => { try { return Function("x", "Math", `return ${viz.expression}`)(x, Math) } catch { return NaN } }
    for (let i = 0; i <= samples; i++) {
      const x = xMin + (i / samples) * (xMax - xMin)
      ys.push(f(x))
    }
    const validYs = ys.filter(y => isFinite(y))
    const yMin = Math.min(...validYs); const yMax = Math.max(...validYs)
    const yPad = (yMax - yMin) * 0.1 || 1
    const toY = (y: number) => h - ((y - (yMin - yPad)) / ((yMax + yPad) - (yMin - yPad))) * h
    ctx.fillStyle = "#050508"; ctx.fillRect(0, 0, w, h)
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1
    for (let gx = Math.ceil(xMin); gx <= xMax; gx++) { const px = toX(gx); ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke() }
    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5
    const zeroY = toY(0); const zeroX = toX(0)
    ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, h); ctx.stroke()
    // Curve
    const grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0, "#8b5cf6"); grad.addColorStop(0.5, "#3b82f6"); grad.addColorStop(1, "#10b981")
    ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.beginPath()
    let started = false
    for (let i = 0; i <= samples; i++) {
      const x = xMin + (i / samples) * (xMax - xMin); const y = f(x)
      if (!isFinite(y)) { started = false; continue }
      const px = toX(x); const py = toY(y)
      if (!started) { ctx.moveTo(px, py); started = true } else { ctx.lineTo(px, py) }
    }
    ctx.stroke()
    // Title
    if (viz.title) { ctx.fillStyle = "#ededff"; ctx.font = "bold 13px system-ui"; ctx.fillText(viz.title, 12, 24) }
    ctx.fillStyle = "#7878a8"; ctx.font = "11px system-ui"
    ctx.fillText(`y = ${viz.expression}`, 12, h - 10)
  }, [viz])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
}

// ─── Physics Simulation ───────────────────────────────────────────────────────

function PhysicsView({ viz }: { viz: PhysicsViz }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; if (!ctx) return
    let t = 0; const p = viz.params ?? {}

    const resize = () => {
      canvas.width  = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    const W = canvas.offsetWidth; const H = canvas.offsetHeight

    function draw() {
      ctx.fillStyle = "#050508"; ctx.fillRect(0, 0, W, H)

      if (viz.scene === "projectile") {
        const angle  = ((p.angle ?? 45) * Math.PI) / 180
        const v0     = p.velocity ?? 25
        const g      = p.gravity ?? 9.8
        const scale  = Math.min(W, H) / 60
        const ox = 40; const oy = H - 40
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1
        for (let y = oy; y > 0; y -= 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
        // Trajectory path
        const totalT = (2 * v0 * Math.sin(angle)) / g
        ctx.strokeStyle = "rgba(139,92,246,0.3)"; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.beginPath()
        for (let i = 0; i <= 80; i++) {
          const ti = (i / 80) * totalT
          const x = ox + v0 * Math.cos(angle) * ti * scale
          const y = oy - (v0 * Math.sin(angle) * ti - 0.5 * g * ti * ti) * scale
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke(); ctx.setLineDash([])
        // Ball
        const curT = (t % (totalT * 60)) / 60
        const bx = ox + v0 * Math.cos(angle) * curT * scale
        const by = oy - (v0 * Math.sin(angle) * curT - 0.5 * g * curT * curT) * scale
        const grad = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, 10)
        grad.addColorStop(0, "#ededff"); grad.addColorStop(1, "#8b5cf6")
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#ededff"; ctx.font = "11px system-ui"
        ctx.fillText(`θ=${p.angle ?? 45}°  v₀=${v0}m/s  g=${g}m/s²`, 40, 20)

      } else if (viz.scene === "pendulum") {
        const L     = Math.min(W, H) * 0.38
        const amp   = ((p.angle ?? 30) * Math.PI) / 180
        const omega = Math.sqrt(9.8 / (L / 50))
        const theta = amp * Math.cos(omega * t / 30)
        const px = W / 2 + L * Math.sin(theta); const py = 60 + L * Math.cos(theta)
        // Rod
        ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2, 60); ctx.lineTo(px, py); ctx.stroke()
        // Pivot
        ctx.fillStyle = "#4a4a6a"; ctx.beginPath(); ctx.arc(W / 2, 60, 6, 0, Math.PI * 2); ctx.fill()
        // Arc path
        ctx.strokeStyle = "rgba(59,130,246,0.2)"; ctx.lineWidth = 1; ctx.beginPath()
        for (let i = -80; i <= 80; i++) {
          const a2 = amp * Math.cos(omega * i / 30)
          const x2 = W/2 + L * Math.sin(a2); const y2 = 60 + L * Math.cos(a2)
          i === -80 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2)
        }
        ctx.stroke()
        // Bob
        const bgrad = ctx.createRadialGradient(px-3, py-3, 1, px, py, 14)
        bgrad.addColorStop(0, "#ededff"); bgrad.addColorStop(1, "#3b82f6")
        ctx.fillStyle = bgrad; ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#ededff"; ctx.font = "11px system-ui"; ctx.fillText(`L=${Math.round(L/10)}cm  θ=${p.angle ?? 30}°`, 12, 20)

      } else if (viz.scene === "wave") {
        const amp   = (p.amplitude ?? 40)
        const freq  = (p.frequency ?? 2)
        const speed = (p.speed ?? 2)
        ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke()
        const g1 = ctx.createLinearGradient(0,0,W,0); g1.addColorStop(0,"#8b5cf6"); g1.addColorStop(1,"#3b82f6")
        ctx.strokeStyle = g1; ctx.lineWidth = 2.5; ctx.beginPath()
        for (let x = 0; x < W; x++) {
          const y = H/2 + amp * Math.sin((x / W) * freq * Math.PI * 2 - t * speed * 0.05)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        const g2 = ctx.createLinearGradient(0,0,W,0); g2.addColorStop(0,"rgba(139,92,246,0.15)"); g2.addColorStop(1,"rgba(59,130,246,0.05)")
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(0, H/2)
        for (let x = 0; x < W; x++) {
          const y = H/2 + amp * Math.sin((x / W) * freq * Math.PI * 2 - t * speed * 0.05)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(W, H/2); ctx.closePath(); ctx.fill()
        ctx.fillStyle = "#ededff"; ctx.font = "11px system-ui"; ctx.fillText(`Amplitude=${amp}  Frequency=${freq}Hz`, 12, 20)
      }

      t++
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [viz])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
}

// ─── Mind Map ─────────────────────────────────────────────────────────────────

function MindmapView({ viz }: { viz: MindmapViz }) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null)

  const W = 560; const H = 360; const cx = W / 2; const cy = H / 2
  const branches = viz.branches ?? []
  const colors   = ["#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899"]

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          {branches.map((b, i) => (
            <radialGradient key={i} id={`bg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={b.color ?? colors[i % colors.length]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={b.color ?? colors[i % colors.length]} stopOpacity="0.05" />
            </radialGradient>
          ))}
        </defs>
        {/* Center node */}
        <ellipse cx={cx} cy={cy} rx={60} ry={28} fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#ededff" fontSize="13" fontWeight="bold">{viz.center}</text>
        {branches.map((branch, bi) => {
          const angle = (bi / branches.length) * Math.PI * 2 - Math.PI / 2
          const bx = cx + 165 * Math.cos(angle); const by = cy + 100 * Math.sin(angle)
          const color = branch.color ?? colors[bi % colors.length]
          return (
            <g key={bi}>
              <line x1={cx} y1={cy} x2={bx} y2={by} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 2" />
              <ellipse cx={bx} cy={by} rx={52} ry={20} fill={`url(#bg${bi})`} stroke={color} strokeWidth="1.2" style={{ cursor: "pointer" }}
                onClick={() => setTip(tip?.label === branch.label ? null : { label: branch.label, x: bx, y: by })} />
              <text x={bx} y={by + 5} textAnchor="middle" fill={color} fontSize="12" fontWeight="600" style={{ pointerEvents: "none" }}>{branch.label}</text>
              {branch.items.map((item, ii) => {
                const leafAngle = angle + (ii - (branch.items.length - 1) / 2) * 0.4
                const lx = bx + 90 * Math.cos(leafAngle); const ly = by + 55 * Math.sin(leafAngle)
                return (
                  <g key={ii}>
                    <line x1={bx} y1={by} x2={lx} y2={ly} stroke={color} strokeWidth="1" strokeOpacity="0.3" />
                    <rect x={lx - 38} y={ly - 13} width={76} height={26} rx={8} fill="rgba(15,15,28,0.8)" stroke={`${color}60`} strokeWidth="1" style={{ cursor: "pointer" }}
                      onClick={() => setTip(tip?.label === item ? null : { label: item, x: lx, y: ly })} />
                    <text x={lx} y={ly + 5} textAnchor="middle" fill="#c8c8e8" fontSize="11" style={{ pointerEvents: "none" }}>{item}</text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
      {tip && (
        <div style={{ position: "absolute", left: "50%", bottom: "8px", transform: "translateX(-50%)", background: "rgba(15,15,28,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px", padding: "8px 16px", fontSize: "12.5px", color: "#ededff", whiteSpace: "nowrap", backdropFilter: "blur(8px)", zIndex: 10, cursor: "pointer" }}
          onClick={() => setTip(null)}>
          <strong style={{ color: "#8b5cf6" }}>{tip.label}</strong> — click to dismiss
        </div>
      )}
    </div>
  )
}

// ─── 3D Hologram View ────────────────────────────────────────────────────────

function HologramView({ viz }: { viz: HologramViz }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const tRef      = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current as HTMLCanvasElement
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; if (!ctx) return
    const primaryColor = viz.color ?? "#00eeff"

    function resize() {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    // ── 3D helpers ──────────────────────────────────────────────────────────
    function rotY(x: number, y: number, z: number, a: number) {
      return { x: x * Math.cos(a) - z * Math.sin(a), y, z: x * Math.sin(a) + z * Math.cos(a) }
    }
    function rotX(x: number, y: number, z: number, a: number) {
      return { x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) }
    }
    function proj(x: number, y: number, z: number, fov: number, cx: number, cy: number) {
      const s = fov / (fov + z); return { px: x * s + cx, py: y * s + cy, s }
    }
    function setGlow(color: string, blur = 18) {
      ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = blur
    }

    // ── HUD overlay ─────────────────────────────────────────────────────────
    function drawHUD(W: number, H: number, t: number) {
      const sz = 22
      ctx.strokeStyle = `${primaryColor}60`; ctx.lineWidth = 1.5; ctx.shadowBlur = 0
      const corners = [[sz,sz],[W-sz,sz],[sz,H-sz],[W-sz,H-sz]]
      corners.forEach(([cx2,cy2],i) => {
        const dx = i%2===0?1:-1; const dy = i<2?1:-1
        ctx.beginPath(); ctx.moveTo(cx2,cy2+dy*14); ctx.lineTo(cx2,cy2); ctx.lineTo(cx2+dx*14,cy2); ctx.stroke()
      })
      ctx.fillStyle = `${primaryColor}60`; ctx.font = "bold 10px monospace"
      const fps = Math.round(t % 60 + 30)
      ctx.fillText(`VEIL·3D   ${viz.shape.toUpperCase()}`, sz+2, H - sz + 3)
      ctx.fillText(`${fps} FPS  `, W - sz - 55, sz - 4)
    }

    // ── Scanlines ───────────────────────────────────────────────────────────
    function drawScanlines(W: number, H: number) {
      ctx.fillStyle = "rgba(0,0,0,0.04)"
      for (let y = 0; y < H; y += 3) { ctx.fillRect(0, y, W, 1) }
    }

    function frame() {
      const t = tRef.current++
      const W = canvas.offsetWidth; const H = canvas.offsetHeight
      const cx = W / 2; const cy = H / 2
      const dim = Math.min(W, H) * 0.38

      ctx.fillStyle = "rgba(0,2,10,0.88)"; ctx.fillRect(0, 0, W, H)

      const ry = t * 0.012; const rx = Math.sin(t * 0.007) * 0.3

      if (viz.shape === "sphere") {
        const RINGS = 10; const SEGS = 24
        ctx.lineWidth = 1.2
        for (let i = 0; i <= RINGS; i++) {
          const phi = (i / RINGS) * Math.PI; const ring: {px:number,py:number,s:number}[] = []
          for (let j = 0; j <= SEGS; j++) {
            const theta = (j / SEGS) * Math.PI * 2
            let p = { x: dim*Math.sin(phi)*Math.cos(theta), y: dim*Math.cos(phi), z: dim*Math.sin(phi)*Math.sin(theta) }
            p = rotY(p.x,p.y,p.z,ry); p = rotX(p.x,p.y,p.z,rx)
            ring.push(proj(p.x,p.y,p.z,400,cx,cy))
          }
          const alpha = 0.3 + ring[0].s * 0.6
          setGlow(`rgba(0,238,255,${alpha})`, 12)
          ctx.beginPath(); ring.forEach((p,j)=>j===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.stroke()
        }
        for (let j = 0; j <= 8; j++) {
          const theta = (j / 8) * Math.PI * 2; const col: {px:number,py:number,s:number}[] = []
          for (let i = 0; i <= RINGS; i++) {
            const phi = (i/RINGS)*Math.PI
            let p = {x:dim*Math.sin(phi)*Math.cos(theta),y:dim*Math.cos(phi),z:dim*Math.sin(phi)*Math.sin(theta)}
            p = rotY(p.x,p.y,p.z,ry); p = rotX(p.x,p.y,p.z,rx)
            col.push(proj(p.x,p.y,p.z,400,cx,cy))
          }
          setGlow(`rgba(0,238,255,0.35)`, 8)
          ctx.beginPath(); col.forEach((p,i)=>i===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.stroke()
        }

      } else if (viz.shape === "dna") {
        const N = 36; const STRIDE = dim * 2 / N
        ctx.lineWidth = 2
        const strand1: {px:number,py:number,s:number}[] = []
        const strand2: {px:number,py:number,s:number}[] = []
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI * 4 + ry
          const yy = (i / N) * dim * 2 - dim
          let p1 = {x:dim*0.35*Math.cos(a), y:yy, z:dim*0.35*Math.sin(a)}
          let p2 = {x:dim*0.35*Math.cos(a+Math.PI), y:yy, z:dim*0.35*Math.sin(a+Math.PI)}
          p1 = rotX(p1.x,p1.y,p1.z,0.2); p2 = rotX(p2.x,p2.y,p2.z,0.2)
          strand1.push(proj(p1.x,p1.y,p1.z,400,cx,cy))
          strand2.push(proj(p2.x,p2.y,p2.z,400,cx,cy))
        }
        setGlow("#00eeff", 18); ctx.beginPath()
        strand1.forEach((p,i)=>i===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.stroke()
        setGlow("#bf00ff", 18); ctx.beginPath()
        strand2.forEach((p,i)=>i===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.stroke()
        ctx.lineWidth = 1
        for (let i = 0; i < N; i += 3) {
          if (i < strand1.length && i < strand2.length) {
            setGlow("#ffffff", 8)
            ctx.beginPath(); ctx.moveTo(strand1[i].px,strand1[i].py); ctx.lineTo(strand2[i].px,strand2[i].py); ctx.stroke()
            ctx.fillStyle = "#00eeff"; ctx.beginPath(); ctx.arc(strand1[i].px,strand1[i].py,2.5,0,Math.PI*2); ctx.fill()
            ctx.fillStyle = "#bf00ff"; ctx.beginPath(); ctx.arc(strand2[i].px,strand2[i].py,2.5,0,Math.PI*2); ctx.fill()
          }
        }

      } else if (viz.shape === "neural") {
        const layers = [4,6,6,4]; const layerX = [-dim*0.6,-dim*0.2,dim*0.2,dim*0.6]
        ctx.lineWidth = 0.8
        const nodes: {px:number,py:number,col:string}[][] = layers.map((n,li) => {
          return Array.from({length:n},(_,ni)=>{
            const yy = (ni-(n-1)/2) * (dim*0.42)
            let p = {x:layerX[li], y:yy, z:0}; p = rotY(p.x,p.y,p.z,ry*0.5); p = rotX(p.x,p.y,p.z,rx*0.5)
            const pp = proj(p.x,p.y,p.z,400,cx,cy)
            const act = Math.sin(t*0.04 + li*0.8 + ni*0.5)*0.5+0.5
            return {...pp, col:act>0.5?"#00eeff":"#bf00ff"}
          })
        })
        nodes.forEach((layer,li)=>{if(li<nodes.length-1){layer.forEach(a=>{nodes[li+1].forEach(b=>{setGlow("rgba(0,200,255,0.12)",4);ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.stroke()})})}})
        nodes.forEach(layer=>layer.forEach(n=>{
          const pulse = Math.sin(t*0.05+n.px*0.02)*4+6
          setGlow(n.col,pulse*2); ctx.fillStyle=n.col
          ctx.beginPath(); ctx.arc(n.px,n.py,4,0,Math.PI*2); ctx.fill()
          ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.arc(n.px,n.py,1.5,0,Math.PI*2); ctx.fill()
        }))

      } else if (viz.shape === "torus") {
        const R = dim*0.5; const r = dim*0.18; const RINGS = 18; const SEGS = 24
        ctx.lineWidth = 1
        for (let i = 0; i < RINGS; i++) {
          const phi = (i/RINGS)*Math.PI*2; const ring: {px:number,py:number,s:number}[] = []
          for (let j = 0; j <= SEGS; j++) {
            const theta = (j/SEGS)*Math.PI*2
            let p = {x:(R+r*Math.cos(theta))*Math.cos(phi), y:r*Math.sin(theta), z:(R+r*Math.cos(theta))*Math.sin(phi)}
            p = rotY(p.x,p.y,p.z,ry); p = rotX(p.x,p.y,p.z,rx)
            ring.push(proj(p.x,p.y,p.z,400,cx,cy))
          }
          const alpha = 0.3 + ring[0].s * 0.5
          setGlow(`rgba(0,238,255,${alpha.toFixed(2)})`, 10)
          ctx.beginPath(); ring.forEach((p,j)=>j===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.stroke()
        }

      } else if (viz.shape === "crystal") {
        const faces = [[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,1,2],[5,2,3],[5,3,4],[5,4,1]]
        const r = dim * 0.55
        const verts = [
          {x:0,y:-r,z:0},{x:r,y:0,z:0},{x:0,y:0,z:r},{x:-r,y:0,z:0},{x:0,y:0,z:-r},{x:0,y:r*0.7,z:0}
        ].map(v=>{ let p=rotY(v.x,v.y,v.z,ry); p=rotX(p.x,p.y,p.z,rx); return proj(p.x,p.y,p.z,400,cx,cy) })
        ctx.lineWidth = 1.5
        faces.forEach((f,fi) => {
          const hue = (fi/faces.length)*60; const alpha = 0.4+verts[f[0]].s*0.4
          setGlow(`hsla(${180+hue},100%,60%,${alpha.toFixed(2)})`, 14)
          ctx.beginPath(); ctx.moveTo(verts[f[0]].px,verts[f[0]].py); ctx.lineTo(verts[f[1]].px,verts[f[1]].py); ctx.lineTo(verts[f[2]].px,verts[f[2]].py); ctx.closePath(); ctx.stroke()
        })

      } else if (viz.shape === "molecule") {
        const atoms = [{x:0,y:0,z:0,r:18,c:"#00eeff"},{x:dim*.35,y:dim*.2,z:0,r:12,c:"#ff4466"},{x:-dim*.3,y:dim*.2,z:0,r:12,c:"#ff4466"},{x:0,y:-dim*.35,z:0,r:12,c:"#00ff88"},{x:dim*.2,y:0,z:dim*.3,r:10,c:"#bf00ff"},{x:-dim*.2,y:0,z:dim*.3,r:10,c:"#bf00ff"}]
        const bonds = [[0,1],[0,2],[0,3],[0,4],[0,5]]
        const projected = atoms.map(a=>{let p=rotY(a.x,a.y,a.z,ry);p=rotX(p.x,p.y,p.z,rx);const pp=proj(p.x,p.y,p.z,400,cx,cy);return{...pp,r:a.r*pp.s,c:a.c}})
        ctx.lineWidth=2; bonds.forEach(([a,b])=>{ setGlow("rgba(200,240,255,0.5)",8); ctx.beginPath(); ctx.moveTo(projected[a].px,projected[a].py); ctx.lineTo(projected[b].px,projected[b].py); ctx.stroke() })
        projected.forEach(a=>{ setGlow(a.c,16); ctx.fillStyle=a.c; ctx.beginPath(); ctx.arc(a.px,a.py,a.r,0,Math.PI*2); ctx.fill(); ctx.fillStyle="rgba(255,255,255,0.4)"; ctx.beginPath(); ctx.arc(a.px-a.r*.25,a.py-a.r*.25,a.r*.35,0,Math.PI*2); ctx.fill() })
      }

      drawScanlines(W, H)
      drawHUD(W, H, t)
      ctx.shadowBlur = 0

      rafRef.current = requestAnimationFrame(frame)
    }
    frame()
    return () => cancelAnimationFrame(rafRef.current)
  }, [viz])

  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%", display:"block", background:"#000208" }} />
}

// ─── Particle View ────────────────────────────────────────────────────────────

function ParticleView({ viz }: { viz: ParticleViz }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current as HTMLCanvasElement
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; if (!ctx) return
    canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const W = canvas.offsetWidth; const H = canvas.offsetHeight
    const cx = W/2; const cy = H/2

    type Particle = { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; r:number; hue:number; angle?:number; dist?:number; speed?:number }
    const N = viz.pattern === "nebula" ? 600 : 400
    const particles: Particle[] = []

    if (viz.pattern === "galaxy") {
      for (let i = 0; i < N; i++) {
        const arm = Math.floor(Math.random()*3); const armAngle = arm*(Math.PI*2/3)
        const dist = Math.random()*Math.min(W,H)*0.42 + 10
        const angle = armAngle + dist*0.012 + (Math.random()-0.5)*0.5
        particles.push({ x:cx+Math.cos(angle)*dist, y:cy+Math.sin(angle)*dist*0.6, vx:0, vy:0, life:Math.random()*120, maxLife:120+Math.random()*80, r:Math.random()*1.8+0.4, hue:200+Math.random()*60, angle, dist, speed:0.003+Math.random()*0.006 })
      }
    } else if (viz.pattern === "vortex") {
      for (let i = 0; i < N; i++) {
        const dist = Math.random()*Math.min(W,H)*0.44
        const angle = Math.random()*Math.PI*2
        particles.push({ x:cx+Math.cos(angle)*dist, y:cy+Math.sin(angle)*dist, vx:0, vy:0, life:Math.random()*80, maxLife:80, r:Math.random()*1.5+0.5, hue:250+Math.random()*80, angle, dist, speed:(0.02+Math.random()*0.04)*(1-dist/Math.min(W,H)) })
      }
    } else if (viz.pattern === "wave") {
      for (let i = 0; i < N; i++) {
        particles.push({ x:Math.random()*W, y:Math.random()*H, vx:0.3+Math.random()*0.5, vy:0, life:Math.random()*100, maxLife:100, r:Math.random()*1.5+0.5, hue:180+Math.random()*40 })
      }
    } else if (viz.pattern === "field") {
      for (let i = 0; i < N; i++) {
        particles.push({ x:Math.random()*W, y:Math.random()*H, vx:0, vy:0, life:Math.random()*60, maxLife:60, r:Math.random()*1.2+0.3, hue:120+Math.random()*120 })
      }
    } else { // nebula
      for (let i = 0; i < N; i++) {
        const angle = Math.random()*Math.PI*2
        const dist = Math.pow(Math.random(),0.5)*Math.min(W,H)*0.46
        particles.push({ x:cx+Math.cos(angle)*dist+(Math.random()-0.5)*80, y:cy+Math.sin(angle)*dist*(0.5+Math.random()*0.5), vx:(Math.random()-0.5)*0.2, vy:(Math.random()-0.5)*0.1, life:Math.random()*200, maxLife:200, r:Math.random()*2.5+0.5, hue:260+Math.random()*120 })
      }
    }

    let t = 0
    function frame() {
      t++
      ctx.fillStyle = "rgba(0,1,8,0.18)"; ctx.fillRect(0,0,W,H)

      particles.forEach(p => {
        p.life += 1
        if (p.life > p.maxLife) { p.life = 0 }
        const alpha = Math.sin((p.life/p.maxLife)*Math.PI)*0.85+0.05

        if (viz.pattern === "galaxy") {
          p.angle! += p.speed!; p.x = cx+Math.cos(p.angle!)*p.dist!; p.y = cy+Math.sin(p.angle!)*p.dist!*0.6
        } else if (viz.pattern === "vortex") {
          p.angle! += p.speed! + 0.001*p.dist!; p.dist! *= 0.9997
          p.x = cx+Math.cos(p.angle!)*p.dist!; p.y = cy+Math.sin(p.angle!)*p.dist!
          if (p.dist! < 5) { p.dist = Math.random()*Math.min(W,H)*0.44; p.angle = Math.random()*Math.PI*2 }
        } else if (viz.pattern === "wave") {
          p.x += p.vx; p.y = p.y + Math.sin(p.x*0.02 + t*0.04)*0.8
          if (p.x > W) { p.x = 0; p.y = Math.random()*H }
        } else if (viz.pattern === "field") {
          const fx = Math.sin(p.y*0.015 + t*0.01); const fy = Math.cos(p.x*0.015 + t*0.008)
          p.x += fx*1.2; p.y += fy*1.2
          if (p.x<0||p.x>W||p.y<0||p.y>H) { p.x=Math.random()*W; p.y=Math.random()*H }
        } else {
          p.x += p.vx; p.y += p.vy
          p.vx += (Math.random()-0.5)*0.04; p.vy += (Math.random()-0.5)*0.04
        }

        const sat = 80 + (p.hue%40); const bright = 60+alpha*30
        ctx.shadowColor = `hsla(${p.hue},${sat}%,${bright}%,0.8)`
        ctx.shadowBlur = p.r*4
        ctx.fillStyle = `hsla(${p.hue},${sat}%,${bright}%,${alpha.toFixed(2)})`
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill()
      })

      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(0,238,255,0.4)"; ctx.font = "bold 10px monospace"
      ctx.fillText(`VEIL·VIZ   ${viz.pattern.toUpperCase()}   ${N} PARTICLES`, 18, H-14)
      rafRef.current = requestAnimationFrame(frame)
    }
    frame()
    return () => cancelAnimationFrame(rafRef.current)
  }, [viz])

  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%", display:"block", background:"#000108" }} />
}

// ─── Main Visual Panel ────────────────────────────────────────────────────────

interface Props {
  visual: AnyViz
  onClose: () => void
}

export default function VisualPanel({ visual, onClose }: Props) {
  const [view, setView] = useState<"primary"|"mindmap">("primary")
  const [exporting, setExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const exportPng = useCallback(async () => {
    setExporting(true)
    const el = containerRef.current
    if (!el) { setExporting(false); return }
    try {
      const canvas = document.createElement("canvas")
      canvas.width = el.offsetWidth * 2; canvas.height = el.offsetHeight * 2
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; if (!ctx) return
      ctx.fillStyle = "#050508"; ctx.fillRect(0, 0, canvas.width, canvas.height)
      const svgEl = el.querySelector("svg")
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl)
        const img = new Image()
        img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); download(canvas) }
        img.src = "data:image/svg+xml;base64," + btoa(svgData)
      } else {
        const innerCanvas = el.querySelector("canvas") as HTMLCanvasElement
        if (innerCanvas) { ctx.drawImage(innerCanvas, 0, 0, canvas.width, canvas.height); download(canvas) }
      }
    } finally { setTimeout(() => setExporting(false), 1000) }
    function download(c: HTMLCanvasElement) {
      const a = document.createElement("a"); a.href = c.toDataURL("image/png")
      a.download = `veil-visual-${Date.now()}.png`; a.click()
    }
  }, [])

  const label = { mermaid: "Flowchart", chart: "Chart", mindmap: "Mind Map", physics: "Simulation", function: "Function Plot", hologram: `3D Hologram · ${(visual as HologramViz).shape ?? ""}`, particles: `Particle Field · ${(visual as ParticleViz).pattern ?? ""}` }[visual.type] ?? "Visual"
  const icon  = { mermaid: "⬡", chart: "▦", mindmap: "◉", physics: "◈", function: "∫", hologram: "⬡", particles: "✦" }[visual.type] ?? "◎"

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(5,5,10,0.8)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{icon}</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#ededff" }}>{label}</span>
          <span style={{ fontSize: "11px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#8b5cf6", padding: "2px 8px", borderRadius: "100px", fontWeight: 600 }}>
            Visual Engine
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={exportPng} disabled={exporting} title="Export as PNG" style={{ padding: "4px 10px", borderRadius: "7px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "#7878a8", fontSize: "11.5px", fontWeight: 600 }}>
            {exporting ? "Saving…" : "⬇ PNG"}
          </button>
          <button onClick={onClose} title="Close visual" style={{ padding: "4px 10px", borderRadius: "7px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "#7878a8", fontSize: "11.5px" }}>✕</button>
        </div>
      </div>

      {/* Visual area */}
      <div ref={containerRef} style={{ flex: 1, overflow: "hidden", padding: visual.type === "hologram" || visual.type === "particles" ? "0" : "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {visual.type === "mermaid"   && <MermaidView code={visual.code} />}
        {visual.type === "chart"     && <ChartView viz={visual} />}
        {visual.type === "function"  && <FuncView viz={visual} />}
        {visual.type === "physics"   && <PhysicsView viz={visual} />}
        {visual.type === "mindmap"   && <MindmapView viz={visual} />}
        {visual.type === "hologram"  && <HologramView viz={visual} />}
        {visual.type === "particles" && <ParticleView viz={visual} />}
      </div>

      {/* Footer hint */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "#4a4a6a", flexShrink: 0 }}>
        Rendered client-side · Click elements to explore · Auto-generated from your query
      </div>
    </div>
  )
}
