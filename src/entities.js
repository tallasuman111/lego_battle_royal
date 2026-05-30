import { sfx } from './audio.js';
import { fx } from './particles.js';

// Global Weapon Configurations
export const WEAPON_TYPES = {
    pistol: { id: 'pistol', name: 'LEGO Pistol', damage: 20, fireRate: 350, spread: 0.03, capacity: 7, bulletSpeed: 14, sound: 'pistol', pelletCount: 1, range: 400 },
    smg: { id: 'smg', name: 'LEGO SMG', damage: 15, fireRate: 100, spread: 0.12, capacity: 30, bulletSpeed: 16, sound: 'smg', pelletCount: 1, range: 350 },
    shotgun: { id: 'shotgun', name: 'LEGO Shotgun', damage: 16, fireRate: 900, spread: 0.25, capacity: 5, bulletSpeed: 11, sound: 'shotgun', pelletCount: 5, range: 220 },
    rifle: { id: 'rifle', name: 'Assault Rifle', damage: 28, fireRate: 180, spread: 0.04, capacity: 30, bulletSpeed: 20, sound: 'rifle', pelletCount: 1, range: 600 },
    sniper: { id: 'sniper', name: 'Sniper Rifle', damage: 80, fireRate: 1600, spread: 0.002, capacity: 5, bulletSpeed: 28, sound: 'sniper', pelletCount: 1, range: 1100 },
    bricklauncher: { id: 'bricklauncher', name: 'Mortar Launcher', damage: 95, fireRate: 1500, spread: 0.02, capacity: 2, bulletSpeed: 9, sound: 'bricklauncher', pelletCount: 1, range: 500 }
};

export class Bullet {
    constructor(x, y, vx, vy, weaponSpec, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = weaponSpec.damage;
        this.weaponId = weaponSpec.id;
        this.owner = owner; // Reference to who fired it
        this.radius = weaponSpec.id === 'bricklauncher' ? 7 : 3.5;
        this.color = owner.color || '#fff';
        
        this.life = weaponSpec.range / weaponSpec.bulletSpeed; // Distance limit
        this.type = weaponSpec.id === 'bricklauncher' ? 'brick' : 'stud';
    }

    update(dt) {
        this.life -= dt * 60;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        if (this.type === 'brick') {
            // Draw a spinning 2x4 Lego ammo brick flying through air
            ctx.translate(this.x, this.y);
            ctx.rotate(this.life * 0.1);
            ctx.fillRect(-6, -4, 12, 8);
            ctx.strokeRect(-6, -4, 12, 8);
        } else {
            // Draw regular circular LEGO stud bullet
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Base Entity Class representing Players and AI bots
class Entity {
    constructor(x, y, username, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        this.radius = 12;
        this.angle = 0;
        this.speed = 3.2; // Standard walking speed

        this.username = username;
        this.color = color;
        this.isPlayer = isPlayer;

        // Health & Shields
        this.health = 100;
        this.shield = 0;
        this.boost = 0;

        // Inventory Systems (3 Weapons Slots)
        this.weapons = [
            { ...WEAPON_TYPES.pistol, currentAmmo: 7 }, // Slot 1 defaults to basic pistol
            null, // Slot 2
            null  // Slot 3
        ];
        this.activeWeaponIndex = 0;
        this.ammoInventory = { smg: 30, rifle: 0, special: 0 }; // Extra reserves
        this.armorLevel = 0; // 0 to 3

        this.medkitsCount = 2; // Health pack reserve count

        // Battle Royale State Machine
        this.state = 'plane'; // plane, parachute, alive, dead
        this.parachuteAltitude = 250; // Skydive height countdown
        
        // Cooldowns
        this.fireCooldown = 0;
        this.reloadCooldown = 0;
        this.healCooldown = 0;
        this.isReloading = false;
        this.isHealing = false;

        // Stats tracking
        this.kills = 0;
        this.damageDealt = 0;
        this.survivalTime = 0;

        // Graphical helpers
        this.walkingFrame = 0;
    }

    takeDamage(dmg, attacker) {
        if (this.state === 'dead') return;

        // Apply damage first to Shield then Health
        let remainingDmg = dmg;
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, remainingDmg);
            this.shield -= absorbed;
            remainingDmg -= absorbed;
        }

        if (remainingDmg > 0) {
            this.health = Math.max(0, this.health - remainingDmg);
        }

        // Trigger hurt red-shattering studs
        fx.spawnStudScatter(this.x, this.y, '#e74c3c', 3, 2.5);

        if (this.health <= 0) {
            this.state = 'dead';
            sfx.playLegoRattle(0.9); // rattle lego parts!
            fx.spawnLegoExplode(this.x, this.y, '#f5b041', this.color, '#2c3e50');
            
            if (attacker && attacker !== this) {
                attacker.kills++;
            }
        }
    }

    heal() {
        if (this.medkitsCount > 0 && this.health < 100 && !this.isHealing && !this.isReloading) {
            this.isHealing = true;
            this.healCooldown = 1500; // 1.5s healing cast timer
            sfx.playHeal();
        }
    }

    reload() {
        const weapon = this.weapons[this.activeWeaponIndex];
        if (!weapon || this.isReloading || this.isHealing) return;

        // Check if ammo exists in reserve
        const ammoType = weapon.id === 'rifle' ? 'rifle' : (weapon.id === 'bricklauncher' ? 'special' : 'smg');
        const needed = weapon.capacity - weapon.currentAmmo;
        const available = this.ammoInventory[ammoType];

        if (needed > 0 && (available > 0 || weapon.id === 'pistol')) { // Pistol has infinite reserves
            this.isReloading = true;
            this.reloadCooldown = weapon.id === 'sniper' ? 1800 : 1000; // Reload time
            sfx.playLegoRattle(0.4);
        }
    }

    useBoosters(dt) {
        // Boost slowly heals player over time and grants slight speed boost
        if (this.boost > 0) {
            this.boost = Math.max(0, this.boost - dt * 2.5);
            
            // Health regen from boost
            if (this.health < 100) {
                this.health = Math.min(100, this.health + dt * 1.5);
            }
        }
    }

    getSpeed() {
        // Speed boosts if boosted
        const factor = this.boost > 50 ? 1.2 : 1.0;
        return this.speed * factor;
    }
}

// ---------------- PLAYER CLASS ----------------
export class Player extends Entity {
    constructor(x, y, username, color) {
        super(x, y, username, color, true);
    }

    update(dt, input, map, spawnBullet, camera) {
        if (this.state === 'dead') return;

        this.survivalTime += dt;

        // Plane Phase
        if (this.state === 'plane') {
            if (input.actions.eject) {
                this.state = 'parachute';
                this.parachuteAltitude = 250;
                sfx.playLegoRattle();
            }
            return;
        }

        // Parachuting Gliding phase
        if (this.state === 'parachute') {
            // Can glide around slowly
            const glideSpeed = 1.8;
            this.x += input.moveX * glideSpeed;
            this.y += input.moveY * glideSpeed;

            // Slowly descends to ground
            this.parachuteAltitude -= dt * 65;
            if (this.parachuteAltitude <= 0) {
                this.state = 'alive';
                this.parachuteAltitude = 0;
                sfx.playLegoRattle(0.6);
                fx.spawnStudScatter(this.x, this.y, '#2ecc71', 8, 2);
            }
            return;
        }

        // 1. General Healing/Reload cast counts
        if (this.isHealing) {
            this.healCooldown -= dt * 1000;
            if (this.healCooldown <= 0) {
                this.isHealing = false;
                this.medkitsCount--;
                this.health = Math.min(100, this.health + 45); // heal 45 hp
                sfx.playLoot();
                fx.spawnStudScatter(this.x, this.y, '#2ecc71', 6, 2);
            }
            // Cannot walk while casting
            this.vx = 0; this.vy = 0;
            return;
        }

        if (this.isReloading) {
            this.reloadCooldown -= dt * 1000;
            if (this.reloadCooldown <= 0) {
                this.isReloading = false;
                const w = this.weapons[this.activeWeaponIndex];
                const ammoType = w.id === 'rifle' ? 'rifle' : (w.id === 'bricklauncher' ? 'special' : 'smg');
                
                if (w.id === 'pistol') {
                    w.currentAmmo = w.capacity;
                } else {
                    const needed = w.capacity - w.currentAmmo;
                    const loaded = Math.min(needed, this.ammoInventory[ammoType]);
                    w.currentAmmo += loaded;
                    this.ammoInventory[ammoType] -= loaded;
                }
            }
            // Slow down reload walk speed
            this.vx = input.moveX * this.getSpeed() * 0.45;
            this.vy = input.moveY * this.getSpeed() * 0.45;
        } else {
            // Regular Movement
            this.vx = input.moveX * this.getSpeed();
            this.vy = input.moveY * this.getSpeed();
        }

        // Apply physical movements
        this.x += this.vx;
        this.y += this.vy;

        // Resolve map boundary & wall collisions
        map.resolveCollisions(this);

        // Update body rotation frame
        if (input.isAiming) {
            this.angle = input.aimAngle;
        } else if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }

        // Leg animations swing
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.walkingFrame += 0.22;
        } else {
            this.walkingFrame = 0;
        }

        // 2. Firing triggers
        const weapon = this.weapons[this.activeWeaponIndex];
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt * 1000;
        }

        if (input.isFiring && weapon && this.fireCooldown <= 0 && !this.isReloading && !this.isHealing) {
            if (weapon.currentAmmo > 0) {
                this.fire(weapon, spawnBullet, camera);
            } else {
                // Auto reload if empty
                this.reload();
            }
        }

        // Weapon swapping buttons
        if (input.actions.weapon1) this.switchWeapon(0);
        if (input.actions.weapon2) this.switchWeapon(1);
        if (input.actions.weapon3) this.switchWeapon(2);

        // Bumpers swap
        if (input.actions.bumperLeft) this.switchWeapon((this.activeWeaponIndex + 2) % 3);
        if (input.actions.bumperRight) this.switchWeapon((this.activeWeaponIndex + 1) % 3);

        // Loot interaction
        if (input.actions.interact) {
            this.interactLoot(map);
        }

        // Healing hotkey
        if (input.actions.heal) {
            this.heal();
        }

        this.useBoosters(dt);
    }

    fire(weapon, spawnBullet, camera) {
        weapon.currentAmmo--;
        this.fireCooldown = weapon.fireRate;

        // Recoil screen shake
        if (camera) {
            const shakeForces = { pistol: 3, smg: 2.2, shotgun: 8, rifle: 4.5, sniper: 14, bricklauncher: 12 };
            camera.shake(shakeForces[weapon.id] || 3);
        }

        // Audio pop
        const soundCalls = {
            pistol: () => sfx.playPistol(),
            smg: () => sfx.playSMG(),
            shotgun: () => sfx.playShotgun(),
            rifle: () => sfx.playRifle(),
            sniper: () => sfx.playSniper(),
            bricklauncher: () => sfx.playBrickExplosion()
        };
        if (soundCalls[weapon.id]) soundCalls[weapon.id]();

        // Calculate bullet velocities including weapon specs spread
        const fireX = this.x + Math.cos(this.angle) * 16;
        const fireY = this.y + Math.sin(this.angle) * 16;

        for (let i = 0; i < weapon.pelletCount; i++) {
            const spreadAngle = this.angle + (Math.random() - 0.5) * weapon.spread;
            const vx = Math.cos(spreadAngle) * weapon.bulletSpeed;
            const vy = Math.sin(spreadAngle) * weapon.bulletSpeed;
            
            spawnBullet(new Bullet(fireX, fireY, vx, vy, weapon, this));
        }

        // Spark explosion muzzle particles
        fx.spawnMuzzleFlash(fireX, fireY, this.angle);
    }

    switchWeapon(index) {
        if (index === this.activeWeaponIndex || index < 0 || index > 2) return;
        this.isReloading = false; // cancel reload
        this.isHealing = false;
        this.activeWeaponIndex = index;
        sfx.playClick();
    }

    interactLoot(map) {
        // Find nearest loot item
        let nearest = null;
        let minDist = 38; // Loot capture distance

        map.loot.forEach((item) => {
            const dx = this.x - item.x;
            const dy = this.y - item.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDist) {
                minDist = d;
                nearest = item;
            }
        });

        if (nearest) {
            const spec = nearest.spec;
            let success = false;

            if (spec.type === 'weapon') {
                // Weapons occupy slots based on profile
                // Pistol is strictly Slot 1, others Slot 2 & Slot 3
                let targetSlot = 1;
                if (spec.id === 'pistol') {
                    targetSlot = 0;
                } else {
                    // Place in empty primary/special slot, or replace active slot
                    if (this.weapons[1] === null) {
                        targetSlot = 1;
                    } else if (this.weapons[2] === null) {
                        targetSlot = 2;
                    } else {
                        targetSlot = this.activeWeaponIndex === 0 ? 1 : this.activeWeaponIndex;
                    }
                }

                // If dropping old weapon, spawn it back on map floor!
                const oldWeapon = this.weapons[targetSlot];
                if (oldWeapon && oldWeapon.id !== 'pistol') {
                    map.loot.push({
                        x: this.x, y: this.y,
                        id: Math.random().toString(36).substr(2, 9),
                        spec: { type: 'weapon', id: oldWeapon.id, name: oldWeapon.name, color: oldWeapon.color, ammo: oldWeapon.currentAmmo },
                        pulseTimer: 0
                    });
                }

                this.weapons[targetSlot] = { ...WEAPON_TYPES[spec.id], currentAmmo: spec.ammo };
                this.activeWeaponIndex = targetSlot;
                success = true;

            } else if (spec.type === 'ammo') {
                const type = spec.id === 'rifle' ? 'rifle' : 'smg';
                this.ammoInventory[type] += spec.qty;
                success = true;

            } else if (spec.type === 'armor') {
                this.armorLevel = Math.max(this.armorLevel, parseInt(spec.id.replace('armor', '')));
                this.shield = Math.min(100, this.shield + spec.shield);
                success = true;

            } else if (spec.type === 'med') {
                if (spec.id === 'medkit') {
                    this.medkitsCount = Math.min(5, this.medkitsCount + 1);
                } else if (spec.id === 'boost') {
                    this.boost = Math.min(100, this.boost + spec.boost);
                }
                success = true;
            }

            if (success) {
                sfx.playLoot();
                fx.spawnStudScatter(nearest.x, nearest.y, spec.color, 5, 2.5);
                // Remove item from map loot array
                map.loot = map.loot.filter((item) => item.id !== nearest.id);
            }
        }
    }
}

// ---------------- SMART BOTS AI CLASS ----------------
export class Bot extends Entity {
    constructor(x, y, username, color) {
        super(x, y, username, color, false);
        this.aiTimer = Math.random() * 2000; // offset decisions
        
        // Navigation targets
        this.targetX = x;
        this.targetY = y;
        
        this.lootTarget = null;
        this.enemyTarget = null;
        
        this.stuckTimer = 0;
        this.lastX = x;
        this.lastY = y;
    }

    update(dt, map, spawnBullet, entitiesList) {
        if (this.state === 'dead') return;

        this.survivalTime += dt;

        // Plane jump simulation
        if (this.state === 'plane') {
            this.aiTimer -= dt * 1000;
            // Plane jumps at randomized trigger times
            if (this.aiTimer <= 0) {
                this.state = 'parachute';
                this.parachuteAltitude = 200 + Math.random() * 80;
                this.targetX = this.x + (Math.random() - 0.5) * 300;
                this.targetY = this.y + (Math.random() - 0.5) * 300;
            }
            return;
        }

        // Parachuting Descend Glide
        if (this.state === 'parachute') {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d > 10) {
                this.x += (dx / d) * 1.5;
                this.y += (dy / d) * 1.5;
            }
            
            this.parachuteAltitude -= dt * 50;
            if (this.parachuteAltitude <= 0) {
                this.state = 'alive';
                this.targetX = this.x;
                this.targetY = this.y;
            }
            return;
        }

        // Healing / Reload actions
        if (this.isHealing) {
            this.healCooldown -= dt * 1000;
            if (this.healCooldown <= 0) {
                this.isHealing = false;
                this.medkitsCount--;
                this.health = Math.min(100, this.health + 45);
                fx.spawnStudScatter(this.x, this.y, '#2ecc71', 6, 2);
            }
            return;
        }

        if (this.isReloading) {
            this.reloadCooldown -= dt * 1000;
            if (this.reloadCooldown <= 0) {
                this.isReloading = false;
                const w = this.weapons[this.activeWeaponIndex];
                const ammoType = w.id === 'rifle' ? 'rifle' : 'smg';
                if (w.id === 'pistol') {
                    w.currentAmmo = w.capacity;
                } else {
                    const needed = w.capacity - w.currentAmmo;
                    const loaded = Math.min(needed, this.ammoInventory[ammoType] || 0);
                    w.currentAmmo += loaded;
                    if (this.ammoInventory[ammoType]) this.ammoInventory[ammoType] -= loaded;
                }
            }
            // Can reload while drifting slow
            this.x += Math.cos(this.angle) * this.getSpeed() * 0.35;
            this.y += Math.sin(this.angle) * this.getSpeed() * 0.35;
            map.resolveCollisions(this);
            return;
        }

        // Firing cooling
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt * 1000;
        }

        // 1. Run AI Decision Cycle every 400ms to reduce CPU performance overhead
        this.aiTimer -= dt * 1000;
        if (this.aiTimer <= 0) {
            this.aiTimer = 350 + Math.random() * 150;
            this.evaluateBehaviors(map, entitiesList);
        }

        // 2. Perform Movement based on targets
        let moveVecX = 0;
        let moveVecY = 0;

        if (this.enemyTarget && this.enemyTarget.state === 'alive') {
            // Battle Mode: face and flank enemy or take cover
            const dx = this.enemyTarget.x - this.x;
            const dy = this.enemyTarget.y - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            this.angle = Math.atan2(dy, dx);

            // Maintain optimal gun range
            const preferredRange = this.weapons[this.activeWeaponIndex] ? this.weapons[this.activeWeaponIndex].range * 0.6 : 150;

            if (d > 0.1) {
                if (d > preferredRange) {
                    // Advance
                    moveVecX = dx / d;
                    moveVecY = dy / d;
                } else if (d < preferredRange * 0.6) {
                    // Back pedal
                    moveVecX = -dx / d;
                    moveVecY = -dy / d;
                } else {
                    // Strafe sideways to dodge!
                    moveVecX = -dy / d;
                    moveVecY = dx / d;
                }
            } else {
                // If perfectly overlapping, move in a random angle to resolve the overlap cleanly without division-by-zero NaN
                const a = Math.random() * Math.PI * 2;
                moveVecX = Math.cos(a);
                moveVecY = Math.sin(a);
            }

            // Shoot!
            const activeWeapon = this.weapons[this.activeWeaponIndex];
            if (activeWeapon && this.fireCooldown <= 0) {
                if (activeWeapon.currentAmmo > 0) {
                    this.botFire(activeWeapon, spawnBullet);
                } else {
                    this.reload();
                }
            }

        } else if (this.lootTarget && map.loot.includes(this.lootTarget)) {
            // Loot Seek
            const dx = this.lootTarget.x - this.x;
            const dy = this.lootTarget.y - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            if (d > 10) {
                moveVecX = dx / d;
                moveVecY = dy / d;
                this.angle = Math.atan2(dy, dx);
            } else {
                // Pick it up!
                this.botInteractLoot(map);
            }
        } else {
            // Normal Zone navigation path
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            if (d > 20) {
                moveVecX = dx / d;
                moveVecY = dy / d;
                this.angle = Math.atan2(dy, dx);
            } else {
                // Patrol new random spot within White Circle
                const r = map.whiteZone.r * Math.random();
                const a = Math.random() * Math.PI * 2;
                this.targetX = map.whiteZone.x + Math.cos(a) * r;
                this.targetY = map.whiteZone.y + Math.sin(a) * r;
            }
        }

        // Apply velocities
        this.vx = moveVecX * this.getSpeed();
        this.vy = moveVecY * this.getSpeed();
        this.x += this.vx;
        this.y += this.vy;

        // Resolve map physics
        map.resolveCollisions(this);

        // Walking frames animations
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.walkingFrame += 0.22;
        } else {
            this.walkingFrame = 0;
        }

        // Check if stuck (colliding walls for a long time)
        const travelDist = Math.sqrt(Math.pow(this.x - this.lastX, 2) + Math.pow(this.y - this.lastY, 2));
        if (travelDist < 0.2 && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
            this.stuckTimer += dt;
            if (this.stuckTimer > 0.5) {
                // Unstuck steering logic (steer towards random target)
                const angle = Math.random() * Math.PI * 2;
                this.targetX = this.x + Math.cos(angle) * 150;
                this.targetY = this.y + Math.sin(angle) * 150;
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }
        
        this.lastX = this.x;
        this.lastY = this.y;

        this.useBoosters(dt);
    }

    evaluateBehaviors(map, entitiesList) {
        // 1. Health check (Heal up if hurt and have kits)
        if (this.health < 45 && this.medkitsCount > 0) {
            this.heal();
            return;
        }

        // 2. Shrinking Playzone warning check
        // If outside safe circle or blue zone moving, force path towards White Zone center immediately
        const distToBlueCenter = Math.sqrt(Math.pow(this.x - map.blueZone.x, 2) + Math.pow(this.y - map.blueZone.y, 2));
        if (distToBlueCenter > map.blueZone.r * 0.8 || map.isOutsideBlueZone(this.x, this.y)) {
            // Guide towards inner white zone
            const angle = Math.random() * Math.PI * 2;
            const innerOffset = map.whiteZone.r * 0.4 * Math.random();
            this.targetX = map.whiteZone.x + Math.cos(angle) * innerOffset;
            this.targetY = map.whiteZone.y + Math.sin(angle) * innerOffset;
            this.lootTarget = null;
            this.enemyTarget = null;
            return;
        }

        // 3. Scan for enemies in combat radius (Check closest enemy)
        let closestEnemy = null;
        let enemyDist = 450; // Detection FOV radius

        entitiesList.forEach((ent) => {
            if (ent !== this && ent.state === 'alive') {
                const dx = ent.x - this.x;
                const dy = ent.y - this.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < enemyDist) {
                    enemyDist = d;
                    closestEnemy = ent;
                }
            }
        });

        if (closestEnemy) {
            this.enemyTarget = closestEnemy;
            this.lootTarget = null;
            return;
        } else {
            this.enemyTarget = null;
        }

        // 4. Scan for loot items nearby (Only seek if not currently carrying good high-tier weapons)
        const hasGoodPrimary = this.weapons[1] !== null || this.weapons[2] !== null;
        if (!hasGoodPrimary && map.loot.length > 0) {
            let closestLoot = null;
            let lootDist = 280; // Scavenge scan range
            
            map.loot.forEach((item) => {
                const dx = item.x - this.x;
                const dy = item.y - this.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < lootDist) {
                    lootDist = d;
                    closestLoot = item;
                }
            });

            if (closestLoot) {
                this.lootTarget = closestLoot;
                return;
            }
        }
        this.lootTarget = null;
    }

    botFire(weapon, spawnBullet) {
        weapon.currentAmmo--;
        this.fireCooldown = weapon.fireRate + Math.random() * 80; // Introduce bot reaction delay

        const fireX = this.x + Math.cos(this.angle) * 16;
        const fireY = this.y + Math.sin(this.angle) * 16;

        // Introduce slight bot inaccuracy sweep
        const botSpreadFactor = 0.08 + Math.random() * 0.05;

        for (let i = 0; i < weapon.pelletCount; i++) {
            const spreadAngle = this.angle + (Math.random() - 0.5) * (weapon.spread + botSpreadFactor);
            const vx = Math.cos(spreadAngle) * weapon.bulletSpeed;
            const vy = Math.sin(spreadAngle) * weapon.bulletSpeed;
            
            spawnBullet(new Bullet(fireX, fireY, vx, vy, weapon, this));
        }

        fx.spawnMuzzleFlash(fireX, fireY, this.angle);
    }

    botInteractLoot(map) {
        if (!this.lootTarget) return;
        const spec = this.lootTarget.spec;
        let success = false;

        if (spec.type === 'weapon') {
            // Equips on empty primary slots
            if (this.weapons[1] === null) {
                this.weapons[1] = { ...WEAPON_TYPES[spec.id], currentAmmo: spec.ammo };
                this.activeWeaponIndex = 1;
                success = true;
            } else if (this.weapons[2] === null) {
                this.weapons[2] = { ...WEAPON_TYPES[spec.id], currentAmmo: spec.ammo };
                this.activeWeaponIndex = 2;
                success = true;
            } else {
                // Drop current and swap
                this.weapons[this.activeWeaponIndex] = { ...WEAPON_TYPES[spec.id], currentAmmo: spec.ammo };
                success = true;
            }
        } else if (spec.type === 'ammo') {
            const type = spec.id === 'rifle' ? 'rifle' : 'smg';
            this.ammoInventory[type] = (this.ammoInventory[type] || 0) + spec.qty;
            success = true;
        } else if (spec.type === 'armor') {
            this.armorLevel = Math.max(this.armorLevel, parseInt(spec.id.replace('armor', '')));
            this.shield = Math.min(100, this.shield + spec.shield);
            success = true;
        } else if (spec.type === 'med') {
            if (spec.id === 'medkit') {
                this.medkitsCount = Math.min(5, this.medkitsCount + 1);
            } else if (spec.id === 'boost') {
                this.boost = Math.min(100, this.boost + spec.boost);
            }
            success = true;
        }

        if (success) {
            fx.spawnStudScatter(this.lootTarget.x, this.lootTarget.y, spec.color, 5, 2.5);
            map.loot = map.loot.filter((item) => item.id !== this.lootTarget.id);
        }
        
        this.lootTarget = null;
    }
}
