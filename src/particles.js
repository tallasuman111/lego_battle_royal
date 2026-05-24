// High-performance particle engine simulating Lego studs, brick shards, limbs, sparks, and smoke
class Particle {
    constructor(opts) {
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.radius = opts.radius || 4;
        this.color = opts.color || '#fff';
        this.type = opts.type || 'stud'; // stud, brick, limb, smoke, spark, fire
        this.limbPart = opts.limbPart || 'head'; // head, torso, arm, leg
        
        this.rotation = opts.rotation || 0;
        this.vRotation = opts.vRotation || 0;

        this.life = 1.0;
        this.decay = opts.decay || 0.02;
        this.drag = opts.drag || 0.95; // Ground friction
        this.gravity = opts.gravity || 0; // Simulated height/gravity fall
        this.height = opts.height || 0;
        this.vHeight = opts.vHeight || 0;
    }

    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        
        // Dynamic friction / drag
        this.vx *= Math.pow(this.drag, dt * 60);
        this.vy *= Math.pow(this.drag, dt * 60);

        // Rotation spin
        this.rotation += this.vRotation * dt * 60;

        // Simulated gravity bounce on top-down floor
        if (this.vHeight !== 0 || this.height > 0) {
            this.vHeight -= 0.5 * dt * 60; // Gravity pulling down
            this.height += this.vHeight * dt * 60;
            if (this.height <= 0) {
                this.height = 0;
                this.vHeight = -this.vHeight * 0.4; // Bounce
                this.vRotation *= 0.5;
                this.vx *= 0.6;
                this.vy *= 0.6;
            }
        }

        this.life -= this.decay * dt * 60;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Apply shadow during height displacement for cool 3D pop effect
        if (this.height > 0) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = this.height * 0.5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = this.height * 0.7;
        }

        ctx.translate(this.x, this.y - this.height);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.life);

        if (this.type === 'stud') {
            // Lego Stud Render (Circle with bevel effect)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Inner circle highlight (3D top stud look)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Bevel border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();

        } else if (this.type === 'brick') {
            // Lego 1x1 Brick (Square with a stud on top)
            const size = this.radius * 2;
            
            // Outer drop shadow highlight on bottom right
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(-size/2 + 1, -size/2 + 1, size, size);

            // Core square brick body
            ctx.fillStyle = this.color;
            ctx.fillRect(-size/2, -size/2, size, size);

            // Bevel edges
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-size/2, -size/2, size, size);

            // 1x1 circular stud on top
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(-size * 0.1, -size * 0.1, size * 0.12, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'limb') {
            // Lego Minifigure Body Part Exploding on Death
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;

            if (this.limbPart === 'head') {
                // Lego Head (cylinder with top stud stub)
                ctx.beginPath();
                ctx.rect(-5, -6, 10, 10);
                ctx.rect(-2.5, -8, 5, 2); // Stud top
                ctx.fill();
                ctx.stroke();

                // Eyes & Smile
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-2, -2, 1, 0, Math.PI*2);
                ctx.arc(2, -2, 1, 0, Math.PI*2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(0, 1, 2.5, 0, Math.PI);
                ctx.stroke();

            } else if (this.limbPart === 'torso') {
                // Lego Torso (trapezoid block)
                ctx.beginPath();
                ctx.moveTo(-7, 6);
                ctx.lineTo(-5, -6);
                ctx.lineTo(5, -6);
                ctx.lineTo(7, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

            } else if (this.limbPart === 'arm') {
                // Lego Curved Arm
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.rect(-2, 0, 4, 8);
                ctx.fill();
                ctx.stroke();

            } else if (this.limbPart === 'leg') {
                // Lego rectangular leg block
                ctx.beginPath();
                ctx.rect(-4, -6, 8, 12);
                ctx.rect(-4, 4, 8, 2); // foot base
                ctx.fill();
                ctx.stroke();
            }

        } else if (this.type === 'smoke') {
            // Soft smoke cloud
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, 'rgba(230, 230, 230, ' + this.life * 0.4 + ')');
            grad.addColorStop(1, 'rgba(120, 120, 120, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'spark') {
            // Fading neon lines
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.vx * 2, -this.vy * 2);
            ctx.stroke();

        } else if (this.type === 'fire') {
            // Exploding expanding fireball particle
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, 'rgba(254, 211, 48, ' + this.life + ')'); // bright yellow
            grad.addColorStop(0.4, 'rgba(235, 94, 40, ' + this.life * 0.8 + ')'); // orange
            grad.addColorStop(1, 'rgba(231, 76, 60, 0)'); // transparent red
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    add(p) {
        this.particles.push(new Particle(p));
    }

    spawnMuzzleFlash(x, y, angle) {
        const speed = 3;
        // Sparks
        for (let i = 0; i < 4; i++) {
            const a = angle + (Math.random() - 0.5) * 0.4;
            const s = speed * (0.6 + Math.random() * 0.6);
            this.add({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 2 + Math.random() * 2,
                color: '#f1c40f',
                type: 'spark',
                decay: 0.08,
                drag: 0.9
            });
        }
        // Small smoke puff
        this.add({
            x, y,
            vx: Math.cos(angle) * 0.5,
            vy: Math.sin(angle) * 0.5,
            radius: 8 + Math.random() * 6,
            type: 'smoke',
            decay: 0.04
        });
    }

    spawnStudScatter(x, y, color, count = 8, speed = 4) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const s = (0.3 + Math.random() * 0.7) * speed;
            this.add({
                x, y,
                vx: Math.cos(angle) * s,
                vy: Math.sin(angle) * s,
                radius: 3 + Math.random() * 2,
                color: color,
                type: 'stud',
                decay: 0.01 + Math.random() * 0.015,
                drag: 0.94,
                height: 5 + Math.random() * 10,
                vHeight: 3 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                vRotation: (Math.random() - 0.5) * 0.3
            });
        }
    }

    spawnLegoExplode(x, y, skinColor, torsoColor, legsColor) {
        const parts = [
            { type: 'head', color: skinColor || '#f5b041' },
            { type: 'torso', color: torsoColor || '#3498db' },
            { type: 'arm', color: torsoColor || '#3498db' },
            { type: 'arm', color: torsoColor || '#3498db' },
            { type: 'leg', color: legsColor || '#2c3e50' },
            { type: 'leg', color: legsColor || '#2c3e50' }
        ];

        // Toss out Lego body parts!
        parts.forEach((p) => {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 3;
            this.add({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                type: 'limb',
                limbPart: p.type,
                color: p.color,
                decay: 0.008 + Math.random() * 0.005, // Persist longer on floor
                drag: 0.95,
                height: 10 + Math.random() * 10,
                vHeight: 4 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                vRotation: (Math.random() - 0.5) * 0.2
            });
        });

        // Scatter a shower of matching color brick studs!
        this.spawnStudScatter(x, y, torsoColor, 8, 3.5);
        this.spawnStudScatter(x, y, skinColor, 4, 3.0);
    }

    spawnWallImpact(x, y, angle, color = '#bdc3c7') {
        // Explode into tiny brick crumbs
        const backAngle = angle + Math.PI; // deflect outwards
        for (let i = 0; i < 5; i++) {
            const a = backAngle + (Math.random() - 0.5) * 1.2;
            const s = (0.5 + Math.random() * 1.5) * 3;
            this.add({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 2.5 + Math.random() * 1.5,
                color: color,
                type: 'brick',
                decay: 0.03 + Math.random() * 0.02,
                drag: 0.92,
                height: 2 + Math.random() * 6,
                vHeight: 1 + Math.random() * 3,
                rotation: Math.random() * Math.PI * 2,
                vRotation: (Math.random() - 0.5) * 0.4
            });
        }
    }

    spawnExplosion(x, y) {
        // Central flash
        this.add({
            x, y,
            vx: 0, vy: 0,
            radius: 40 + Math.random() * 15,
            type: 'fire',
            decay: 0.03,
            drag: 1
        });

        // Ring sparks
        for (let i = 0; i < 15; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 4 + Math.random() * 6;
            this.add({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 3 + Math.random() * 3,
                color: '#e67e22',
                type: 'spark',
                decay: 0.02 + Math.random() * 0.02,
                drag: 0.93
            });
        }

        // Heavy dark smoke rings
        for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 0.5 + Math.random() * 1.5;
            this.add({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                radius: 20 + Math.random() * 15,
                type: 'smoke',
                decay: 0.01 + Math.random() * 0.01
            });
        }

        // Scatter random red/orange/yellow Lego brick shards
        const colors = ['#e74c3c', '#f1c40f', '#f39c12', '#7f8c8d'];
        for (let i = 0; i < 12; i++) {
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.spawnStudScatter(x, y, c, 1, 6);
        }
    }

    update(dt) {
        // Update in reverse to handle splicing safely
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const alive = this.particles[i].update(dt);
            if (!alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach((p) => p.draw(ctx));
    }
}
export const fx = new ParticleSystem();
