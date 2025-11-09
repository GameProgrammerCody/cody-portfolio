import { useEffect, useRef, useState } from "react"

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const [enabled, setEnabled] = useState(true)
  const [opacity, setOpacity] = useState(1)

  // Listen for motion toggle + load saved pref
  useEffect(() => {
    const saved = localStorage.getItem("reduceMotion")
    if (saved === "true") setEnabled(false)

    const handleToggle = (e) => {
      const newState = e.detail
      setOpacity(0)
      setTimeout(() => {
        setEnabled(newState)
        setOpacity(1)
      }, 400)
    }
    window.addEventListener("motionToggle", handleToggle)
    return () => window.removeEventListener("motionToggle", handleToggle)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
    let w = 0, h = 0

    // Mouse parallax
    const target = { x: 0.5, y: 0.5 }
    const mouse = { x: 0.5, y: 0.5 }
    const handleMouseMove = (e) => {
      target.x = e.clientX / window.innerWidth
      target.y = e.clientY / window.innerHeight
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Particles
    const particles = Array.from({ length: 160 }).map(() => {
      const z = Math.random() ** 2 // more small/deep dots
      return {
        x: Math.random(),
        y: Math.random(),
        z,
        vx: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
        vy: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
        r: (0.9 + Math.random() * 1.3) * (0.3 + z),
        a: 0.35 + Math.random() * 0.45 * (0.3 + z),
      }
    })

    // Robust resize (prevents compounded scaling)
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0) // reset + scale
    }
    resize()
    window.addEventListener("resize", resize)

    const loop = () => {
      // Smoothly follow mouse only if motion enabled
      if (enabled) {
        mouse.x += (target.x - mouse.x) * 0.05
        mouse.y += (target.y - mouse.y) * 0.05
      }

      // Clear then background
      ctx.clearRect(0, 0, w, h)
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h))
      bg.addColorStop(0, "rgba(8,14,24,1)")
      bg.addColorStop(1, "rgba(3,6,12,1)")
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const time = Date.now() * 0.02
      const hue = (200 + Math.sin(time / 2000) * 60) % 360 // cyan?blue?indigo

      // Advance + project
      const projected = particles.map((p) => {
        if (enabled) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > 1) p.vx *= -1
          if (p.y < 0 || p.y > 1) p.vy *= -1
        }
        const parallaxX = enabled ? (mouse.x - 0.5) * p.z * 0.12 : 0
        const parallaxY = enabled ? (mouse.y - 0.5) * p.z * 0.12 : 0
        return {
          ...p,
          px: (p.x + parallaxX) * w,
          py: (p.y + parallaxY) * h,
        }
      })

      // Particles (make them clearly visible)
      ctx.globalCompositeOperation = "source-over"
      projected.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2)
        // brighter lightness, stronger alpha
        const L = 72 + p.z * 18
        const A = Math.min(1, 0.75 * p.a + 0.25)
        ctx.fillStyle = `hsla(${hue}, 100%, ${L}%, ${A})`
        ctx.fill()
      })

      // Lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i], b = projected[j]
          const dx = a.px - b.px
          const dy = a.py - b.py
          const d2 = dx * dx + dy * dy
          if (d2 < 130 * 130) {
            const alpha = 0.12 * (1 - d2 / (130 * 130))
            ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.px, a.py)
            ctx.lineTo(b.px, b.py)
            ctx.stroke()
          }
        }
      }

      // Soft bloom overlay (lighter only here)
      const bloom = ctx.createRadialGradient(
        w / 2, h / 2, 0,
        w / 2, h / 2, Math.max(w, h) * 0.8
      )
      bloom.addColorStop(0, "rgba(0,255,255,0.06)")
      bloom.addColorStop(0.5, "rgba(120,120,255,0.05)")
      bloom.addColorStop(0.9, "rgba(150,100,255,0.03)")
      ctx.globalCompositeOperation = "lighter"
      ctx.fillStyle = bloom
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = "source-over"

      rafRef.current = requestAnimationFrame(loop)
    }

    loop()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [enabled])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full transition-opacity duration-700 ease-in-out"
      style={{ opacity }}
    />
  )
}
