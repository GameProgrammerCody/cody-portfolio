// src/components/RiftWraith.js
// Handles the Rift Wraith creature logic, portal effects, idle detection, and drawing.
// Includes visual level-up effects (pulse, radial flash, and sparks).

export function createRiftWraith(ctx, w, h, DPR, particles, enabled, isMobile) {
    // -------------------------------
    //  SPRITE SETUP
    // -------------------------------
    const SPRITES = {
        creature: [
            "/assets/creature/creature_1.png",
            "/assets/creature/creature_2.png",
            "/assets/creature/creature_3.png",
            "/assets/creature/creature_4.png",
            "/assets/creature/creature_5.png",
            "/assets/creature/creature_6.png",
        ],
        portal: "/assets/creature/portal.png",
    };

    // Preload all assets
    const images = { creature: [], portal: null };
    let assetsReady = false;

    const loadImage = (src) =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });

    Promise.all([...SPRITES.creature.map(loadImage), loadImage(SPRITES.portal)]).then((res) => {
        images.creature = res.slice(0, 6).filter(Boolean);
        images.portal = res[6];
        assetsReady = true;
    });

    // -------------------------------
    //  CREATURE DATA
    // -------------------------------
    const creature = {
        active: false,
        exiting: false,
        x: 0.5,
        y: 0.5,
        size: 28,
        maxSize: 160,
        growthPerEat: 2.2,   // slower growth per particle
        tier: 0,
        opacity: 0,
        pulse: 0,            // used for level-up pulse
        speed: 0.0025,
        eatRadius: 0.02,
        nextSeekAt: 0,
    };

    // -------------------------------
    //  PORTAL DATA
    // -------------------------------
    const portal = {
        active: false,
        x: 0.5,
        y: 0.5,
        r: 82,
        rot: 0,
        opacity: 0,
        opening: false,
        closing: false,
    };

    // -------------------------------
    //  TRAIL + VISUAL EFFECTS
    // -------------------------------
    const trail = [];
    const maxTrail = 28;

    // Transient effect arrays
    const levelUpBursts = []; // bright radial flashes
    const sparks = [];        // flying spark particles

    // -------------------------------
    //  FINITE STATE MACHINE
    // -------------------------------
    // idle → spawn_open → spawn_creature → roaming → exit_open → exit_fade → idle
    let state = "idle";
    let spawnTimer = 0;
    const idleMs = 60000;
    let idleTimeout = null;
    let cooldown = false;

    // ---- Portal helpers ----
    const openPortalAt = (x, y) => {
        portal.active = true;
        portal.opening = true;
        portal.closing = false;
        portal.opacity = 0;
        portal.x = x;
        portal.y = y;
    };

    const closePortal = () => {
        portal.opening = false;
        portal.closing = true;
    };

    // ---- Creature spawning and exit ----
    const beginSpawn = () => {
        const x = 0.15 + Math.random() * 0.7;
        const y = 0.2 + Math.random() * 0.6;
        openPortalAt(x, y);
        spawnTimer = performance.now();
        state = "spawn_open";
    };

    const spawnCreature = (x, y) => {
        creature.active = true;
        creature.exiting = false;
        creature.x = x;
        creature.y = y;
        creature.size = 28;
        creature.tier = 0;
        creature.opacity = 0;
        creature.pulse = 0;
        trail.length = 0;
    };

    const startExit = () => {
        if (!creature.active || creature.exiting) return;
        creature.exiting = true;
        openPortalAt(creature.x, creature.y);
        state = "exit_open";
    };

    // ---- Idle control ----
    const resetIdle = () => {
        if (idleTimeout) clearTimeout(idleTimeout);

        // If creature exists, trigger exit sequence
        if (state === "roaming" || state === "spawn_creature") {
            startExit();
            return;
        }

        // Otherwise, arm idle spawn timer
        if (!cooldown && enabled && !isMobile) {
            idleTimeout = setTimeout(() => {
                cooldown = true;
                beginSpawn();
                setTimeout(() => (cooldown = false), 5000);
            }, idleMs);
        }
    };

    const cancelers = ["mousemove", "scroll", "keydown", "touchstart"];
    cancelers.forEach((evt) => window.addEventListener(evt, resetIdle));
    resetIdle();

    // -------------------------------
    //  UPDATE + DRAW LOOP
    // -------------------------------
    function updateAndDraw(hue, W, H) {
        if (!assetsReady) return;
        const now = performance.now();

        // ---- Portal animation ----
        if (portal.active) {
            if (portal.opening) {
                portal.opacity = Math.min(1, portal.opacity + 0.05);
                if (portal.opacity >= 1) portal.opening = false;
            } else if (portal.closing) {
                portal.opacity = Math.max(0, portal.opacity - 0.05);
                if (portal.opacity <= 0) {
                    portal.active = false;
                    portal.closing = false;
                }
            }
            portal.rot += 0.01;

            // draw portal
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.translate(portal.x * W, portal.y * H);
            ctx.rotate(portal.rot);
            const pr = portal.r;
            if (images.portal && images.portal.complete) {
                ctx.globalAlpha = 0.6 * portal.opacity;
                ctx.drawImage(images.portal, -pr, -pr, pr * 2, pr * 2);
            } else {
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pr);
                grad.addColorStop(0, `rgba(0,255,255,${0.25 * portal.opacity})`);
                grad.addColorStop(0.7, `rgba(120,120,255,${0.18 * portal.opacity})`);
                grad.addColorStop(1, `rgba(0,0,0,0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // ---- FSM transitions ----
        if (state === "spawn_open") {
            if (now - spawnTimer > 400 && !creature.active) {
                spawnCreature(portal.x, portal.y);
                setTimeout(() => closePortal(), 1200);
                state = "spawn_creature";
            }
        } else if (state === "exit_open") {
            if (!portal.opening && portal.active && !portal.closing) state = "exit_fade";
        } else if (state === "exit_fade") {
            if (!creature.active) {
                closePortal();
                state = "idle";
                resetIdle();
            }
        }

        // ---- Creature logic ----
        if (creature.active) {
            // fade in/out
            if (!creature.exiting) creature.opacity = Math.min(1, creature.opacity + 0.05);
            else {
                creature.opacity = Math.max(0, creature.opacity - 0.05);
                if (creature.opacity <= 0) {
                    creature.active = false;
                    creature.exiting = false;
                    trail.length = 0;
                }
            }

            // update pulse + fade effects
            if (creature.pulse > 0) creature.pulse -= 0.04;
            levelUpBursts.forEach((b) => (b.life -= 0.05));
            for (let i = levelUpBursts.length - 1; i >= 0; i--)
                if (levelUpBursts[i].life <= 0) levelUpBursts.splice(i, 1);
            sparks.forEach((s) => (s.life -= 0.05));
            for (let i = sparks.length - 1; i >= 0; i--)
                if (sparks[i].life <= 0) sparks.splice(i, 1);

            // movement + eating
            if (!creature.exiting && particles.length > 0) {
                if (now > creature.nextSeekAt) {
                    let best = -1, bestD2 = 1e9;
                    for (let i = 0; i < particles.length; i++) {
                        const dx = particles[i].x - creature.x;
                        const dy = particles[i].y - creature.y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < bestD2) { bestD2 = d2; best = i; }
                    }
                    creature.nextSeekAt = now + 80;

                    if (best >= 0) {
                        const t = particles[best];
                        const dx = t.x - creature.x;
                        const dy = t.y - creature.y;
                        const len = Math.hypot(dx, dy) || 1;
                        const step = creature.speed * (enabled ? 1 : 0);
                        const prevX = creature.x, prevY = creature.y;
                        creature.x += (dx / len) * step;
                        creature.y += (dy / len) * step;

                        // trail
                        trail.push({ x: prevX, y: prevY, life: 1.0 });
                        if (trail.length > maxTrail) trail.shift();

                        // eat particle
                        if (len < creature.eatRadius) {
                            particles.splice(best, 1);
                            const previousTier = creature.tier;
                            creature.size = Math.min(creature.maxSize, creature.size + creature.growthPerEat);

                            // tier progression thresholds
                            const thresholds = [36, 52, 70, 92, 118];
                            let tier = 0;
                            for (let i = 0; i < thresholds.length; i++) if (creature.size >= thresholds[i]) tier = i + 1;
                            creature.tier = Math.min(tier, images.creature.length - 1);

                            // LEVEL-UP FLASH + SPARKS
                            if (creature.tier > previousTier) {
                                creature.pulse = 1.0;
                                const bx = creature.x * W, by = creature.y * H;

                                // bright radial burst
                                levelUpBursts.push({ x: bx, y: by, r: 0, life: 1 });

                                // spark burst
                                for (let i = 0; i < 16; i++) {
                                    const a = Math.random() * Math.PI * 2;
                                    const s = 2 + Math.random() * 3;
                                    sparks.push({
                                        x: bx,
                                        y: by,
                                        vx: Math.cos(a) * s,
                                        vy: Math.sin(a) * s,
                                        life: 1,
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // ---- Draw trail ----
            if (trail.length) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                for (let i = 0; i < trail.length; i++) {
                    const p = trail[i];
                    p.life -= 0.04;
                    if (p.life <= 0) continue;
                    const px = p.x * W, py = p.y * H;
                    const grad = ctx.createRadialGradient(px, py, 0, px, py, 30);
                    grad.addColorStop(0, `rgba(100,200,255,${0.18 * p.life})`);
                    grad.addColorStop(1, `rgba(0,0,0,0)`);
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(px, py, 30, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // ---- Draw level-up flash + sparks ----
            if (levelUpBursts.length) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                levelUpBursts.forEach((b) => {
                    b.r += 20;
                    const alpha = 0.35 * b.life;
                    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                    grad.addColorStop(0, `rgba(120,255,255,${alpha})`);
                    grad.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            }

            if (sparks.length) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                for (let i = sparks.length - 1; i >= 0; i--) {
                    const s = sparks[i];
                    s.x += s.vx;
                    s.y += s.vy;
                    ctx.globalAlpha = s.life;
                    ctx.fillStyle = "rgba(180,255,255,0.8)";
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // ---- Draw creature ----
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.9 * creature.opacity;

            const img = images.creature[Math.min(creature.tier, images.creature.length - 1)];
            const s = creature.size;
            const dx = creature.x * W, dy = creature.y * H;
            const wiggle = Math.sin(Date.now() * 0.006) * 0.15;
            ctx.translate(dx, dy);
            ctx.rotate(wiggle);
            const pulseScale = 1 + creature.pulse * 0.4;

            if (img && img.complete) {
                ctx.drawImage(img, -s * pulseScale, -s * pulseScale, s * 2 * pulseScale, s * 2 * pulseScale);
            } else {
                const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
                grd.addColorStop(0, "rgba(160,220,255,0.7)");
                grd.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(0, 0, s, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Expose methods for background file
    return { updateAndDraw, resetIdle, cancelers };
}
