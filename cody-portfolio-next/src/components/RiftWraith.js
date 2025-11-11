// src/components/RiftWraith.js
export function createRiftWraith(ctx, w, h, DPR, particles, enabled, isMobile) {
    const SPRITES = {
        creature: [
            "/assets/creature/creature_1.png",
            "/assets/creature/creature_2.png",
            "/assets/creature/creature_3.png",
        ],
        portal: "/assets/creature/portal.png",
    }

    const images = { creature: [], portal: null }
    let allLoaded = false

    // ---- load images ----
    const loadImage = (src) =>
        new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = src
        })

    Promise.all([...SPRITES.creature.map(loadImage), loadImage(SPRITES.portal)]).then((res) => {
        images.creature = res.slice(0, 3).filter(Boolean)
        images.portal = res[3]
        allLoaded = true
    })

    // ---- state ----
    const creature = {
        active: false,
        exiting: false,
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0,
        size: 28,
        maxSize: 90,
        growthPerEat: 6,
        tier: 0,
        opacity: 0,
        speed: 0.0035,
        eatRadius: 0.02,
        nextSeekAt: 0,
    }

    const portal = {
        active: false,
        x: 0.5,
        y: 0.5,
        r: 80,
        rot: 0,
        opacity: 0,
        opening: false,
        closing: false,
    }

    const trail = []
    const maxTrail = 25

    const idleMs = 60000
    let idleTimeout = null
    let respawnCooldown = false

    // ---- functions ----
    const startPortal = (x, y) => {
        portal.active = true
        portal.opening = true
        portal.closing = false
        portal.opacity = 0
        portal.x = x
        portal.y = y
    }

    const closePortal = () => {
        portal.opening = false
        portal.closing = true
    }

    const spawnCreature = (x, y) => {
        creature.active = true
        creature.exiting = false
        creature.x = x
        creature.y = y
        creature.vx = 0
        creature.vy = 0
        creature.size = 28
        creature.tier = 0
        creature.opacity = 0
        trail.length = 0

        // close the portal once creature is out
        setTimeout(closePortal, 1200)
    }

    const exitCreature = () => {
        if (!creature.active || creature.exiting) return
        creature.exiting = true
        portal.active = true
        portal.x = creature.x
        portal.y = creature.y
        portal.opening = true
        portal.closing = false
    }

    const finishExit = () => {
        creature.active = false
        creature.exiting = false
        closePortal()
    }

    // ---- idle control ----
    const resetIdle = () => {
        if (idleTimeout) clearTimeout(idleTimeout)

        // If user returns, trigger creature exit
        if (creature.active && !creature.exiting) {
            exitCreature()
        }

        if (respawnCooldown) return

        if (enabled && !isMobile) {
            idleTimeout = setTimeout(() => {
                respawnCooldown = true
                const spawnX = 0.15 + Math.random() * 0.7
                const spawnY = 0.2 + Math.random() * 0.6
                startPortal(spawnX, spawnY)
                setTimeout(() => {
                    spawnCreature(spawnX, spawnY)
                    setTimeout(() => (respawnCooldown = false), 5000)
                }, 400)
            }, idleMs)
        }
    }

    const cancelers = ["mousemove", "scroll", "keydown", "touchstart"]
    cancelers.forEach((evt) => window.addEventListener(evt, resetIdle))
    resetIdle()

    // ---- draw/update ----
    function updateAndDraw(hue, w, h) {
        if (!allLoaded) return
        const now = performance.now()

        // portal animation
        if (portal.active) {
            if (portal.opening) {
                portal.opacity = Math.min(1, portal.opacity + 0.05)
                if (portal.opacity >= 1) portal.opening = false
            } else if (portal.closing) {
                portal.opacity = Math.max(0, portal.opacity - 0.05)
                if (portal.opacity <= 0) {
                    portal.active = false
                    portal.closing = false
                }
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

        // creature update
        if (creature.active) {
            // fade
            if (!creature.exiting) {
                creature.opacity = Math.min(1, creature.opacity + 0.05)
            } else {
                creature.opacity = Math.max(0, creature.opacity - 0.05)
                if (creature.opacity <= 0) {
                    finishExit()
                    return
                }
            }

            // AI movement
            if (particles.length < 5) return
            let targetIdx = -1
            if (now > creature.nextSeekAt) {
                let bestD2 = 1e9
                for (let i = 0; i < particles.length; i++) {
                    const dx = particles[i].x - creature.x
                    const dy = particles[i].y - creature.y
                    const d2 = dx * dx + dy * dy
                    if (d2 < bestD2) {
                        bestD2 = d2
                        targetIdx = i
                    }
                }
                creature.nextSeekAt = now + 80
            }

            if (targetIdx >= 0 && !creature.exiting) {
                const t = particles[targetIdx]
                const dx = t.x - creature.x
                const dy = t.y - creature.y
                const len = Math.hypot(dx, dy) || 1
                const step = creature.speed * (enabled ? 1 : 0)
                const prevX = creature.x
                const prevY = creature.y
                creature.x += (dx / len) * step
                creature.y += (dy / len) * step

                trail.push({ x: prevX, y: prevY, life: 1.0 })
                if (trail.length > maxTrail) trail.shift()

                if (len < creature.eatRadius) {
                    particles.splice(targetIdx, 1)
                    creature.size = Math.min(creature.maxSize, creature.size + creature.growthPerEat)
                    const t0 = 42, t1 = 68
                    creature.tier = creature.size >= t1 ? 2 : (creature.size >= t0 ? 1 : 0)
                }
            }

            // trail
            ctx.save()
            ctx.globalCompositeOperation = "lighter"
            for (let i = 0; i < trail.length; i++) {
                const p = trail[i]
                p.life -= 0.04
                if (p.life <= 0) continue
                const px = p.x * w
                const py = p.y * h
                const grad = ctx.createRadialGradient(px, py, 0, px, py, 30)
                grad.addColorStop(0, `rgba(100,200,255,${0.18 * p.life})`)
                grad.addColorStop(1, `rgba(0,0,0,0)`)
                ctx.fillStyle = grad
                ctx.beginPath()
                ctx.arc(px, py, 30, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.restore()

            // draw creature
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
    }

    return { updateAndDraw, resetIdle, cancelers }
}
