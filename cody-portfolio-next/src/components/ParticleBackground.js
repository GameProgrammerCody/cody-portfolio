import { useEffect, useRef, useState } from "react"

export default function ParticleBackground() {
    const canvasRef = useRef(null)
    const rafRef = useRef(0)
    const [enabled, setEnabled] = useState(true)
    const [opacity, setOpacity] = useState(1)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

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

        // ---- DPR / size ----
        const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
        let w = 0, h = 0
        const resize = () => {
            w = window.innerWidth
            h = window.innerHeight
            canvas.style.width = w + "px"
            canvas.style.height = h + "px"
            canvas.width = Math.floor(w * DPR)
            canvas.height = Math.floor(h * DPR)
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
        }
        resize()
        window.addEventListener("resize", resize)

        // ---- Parallax ----
        const target = { x: 0.5, y: 0.5 }
        const mouse = { x: 0.5, y: 0.5 }
        const handleMouseMove = (e) => {
            if (isMobile) return
            target.x = e.clientX / window.innerWidth
            target.y = e.clientY / window.innerHeight
        }
        if (!isMobile) window.addEventListener("mousemove", handleMouseMove)

        // ---- Particles ----
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

        // ---- Click to add particle (and remove one elsewhere) ----
        const addParticleAt = (clientX, clientY) => {
            const x = clientX / window.innerWidth
            const y = clientY / window.innerHeight
            const z = Math.random() ** 2
            const newParticle = {
                x, y, z,
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
            newParticle.links = tempList.slice(0, 5).map(n => n.i)

            particles.splice(Math.floor(Math.random() * particles.length), 1)
            particles.push(newParticle)
        }
        const handleClick = (e) => { if (!isMobile) addParticleAt(e.clientX, e.clientY) }
        window.addEventListener("click", handleClick)

        // ---- Rift Wraith (idle creature) ----
        const SPRITES = {
            creature: ["/assets/creature/creature_1.webp", "/assets/creature/creature_2.webp", "/assets/creature/creature_3.webp"],
            portal: "/assets/creature/portal.webp",
        }
        const images = { creature: [], portal: null }
        SPRITES.creature.forEach((src) => {
            const img = new Image()
            img.src = src
            images.creature.push(img)
        })
        if (SPRITES.portal) {
            const imgP = new Image()
            imgP.src = SPRITES.portal
            images.portal = imgP
        }

        const creature = {
            active: false,
            exiting: false,
            x: 0.5, y: 0.5,
            vx: 0, vy: 0,
            size: 28,               // starting render size (px at DPR=1)
            maxSize: 90,
            growthPerEat: 6,
            tier: 0,                // 0..2
            opacity: 0,
            speed: 0.0035,          // normalized per frame
            eatRadius: 0.02,        // normalized: ~2% of screen
            nextSeekAt: 0,          // throttle seeking
        }

        const portal = {
            active: false,
            x: 0.5, y: 0.5,
            r: 80,                  // px radius
            rot: 0,
            opacity: 0,
            opening: false,
            closing: false,
        }

        const idleMs = 60000
        let idleTimeout = null

        const resetIdle = () => {
            if (idleTimeout) clearTimeout(idleTimeout)
            // If user returns, start despawn if creature is around
            if (creature.active && !creature.exiting) {
                creature.exiting = true
                portal.closing = true
                portal.opening = false
                portal.active = true
            }
            // Only arm idle if feature allowed
            if (enabled && !isMobile) {
                idleTimeout = setTimeout(() => {
                    // Spawn via portal
                    portal.active = true
                    portal.opening = true
                    portal.closing = false
                    portal.opacity = 0
                    portal.x = 0.15 + Math.random() * 0.7
                    portal.y = 0.2 + Math.random() * 0.6

                    // Initialize creature just after portal appears
                    setTimeout(() => {
                        creature.active = true
                        creature.exiting = false
                        creature.x = portal.x
                        creature.y = portal.y
                        creature.vx = 0
                        creature.vy = 0
                        creature.size = 28
                        creature.tier = 0
                        creature.opacity = 0
                    }, 400)
                }, idleMs)
            }
        }

        // consider also scroll, key, touch to reset
        const cancelers = ["mousemove", "scroll", "keydown", "touchstart"]
        cancelers.forEach((evt) => window.addEventListener(evt, resetIdle))
        resetIdle() // arm timer

        // ---- Main loop ----
        const loop = () => {
            if (enabled && !isMobile) {
                mouse.x += (target.x - mouse.x) * 0.05
                mouse.y += (target.y - mouse.y) * 0.05
            }

            ctx.clearRect(0, 0, w, h)

            // background
            const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h))
            bg.addColorStop(0, "rgba(8,14,24,1)")
            bg.addColorStop(1, "rgba(3,6,12,1)")
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, w, h)

            const hue = (200 + Math.sin(Date.now() * 0.0005) * 60) % 360

            // update + project particles
            const projected = particles.map((p) => {
                if (enabled) {
                    p.x += p.vx
                    p.y += p.vy
                    if (p.x < 0 || p.x > 1) p.vx *= -1
                    if (p.y < 0 || p.y > 1) p.vy *= -1
                }
                if (p.pulse > 0) p.pulse -= 0.03
                if (p.burst > 0) p.burst -= 0.04
                const pulseScale = 1 + p.pulse * 1.8
                const parallaxX = !isMobile && enabled ? (mouse.x - 0.5) * p.z * 0.12 : 0
                const parallaxY = !isMobile && enabled ? (mouse.y - 0.5) * p.z * 0.12 : 0
                return {
                    ...p,
                    px: (p.x + parallaxX) * w,
                    py: (p.y + parallaxY) * h,
                    pr: p.r * pulseScale,
                }
            })

            // draw particles
            ctx.globalCompositeOperation = "source-over"
            projected.forEach((p) => {
                ctx.beginPath()
                ctx.arc(p.px, p.py, p.pr, 0, Math.PI * 2)
                const L = 72 + p.z * 18
                const A = Math.min(1, 0.75 * p.a + 0.25)
                ctx.fillStyle = `hsla(${hue}, 100%, ${L}%, ${A})`
                ctx.fill()
            })

            // network lines
            for (let i = 0; i < projected.length; i++) {
                for (let j = i + 1; j < projected.length; j++) {
                    const a = projected[i], b = projected[j]
                    const dx = a.px - b.px
                    const dy = a.py - b.py
                    const d2 = dx * dx + dy * dy
                    if (d2 < connectionRange * connectionRange) {
                        const alpha = 0.12 * (1 - d2 / (connectionRange * connectionRange))
                        ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${alpha})`
                        ctx.lineWidth = 1
                        ctx.beginPath()
                        ctx.moveTo(a.px, a.py)
                        ctx.lineTo(b.px, b.py)
                        ctx.stroke()
                    }
                }
            }

            // burst lines on newly added particles
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

            // ---- Portal draw/update ----
            if (portal.active) {
                if (portal.opening) {
                    portal.opacity = Math.min(1, portal.opacity + 0.05)
                    if (portal.opacity >= 1) portal.opening = false
                } else if (portal.closing) {
                    portal.opacity = Math.max(0, portal.opacity - 0.05)
                    if (portal.opacity <= 0) { portal.active = false; portal.closing = false }
                }
                portal.rot += 0.01

                ctx.save()
                ctx.globalCompositeOperation = "lighter"
                ctx.translate(portal.x * w, portal.y * h)
                ctx.rotate(portal.rot)
                const pr = portal.r
                if (images.portal && images.portal.complete) {
                    ctx.globalAlpha = 0.6 * portal.opacity
                    ctx.drawImage(images.portal, -pr, -pr, pr * 2, pr * 2)
                } else {
                    // fallback ring
                    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pr)
                    grad.addColorStop(0, `rgba(0,255,255,${0.25 * portal.opacity})`)
                    grad.addColorStop(0.7, `rgba(120,120,255,${0.18 * portal.opacity})`)
                    grad.addColorStop(1, `rgba(0,0,0,0)`)
                    ctx.fillStyle = grad
                    ctx.beginPath()
                    ctx.arc(0, 0, pr, 0, Math.PI * 2)
                    ctx.fill()
                }
                ctx.restore()
            }

            // ---- Creature logic ----
            if (creature.active) {
                // fade in/out
                if (!creature.exiting) {
                    creature.opacity = Math.min(1, creature.opacity + 0.05)
                } else {
                    creature.opacity = Math.max(0, creature.opacity - 0.06)
                    if (creature.opacity <= 0) {
                        creature.active = false
                        creature.exiting = false
                    }
                }

                // seek nearest particle (throttled ~every 80ms)
                const now = performance.now()
                let targetIdx = -1
                if (now > creature.nextSeekAt) {
                    let bestD2 = 1e9
                    for (let i = 0; i < particles.length; i++) {
                        const dx = particles[i].x - creature.x
                        const dy = particles[i].y - creature.y
                        const d2 = dx * dx + dy * dy
                        if (d2 < bestD2) { bestD2 = d2; targetIdx = i }
                    }
                    creature.nextSeekAt = now + 80
                }

                // move toward target
                if (targetIdx >= 0 && !creature.exiting) {
                    const t = particles[targetIdx]
                    const dx = t.x - creature.x
                    const dy = t.y - creature.y
                    const len = Math.hypot(dx, dy) || 1
                    const step = creature.speed * (enabled ? 1 : 0) // pause motion if disabled
                    creature.x += (dx / len) * step
                    creature.y += (dy / len) * step

                    // eat?
                    const eatR = creature.eatRadius
                    if (len < eatR) {
                        // remove particle + effects
                        const removed = particles.splice(targetIdx, 1)[0]
                        if (removed) {
                            // spawn a quick pulse where it was (using projected coords if available)
                            // approximate; normalized->px:
                            const px = removed.x * w, py = removed.y * h
                            ctx.save()
                            ctx.globalCompositeOperation = "lighter"
                            const g = ctx.createRadialGradient(px, py, 0, px, py, 40)
                            g.addColorStop(0, "rgba(0,255,255,0.35)")
                            g.addColorStop(1, "rgba(0,0,0,0)")
                            ctx.fillStyle = g
                            ctx.beginPath()
                            ctx.arc(px, py, 40, 0, Math.PI * 2)
                            ctx.fill()
                            ctx.restore()
                        }

                        // grow & tier up
                        creature.size = Math.min(creature.maxSize, creature.size + creature.growthPerEat)
                        const t0 = 42, t1 = 68 // sprite thresholds
                        creature.tier = creature.size >= t1 ? 2 : (creature.size >= t0 ? 1 : 0)
                    }
                }

                // draw creature sprite
                ctx.save()
                ctx.globalCompositeOperation = "lighter"
                ctx.globalAlpha = 0.85 * creature.opacity
                const img = images.creature[creature.tier]
                const drawX = creature.x * w
                const drawY = creature.y * h
                const s = creature.size
                const wiggle = Math.sin(Date.now() * 0.006) * 0.15
                ctx.translate(drawX, drawY)
                ctx.rotate(wiggle)
                if (img && img.complete) {
                    ctx.drawImage(img, -s, -s, s * 2, s * 2)
                } else {
                    // fallback glowing blob
                    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s)
                    grd.addColorStop(0, "rgba(160,220,255,0.7)")
                    grd.addColorStop(1, "rgba(0,0,0,0)")
                    ctx.fillStyle = grd
                    ctx.beginPath()
                    ctx.arc(0, 0, s, 0, Math.PI * 2)
                    ctx.fill()
                }
                ctx.restore()
            }

            // ---- Bloom pass ----
            const bloom = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8)
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
            if (!isMobile) window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("click", handleClick)
            cancelers.forEach((evt) => window.removeEventListener(evt, resetIdle))
            if (idleTimeout) clearTimeout(idleTimeout)
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
