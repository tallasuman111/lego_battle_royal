// Sleek 2D / 2.5D Rendering engine for Lego Minifigures, cargo planes, weapons, parachutes, and camera effects
export class Camera {
    constructor(x = 1800, y = 1800) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        
        // Recoil screen shake
        this.shakeIntensity = 0;
        this.shakeTime = 0;
    }

    update(tx, ty, dt) {
        this.targetX = tx;
        this.targetY = ty;

        // Smooth camera LERP tracking
        const lerpSpeed = 5 * dt;
        this.x += (this.targetX - this.x) * Math.min(1, lerpSpeed);
        this.y += (this.targetY - this.y) * Math.min(1, lerpSpeed);

        // Zoom LERP
        this.zoom += (this.targetZoom - this.zoom) * Math.min(1, lerpSpeed);

        // Shake decay
        if (this.shakeTime > 0) {
            this.shakeTime -= dt * 1000;
            if (this.shakeTime <= 0) {
                this.shakeIntensity = 0;
            }
        }
    }

    shake(intensity, duration = 150) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }

    apply(ctx, width, height) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(this.zoom, this.zoom);

        // Offset for camera positions
        let cx = -this.x;
        let cy = -this.y;

        // Apply screen shake forces
        if (this.shakeTime > 0) {
            cx += (Math.random() - 0.5) * this.shakeIntensity;
            cy += (Math.random() - 0.5) * this.shakeIntensity;
        }

        ctx.translate(cx, cy);
    }

    revert(ctx) {
        ctx.restore();
    }
}

export class GraphicsEngine {
    // Renders a LEGO cargo dropship plane moving across the island
    static drawPlane(ctx, px, py, angle, scale = 1.5) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        
        // Drop shadow for the high-altitude plane
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 40;
        ctx.shadowOffsetY = 120;

        ctx.fillStyle = '#7f8c8d'; // Classic Gray Lego Bricks
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 4;

        // Main cylindrical fuselage (drawn as long rectangle blocks)
        ctx.fillRect(-150, -35, 300, 70);
        ctx.strokeRect(-150, -35, 300, 70);

        // Cockpit (blocky black windshield glass)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(100, -25, 45, 50);
        ctx.strokeRect(100, -25, 45, 50);
        
        // Yellow headlights
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(135, -20, 10, 10);
        ctx.fillRect(135, 10, 10, 10);

        // Huge wings
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.moveTo(-40, -35);
        ctx.lineTo(-70, -220); // Tip left
        ctx.lineTo(-20, -220);
        ctx.lineTo(25, -35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-40, 35);
        ctx.lineTo(-70, 220); // Tip right
        ctx.lineTo(-20, 220);
        ctx.lineTo(25, 35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Horizontal tail fins
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-145, -75, 30, 45);
        ctx.strokeRect(-145, -75, 30, 45);
        ctx.fillRect(-145, 30, 30, 45);
        ctx.strokeRect(-145, 30, 30, 45);

        // Jet Engine Turbines on wings
        const drawEngine = (ex, ey) => {
            ctx.fillStyle = '#e74c3c'; // Red highlights
            ctx.fillRect(ex - 20, ey - 15, 50, 30);
            ctx.strokeRect(ex - 20, ey - 15, 50, 30);
            // Yellow jet fire
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(ex - 35, ey - 8, 15, 16);
        };

        drawEngine(-40, -110);
        drawEngine(-40, 110);

        // Cargo Door markings at back
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-140, -20, 15, 40);
        
        // Lego Stud decoration lines along fuselage
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let x = -100; x < 80; x += 30) {
            ctx.beginPath();
            ctx.arc(x, -18, 4, 0, Math.PI * 2);
            ctx.arc(x, 18, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Draws a beautiful 2.5D LEGO Minifigure
    static drawMinifig(ctx, opts) {
        const x = opts.x || 0;
        const y = opts.y || 0;
        const angle = opts.angle || 0;
        const skinColor = opts.skinColor || '#f5b041'; // Bright yellow
        const torsoColor = opts.torsoColor || '#3498db';
        const legsColor = opts.legsColor || '#2c3e50';
        const state = opts.state || 'alive'; // alive, plane, parachute, dead
        const walkingFrame = opts.walkingFrame || 0;
        const activeWeapon = opts.activeWeapon || null;
        const armorLevel = opts.armorLevel || 0;
        const shield = opts.shield || 0;
        const username = opts.username || 'Minifig';
        const isPlayer = opts.isPlayer || false;
        const healthPercent = opts.healthPercent !== undefined ? opts.healthPercent : 1.0;

        if (state === 'plane' || state === 'dead') return; // Handled separately or invisible

        ctx.save();
        ctx.translate(x, y);

        // 1. Draw Parachute Canopy if skydiving
        if (state === 'parachute') {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 30;

            // Lines connect from canopy to player (we just draw thick straps)
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-40, -75);
            ctx.moveTo(0, 0);
            ctx.lineTo(40, -75);
            ctx.stroke();

            // Huge Red & White striped Lego Parachute Canopy
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(0, -85, 55, Math.PI, 0);
            ctx.fill();

            // White accent stripes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, -85, 30, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(0, -85, 10, Math.PI, 0);
            ctx.fill();

            // Highlight border
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -85, 55, Math.PI, 0);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        // Align body rotation towards crosshair aim angle
        ctx.rotate(angle + Math.PI / 2);

        // 2. Draw Legs (Rotating forward/backwards to simulate running)
        ctx.fillStyle = legsColor;
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.0;

        const legSweep = Math.sin(walkingFrame) * 8; // Running swing amplitude

        // Left Leg
        ctx.save();
        ctx.translate(-7, legSweep);
        ctx.fillRect(-4, -6, 8, 12);
        ctx.strokeRect(-4, -6, 8, 12);
        ctx.restore();

        // Right Leg
        ctx.save();
        ctx.translate(7, -legSweep);
        ctx.fillRect(-4, -6, 8, 12);
        ctx.strokeRect(-4, -6, 8, 12);
        ctx.restore();

        // 3. Draw Torso (Shoulders trapezoid block)
        ctx.fillStyle = torsoColor;
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-9, -10);
        ctx.lineTo(9, -10);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vest/Armor visual enhancement
        if (armorLevel > 0) {
            ctx.fillStyle = armorLevel === 3 ? '#34495e' : (armorLevel === 2 ? '#95a5a6' : '#a6acaf');
            ctx.beginPath();
            ctx.moveTo(-10, 8);
            ctx.lineTo(-7, -8);
            ctx.lineTo(7, -8);
            ctx.lineTo(10, 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Bullet vest straps
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-5, -8); ctx.lineTo(-5, 8);
            ctx.moveTo(5, -8); ctx.lineTo(5, 8);
            ctx.stroke();
        }

        // 4. Draw Arms & Hands holding weapon
        ctx.fillStyle = torsoColor;
        ctx.lineWidth = 2.0;

        // Check if player has a weapon equipped
        const hasGun = activeWeapon !== null;

        // Left Arm (Usually resting or aiming)
        ctx.save();
        if (hasGun) {
            ctx.translate(-10, -3);
            ctx.rotate(-0.35); // Swing arm forward
            ctx.fillRect(-3, 0, 6, 12);
            ctx.strokeRect(-3, 0, 6, 12);
            
            // Hand hook
            ctx.fillStyle = skinColor;
            ctx.beginPath(); ctx.arc(0, 13, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
            // Sway arms naturally when walking
            const armSweep = Math.sin(walkingFrame) * 0.4;
            ctx.translate(-11, 0);
            ctx.rotate(-armSweep);
            ctx.fillRect(-3, -2, 6, 13);
            ctx.strokeRect(-3, -2, 6, 13);
            
            ctx.fillStyle = skinColor;
            ctx.beginPath(); ctx.arc(0, 12, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();

        // Right Arm (Always pointing weapon forward)
        ctx.fillStyle = torsoColor;
        ctx.save();
        if (hasGun) {
            ctx.translate(10, -3);
            ctx.rotate(0.3);
            ctx.fillRect(-3, 0, 6, 12);
            ctx.strokeRect(-3, 0, 6, 12);
            
            // Hand hook
            ctx.fillStyle = skinColor;
            ctx.beginPath(); ctx.arc(0, 13, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
            const armSweep = Math.sin(walkingFrame) * 0.4;
            ctx.translate(11, 0);
            ctx.rotate(armSweep);
            ctx.fillRect(-3, -2, 6, 13);
            ctx.strokeRect(-3, -2, 6, 13);
            
            ctx.fillStyle = skinColor;
            ctx.beginPath(); ctx.arc(0, 12, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();

        // 5. Draw Weapon (Crisp 2D Lego Guns)
        if (hasGun) {
            ctx.save();
            ctx.translate(6, -2);
            ctx.rotate(-Math.PI / 2); // Point straight ahead from aiming front

            ctx.fillStyle = '#2c3e50'; // Steel color
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;

            if (activeWeapon.id === 'pistol') {
                // Short blocky pistol
                ctx.fillRect(-3, -6, 6, 12);
                ctx.fillRect(-2, -6, 4, -4); // barrel
                ctx.strokeRect(-3, -6, 6, 12);
            } else if (activeWeapon.id === 'smg') {
                // Compact SMG
                ctx.fillRect(-4, -8, 8, 16);
                ctx.fillRect(-2, -8, 4, -8); // extended barrel
                ctx.fillRect(-3, 4, 6, 4); // stock
                ctx.fillRect(2, -4, 2, 8); // magazine
                ctx.strokeRect(-4, -8, 8, 16);
            } else if (activeWeapon.id === 'shotgun') {
                // Heavy blocky barrel
                ctx.fillRect(-4, -10, 8, 20);
                ctx.fillRect(-3, -12, 6, -6); // double barrel
                ctx.fillStyle = '#a0522d'; // Brown wood buttstock
                ctx.fillRect(-4, 6, 8, 8);
                ctx.strokeRect(-4, -10, 8, 20);
            } else if (activeWeapon.id === 'rifle') {
                // Assault Rifle
                ctx.fillRect(-4, -10, 8, 22);
                ctx.fillRect(-2, -10, 4, -12); // long barrel
                ctx.fillStyle = '#d35400'; // Orange/wood stock accent
                ctx.fillRect(-4, 8, 8, 6);
                // Magazine curved block
                ctx.fillStyle = '#2c3e50';
                ctx.beginPath();
                ctx.moveTo(3, -2);
                ctx.lineTo(8, -6);
                ctx.lineTo(8, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (activeWeapon.id === 'sniper') {
                // Extremely long heavy sniper rifle
                ctx.fillRect(-4, -12, 8, 26);
                ctx.fillRect(-1.5, -12, 3, -22); // Massive heavy barrel
                ctx.fillRect(-1.5, -24, 4, -2); // Muzzle brake
                ctx.fillStyle = '#27ae60'; // Camouflage stock
                ctx.fillRect(-4, 10, 8, 8);
                // Scope sight
                ctx.fillStyle = '#000';
                ctx.fillRect(-5, -6, 2, 10);
            } else if (activeWeapon.id === 'bricklauncher') {
                // Bazooka brick mortar tube
                ctx.fillStyle = '#c0392b'; // Lego Red Rocket tube
                ctx.fillRect(-6, -14, 12, 28);
                ctx.strokeRect(-6, -14, 12, 28);
                // Loaded LEGO Brick showing in muzzle
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(-4, -17, 8, 3);
            }
            ctx.restore();
        }

        // 6. Draw Neck & Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw dynamic minifig eyes and smile
        ctx.save();
        ctx.rotate(-Math.PI / 2); // Rotate details to face aim direction
        ctx.fillStyle = '#000';
        // Left eye
        ctx.beginPath(); ctx.arc(2.5, -2.5, 1, 0, Math.PI*2); ctx.fill();
        // Right eye
        ctx.beginPath(); ctx.arc(2.5, 2.5, 1, 0, Math.PI*2); ctx.fill();
        // Smiling mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(1.0, 0, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();

        // 7. Draw Helmet / Accessories
        if (armorLevel > 0) {
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            // Draw helmet shell covering head
            ctx.fillStyle = armorLevel === 3 ? '#34495e' : (armorLevel === 2 ? '#7f8c8d' : '#95a5a6');
            ctx.beginPath();
            ctx.arc(0, 0, 8.5, Math.PI * 0.9, -Math.PI * 0.1); // shell dome
            ctx.lineTo(3, 8.5);
            ctx.lineTo(1, 0);
            ctx.lineTo(3, -8.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Level 3 visor
            if (armorLevel === 3) {
                ctx.fillStyle = '#f1c40f'; // Gold reflective visor
                ctx.fillRect(4, -5, 3, 10);
                ctx.strokeRect(4, -5, 3, 10);
            }
            ctx.restore();
        } else {
            // Draw standard Lego cap or hair
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(0, 0, 8, Math.PI, 0);
            ctx.fill();
        }

        ctx.restore(); // Revert entity rotate

        // 8. Draw UI Indicators (Username, Health bar, Shields above head in screen space)
        // Note: These must not rotate with the player, so they are drawn in static orientation
        ctx.save();
        ctx.translate(x, y);

        // Name tag
        ctx.fillStyle = isPlayer ? '#f1c40f' : '#ffffff';
        ctx.font = '600 10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(username, 0, -22);
        ctx.shadowBlur = 0;

        // Compact Health & Shield bar above head
        if (healthPercent < 1.0 || shield > 0) {
            const barW = 28;
            const barH = 3;
            const by = -16;

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(-barW/2, by, barW, barH);

            // Health layer
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(-barW/2, by, barW * healthPercent, barH);

            // Shield layer directly below
            if (shield > 0) {
                ctx.fillStyle = '#3498db';
                ctx.fillRect(-barW/2, by + barH + 1, barW * (shield / 100), 2);
            }
        }
        ctx.restore();
    }
}
