// src/components/RiftWraith.js
export function createRiftWraith(ctx, w, h, DPR, particles, enabled, isMobile) {
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

    // ---- preload ----
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

    // ---- creature ----
    const creature = {
        active: false,
        exiting: false,
        x: 0.5,
        y: 0.5,
        size: 5,
        maxSize: 50,
        growthPerEat: 0.33,
        tier: 0,
        opacity: 0,
        speed: 0.0025,
        nextSeekAt: 0,
        nextTargetSwitch: 0,
        angle: 0,
        target: null,
    };

    // ---- portal ----
    const portal = {
        active: false,
        x: 0.5,
        y: 0.5,
        r: 10,
        targetR: 40,
        rot: 0,
        opacity: 0,
        opening: false,
        closing: false,
    };

    const trail = [];
    const maxTrail = 28;
    const levelUpBursts = [];
    const sparks = [];

    // ---- FSM ----
    let state = "idle";
    let spawnTimer = 0;
    const idleMs = 60000;
    let idleTimeout = null;
    let cooldown = false;

    const openPortalAt = (x, y) => {
        const baseRadius = 16;
        const sizeFactor = creature.size / creature.maxSize || 0.1;
        const targetSize = (baseRadius + sizeFactor * 24) * 0.8;

        portal.active = true;
        portal.opening = true;
        portal.closing = false;
        portal.opacity = 0;
        portal.r = 8;
        portal.targetR = targetSize;
        portal.x = x;
        portal.y = y;
    };

    const closePortal = () => {
        portal.opening = false;
        portal.closing = true;
    };

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
        creature.size = 5;
        creature.tier = 0;
        creature.opacity = 0;
        creature.angle = Math.random() * Math.PI * 2;
        creature.target = null;
        trail.length = 0;
    };

    const startExit = () => {
        if (!creature.active || creature.exiting) return;
        creature.exiting = true;
        openPortalAt(creature.x, creature.y);
        state = "exit_open";
    };

    const resetIdle = () => {
        if (idleTimeout) clearTimeout(idleTimeout);
        if (state === "roaming" || state === "spawn_creature") {
            startExit();
            return;
        }
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

    // ---- main update/draw ----
    function updateAndDraw(hue, W, H) {
        if (!assetsReady) return;

        // PORTAL ANIM
        if (portal.active) {
            const sizeFactor = creature.active ? creature.size / creature.maxSize : 0.1;
            portal.targetR = (16 + sizeFactor * 24) * 0.8;
            portal.r += (portal.targetR - portal.r) * 0.1;

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

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.translate(portal.x * W, portal.y * H);
            ctx.rotate(portal.rot);
            const pr = portal.r;
            if (images.portal && images.portal.complete) {
                ctx.globalAlpha = 0.28 * portal.opacity;
                ctx.drawImage(images.portal, -pr, -pr, pr * 2, pr * 2);
            } else {
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pr);
                grad.addColorStop(0, `rgba(0,255,255,${0.1 * portal.opacity})`);
                grad.addColorStop(0.7, `rgba(120,120,255,${0.07 * portal.opacity})`);
                grad.addColorStop(1, `rgba(0,0,0,0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // FSM transitions
        const now = performance.now();
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

        // CREATURE UPDATE/DRAW
        if (creature.active) {
            if (!creature.exiting) {
                creature.opacity = Math.min(1, creature.opacity + 0.05);
            } else {
                creature.opacity = Math.max(0, creature.opacity - 0.05);
                if (creature.opacity <= 0) {
                    creature.active = false;
                    creature.exiting = false;
                    trail.length = 0;
                }
            }

            // Adjust eat radius to match creature’s on-screen size
            const eatRadius = (creature.size / W) * 0.6;

            // AI seek + smooth direction
            if (!creature.exiting && particles.length > 0) {
                if (now > creature.nextSeekAt) {
                    // Only switch targets every ~300ms
                    if (!creature.target || now > creature.nextTargetSwitch) {
                        let best = -1,
                            bestD2 = 1e9;
                        for (let i = 0; i < particles.length; i++) {
                            const dx = particles[i].x - creature.x;
                            const dy = particles[i].y - creature.y;
                            const d2 = dx * dx + dy * dy;
                            if (d2 < bestD2) {
                                bestD2 = d2;
                                best = i;
                            }
                        }
                        if (best >= 0) {
                            creature.target = particles[best];
                            creature.nextTargetSwitch = now + 300 + Math.random() * 200;
                        }
                    }

                    if (creature.target) {
                        const dx = creature.target.x - creature.x;
                        const dy = creature.target.y - creature.y;
                        const len = Math.hypot(dx, dy) || 1;
                        const step = creature.speed * (enabled ? 1 : 0);
                        const prevX = creature.x,
                            prevY = creature.y;
                        creature.x += (dx / len) * step;
                        creature.y += (dy / len) * step;

                        trail.push({ x: prevX, y: prevY, life: 1.0 });
                        if (trail.length > maxTrail) trail.shift();

                        // eat only when really touching
                        if (len < eatRadius) {
                            const idx = particles.indexOf(creature.target);
                            if (idx >= 0) particles.splice(idx, 1);
                            creature.target = null;

                            const prevTier = creature.tier;
                            creature.size = Math.min(
                                creature.maxSize,
                                creature.size + creature.growthPerEat
                            );

                            const thresholds = [28, 38, 50, 64, 80];
                            let tier = 0;
                            for (let i = 0; i < thresholds.length; i++)
                                if (creature.size >= thresholds[i]) tier = i + 1;
                            creature.tier = Math.min(tier, images.creature.length - 1);

                            if (creature.tier > prevTier) {
                                const bx = creature.x * W,
                                    by = creature.y * H;
                                const scale = creature.size / creature.maxSize;
                                levelUpBursts.push({ x: bx, y: by, r: 0, life: 1, scale });
                                for (let i = 0; i < 6; i++) {
                                    const a = Math.random() * Math.PI * 2;
                                    const s = (1 + Math.random() * 1.5) * (0.5 + scale);
                                    sparks.push({
                                        x: bx,
                                        y: by,
                                        vx: Math.cos(a) * s,
                                        vy: Math.sin(a) * s,
                                        life: 0.7,
                                    });
                                }
                            }
                        }
                    }
                    creature.nextSeekAt = now + 80;
                }
            }

            // Level-up bursts
            if (levelUpBursts.length) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                for (let i = levelUpBursts.length - 1; i >= 0; i--) {
                    const b = levelUpBursts[i];
                    b.r += 8 * (0.5 + b.scale);
                    b.life -= 0.04;
                    if (b.life <= 0) {
                        levelUpBursts.splice(i, 1);
                        continue;
                    }
                    const alpha = 0.08 * b.life * (0.5 + b.scale);
                    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                    grad.addColorStop(0, `rgba(120,255,255,${alpha})`);
                    grad.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // Sparks
            if (sparks.length) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                for (let i = sparks.length - 1; i >= 0; i--) {
                    const s = sparks[i];
                    s.x += s.vx;
                    s.y += s.vy;
                    s.life -= 0.03;
                    if (s.life <= 0) {
                        sparks.splice(i, 1);
                        continue;
                    }
                    ctx.globalAlpha = s.life;
                    ctx.fillStyle = "rgba(160,255,255,0.4)";
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // Draw creature
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.07 * creature.opacity;

            const img = images.creature[Math.min(creature.tier, images.creature.length - 1)];
            const s = creature.size;
            const dx = creature.x * W;
            const dy = creature.y * H;

            // smoother facing interpolation
            let targetAngle = creature.angle;
            if (trail.length > 1) {
                const a = trail[trail.length - 1];
                const b = trail[trail.length - 2];
                targetAngle = Math.atan2(a.y - b.y, a.x - b.x);
            }
            let diff = targetAngle - creature.angle;
            diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
            creature.angle += diff * 0.08; // slower turns = more natural

            const wiggle = Math.sin(Date.now() * 0.006) * 0.15;

            ctx.translate(dx, dy);
            ctx.rotate(creature.angle + wiggle);

            if (img && img.complete) {
                ctx.drawImage(img, -s, -s, s * 2, s * 2);
            } else {
                const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
                grd.addColorStop(0, "rgba(160,220,255,0.25)");
                grd.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(0, 0, s, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    return { updateAndDraw, resetIdle, cancelers };
}
