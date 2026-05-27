import { fx } from './particles.js';

// Procedural Lego Island Map Generator, collision engine, and Battle Royale zone controller
export class GameMap {
    constructor(size = 3600) {
        this.setSize(size);
    }

    setSize(size) {
        this.size = size;
        this.half = size / 2;
        
        // Island configuration
        this.islandRadius = size * 0.42; // Circular island shape surrounded by water
        
        // Sectors (Procedural design parameters)
        this.sectors = [
            { name: 'LEGO CITY CORE', x: size * 0.35, y: size * 0.35, r: size * (400 / 3600), type: 'city' },
            { name: 'BRICK YARDS', x: size * 0.7, y: size * 0.3, r: size * (350 / 3600), type: 'crates' },
            { name: 'CASTLE RUINS', x: size * 0.3, y: size * 0.7, r: size * (350 / 3600), type: 'ruins' },
            { name: 'PINE FOREST HILLS', x: size * 0.65, y: size * 0.68, r: size * (400 / 3600), type: 'forest' }
        ];

        this.buildings = [];
        this.obstacles = []; // Trees, rocks, Lego crates
        this.loot = [];      // Floating collectibles on the floor
        
        // Battle Royale safe playzones
        this.blueZone = { x: this.half, y: this.half, r: size * 0.5 };
        this.whiteZone = { x: this.half, y: this.half, r: size * 0.35 };
        
        this.zonePhase = 1;
        this.zonePhaseMax = 5;
        this.zoneTimer = 90; // Seconds before shrink
        this.zoneDuration = 90; // Default phase duration
        this.isShrinking = false;
        this.shrinkTimerProgress = 0; // percentage
        
        // Damage per second outside blue zone
        this.zoneDamage = 1;
    }

    generate() {
        this.buildings = [];
        this.obstacles = [];
        this.loot = [];

        // 1. Generate Procedural Buildings & Obstacles based on sectors
        this.sectors.forEach((sec) => {
            if (sec.type === 'city') {
                // Generate rectangular LEGO skyscrapers/homes
                const count = 6;
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                    const dist = Math.random() * sec.r * 0.75;
                    const bx = sec.x + Math.cos(angle) * dist;
                    const by = sec.y + Math.sin(angle) * dist;
                    
                    const w = 120 + Math.floor(Math.random() * 3) * 40;
                    const h = 120 + Math.floor(Math.random() * 3) * 40;
                    
                    if (this.isPointOnIsland(bx, by)) {
                        // Enforce a 60px distance between city buildings so players can walk between them
                        if (!this.checkBuildingOverlap(bx, by, w, h, 60)) {
                            this.createBuilding(bx, by, w, h, '#7f8c8d', 1);
                        }
                    }
                }
            } else if (sec.type === 'crates') {
                // Lego warehouses / container yards
                this.createBuilding(sec.x, sec.y, 250, 150, '#34495e', 2);
                
                // Scatter modular crates inside the yard
                const crateColors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#95a5a6'];
                for (let i = 0; i < 35; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const d = Math.random() * sec.r * 0.8;
                    const cx = sec.x + Math.cos(a) * d;
                    const cy = sec.y + Math.sin(a) * d;
                    
                    if (this.isPointOnIsland(cx, cy)) {
                        if (!this.checkBuildingCollision(cx, cy, 45)) {
                            this.obstacles.push({
                                x: cx, y: cy,
                                w: 32, h: 32,
                                type: 'crate',
                                color: crateColors[Math.floor(Math.random() * crateColors.length)]
                            });
                        }
                    }
                }
            } else if (sec.type === 'ruins') {
                // Stone Lego walls and old brick pillars
                const wallColors = ['#7f8c8d', '#95a5a6', '#5d6d7e'];
                for (let i = 0; i < 8; i++) {
                    const rx = sec.x + (Math.random() - 0.5) * sec.r * 1.25;
                    const ry = sec.y + (Math.random() - 0.5) * sec.r * 1.25;
                    const rw = 20 + Math.random() * 140;
                    const rh = 20 + Math.random() * 140;
                    
                    if (this.isPointOnIsland(rx, ry)) {
                        // Enforce a 50px clearance for ruins to avoid overlaps
                        if (!this.checkBuildingOverlap(rx, ry, rw, rh, 50)) {
                            this.buildings.push({
                                x: rx, y: ry,
                                w: rw, h: rh,
                                color: wallColors[Math.floor(Math.random() * wallColors.length)],
                                type: 'ruin',
                                walls: [
                                    { x: rx - rw/2, y: ry - rh/2, w: rw, h: 16 },
                                    { x: rx - rw/2, y: ry + rh/2 - 16, w: rw, h: 16 }
                                ]
                            });
                        }
                    }
                }
            } else if (sec.type === 'forest') {
                // A cluster of green pine trees
                this.createBuilding(sec.x, sec.y, 100, 100, '#d35400', 0.5);
                
                for (let i = 0; i < 60; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const d = Math.random() * sec.r * 0.9;
                    const tx = sec.x + Math.cos(a) * d;
                    const ty = sec.y + Math.sin(a) * d;

                    if (this.isPointOnIsland(tx, ty)) {
                        if (!this.checkBuildingCollision(tx, ty, 45)) {
                            this.obstacles.push({
                                x: tx, y: ty,
                                w: 24, h: 24,
                                type: 'tree',
                                color: '#27ae60'
                            });
                        }
                    }
                }
            }
        });

        // 2. Scatter general wilderness wilderness trees and obstacles across the island
        const obstacleCount = Math.floor(180 * (this.size / 3600));
        for (let i = 0; i < obstacleCount; i++) {
            const rx = (Math.random() - 0.5) * this.size * 0.9 + this.half;
            const ry = (Math.random() - 0.5) * this.size * 0.9 + this.half;

            if (this.isPointOnIsland(rx, ry)) {
                // Ensure we don't spawn right inside an existing building
                if (!this.checkBuildingCollision(rx, ry, 45)) {
                    const isTree = Math.random() > 0.3;
                    if (isTree) {
                        this.obstacles.push({
                            x: rx, y: ry,
                            w: 24, h: 24,
                            type: 'tree',
                            color: Math.random() > 0.4 ? '#27ae60' : '#2ecc71'
                        });
                    } else {
                        // Lego boulder
                        this.obstacles.push({
                            x: rx, y: ry,
                            w: 36, h: 28,
                            type: 'boulder',
                            color: '#7f8c8d'
                        });
                    }
                }
            }
        }

        // 3. Populate loot spawns inside buildings and crates
        this.buildings.forEach((b) => {
            // Spawn multiple loot items inside each building
            const lootCount = b.type === 'ruin' ? 2 : 4;
            for (let i = 0; i < lootCount; i++) {
                const lx = b.x + (Math.random() - 0.5) * (b.w - 40);
                const ly = b.y + (Math.random() - 0.5) * (b.h - 40);
                this.spawnRandomLoot(lx, ly);
            }
        });

        // Add some loot in the open forest/crates sectors too
        const generalLootCount = Math.floor(40 * (this.size / 3600));
        for (let i = 0; i < generalLootCount; i++) {
            const rx = (Math.random() - 0.5) * this.size * 0.8 + this.half;
            const ry = (Math.random() - 0.5) * this.size * 0.8 + this.half;
            if (this.isPointOnIsland(rx, ry) && !this.checkBuildingCollision(rx, ry, 25)) {
                this.spawnRandomLoot(rx, ry);
            }
        }

        // Generate the first circle parameters
        this.calculateNextCircle();
    }

    createBuilding(cx, cy, w, h, color, scaleLootMultiplier) {
        if (!this.isPointOnIsland(cx, cy)) return;
        
        // Define simple walls layout: Top, Bottom, Left, Right with door gaps
        const wallThickness = 12;
        const walls = [
            // Top wall (with door gap in center)
            { x: cx - w/2, y: cy - h/2, w: w * 0.4, h: wallThickness },
            { x: cx + w/2 - w * 0.4, y: cy - h/2, w: w * 0.4, h: wallThickness },
            // Bottom wall
            { x: cx - w/2, y: cy + h/2 - wallThickness, w: w, h: wallThickness },
            // Left wall
            { x: cx - w/2, y: cy - h/2, w: wallThickness, h: h },
            // Right wall
            { x: cx + w/2 - wallThickness, y: cy - h/2, w: wallThickness, h: h }
        ];

        this.buildings.push({
            x: cx, y: cy,
            w: w, h: h,
            color: color,
            type: 'house',
            walls: walls
        });
    }

    isPointOnIsland(x, y) {
        const dx = x - this.half;
        const dy = y - this.half;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.islandRadius;
    }

    checkBuildingCollision(x, y, radius) {
        for (let i = 0; i < this.buildings.length; i++) {
            const b = this.buildings[i];
            if (x + radius > b.x - b.w/2 && x - radius < b.x + b.w/2 &&
                y + radius > b.y - b.h/2 && y - radius < b.y + b.h/2) {
                return true;
            }
        }
        return false;
    }

    spawnRandomLoot(x, y) {
        const roll = Math.random();
        let item = null;

        if (roll < 0.25) {
            // Weapon spawning
            const weaponRoll = Math.random();
            if (weaponRoll < 0.22) {
                item = { type: 'weapon', id: 'smg', name: 'LEGO SMG', color: '#e67e22', ammo: 90 };
            } else if (weaponRoll < 0.44) {
                item = { type: 'weapon', id: 'shotgun', name: 'LEGO Shotgun', color: '#8e44ad', ammo: 15 };
            } else if (weaponRoll < 0.68) {
                item = { type: 'weapon', id: 'rifle', name: 'Assault Rifle', color: '#27ae60', ammo: 60 };
            } else if (weaponRoll < 0.85) {
                item = { type: 'weapon', id: 'sniper', name: 'Sniper Rifle', color: '#f1c40f', ammo: 10 };
            } else {
                item = { type: 'weapon', id: 'bricklauncher', name: 'Stud Launcher', color: '#d35400', ammo: 5 };
            }
        } else if (roll < 0.50) {
            // Ammo packs
            const ammoType = Math.random() > 0.5 ? 'rifle' : 'smg';
            item = { type: 'ammo', id: ammoType, name: ammoType.toUpperCase() + ' Studs', qty: ammoType === 'rifle' ? 30 : 50, color: '#f1c40f' };
        } else if (roll < 0.70) {
            // Armor / Shield
            const armorRoll = Math.random();
            if (armorRoll < 0.5) {
                item = { type: 'armor', id: 'armor1', name: 'Helmet (Lvl 1)', shield: 30, color: '#bdc3c7' };
            } else if (armorRoll < 0.85) {
                item = { type: 'armor', id: 'armor2', name: 'Chestplate (Lvl 2)', shield: 60, color: '#95a5a6' };
            } else {
                item = { type: 'armor', id: 'armor3', name: 'Lego SpecOps (Lvl 3)', shield: 100, color: '#34495e' };
            }
        } else {
            // Medical
            const medRoll = Math.random();
            if (medRoll < 0.6) {
                item = { type: 'med', id: 'medkit', name: 'Lego Red Brick', heal: 50, color: '#e74c3c' };
            } else {
                item = { type: 'med', id: 'boost', name: 'Boost Stud Soda', boost: 40, color: '#f39c12' };
            }
        }

        if (item) {
            this.loot.push({
                x, y,
                id: Math.random().toString(36).substr(2, 9),
                spec: item,
                pulseTimer: Math.random() * Math.PI
            });
        }
    }

    // Resolves collisions of an entity (x, y, radius) with walls, obstacles
    resolveCollisions(entity) {
        if (!entity || entity.state === 'plane' || entity.state === 'parachute') return;

        const radius = entity.radius || 12;
        
        // 1. Collision with building walls
        this.buildings.forEach((b) => {
            // Check bounding box first
            if (entity.x + radius > b.x - b.w/2 - 20 && entity.x - radius < b.x + b.w/2 + 20 &&
                entity.y + radius > b.y - b.h/2 - 20 && entity.y - radius < b.y + b.h/2 + 20) {
                
                b.walls.forEach((wall) => {
                    const cx = Math.max(wall.x, Math.min(entity.x, wall.x + wall.w));
                    const cy = Math.max(wall.y, Math.min(entity.y, wall.y + wall.h));
                    
                    const dx = entity.x - cx;
                    const dy = entity.y - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < radius && dist > 0) {
                        const overlap = radius - dist;
                        entity.x += (dx / dist) * overlap;
                        entity.y += (dy / dist) * overlap;
                    }
                });
            }
        });

        // 2. Collision with round obstacles (trees, boulders, crates)
        this.obstacles.forEach((obs) => {
            const dx = entity.x - obs.x;
            const dy = entity.y - obs.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Collision radius depends on type
            const collRadius = (obs.w / 2) + radius;
            
            if (dist < collRadius) {
                if (dist > 0.05) {
                    const overlap = collRadius - dist;
                    entity.x += (dx / dist) * overlap;
                    entity.y += (dy / dist) * overlap;
                } else {
                    // Prevent division by zero and resulting NaN coordinates if perfectly centered on the obstacle
                    // Push the entity slightly to the right of the obstacle's collision boundary
                    entity.x = obs.x + collRadius + 1;
                }
            }
        });

        // Clamp entity within the procedural circular boundaries of map size
        const dx = entity.x - this.half;
        const dy = entity.y - this.half;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.size * 0.49;
        
        if (dist > maxDist) {
            entity.x = this.half + (dx / dist) * maxDist;
            entity.y = this.half + (dy / dist) * maxDist;
        }
    }

    // Shrinking logic of playzones
    updateZones(dt, onZoneStartShrink, onZoneCompleteShrink) {
        if (this.zonePhase > this.zonePhaseMax) return;

        if (!this.isShrinking) {
            // Count down zone timer
            this.zoneTimer -= dt;
            this.shrinkTimerProgress = Math.max(0, this.zoneTimer / this.zoneDuration);
            
            if (this.zoneTimer <= 0) {
                this.isShrinking = true;
                this.zoneTimer = 0;
                if (onZoneStartShrink) onZoneStartShrink(this.zonePhase);
            }
        } else {
            // Contract blue zone towards white zone center/radius
            const dx = this.whiteZone.x - this.blueZone.x;
            const dy = this.whiteZone.y - this.blueZone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const shrinkSpeedR = 30 * dt; // Units per second
            const shrinkSpeedXY = 15 * dt;

            // Reduce radius
            if (this.blueZone.r > this.whiteZone.r) {
                this.blueZone.r -= shrinkSpeedR;
                if (this.blueZone.r < this.whiteZone.r) this.blueZone.r = this.whiteZone.r;
            }

            // Move blue center towards white center
            if (dist > 1) {
                this.blueZone.x += (dx / dist) * Math.min(dist, shrinkSpeedXY);
                this.blueZone.y += (dy / dist) * Math.min(dist, shrinkSpeedXY);
            }

            // Shrink completed?
            if (Math.abs(this.blueZone.r - this.whiteZone.r) < 2 && dist < 2) {
                this.blueZone.r = this.whiteZone.r;
                this.blueZone.x = this.whiteZone.x;
                this.blueZone.y = this.whiteZone.y;
                
                this.isShrinking = false;
                
                // Increment zone stage
                this.zonePhase++;
                
                if (this.zonePhase <= this.zonePhaseMax) {
                    this.calculateNextCircle();
                    if (onZoneCompleteShrink) onZoneCompleteShrink(this.zonePhase);
                } else {
                    // Final circle matches white zone
                    this.whiteZone.r = 10; // Collapse completely
                }
            }
        }
    }

    calculateNextCircle() {
        // Safe playzone configuration variables
        const ratios = [0.35, 0.22, 0.12, 0.05, 0.01]; // Safe zone shrinking sizes
        const index = Math.min(this.zonePhase - 1, ratios.length - 1);
        const nextR = this.size * ratios[index];
        
        // White zone must lie strictly inside the current blue zone
        // New center lies within a range around the old center
        const maxOffset = Math.max(0, this.blueZone.r - nextR);
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxOffset * 0.7; // 70% offset for better gaming coverage
        
        this.whiteZone.x = this.blueZone.x + Math.cos(angle) * dist;
        this.whiteZone.y = this.blueZone.y + Math.sin(angle) * dist;
        this.whiteZone.r = nextR;

        // Set timers
        const durations = [90, 70, 50, 40, 30];
        this.zoneDuration = durations[index] || 30;
        this.zoneTimer = this.zoneDuration;
        
        // Increase damage factor in late circles
        const damages = [1, 2, 4, 8, 15];
        this.zoneDamage = damages[index] || 20;
    }

    isOutsideBlueZone(x, y) {
        const dx = x - this.blueZone.x;
        const dy = y - this.blueZone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist > this.blueZone.r;
    }

    // DRAW RENDERS
    drawTerrain(ctx, camera) {
        // Deep blue ocean background is automatically handled by body color
        
        // 1. Draw Sandy island base
        ctx.save();
        ctx.fillStyle = '#f9e79f'; // Sand color
        ctx.beginPath();
        ctx.arc(this.half, this.half, this.islandRadius + 12, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Lush Green island grass
        ctx.fillStyle = '#2ecc71'; // Grass green
        ctx.beginPath();
        ctx.arc(this.half, this.half, this.islandRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw structural sectors boundary lines / text for vintage map look
        ctx.restore();
        
        // Draw nice blocky patterns on grass for LEGO plate grid feel
        ctx.save();
        ctx.fillStyle = '#27ae60';
        const gridSize = 160;
        const gridStart = Math.max(0, Math.floor((camera.x - 1000) / gridSize) * gridSize);
        const gridEnd = Math.min(this.size, Math.floor((camera.x + 1000) / gridSize) * gridSize);
        
        // Just draw a few dots on the map to give "lego plate" feel without lag!
        for (let gx = 0; gx < this.size; gx += 120) {
            for (let gy = 0; gy < this.size; gy += 120) {
                if (this.isPointOnIsland(gx, gy)) {
                    // Small green LEGO stud circle
                    ctx.fillStyle = 'rgba(39, 174, 96, 0.25)';
                    ctx.beginPath();
                    ctx.arc(gx, gy, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();

        // 3. Draw Buildings (Base tiles and layout)
        this.buildings.forEach((b) => {
            ctx.save();
            // Roof or floor tiles
            ctx.fillStyle = '#5d6d7e'; // Floor dark gray
            ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
            
            // Draw floor studs patterns inside building
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let bx = b.x - b.w/2 + 20; bx < b.x + b.w/2; bx += 30) {
                for (let by = b.y - b.h/2 + 20; by < b.y + b.h/2; by += 30) {
                    ctx.beginPath();
                    ctx.arc(bx, by, 3, 0, Math.PI*2);
                    ctx.fill();
                }
            }

            // Draw individual walls
            b.walls.forEach((wall) => {
                // Lego colored wall block styling
                ctx.fillStyle = b.color;
                ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

                // Draw tiny Lego stud contours along wall length to represent actual bricks!
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                const wallLen = Math.max(wall.w, wall.h);
                const step = 20;
                if (wall.w > wall.h) {
                    for (let wx = wall.x + 10; wx < wall.x + wall.w; wx += step) {
                        ctx.beginPath();
                        ctx.arc(wx, wall.y + wall.h/2, 2.5, 0, Math.PI*2);
                        ctx.fill();
                    }
                } else {
                    for (let wy = wall.y + 10; wy < wall.y + wall.h; wy += step) {
                        ctx.beginPath();
                        ctx.arc(wall.x + wall.w/2, wy, 2.5, 0, Math.PI*2);
                        ctx.fill();
                    }
                }

                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
            });
            ctx.restore();
        });

        // 4. Draw trees/crates/obstacles
        this.obstacles.forEach((obs) => {
            ctx.save();
            if (obs.type === 'tree') {
                // Draw cool circular stackable LEGO green pine cones
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 6;
                
                // Trunk
                ctx.fillStyle = '#784212'; // Brown trunk
                ctx.fillRect(obs.x - 4, obs.y - 4, 8, 8);
                
                // Stacked cones
                ctx.fillStyle = obs.color;
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 22, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#229954';
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 16, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 10, 0, Math.PI*2); ctx.fill();
                
                // Yellow Lego cap stud on top
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 3, 0, Math.PI*2); ctx.fill();

            } else if (obs.type === 'crate') {
                // Beautiful blocky lego crate
                const w = obs.w;
                const h = obs.h;
                ctx.fillStyle = obs.color;
                ctx.fillRect(obs.x - w/2, obs.y - h/2, w, h);
                
                // Highlight border
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.strokeRect(obs.x - w/2, obs.y - h/2, w, h);

                // Draw 4 distinct studs on top of the Lego crate!
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                const studOffsets = [-8, 8];
                studOffsets.forEach((ox) => {
                    studOffsets.forEach((oy) => {
                        ctx.beginPath();
                        ctx.arc(obs.x + ox, obs.y + oy, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });

            } else if (obs.type === 'boulder') {
                // Rock block
                ctx.fillStyle = obs.color;
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                ctx.moveTo(obs.x - 16, obs.y + 10);
                ctx.lineTo(obs.x - 18, obs.y - 6);
                ctx.lineTo(obs.x - 5, obs.y - 14);
                ctx.lineTo(obs.x + 12, obs.y - 12);
                ctx.lineTo(obs.x + 18, obs.y + 2);
                ctx.lineTo(obs.x + 10, obs.y + 14);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Draw rock bevel lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(obs.x - 16, obs.y + 2);
                ctx.lineTo(obs.x - 5, obs.y - 2);
                ctx.lineTo(obs.x + 12, obs.y - 6);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    drawLoot(ctx) {
        ctx.save();
        this.loot.forEach((item) => {
            item.pulseTimer += 0.05;
            const floatOffset = Math.sin(item.pulseTimer) * 3;
            
            // 1. Draw glowing aura base
            ctx.shadowColor = item.spec.color;
            ctx.shadowBlur = 10 + Math.sin(item.pulseTimer) * 5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(item.x, item.y, 14, 0, Math.PI * 2);
            ctx.fill();

            // 2. Draw floating item icon / brick shape
            ctx.shadowColor = 'none';
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = item.spec.color;
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;

            // Draw a cute Lego 2x2 flat tile for loot icons
            ctx.save();
            ctx.translate(item.x, item.y + floatOffset);
            ctx.fillRect(-8, -6, 16, 12);
            ctx.strokeRect(-8, -6, 16, 12);

            // Double studs
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(-4, -2, 2.5, 0, Math.PI*2);
            ctx.arc(4, -2, 2.5, 0, Math.PI*2);
            ctx.fill();
            
            // Small badge text
            ctx.restore();

            // Hover tag label
            ctx.fillStyle = '#fff';
            ctx.font = '600 9px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.spec.name, item.x, item.y - 12 + floatOffset);
        });
        ctx.restore();
    }

    drawZones(ctx) {
        ctx.save();
        
        // 1. Draw White Target zone circle (dashed outline)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(this.whiteZone.x, this.whiteZone.y, this.whiteZone.r, 0, Math.PI * 2);
        ctx.stroke();
        
        // 2. Draw Blue shrinking electrical boundary circle
        ctx.setLineDash([]);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        
        // Cool electric blur shadow
        ctx.shadowColor = '#3498db';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(this.blueZone.x, this.blueZone.y, this.blueZone.r, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Draw electrical storm outer screen layer (semi-translucency outside blue circle)
        ctx.restore();
        
        // We can draw a subtle electric warning ring overlay
        ctx.save();
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.15)';
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.arc(this.blueZone.x, this.blueZone.y, this.blueZone.r + 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
