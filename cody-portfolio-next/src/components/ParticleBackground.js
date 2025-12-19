import { useEffect, useRef, useState } from "react"
import { createRiftWraith } from "./RiftWraith"

export default function ParticleBackground() {
    const canvasRef = useRef(null)
    const rafRef = useRef(0)

    const [enabled, setEnabled] = useState(true)
    const [opacity, setOpacity] = useState(1)
    const [isMobile, setIsMobile] = useState(false)

    // --- detect mobile ---
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
        checkMobile()
        window.addEventListener("resize", checkMobile, { passive: true })
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // --- motion toggle ---
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

    // --- main draw loop ---
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true })
        if (!ctx) return

        // Viewport helpers (more reliable than innerWidth/innerHeight on some setups)
        const getViewportSize = () => {
            const vv = window.visualViewport
            const vw = vv?.width ?? window.innerWidth
            const vh = vv?.height ?? window.innerHeight
            return { w: Math.max(1, Math.floor(vw)), h: Math.max(1, Math.floor(vh)) }
        }

        // IMPORTANT:
        // - allow DPR < 1 (zoom-out becomes cheaper, not slower)
        // - cap to 2 to avoid 4K+ melting GPUs
        // - floor to 0.75 to avoid things looking too blurry when zoomed way out
        const getDPR = () => {
            const raw = window.devicePixelRatio || 1
            return Math.max(0.75, Math.min(raw, 2))
        }

        let w = 0
        let h = 0
        let dpr = 1

        let bgGradient = null
        let bloomGradient = null

        const target = { x: 0.5, y: 0.5 }
        const mouse = { x: 0.5, y: 0.5 }

        const particleCount = isMobile ? 70 : 160
        const connectionRange = isMobile ? 100 : 130

        const particles = Array.from({ length: particleCount }).map(() => {
            const z = Math.random() ** 2
            return {
                x: Math.random(),
                y: Math.random(),
                z,
                vx: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
                vy: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
                r: (0.9 + Math.random() * 1.3) * (0.3 + z),
                a: 0.35 + Math.random() * 0.45 * (0.3 + z),
                pulse: 0,
                burst: 0,
                links: [],
            }
        })

        // RiftWraith instance (created after first resize)
        let rift = null

        const rebuildGradients = () => {
            bgGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h))
            bgGradient.addColorStop(0, "rgba(8,14,24,1)")
            bgGradient.addColorStop(1, "rgba(3,6,12,1)")

            bloomGradient = ctx.createRadialGradient(
                w / 2,
                h / 2,
                0,
                w / 2,
                h / 2,
                Math.max(w, h) * 0.8
            )
            bloomGradient.addColorStop(0, "rgba(0,255,255,0.06)")
            bloomGradient.addColorStop(0.5, "rgba(120,120,255,0.05)")
            bloomGradient.addColorStop(0.9, "rgba(150,100,255,0.03)")
        }

        const createOrResizeRift = () => {
            if (!rift) {
                rift = createRiftWraith(ctx, w, h, dpr, particles, enabled, isMobile, mouse)
                if (rift?.resetIdle) rift.resetIdle()
                return
            }

            // Try any common resize hooks, otherwise recreate.
            const resized =
                (typeof rift.resize === "function" && (rift.resize(w, h, dpr), true)) ||
                (typeof rift.onResize === "function" && (rift.onResize(w, h, dpr), true)) ||
                (typeof rift.setSize === "function" && (rift.setSize(w, h, dpr), true))

            if (!resized) {
                // best-effort cleanup if RiftWraith exposes a destroy function
                if (typeof rift.destroy === "function") rift.destroy()
                rift = createRiftWraith(ctx, w, h, dpr, particles, enabled, isMobile, mouse)
                if (rift?.resetIdle) rift.resetIdle()
            }
        }

        const applyCanvasSize = () => {
            const vp = getViewportSize()
            const nextDpr = getDPR()

            // Bail if nothing changed (prevents churn)
            if (vp.w === w && vp.h === h && nextDpr === dpr) return

            w = vp.w
            h = vp.h
            dpr = nextDpr

            // Use CSS pixels for layout
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`

            // Use device pixels for backing store
            canvas.width = Math.max(1, Math.floor(w * dpr))
            canvas.height = Math.max(1, Math.floor(h * dpr))

            // Draw in CSS-pixel coordinate space
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            rebuildGradients()
            createOrResizeRift()
        }

        // Throttle resize/zoom handling to the next animation frame
        let resizeQueued = false
        const queueResize = () => {
            if (resizeQueued) return
            resizeQueued = true
            requestAnimationFrame(() => {
                resizeQueued = false
                applyCanvasSize()
            })
        }

        // initial sizing
        applyCanvasSize()

        // mouse parallax
        const handleMouseMove = (e) => {
            if (isMobile) return
            const vp = getViewportSize()
            target.x = e.clientX / vp.w
            target.y = e.clientY / vp.h
        }
        if (!isMobile) window.addEventListener("mousemove", handleMouseMove, { passive: true })

        // click burst
        const addParticleAt = (clientX, clientY) => {
            const vp = getViewportSize()
            const x = clientX / vp.w
            const y = clientY / vp.h
            const z = Math.random() ** 2
            const newParticle = {
                x,
                y,
                z,
                vx: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
                vy: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
                r: (0.9 + Math.random() * 1.3) * (0.3 + z),
                a: 0.8,
                pulse: 1.0,
                burst: 1.0,
                links: [],
            }

            const tempList = []
            for (let i = 0; i < particles.length; i++) {
                const dx = x - particles[i].x
                const dy = y - particles[i].y
                tempList.push({ i, d2: dx * dx + dy * dy })
            }
            tempList.sort((a, b) => a.d2 - b.d2)
            newParticle.links = tempList.slice(0, 5).map((n) => n.i)

            particles.splice(Math.floor(Math.random() * particles.length), 1)
            particles.push(newParticle)
        }

        const handleClick = (e) => {
            if (!isMobile) addParticleAt(e.clientX, e.clientY)
        }
        window.addEventListener("click", handleClick, { passive: true })

        // Resize listeners (covers zoom, monitor changes, mobile UI chrome changes)
        window.addEventListener("resize", queueResize, { passive: true })
        window.visualViewport?.addEventListener("resize", queueResize, { passive: true })
        // Some browsers fire scroll on visualViewport during UI chrome changes
        window.visualViewport?.addEventListener("scroll", queueResize, { passive: true })

        const drawFrame = () => {
            // If motion disabled, don't animate every frame. Draw once and stop.
            if (!enabled) {
                ctx.clearRect(0, 0, w, h)
                ctx.globalCompositeOperation = "source-over"
                ctx.fillStyle = bgGradient
                ctx.fillRect(0, 0, w, h)

                // still draw a static scene (no movement)
                const hue = 220
                const projected = particles.map((p) => {
                    const parallaxX = 0
                    const parallaxY = 0
                    return {
                        ...p,
                        px: (p.x + parallaxX) * w,
                        py: (p.y + parallaxY) * h,
                        pr: p.r,
                    }
                })

                projected.forEach((p) => {
                    ctx.beginPath()
                    ctx.arc(p.px, p.py, p.pr, 0, Math.PI * 2)
                    const L = 72 + p.z * 18
                    const A = Math.min(1, 0.75 * p.a + 0.25)
                    ctx.fillStyle = `hsla(${hue}, 100%, ${L}%, ${A})`
                    ctx.fill()
                })

                // static rift
                if (rift) rift.updateAndDraw(hue, w, h)

                ctx.globalCompositeOperation = "lighter"
                ctx.fillStyle = bloomGradient
                ctx.fillRect(0, 0, w, h)
                ctx.globalCompositeOperation = "source-over"

                return
            }

            // animate mouse smoothing
            if (!isMobile) {
                mouse.x += (target.x - mouse.x) * 0.05
                mouse.y += (target.y - mouse.y) * 0.05
            }

            ctx.clearRect(0, 0, w, h)

            ctx.globalCompositeOperation = "source-over"
            ctx.fillStyle = bgGradient
            ctx.fillRect(0, 0, w, h)

            const now = performance.now()
            const hue = (200 + Math.sin(now * 0.0005) * 60) % 360

            const projected = particles.map((p) => {
                // move
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0 || p.x > 1) p.vx *= -1
                if (p.y < 0 || p.y > 1) p.vy *= -1

                if (p.pulse > 0) p.pulse -= 0.03
                if (p.burst > 0) p.burst -= 0.04

                const pulseScale = 1 + p.pulse * 1.8
                const parallaxX = !isMobile ? (mouse.x - 0.5) * p.z * 0.12 : 0
                const parallaxY = !isMobile ? (mouse.y - 0.5) * p.z * 0.12 : 0

                return {
                    ...p,
                    px: (p.x + parallaxX) * w,
                    py: (p.y + parallaxY) * h,
                    pr: p.r * pulseScale,
                }
            })

            // draw particles
            projected.forEach((p) => {
                ctx.beginPath()
                ctx.arc(p.px, p.py, p.pr, 0, Math.PI * 2)
                const L = 72 + p.z * 18
                const A = Math.min(1, 0.75 * p.a + 0.25)
                ctx.fillStyle = `hsla(${hue}, 100%, ${L}%, ${A})`
                ctx.fill()
            })

            // respawn particles if eaten
            const desiredCount = isMobile ? 70 : 160
            if (particles.length < desiredCount) {
                const toSpawn = Math.min(3, desiredCount - particles.length)
                for (let i = 0; i < toSpawn; i++) {
                    const z = Math.random() ** 2
                    particles.push({
                        x: Math.random(),
                        y: Math.random(),
                        z,
                        vx: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
                        vy: (Math.random() - 0.5) * 0.00035 * (0.5 + z),
                        r: (0.9 + Math.random() * 1.3) * (0.3 + z),
                        a: 0.35 + Math.random() * 0.45 * (0.3 + z),
                        pulse: 0,
                        burst: 0,
                        links: [],
                    })
                }
            }

            // connections (O(n^2) but fine at 160; still keep it tight)
            const range2 = connectionRange * connectionRange
            for (let i = 0; i < projected.length; i++) {
                for (let j = i + 1; j < projected.length; j++) {
                    const a = projected[i]
                    const b = projected[j]
                    const dx = a.px - b.px
                    const dy = a.py - b.py
                    const d2 = dx * dx + dy * dy
                    if (d2 < range2) {
                        const alpha = 0.12 * (1 - d2 / range2)
                        ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${alpha})`
                        ctx.lineWidth = 1
                        ctx.beginPath()
                        ctx.moveTo(a.px, a.py)
                        ctx.lineTo(b.px, b.py)
                        ctx.stroke()
                    }
                }
            }

            // burst links
            projected.forEach((p) => {
                if (p.burst > 0 && p.links.length) {
                    ctx.strokeStyle = `hsla(${(hue + 40) % 360},100%,80%,${0.5 * p.burst})`
                    ctx.lineWidth = 1.5
                    p.links.forEach((idx) => {
                        const b = projected[idx]
                        if (!b) return
                        ctx.beginPath()
                        ctx.moveTo(p.px, p.py)
                        ctx.lineTo(b.px, b.py)
                        ctx.stroke()
                    })
                }
            })

            // rift
            if (rift) rift.updateAndDraw(hue, w, h)

            // bloom (cached gradient)
            ctx.globalCompositeOperation = "lighter"
            ctx.fillStyle = bloomGradient
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = "source-over"

            rafRef.current = requestAnimationFrame(drawFrame)
        }

        // Start
        drawFrame()

        return () => {
            cancelAnimationFrame(rafRef.current)

            window.removeEventListener("resize", queueResize)
            window.visualViewport?.removeEventListener("resize", queueResize)
            window.visualViewport?.removeEventListener("scroll", queueResize)

            if (!isMobile) window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("click", handleClick)

            // RiftWraith cancelers
            if (rift?.cancelers && rift?.resetIdle) {
                rift.cancelers.forEach((evt) => window.removeEventListener(evt, rift.resetIdle))
            }
            if (typeof rift?.destroy === "function") rift.destroy()
            rift = null
        }
    }, [enabled, isMobile])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 w-full h-full transition-opacity duration-700 ease-in-out"
            style={{ opacity, pointerEvents: "none" }}
        />
    )
}
