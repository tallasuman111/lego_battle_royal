// ============================================================================
// LEGO BATTLE ROYALE - UNIFIED GAME ENGINE (Zero-Dependency Single File)
// Supports: Keyboard/Mouse, Gamepad API, Mobile Touch Joysticks
// Works directly over file:// protocol (No server required!)
// ============================================================================

// ============================================================================
// 1. PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
// ============================================================================
class SoundController {
    constructor() {
        this.ctx = null;
        this.planeHumNode = null;
        this.zoneHumNode = null;
        this.masterVolume = null;
    }

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        this.ctx = new AudioContextClass();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(0.3, this.ctx.currentTime); // Standard volume
        this.masterVolume.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoiseBuffer() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    playPistol() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterVolume);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.08);
        noise.start(now);
        noise.stop(now + 0.04);
    }

    playSMG() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterVolume);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.05);
        noise.start(now);
        noise.stop(now + 0.03);
    }

    playRifle() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseGain = this.ctx.createGain();
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(200, now);

        noiseGain.gain.setValueAtTime(0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterVolume);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.12);
        noise.start(now);
        noise.stop(now + 0.08);
    }

    playShotgun() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
        
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(oscGain);
        oscGain.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.2);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noise.start(now);
        noise.stop(now + 0.25);
    }

    playSniper() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
        
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.9, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.4);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        filter.Q.setValueAtTime(2, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterVolume);

        noise.start(now);
        noise.stop(now + 0.35);
    }

    playBrickExplosion() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const sub = this.ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, now);
        sub.frequency.exponentialRampToValueAtTime(10, now + 0.5);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(1.0, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        sub.connect(subGain);
        subGain.connect(this.masterVolume);
        sub.start(now);
        sub.stop(now + 0.5);

        for (let i = 0; i < 6; i++) {
            const timeOffset = Math.random() * 0.3;
            setTimeout(() => this.playLegoRattle(0.2), timeOffset * 1000);
        }
    }

    playLegoRattle(intensity = 0.5) {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const clicks = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < clicks; i++) {
            const clickTime = now + (i * 0.035) + (Math.random() * 0.015);
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            const startFreq = 1800 + Math.random() * 800;
            osc.frequency.setValueAtTime(startFreq, clickTime);
            osc.frequency.exponentialRampToValueAtTime(300, clickTime + 0.015);
            
            gain.gain.setValueAtTime(intensity * 0.5, clickTime);
            gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.015);
            
            osc.connect(gain);
            gain.connect(this.masterVolume);
            
            osc.start(clickTime);
            osc.stop(clickTime + 0.018);
        }
    }

    playLoot() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];

        notes.forEach((freq, index) => {
            const noteTime = now + (index * 0.06);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);
            
            gain.gain.setValueAtTime(0.3, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

            osc.connect(gain);
            gain.connect(this.masterVolume);

            osc.start(noteTime);
            osc.stop(noteTime + 0.16);
        });
    }

    playHeal() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.8);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(303, now);
        osc2.frequency.linearRampToValueAtTime(606, now + 0.8);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.8);
        osc2.stop(now + 0.8);
    }

    playClick() {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.setValueAtTime(800, now + 0.02);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    startPlaneHum() {
        this.init(); this.resume();
        if (!this.ctx || this.planeHumNode) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(45, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(45.5, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 1.0);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(90, now);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc2.start(now);

        this.planeHumNode = { osc, osc2, gain, filter };
    }

    stopPlaneHum() {
        if (!this.ctx || !this.planeHumNode) return;
        
        const now = this.ctx.currentTime;
        const node = this.planeHumNode;
        
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
        node.gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

        setTimeout(() => {
            try {
                node.osc.stop();
                node.osc2.stop();
            } catch(e) {}
        }, 600);

        this.planeHumNode = null;
    }

    startZoneHum() {
        this.init(); this.resume();
        if (!this.ctx || this.zoneHumNode) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2, now);
        lfoGain.gain.setValueAtTime(1.5, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.5);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        lfo.start(now);

        this.zoneHumNode = { osc, lfo, gain, filter };
    }

    stopZoneHum() {
        if (!this.ctx || !this.zoneHumNode) return;
        
        const now = this.ctx.currentTime;
        const node = this.zoneHumNode;
        
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
        node.gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

        setTimeout(() => {
            try {
                node.osc.stop();
                node.lfo.stop();
            } catch(e) {}
        }, 500);

        this.zoneHumNode = null;
    }
}
const sfx = new SoundController();


// ============================================================================
// 2. PHYSICS-BASED LEGO PARTICLES SYSTEM
// ============================================================================
class Particle {
    constructor(opts) {
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.radius = opts.radius || 4;
        this.color = opts.color || '#fff';
        this.type = opts.type || 'stud'; // stud, brick, limb, smoke, spark, fire
        this.limbPart = opts.limbPart || 'head';
        
        this.rotation = opts.rotation || 0;
        this.vRotation = opts.vRotation || 0;

        this.life = 1.0;
        this.decay = opts.decay || 0.02;
        this.drag = opts.drag || 0.95;
        this.gravity = opts.gravity || 0;
        this.height = opts.height || 0;
        this.vHeight = opts.vHeight || 0;
    }

    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        
        this.vx *= Math.pow(this.drag, dt * 60);
        this.vy *= Math.pow(this.drag, dt * 60);

        this.rotation += this.vRotation * dt * 60;

        if (this.vHeight !== 0 || this.height > 0) {
            this.vHeight -= 0.5 * dt * 60;
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
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();

        } else if (this.type === 'brick') {
            const size = this.radius * 2;
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(-size/2 + 1, -size/2 + 1, size, size);

            ctx.fillStyle = this.color;
            ctx.fillRect(-size/2, -size/2, size, size);

            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-size/2, -size/2, size, size);

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(-size * 0.1, -size * 0.1, size * 0.12, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'limb') {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;

            if (this.limbPart === 'head') {
                ctx.beginPath();
                ctx.rect(-5, -6, 10, 10);
                ctx.rect(-2.5, -8, 5, 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-2, -2, 1, 0, Math.PI*2);
                ctx.arc(2, -2, 1, 0, Math.PI*2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(0, 1, 2.5, 0, Math.PI);
                ctx.stroke();

            } else if (this.limbPart === 'torso') {
                ctx.beginPath();
                ctx.moveTo(-7, 6);
                ctx.lineTo(-5, -6);
                ctx.lineTo(5, -6);
                ctx.lineTo(7, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

            } else if (this.limbPart === 'arm') {
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.rect(-2, 0, 4, 8);
                ctx.fill();
                ctx.stroke();

            } else if (this.limbPart === 'leg') {
                ctx.beginPath();
                ctx.rect(-4, -6, 8, 12);
                ctx.rect(-4, 4, 8, 2);
                ctx.fill();
                ctx.stroke();
            }

        } else if (this.type === 'smoke') {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, 'rgba(230, 230, 230, ' + this.life * 0.4 + ')');
            grad.addColorStop(1, 'rgba(120, 120, 120, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'spark') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.vx * 2, -this.vy * 2);
            ctx.stroke();

        } else if (this.type === 'fire') {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, 'rgba(254, 211, 48, ' + this.life + ')');
            grad.addColorStop(0.4, 'rgba(235, 94, 40, ' + this.life * 0.8 + ')');
            grad.addColorStop(1, 'rgba(231, 76, 60, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    add(p) {
        this.particles.push(new Particle(p));
    }

    spawnMuzzleFlash(x, y, angle) {
        const speed = 3;
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
                decay: 0.008 + Math.random() * 0.005,
                drag: 0.95,
                height: 10 + Math.random() * 10,
                vHeight: 4 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                vRotation: (Math.random() - 0.5) * 0.2
            });
        });

        this.spawnStudScatter(x, y, torsoColor, 8, 3.5);
        this.spawnStudScatter(x, y, skinColor, 4, 3.0);
    }

    spawnWallImpact(x, y, angle, color = '#bdc3c7') {
        const backAngle = angle + Math.PI;
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
        this.add({
            x, y,
            vx: 0, vy: 0,
            radius: 40 + Math.random() * 15,
            type: 'fire',
            decay: 0.03,
            drag: 1
        });

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

        const colors = ['#e74c3c', '#f1c40f', '#f39c12', '#7f8c8d'];
        for (let i = 0; i < 12; i++) {
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.spawnStudScatter(x, y, c, 1, 6);
        }
    }

    update(dt) {
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
const fx = new ParticleSystem();


// ============================================================================
// 3. UNIFIED INPUT CONTROLLER (Mouse, Keys, Joysticks, Gamepad)
// ============================================================================
class InputManager {
    constructor(director = null) {
        this.director = director;
        this.lastTouchTime = 0;
        this.keys = {};
        this.mouse = { x: 0, y: 0, rawX: 0, rawY: 0, clicked: false };
        
        this.moveX = 0;
        this.moveY = 0;

        this.aimX = 0;
        this.aimY = 0;
        this.aimAngle = 0;
        this.isAiming = false;
        this.isFiring = false;

        this.sprintLocked = false;
        this.sprintLockedTarget = false;

        this.actions = {
            shoot: false,
            reload: false,
            interact: false,
            heal: false,
            eject: false,
            weapon1: false,
            weapon2: false,
            weapon3: false,
            toggleView: false,
            touchActive: false
        };

        this.moveJoy = { active: false, startX: 0, startY: 0, x: 0, y: 0, identifier: null };
        this.aimJoy = { active: false, startX: 0, startY: 0, x: 0, y: 0, identifier: null };
        this.maxJoyRadius = 50;

        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);

        this.initKeyboardMouse();
        this.initTouchControls();
        this.initGamepad();
    }

    triggerDeviceSwitch(type) {
        if (this.director) {
            if (this.director.deviceType !== type) {
                this.director.setDeviceType(type);
            }
        } else if (window.director) {
            if (window.director.deviceType !== type) {
                window.director.setDeviceType(type);
            }
        }
    }

    initKeyboardMouse() {
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('mousedown', this.boundMouseDown);
        window.addEventListener('mouseup', this.boundMouseUp);
        
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    initGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log("Gamepad connected:", e.gamepad);
            const currentDevice = this.director ? this.director.deviceType : (window.director ? window.director.deviceType : 'desktop');
            if (currentDevice !== 'tv') {
                const ua = navigator.userAgent;
                const isTV = /GoogleTV|SmartTV|Internet.TV|NetCast|NETTV|AppleTV|Boxee|Kylo|Roku|DLNADOC|CE-HTML/i.test(ua);
                if (isTV) {
                    this.triggerDeviceSwitch('tv');
                }
            }
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log("Gamepad disconnected:", e.gamepad);
            const currentDevice = this.director ? this.director.deviceType : (window.director ? window.director.deviceType : 'desktop');
            if (currentDevice === 'tv') {
                const ua = navigator.userAgent;
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (window.matchMedia("(pointer: coarse)").matches);
                this.triggerDeviceSwitch(isMobile ? 'mobile' : 'desktop');
            }
        });
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
        this.triggerDeviceSwitch('desktop');
        
        if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD' || 
            e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            this.sprintLocked = false;
            const sprintIndicator = document.getElementById('joystick-sprint-indicator');
            if (sprintIndicator) sprintIndicator.classList.remove('active');
        }

        if (e.code === 'KeyR') this.actions.reload = true;
        if (e.code === 'KeyE' || e.code === 'KeyF') this.actions.interact = true;
        if (e.code === 'KeyG') this.actions.dropWeapon = true;
        if (e.code === 'Space') {
            this.actions.heal = true;
            this.actions.eject = true;
        }
        if (e.code === 'KeyV') this.actions.toggleView = true;
        if (e.code === 'Digit1') this.actions.weapon1 = true;
        if (e.code === 'Digit2') this.actions.weapon2 = true;
        if (e.code === 'Digit3') this.actions.weapon3 = true;
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    handleMouseMove(e) {
        if (this.lastTouchTime && Date.now() - this.lastTouchTime < 1000) return;
        this.mouse.rawX = e.clientX;
        this.mouse.rawY = e.clientY;
        if (e.movementX !== 0 || e.movementY !== 0) {
            this.triggerDeviceSwitch('desktop');
        }
    }

    handleMouseDown(e) {
        if (this.lastTouchTime && Date.now() - this.lastTouchTime < 1000) return;
        if (e.button === 0) {
            this.mouse.clicked = true;
            this.isFiring = true;
            this.triggerDeviceSwitch('desktop');
        }
    }

    handleMouseUp(e) {
        if (e.button === 0) {
            this.mouse.clicked = false;
            this.isFiring = false;
        }
    }

    initTouchControls() {
        const joyMove = document.getElementById('joystick-move');
        const joyAim = document.getElementById('joystick-aim');
        const touchLeftSide = document.querySelector('.touch-left-side');
        
        if (!joyMove || !joyAim) return;

        const showTouchUI = () => {
            this.actions.touchActive = true;
            this.triggerDeviceSwitch('mobile');
            const touchControls = document.getElementById('touch-controls');
            if (touchControls) touchControls.classList.add('active');
            const ctrlHelp = document.getElementById('controls-help');
            if (ctrlHelp) ctrlHelp.classList.add('hidden');
        };

        window.addEventListener('touchstart', (e) => {
            this.lastTouchTime = Date.now();
            showTouchUI();
        });
        window.addEventListener('touchmove', (e) => {
            this.lastTouchTime = Date.now();
        }, { passive: true });

        // Dynamic / Floating Left Joystick ( Movement )
        if (touchLeftSide) {
            touchLeftSide.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.lastTouchTime = Date.now();
                showTouchUI();

                this.sprintLocked = false; // Break sprint lock immediately on new touch!
                const sprintIndicator = document.getElementById('joystick-sprint-indicator');
                if (sprintIndicator) sprintIndicator.classList.remove('active');

                // Get the active touch on the left side
                const touch = e.changedTouches[0];
                const clientX = touch.clientX;
                const clientY = touch.clientY;

                // Reposition the virtual joystick container dynamically at the touch point
                const container = document.getElementById('joystick-move-container');
                if (container) {
                    container.style.position = 'absolute';
                    container.style.left = `${clientX - 70}px`;
                    container.style.top = `${clientY - 145}px`;
                    container.style.bottom = 'auto';
                    container.style.transform = 'none';
                    container.style.opacity = '0.95';
                }

                this.moveJoy.active = true;
                this.moveJoy.startX = clientX;
                this.moveJoy.startY = clientY;
                this.moveJoy.identifier = touch.identifier;
            });

            touchLeftSide.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.lastTouchTime = Date.now();
                if (!this.moveJoy.active) return;
                
                for (let i = 0; i < e.touches.length; i++) {
                    const touch = e.touches[i];
                    if (touch.identifier === this.moveJoy.identifier) {
                        const dx = touch.clientX - this.moveJoy.startX;
                        const dy = touch.clientY - this.moveJoy.startY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist === 0) {
                            this.moveJoy.x = 0;
                            this.moveJoy.y = 0;
                        } else {
                            const angle = Math.atan2(dy, dx);
                            // Super responsive sensitivity: 35px drag is already full speed!
                            const sensitivityRadius = 35;
                            const speedScale = Math.min(1.0, dist / sensitivityRadius);
                            this.moveJoy.x = Math.cos(angle) * speedScale;
                            this.moveJoy.y = Math.sin(angle) * speedScale;
                        }

                        // Sprint Lock threshold checking (dragging up high)
                        const sprintIndicator = document.getElementById('joystick-sprint-indicator');
                        if (this.moveJoy.y < -0.80) {
                            this.sprintLockedTarget = true;
                            if (sprintIndicator) sprintIndicator.classList.add('active');
                        } else {
                            this.sprintLockedTarget = false;
                            if (sprintIndicator) sprintIndicator.classList.remove('active');
                        }

                        const knob = document.getElementById('joystick-move-knob');
                        if (knob) {
                            knob.style.transform = `translate(${this.moveJoy.x * this.maxJoyRadius}px, ${this.moveJoy.y * this.maxJoyRadius}px)`;
                        }
                    }
                }
            });

            const resetMoveJoy = () => {
                this.moveJoy.active = false;
                this.moveJoy.x = 0;
                this.moveJoy.y = 0;
                const knob = document.getElementById('joystick-move-knob');
                if (knob) knob.style.transform = 'translate(0px, 0px)';
                
                const sprintIndicator = document.getElementById('joystick-sprint-indicator');
                if (this.sprintLockedTarget) {
                    this.sprintLocked = true;
                    this.sprintLockedTarget = false;
                    if (sprintIndicator) sprintIndicator.classList.add('active');
                } else {
                    this.sprintLocked = false;
                    if (sprintIndicator) sprintIndicator.classList.remove('active');
                }

                // Reset joystick container back to its default stylesheet-defined bottom-left position
                const container = document.getElementById('joystick-move-container');
                if (container) {
                    container.style.position = '';
                    container.style.left = '';
                    container.style.top = '';
                    container.style.bottom = '';
                    container.style.transform = '';
                    container.style.opacity = '';
                }
            };

            touchLeftSide.addEventListener('touchend', resetMoveJoy);
            touchLeftSide.addEventListener('touchcancel', resetMoveJoy);
        }

        // Aim Joystick
        joyAim.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.targetTouches[0];
            const rect = joyAim.getBoundingClientRect();
            this.aimJoy.active = true;
            this.aimJoy.startX = rect.left + rect.width / 2;
            this.aimJoy.startY = rect.top + rect.height / 2;
            this.aimJoy.identifier = touch.identifier;
            this.isFiring = true;
        });

        joyAim.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.aimJoy.active) return;
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                if (touch.identifier === this.aimJoy.identifier) {
                    const dx = touch.clientX - this.aimJoy.startX;
                    const dy = touch.clientY - this.aimJoy.startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 5) {
                        const screenAngle = Math.atan2(dy, dx);
                        const clampedDist = Math.min(dist, this.maxJoyRadius);
                        this.aimJoy.x = (Math.cos(screenAngle) * clampedDist) / this.maxJoyRadius;
                        this.aimJoy.y = (Math.sin(screenAngle) * clampedDist) / this.maxJoyRadius;
                        
                        let worldAngle = screenAngle;
                        if (this.camera && this.camera.viewMode === 'isometric') {
                            worldAngle += Math.PI / 4;
                        }
                        
                        this.aimX = Math.cos(worldAngle);
                        this.aimY = Math.sin(worldAngle);
                        this.aimAngle = worldAngle;
                        this.isAiming = true;
                        this.isFiring = true;
                    }

                    const knob = document.getElementById('joystick-aim-knob');
                    if (knob) {
                        knob.style.transform = `translate(${this.aimJoy.x * this.maxJoyRadius}px, ${this.aimJoy.y * this.maxJoyRadius}px)`;
                    }
                }
            }
        });

        const resetAimJoy = () => {
            this.aimJoy.active = false;
            this.aimJoy.x = 0;
            this.aimJoy.y = 0;
            this.isFiring = false;
            const knob = document.getElementById('joystick-aim-knob');
            if (knob) knob.style.transform = 'translate(0px, 0px)';
        };

        joyAim.addEventListener('touchend', resetAimJoy);
        joyAim.addEventListener('touchcancel', resetAimJoy);

        // Dedicated Bullet Fire Button
        const btnFire = document.getElementById('t-btn-fire');
        if (btnFire) {
            btnFire.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isFiring = true;
            });
            btnFire.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isFiring = false;
            });
            btnFire.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.isFiring = false;
            });
        }

        // Action Buttons
        const btnEject = document.getElementById('t-btn-eject');
        if (btnEject) {
            btnEject.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.actions.eject = true;
            });
        }
        
        const btnReload = document.getElementById('t-btn-reload');
        if (btnReload) {
            btnReload.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.actions.reload = true;
            });
        }
        
        const btnHeal = document.getElementById('t-btn-heal');
        if (btnHeal) {
            btnHeal.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.actions.heal = true;
            });
        }
        
        const btnInteract = document.getElementById('t-btn-interact');
        if (btnInteract) {
            btnInteract.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.actions.interact = true;
            });
        }

        const btnViewToggle = document.getElementById('t-btn-view-toggle');
        if (btnViewToggle) {
            btnViewToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.actions.toggleView = true;
            });
        }
    }

    updateGamepadDebugHUD(activeGamepad) {
        if (!activeGamepad) {
            const debugPanel = document.getElementById('gamepad-debug');
            if (debugPanel) debugPanel.classList.add('hidden');
            return;
        }

        const debugPanel = document.getElementById('gamepad-debug');
        if (debugPanel) {
            debugPanel.classList.remove('hidden');
            
            const debugName = document.getElementById('gamepad-name');
            if (debugName) debugName.textContent = activeGamepad.id;

            const deadzone = 0.15;
            const applyDeadzone = (val) => {
                if (Math.abs(val) < deadzone) return 0;
                return (val - Math.sign(val) * deadzone) / (1 - deadzone);
            };

            const stickLeftX = applyDeadzone(activeGamepad.axes[0]);
            const stickLeftY = applyDeadzone(activeGamepad.axes[1]);
            const debugLeft = document.getElementById('debug-left-stick');
            if (debugLeft) debugLeft.textContent = `${stickLeftX.toFixed(2)}, ${stickLeftY.toFixed(2)}`;

            let stick2 = activeGamepad.axes.length > 2 ? applyDeadzone(activeGamepad.axes[2]) : 0;
            let stick3 = activeGamepad.axes.length > 3 ? applyDeadzone(activeGamepad.axes[3]) : 0;
            let stick4 = activeGamepad.axes.length > 4 ? applyDeadzone(activeGamepad.axes[4]) : 0;
            let stick5 = activeGamepad.axes.length > 5 ? applyDeadzone(activeGamepad.axes[5]) : 0;

            let stickRightX = 0;
            let stickRightY = 0;

            // Detect if axes are triggers (resting at -1)
            const axis2IsTrigger = activeGamepad.axes.length > 2 && activeGamepad.axes[2] < -0.9;
            const axis3IsTrigger = activeGamepad.axes.length > 3 && activeGamepad.axes[3] < -0.9;
            const axis4IsTrigger = activeGamepad.axes.length > 4 && activeGamepad.axes[4] < -0.9;
            const axis5IsTrigger = activeGamepad.axes.length > 5 && activeGamepad.axes[5] < -0.9;

            if (activeGamepad.mapping === 'standard') {
                stickRightX = stick2;
                stickRightY = stick3;
            } else {
                // Dynamically assign stick axes by avoiding trigger axes
                if (axis3IsTrigger) {
                    stickRightX = stick2;
                    stickRightY = (activeGamepad.axes.length > 5 && !axis5IsTrigger) ? stick5 : (activeGamepad.axes.length > 4 && !axis4IsTrigger ? stick4 : stick3);
                } else if (axis2IsTrigger) {
                    stickRightX = stick3;
                    stickRightY = stick4;
                } else {
                    stickRightX = stick2;
                    stickRightY = stick3;
                }
            }

            const debugRight = document.getElementById('debug-right-stick');
            if (debugRight) debugRight.textContent = `${stickRightX.toFixed(2)}, ${stickRightY.toFixed(2)}`;

            const axesGrid = document.getElementById('debug-axes-grid');
            if (axesGrid) {
                axesGrid.innerHTML = '';
                for (let i = 0; i < Math.min(6, activeGamepad.axes.length); i++) {
                    const val = activeGamepad.axes[i];
                    const activeClass = Math.abs(val) > 0.15 ? 'active' : '';
                    axesGrid.innerHTML += `<div class="axis-item">A${i}: <span class="axis-val ${activeClass}">${val.toFixed(2)}</span></div>`;
                }
            }

            const buttonsGrid = document.getElementById('debug-buttons-grid');
            if (buttonsGrid) {
                buttonsGrid.innerHTML = '';
                for (let i = 0; i < Math.min(16, activeGamepad.buttons.length); i++) {
                    const btn = activeGamepad.buttons[i];
                    const isPressed = btn.pressed || btn.value > 0.5;
                    const pressedClass = isPressed ? 'pressed' : '';
                    buttonsGrid.innerHTML += `<div class="btn-indicator ${pressedClass}">${i}</div>`;
                }
            }
        }
    }

    updateGamepad(camera) {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let activeGamepad = null;
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].connected) {
                activeGamepad = gamepads[i];
                break;
            }
        }

        // Hide debug panel if no gamepad connected
        if (!activeGamepad) {
            const debugPanel = document.getElementById('gamepad-debug');
            if (debugPanel) debugPanel.classList.add('hidden');
            return false;
        }

        // TV Gamepad Menu Navigation Helper: Allow A (Button 0) or Start (Button 9) to auto-click Matchmaking
        if (this.director && this.director.gameState === 'menu') {
            const btnA = activeGamepad.buttons[0];
            const btnStart = activeGamepad.buttons.length > 9 ? activeGamepad.buttons[9] : null;
            if ((btnA && btnA.pressed) || (btnStart && btnStart.pressed)) {
                const startBtn = document.getElementById('btn-start-game');
                if (startBtn && !startBtn.disabled) {
                    if (!this.menuClickCooldown || Date.now() - this.menuClickCooldown > 1000) {
                        this.menuClickCooldown = Date.now();
                        startBtn.click();
                    }
                }
            }
        }

        const deadzone = 0.15;
        const applyDeadzone = (val) => {
            if (Math.abs(val) < deadzone) return 0;
            return (val - Math.sign(val) * deadzone) / (1 - deadzone);
        };

        // Check if there is actual input from the gamepad to trigger Gamepad mode dynamically.
        // We only check active, deadzoned movement axes and button presses, ignoring triggers at rest.
        let hasInput = false;

        // 1. Check Left Stick
        const stickLeftX = applyDeadzone(activeGamepad.axes[0]);
        const stickLeftY = applyDeadzone(activeGamepad.axes[1]);
        if (stickLeftX !== 0 || stickLeftY !== 0) {
            hasInput = true;
        }

        // 2. Check Right Stick (supports standard and alternative mapping)
        let stick2 = activeGamepad.axes.length > 2 ? applyDeadzone(activeGamepad.axes[2]) : 0;
        let stick3 = activeGamepad.axes.length > 3 ? applyDeadzone(activeGamepad.axes[3]) : 0;
        let stick4 = activeGamepad.axes.length > 4 ? applyDeadzone(activeGamepad.axes[4]) : 0;
        let stick5 = activeGamepad.axes.length > 5 ? applyDeadzone(activeGamepad.axes[5]) : 0;

        let stickRightX = 0;
        let stickRightY = 0;

        // Detect if axes are triggers (resting at -1)
        const axis2IsTrigger = activeGamepad.axes.length > 2 && activeGamepad.axes[2] < -0.9;
        const axis3IsTrigger = activeGamepad.axes.length > 3 && activeGamepad.axes[3] < -0.9;
        const axis4IsTrigger = activeGamepad.axes.length > 4 && activeGamepad.axes[4] < -0.9;
        const axis5IsTrigger = activeGamepad.axes.length > 5 && activeGamepad.axes[5] < -0.9;

        if (activeGamepad.mapping === 'standard') {
            stickRightX = stick2;
            stickRightY = stick3;
        } else {
            // Dynamically assign stick axes by avoiding trigger axes
            if (axis3IsTrigger) {
                stickRightX = stick2;
                stickRightY = (activeGamepad.axes.length > 5 && !axis5IsTrigger) ? stick5 : (activeGamepad.axes.length > 4 && !axis4IsTrigger ? stick4 : stick3);
            } else if (axis2IsTrigger) {
                stickRightX = stick3;
                stickRightY = stick4;
            } else {
                stickRightX = stick2;
                stickRightY = stick3;
            }
        }

        if (stickRightX !== 0 || stickRightY !== 0) {
            hasInput = true;
        }

        // 3. Check Buttons
        if (!hasInput) {
            for (let i = 0; i < activeGamepad.buttons.length; i++) {
                const btn = activeGamepad.buttons[i];
                if (btn.pressed || btn.value > 0.1) {
                    hasInput = true;
                    break;
                }
            }
        }

        if (hasInput) {
            this.triggerDeviceSwitch('tv');
        }

        // Always update Gamepad Debug HUD if a controller is connected
        this.updateGamepadDebugHUD(activeGamepad);

        // If no active gamepad input, yield control to keyboard/mouse (avoid device fight stutter)
        if (!hasInput) {
            return false;
        }

        this.isAiming = false;

        // Apply Left Stick - Movement
        if (stickLeftX !== 0 || stickLeftY !== 0) {
            this.moveX = stickLeftX;
            this.moveY = stickLeftY;
        }

        // Apply Right Stick - Aiming
        if (stickRightX !== 0 || stickRightY !== 0) {
            let rx = stickRightX;
            let ry = stickRightY;
            if (camera && camera.viewMode === 'isometric') {
                const rotAngle = Math.PI / 4;
                rx = stickRightX * Math.cos(rotAngle) - stickRightY * Math.sin(rotAngle);
                ry = stickRightX * Math.sin(rotAngle) + stickRightY * Math.cos(rotAngle);
            }
            this.aimX = rx;
            this.aimY = ry;
            this.aimAngle = Math.atan2(ry, rx);
            this.isAiming = true;
        }

        const rt = activeGamepad.buttons[7];
        if (rt) {
            this.isFiring = rt.pressed || rt.value > 0.1;
        }

        const btnInteract = activeGamepad.buttons[0];
        if (btnInteract && (btnInteract.pressed || btnInteract.value > 0.5)) {
            this.actions.interact = true;
            this.actions.eject = true;
        }

        // Support Reload on Button 2 (Square/X) or Button 3 (Triangle/Y)
        // Check for robust button pressure threshold (> 0.5) to avoid analog trigger/drift loop
        const btnReload2 = activeGamepad.buttons[2];
        const btnReload3 = activeGamepad.buttons[3];
        const isReloadPressed = (btnReload2 && (btnReload2.pressed || btnReload2.value > 0.5)) ||
                                (btnReload3 && (btnReload3.pressed || btnReload3.value > 0.5));
        if (isReloadPressed) {
            this.actions.reload = true;
        }

        const btnHeal = activeGamepad.buttons[12];
        if (btnHeal && (btnHeal.pressed || btnHeal.value > 0.5)) {
            this.actions.heal = true;
        }

        const btnLB = activeGamepad.buttons[4];
        if (btnLB && (btnLB.pressed || btnLB.value > 0.5) && !this.wasLBPressed) {
            this.actions.bumperLeft = true;
            this.wasLBPressed = true;
        } else if (btnLB && !(btnLB.pressed || btnLB.value > 0.5)) {
            this.wasLBPressed = false;
        }

        const btnRB = activeGamepad.buttons[5];
        if (btnRB && (btnRB.pressed || btnRB.value > 0.5) && !this.wasRBPressed) {
            this.actions.bumperRight = true;
            this.wasRBPressed = true;
        } else if (btnRB && !(btnRB.pressed || btnRB.value > 0.5)) {
            this.wasRBPressed = false;
        }

        return true;
    }

    update(camera, player) {
        this.camera = camera;
        this.moveX = 0;
        this.moveY = 0;

        const currentDevice = this.director ? this.director.deviceType : (window.director ? window.director.deviceType : 'desktop');
        const gamepadUsed = this.updateGamepad(camera);

        if (!gamepadUsed) {
            if (this.keys['KeyW'] || this.keys['ArrowUp']) this.moveY = -1;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) this.moveY = 1;
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.moveX = -1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) this.moveX = 1;

            if (this.moveX !== 0 && this.moveY !== 0) {
                const len = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
                this.moveX /= len;
                this.moveY /= len;
            }

            if (this.moveJoy.active) {
                this.moveX = this.moveJoy.x;
                this.moveY = this.moveJoy.y;
            } else if (this.sprintLocked) {
                this.moveX = 0;
                this.moveY = -1; // Force persistent forward movement
            }

            if (this.aimJoy.active) {
                this.isAiming = true;
            } else if (currentDevice === 'mobile') {
                this.isAiming = false;
            } else if (player && camera) {
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const viewMouseX = this.mouse.rawX - rect.left;
                    const viewMouseY = this.mouse.rawY - rect.top;

                    const canvasW = canvas.width;
                    const canvasH = canvas.height;
                    const scaleX = rect.width / canvasW;
                    const scaleY = rect.height / canvasH;

                    const screenX = viewMouseX / scaleX;
                    const screenY = viewMouseY / scaleY;

                     // Unproject screen-space coordinates back to world coordinates
                    let worldMouseX, worldMouseY;
                    if (camera.viewMode === 'isometric') {
                        const dx = (screenX - canvasW / 2) / camera.zoom;
                        const dy = (screenY - canvasH / 2) / (camera.zoom * 0.6);
                        
                        const rotAngle = Math.PI / 4;
                        worldMouseX = (dx * Math.cos(rotAngle) - dy * Math.sin(rotAngle)) + camera.x;
                        worldMouseY = (dx * Math.sin(rotAngle) + dy * Math.cos(rotAngle)) + camera.y;
                    } else {
                        // Standard 2D Top-Down View (Previous)
                        const dx = (screenX - canvasW / 2) / camera.zoom;
                        const dy = (screenY - canvasH / 2) / camera.zoom;
                        worldMouseX = dx + camera.x;
                        worldMouseY = dy + camera.y;
                    }

                    const aimDx = worldMouseX - player.x;
                    const aimDy = worldMouseY - player.y;
                    
                    this.aimAngle = Math.atan2(aimDy, aimDx);
                    this.aimX = Math.cos(this.aimAngle);
                    this.aimY = Math.sin(this.aimAngle);
                    this.isAiming = true;
                }
            }
        }
    }

    clearActions() {
        this.actions.reload = false;
        this.actions.interact = false;
        this.actions.heal = false;
        this.actions.eject = false;
        this.actions.weapon1 = false;
        this.actions.weapon2 = false;
        this.actions.weapon3 = false;
        this.actions.toggleView = false;
        this.actions.bumperLeft = false;
        this.actions.bumperRight = false;
    }
}


// ============================================================================
// 4. ENTITIES AND WEAPONS SYSTEMS
// ============================================================================
const WEAPON_TYPES = {
    pistol: { id: 'pistol', name: 'LEGO Pistol', damage: 20, fireRate: 350, spread: 0.03, capacity: 7, bulletSpeed: 14, sound: 'pistol', pelletCount: 1, range: 400 },
    smg: { id: 'smg', name: 'LEGO SMG', damage: 15, fireRate: 100, spread: 0.12, capacity: 30, bulletSpeed: 16, sound: 'smg', pelletCount: 1, range: 350 },
    shotgun: { id: 'shotgun', name: 'LEGO Shotgun', damage: 16, fireRate: 900, spread: 0.25, capacity: 5, bulletSpeed: 11, sound: 'shotgun', pelletCount: 5, range: 220 },
    rifle: { id: 'rifle', name: 'Assault Rifle', damage: 28, fireRate: 180, spread: 0.04, capacity: 30, bulletSpeed: 20, sound: 'rifle', pelletCount: 1, range: 600 },
    sniper: { id: 'sniper', name: 'Sniper Rifle', damage: 80, fireRate: 1600, spread: 0.002, capacity: 5, bulletSpeed: 28, sound: 'sniper', pelletCount: 1, range: 1100 },
    bricklauncher: { id: 'bricklauncher', name: 'Mortar Launcher', damage: 95, fireRate: 1500, spread: 0.02, capacity: 2, bulletSpeed: 9, sound: 'bricklauncher', pelletCount: 1, range: 500 }
};

class Bullet {
    constructor(x, y, vx, vy, weaponSpec, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = weaponSpec.damage;
        this.weaponId = weaponSpec.id;
        this.owner = owner;
        this.radius = weaponSpec.id === 'bricklauncher' ? 7 : 3.5;
        this.color = owner.color || '#fff';
        
        this.life = weaponSpec.range / weaponSpec.bulletSpeed;
        this.type = weaponSpec.id === 'bricklauncher' ? 'brick' : 'stud';
    }

    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
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
            ctx.translate(this.x, this.y);
            ctx.rotate(this.life * 0.1);
            ctx.fillRect(-6, -4, 12, 8);
            ctx.strokeRect(-6, -4, 12, 8);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

class Entity {
    constructor(x, y, username, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        this.radius = 12;
        this.angle = 0;
        this.speed = 3.2;

        this.username = username;
        this.color = color;
        this.isPlayer = isPlayer;

        this.health = 100;
        this.shield = 0;
        this.boost = 0;

        this.weapons = [
            { ...WEAPON_TYPES.pistol, currentAmmo: 7 },
            null,
            null
        ];
        this.activeWeaponIndex = 0;
        this.ammoInventory = { smg: 30, rifle: 0, special: 0 };
        this.armorLevel = 0;

        this.medkitsCount = 2;

        this.state = 'plane';
        this.parachuteAltitude = 250;
        
        this.fireCooldown = 0;
        this.reloadCooldown = 0;
        this.healCooldown = 0;
        this.isReloading = false;
        this.isHealing = false;

        this.kills = 0;
        this.damageDealt = 0;
        this.survivalTime = 0;

        this.walkingFrame = 0;
    }

    takeDamage(dmg, attacker) {
        if (this.state === 'dead') return;

        let remainingDmg = dmg;
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, remainingDmg);
            this.shield -= absorbed;
            remainingDmg -= absorbed;
        }

        if (remainingDmg > 0) {
            this.health = Math.max(0, this.health - remainingDmg);
        }

        fx.spawnStudScatter(this.x, this.y, '#e74c3c', 3, 2.5);

        if (this.health <= 0) {
            this.state = 'dead';
            sfx.playLegoRattle(0.9);
            fx.spawnLegoExplode(this.x, this.y, '#f5b041', this.color, '#2c3e50');
            
            if (attacker && attacker !== this) {
                attacker.kills++;

                if (director.isOnline && (director.player === this || (director.isHost && this instanceof Bot))) {
                    director.sendNetPacket({
                        type: 'elimination',
                        killedId: this.username,
                        killerId: attacker.username,
                        killedName: this.username,
                        killerName: attacker.username
                    });
                }
            }
        }
    }

    heal() {
        if (this.medkitsCount > 0 && this.health < 100 && !this.isHealing && !this.isReloading) {
            this.isHealing = true;
            this.healCooldown = 1500;
            sfx.playHeal();
        }
    }

    reload() {
        const weapon = this.weapons[this.activeWeaponIndex];
        if (!weapon || this.isReloading || this.isHealing) return;

        const ammoType = weapon.id === 'rifle' ? 'rifle' : (weapon.id === 'bricklauncher' ? 'special' : 'smg');
        const needed = weapon.capacity - weapon.currentAmmo;
        const available = this.ammoInventory[ammoType];

        if (needed > 0 && (available > 0 || weapon.id === 'pistol')) {
            this.isReloading = true;
            this.reloadCooldown = weapon.id === 'sniper' ? 1800 : 1000;
            sfx.playLegoRattle(0.4);
        }
    }

    useBoosters(dt) {
        if (this.boost > 0) {
            this.boost = Math.max(0, this.boost - dt * 2.5);
            if (this.health < 100) {
                this.health = Math.min(100, this.health + dt * 1.5);
            }
        }
    }

    getSpeed() {
        const factor = this.boost > 50 ? 1.2 : 1.0;
        return this.speed * factor;
    }
}

class Player extends Entity {
    constructor(x, y, username, color) {
        super(x, y, username, color, true);
        this.autoPickup = true;
    }

    update(dt, input, map, spawnBullet, camera) {
        if (this.state === 'dead') return;

        this.survivalTime += dt;

        if (this.isNetworkPlayer) {
            if (this.targetX !== undefined && this.targetY !== undefined) {
                const lerpSpeed = 15 * dt;
                this.x += (this.targetX - this.x) * Math.min(1, lerpSpeed);
                this.y += (this.targetY - this.y) * Math.min(1, lerpSpeed);
            }
            if (this.targetAngle !== undefined) {
                this.angle = this.targetAngle;
            }
            if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                this.walkingFrame += 0.22;
            } else {
                this.walkingFrame = 0;
            }
            return;
        }

        if (this.state === 'plane') {
            if (input.actions.eject) {
                this.state = 'parachute';
                this.parachuteAltitude = 250;
                sfx.playLegoRattle();
            }
            return;
        }

        // Rotate movement vectors by +45 degrees to align keyboard inputs with the isometric screen axes if in isometric mode
        let moveX = input.moveX;
        let moveY = input.moveY;
        if ((moveX !== 0 || moveY !== 0) && camera && camera.viewMode === 'isometric') {
            const rotAngle = Math.PI / 4;
            const rx = moveX * Math.cos(rotAngle) - moveY * Math.sin(rotAngle);
            const ry = moveX * Math.sin(rotAngle) + moveY * Math.cos(rotAngle);
            moveX = rx;
            moveY = ry;
        }

        const fpsFactor = 60 * dt;
        if (this.state === 'parachute') {
            const glideSpeed = 1.8 * fpsFactor;
            this.x += moveX * glideSpeed;
            this.y += moveY * glideSpeed;

            this.parachuteAltitude -= dt * 65;
            if (this.parachuteAltitude <= 0) {
                this.state = 'alive';
                this.parachuteAltitude = 0;
                sfx.playLegoRattle(0.6);
                fx.spawnStudScatter(this.x, this.y, '#2ecc71', 8, 2);
            }
            return;
        }

        if (this.isHealing) {
            this.healCooldown -= dt * 1000;
            if (this.healCooldown <= 0) {
                this.isHealing = false;
                this.medkitsCount--;
                this.health = Math.min(100, this.health + 45);
                sfx.playLoot();
                fx.spawnStudScatter(this.x, this.y, '#2ecc71', 6, 2);
            }
            this.vx = 0; this.vy = 0;
            return;
        }

        if (input.actions.dropWeapon) {
            this.dropActiveWeapon(map);
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
                    const loaded = Math.min(needed, this.ammoInventory[ammoType] || 0);
                    w.currentAmmo += loaded;
                    this.ammoInventory[ammoType] = Math.max(0, (this.ammoInventory[ammoType] || 0) - loaded);
                }
            }
            this.vx = moveX * this.getSpeed() * 0.45 * fpsFactor;
            this.vy = moveY * this.getSpeed() * 0.45 * fpsFactor;
        } else {
            this.vx = moveX * this.getSpeed() * fpsFactor;
            this.vy = moveY * this.getSpeed() * fpsFactor;
        }

        this.x += this.vx;
        this.y += this.vy;

        map.resolveCollisions(this);

        if (input.isAiming) {
            this.angle = input.aimAngle;
        } else if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }

        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.walkingFrame += 0.22;
        } else {
            this.walkingFrame = 0;
        }

        const weapon = this.weapons[this.activeWeaponIndex];
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt * 1000;
        }

        if (input.isFiring && weapon && this.fireCooldown <= 0 && !this.isReloading && !this.isHealing) {
            if (weapon.currentAmmo > 0) {
                this.fire(weapon, spawnBullet, camera);
            } else {
                this.reload();
            }
        }

        if (input.actions.reload) {
            this.reload();
        }

        if (input.actions.weapon1) this.switchWeapon(0);
        if (input.actions.weapon2) this.switchWeapon(1);
        if (input.actions.weapon3) this.switchWeapon(2);

        if (input.actions.bumperLeft) this.switchWeapon((this.activeWeaponIndex + 2) % 3);
        if (input.actions.bumperRight) this.switchWeapon((this.activeWeaponIndex + 1) % 3);

        if (input.actions.interact) {
            this.interactLoot(map);
        } else if (this.autoPickup) {
            this.runAutoPickup(map);
        }

        if (input.actions.heal) {
            this.heal();
        }

        this.useBoosters(dt);
    }

    fire(weapon, spawnBullet, camera) {
        weapon.currentAmmo--;
        this.fireCooldown = weapon.fireRate;

        if (camera) {
            const shakeForces = { pistol: 3, smg: 2.2, shotgun: 8, rifle: 4.5, sniper: 14, bricklauncher: 12 };
            camera.shake(shakeForces[weapon.id] || 3);
        }

        const soundCalls = {
            pistol: () => sfx.playPistol(),
            smg: () => sfx.playSMG(),
            shotgun: () => sfx.playShotgun(),
            rifle: () => sfx.playRifle(),
            sniper: () => sfx.playSniper(),
            bricklauncher: () => sfx.playBrickExplosion()
        };
        if (soundCalls[weapon.id]) soundCalls[weapon.id]();

        const fireX = this.x + Math.cos(this.angle) * 16;
        const fireY = this.y + Math.sin(this.angle) * 16;

        for (let i = 0; i < weapon.pelletCount; i++) {
            const spreadAngle = this.angle + (Math.random() - 0.5) * weapon.spread;
            const vx = Math.cos(spreadAngle) * weapon.bulletSpeed;
            const vy = Math.sin(spreadAngle) * weapon.bulletSpeed;
            
            spawnBullet(new Bullet(fireX, fireY, vx, vy, weapon, this));

            if (director.isOnline) {
                director.sendNetPacket({
                    type: 'bullet_spawn',
                    x: fireX,
                    y: fireY,
                    vx: vx,
                    vy: vy,
                    weaponId: weapon.id
                });
            }
        }

        fx.spawnMuzzleFlash(fireX, fireY, this.angle);
    }

    switchWeapon(index) {
        if (index === this.activeWeaponIndex || index < 0 || index > 2) return;
        this.isReloading = false;
        this.isHealing = false;
        this.activeWeaponIndex = index;
        sfx.playClick();
    }

    interactLoot(map) {
        let nearest = null;
        let minDist = 38;

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
                let targetSlot = 1;
                if (spec.id === 'pistol') {
                    targetSlot = 0;
                } else {
                    if (this.weapons[1] === null) {
                        targetSlot = 1;
                    } else if (this.weapons[2] === null) {
                        targetSlot = 2;
                    } else {
                        targetSlot = this.activeWeaponIndex === 0 ? 1 : this.activeWeaponIndex;
                    }
                }

                const oldWeapon = this.weapons[targetSlot];
                if (oldWeapon && oldWeapon.id !== 'pistol') {
                    map.loot.push({
                        x: this.x, y: this.y,
                        id: Math.random().toString(36).substr(2, 9),
                        spec: { type: 'weapon', id: oldWeapon.id, name: oldWeapon.name, color: oldWeapon.color, ammo: oldWeapon.currentAmmo },
                        pulseTimer: 0
                    });
                }

                const weaponSpec = WEAPON_TYPES[spec.id];
                const capacity = weaponSpec.capacity;
                const loaded = Math.min(spec.ammo, capacity);
                const extraReserve = spec.ammo - loaded;

                this.weapons[targetSlot] = { ...weaponSpec, currentAmmo: loaded };
                this.activeWeaponIndex = targetSlot;
                
                const ammoType = spec.id === 'rifle' ? 'rifle' : (spec.id === 'bricklauncher' ? 'special' : 'smg');
                this.ammoInventory[ammoType] += extraReserve;
                
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
                map.loot = map.loot.filter((item) => item.id !== nearest.id);

                if (director.isOnline) {
                    director.sendHostLootSync();
                }
            }
        }
    }

    runAutoPickup(map) {
        let nearest = null;
        let minDist = 32;

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
                let targetSlot = -1;
                if (spec.id === 'pistol') {
                    if (this.weapons[0] === null) targetSlot = 0;
                } else {
                    if (this.weapons[1] === null) {
                        targetSlot = 1;
                    } else if (this.weapons[2] === null) {
                        targetSlot = 2;
                    }
                }

                if (targetSlot !== -1) {
                    const weaponSpec = WEAPON_TYPES[spec.id];
                    const capacity = weaponSpec.capacity;
                    const loaded = Math.min(spec.ammo, capacity);
                    const extraReserve = spec.ammo - loaded;

                    this.weapons[targetSlot] = { ...weaponSpec, currentAmmo: loaded };
                    this.activeWeaponIndex = targetSlot;
                    
                    const ammoType = spec.id === 'rifle' ? 'rifle' : (spec.id === 'bricklauncher' ? 'special' : 'smg');
                    this.ammoInventory[ammoType] += extraReserve;
                    
                    success = true;
                }
            } else if (spec.type === 'ammo') {
                const type = spec.id === 'rifle' ? 'rifle' : 'smg';
                this.ammoInventory[type] += spec.qty;
                success = true;
            } else if (spec.type === 'armor') {
                const targetArmorLvl = parseInt(spec.id.replace('armor', ''));
                if (targetArmorLvl > this.armorLevel || this.shield < 100) {
                    this.armorLevel = Math.max(this.armorLevel, targetArmorLvl);
                    this.shield = Math.min(100, this.shield + spec.shield);
                    success = true;
                }
            } else if (spec.type === 'med') {
                if (spec.id === 'medkit') {
                    if (this.medkitsCount < 5) {
                        this.medkitsCount = Math.min(5, this.medkitsCount + 1);
                        success = true;
                    }
                } else if (spec.id === 'boost') {
                    if (this.boost < 100) {
                        this.boost = Math.min(100, this.boost + spec.boost);
                        success = true;
                    }
                }
            }

            if (success) {
                sfx.playLoot();
                fx.spawnStudScatter(nearest.x, nearest.y, spec.color, 5, 2.5);
                map.loot = map.loot.filter((item) => item.id !== nearest.id);

                if (director.isOnline) {
                    director.sendHostLootSync();
                }
            }
        }
    }

    dropActiveWeapon(map) {
        if (this.activeWeaponIndex === 0) return;
        const w = this.weapons[this.activeWeaponIndex];
        if (!w) return;

        map.loot.push({
            x: this.x + (Math.random() - 0.5) * 20,
            y: this.y + (Math.random() - 0.5) * 20,
            id: Math.random().toString(36).substr(2, 9),
            spec: { type: 'weapon', id: w.id, name: w.name, color: w.color, ammo: w.currentAmmo },
            pulseTimer: 0
        });

        this.weapons[this.activeWeaponIndex] = null;
        sfx.playClick();
        this.activeWeaponIndex = 0;
    }
}

class Bot extends Entity {
    constructor(x, y, username, color) {
        super(x, y, username, color, false);
        this.aiTimer = Math.random() * 2000;
        
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

        if (director.isOnline && !director.isHost) {
            if (this.targetX !== undefined && this.targetY !== undefined) {
                const lerpSpeed = 15 * dt;
                this.x += (this.targetX - this.x) * Math.min(1, lerpSpeed);
                this.y += (this.targetY - this.y) * Math.min(1, lerpSpeed);
            }
            if (this.targetAngle !== undefined) {
                this.angle = this.targetAngle;
            }
            if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                this.walkingFrame += 0.22;
            } else {
                this.walkingFrame = 0;
            }
            return;
        }

        if (this.state === 'plane') {
            this.aiTimer -= dt * 1000;
            if (this.aiTimer <= 0) {
                this.state = 'parachute';
                this.parachuteAltitude = 200 + Math.random() * 80;
                this.targetX = this.x + (Math.random() - 0.5) * 300;
                this.targetY = this.y + (Math.random() - 0.5) * 300;
            }
            return;
        }

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
                const ammoType = w.id === 'rifle' ? 'rifle' : (w.id === 'bricklauncher' ? 'special' : 'smg');
                if (w.id === 'pistol') {
                    w.currentAmmo = w.capacity;
                } else {
                    const needed = w.capacity - w.currentAmmo;
                    const loaded = Math.min(needed, this.ammoInventory[ammoType] || 0);
                    w.currentAmmo += loaded;
                    this.ammoInventory[ammoType] = Math.max(0, (this.ammoInventory[ammoType] || 0) - loaded);
                }
            }
            const fpsFactor = 60 * dt;
            this.x += Math.cos(this.angle) * this.getSpeed() * 0.35 * fpsFactor;
            this.y += Math.sin(this.angle) * this.getSpeed() * 0.35 * fpsFactor;
            map.resolveCollisions(this);
            return;
        }

        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt * 1000;
        }

        this.aiTimer -= dt * 1000;
        if (this.aiTimer <= 0) {
            this.aiTimer = 350 + Math.random() * 150;
            this.evaluateBehaviors(map, entitiesList);
        }

        let moveVecX = 0;
        let moveVecY = 0;

        if (this.enemyTarget && this.enemyTarget.state === 'alive') {
            const dx = this.enemyTarget.x - this.x;
            const dy = this.enemyTarget.y - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            this.angle = Math.atan2(dy, dx);

            const preferredRange = this.weapons[this.activeWeaponIndex] ? this.weapons[this.activeWeaponIndex].range * 0.6 : 150;

            if (d > 0.1) {
                if (d > preferredRange) {
                    moveVecX = dx / d;
                    moveVecY = dy / d;
                } else if (d < preferredRange * 0.6) {
                    moveVecX = -dx / d;
                    moveVecY = -dy / d;
                } else {
                    moveVecX = -dy / d;
                    moveVecY = dx / d;
                }
            } else {
                // If perfectly overlapping, move in a random angle to resolve the overlap cleanly without division-by-zero NaN
                const a = Math.random() * Math.PI * 2;
                moveVecX = Math.cos(a);
                moveVecY = Math.sin(a);
            }

            const activeWeapon = this.weapons[this.activeWeaponIndex];
            if (activeWeapon && this.fireCooldown <= 0) {
                if (activeWeapon.currentAmmo > 0) {
                    this.botFire(activeWeapon, spawnBullet);
                } else {
                    this.reload();
                }
            }

        } else if (this.lootTarget && map.loot.includes(this.lootTarget)) {
            const dx = this.lootTarget.x - this.x;
            const dy = this.lootTarget.y - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            if (d > 10) {
                moveVecX = dx / d;
                moveVecY = dy / d;
                this.angle = Math.atan2(dy, dx);
            } else {
                this.botInteractLoot(map);
            }
        } else {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            if (d > 20) {
                moveVecX = dx / d;
                moveVecY = dy / d;
                this.angle = Math.atan2(dy, dx);
            } else {
                const r = map.whiteZone.r * Math.random();
                const a = Math.random() * Math.PI * 2;
                this.targetX = map.whiteZone.x + Math.cos(a) * r;
                this.targetY = map.whiteZone.y + Math.sin(a) * r;
            }
        }

        const fpsFactor = 60 * dt;
        this.vx = moveVecX * this.getSpeed() * fpsFactor;
        this.vy = moveVecY * this.getSpeed() * fpsFactor;
        this.x += this.vx;
        this.y += this.vy;

        map.resolveCollisions(this);

        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.walkingFrame += 0.22;
        } else {
            this.walkingFrame = 0;
        }

        const travelDist = Math.sqrt(Math.pow(this.x - this.lastX, 2) + Math.pow(this.y - this.lastY, 2));
        if (travelDist < 0.2 && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
            this.stuckTimer += dt;
            if (this.stuckTimer > 0.5) {
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
        if (this.health < 45 && this.medkitsCount > 0) {
            this.heal();
            return;
        }

        const distToBlueCenter = Math.sqrt(Math.pow(this.x - map.blueZone.x, 2) + Math.pow(this.y - map.blueZone.y, 2));
        if (distToBlueCenter > map.blueZone.r * 0.8 || map.isOutsideBlueZone(this.x, this.y)) {
            const angle = Math.random() * Math.PI * 2;
            const innerOffset = map.whiteZone.r * 0.4 * Math.random();
            this.targetX = map.whiteZone.x + Math.cos(angle) * innerOffset;
            this.targetY = map.whiteZone.y + Math.sin(angle) * innerOffset;
            this.lootTarget = null;
            this.enemyTarget = null;
            return;
        }

        let closestEnemy = null;
        let enemyDist = 450;

        entitiesList.forEach((ent) => {
            if (ent !== this && ent.state === 'alive') {
                const dx = ent.x - this.x;
                const dy = ent.y - this.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < enemyDist) {
                    // Check Line of Sight so bots don't wall-hack target or shoot through buildings/obstacles
                    if (map.checkLineOfSight(this.x, this.y, ent.x, ent.y)) {
                        enemyDist = d;
                        closestEnemy = ent;
                    }
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

        const hasGoodPrimary = this.weapons[1] !== null || this.weapons[2] !== null;
        if (!hasGoodPrimary && map.loot.length > 0) {
            let closestLoot = null;
            let lootDist = 280;
            
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
        this.fireCooldown = weapon.fireRate + Math.random() * 80;

        const fireX = this.x + Math.cos(this.angle) * 16;
        const fireY = this.y + Math.sin(this.angle) * 16;

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
            const weaponSpec = WEAPON_TYPES[spec.id];
            const capacity = weaponSpec.capacity;
            const loaded = Math.min(spec.ammo, capacity);
            const extraReserve = spec.ammo - loaded;
            const ammoType = spec.id === 'rifle' ? 'rifle' : (spec.id === 'bricklauncher' ? 'special' : 'smg');

            if (this.weapons[1] === null) {
                this.weapons[1] = { ...weaponSpec, currentAmmo: loaded };
                this.activeWeaponIndex = 1;
                this.ammoInventory[ammoType] = (this.ammoInventory[ammoType] || 0) + extraReserve;
                success = true;
            } else if (this.weapons[2] === null) {
                this.weapons[2] = { ...weaponSpec, currentAmmo: loaded };
                this.activeWeaponIndex = 2;
                this.ammoInventory[ammoType] = (this.ammoInventory[ammoType] || 0) + extraReserve;
                success = true;
            } else {
                this.weapons[this.activeWeaponIndex] = { ...weaponSpec, currentAmmo: loaded };
                this.ammoInventory[ammoType] = (this.ammoInventory[ammoType] || 0) + extraReserve;
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

            if (director.isOnline && director.isHost) {
                director.sendHostLootSync();
            }
        }
        
        this.lootTarget = null;
    }
}


// ============================================================================
// 5. PROCEDURAL MAP GENERATOR AND BR BLUE ZONE
// ============================================================================
class GameMap {
    constructor(size = 3600) {
        this.size = size;
        this.half = size / 2;
        this.islandRadius = size * 0.42;
        
        this.sectors = [
            { name: 'LEGO CITY CORE', x: size * 0.35, y: size * 0.35, r: 400, type: 'city' },
            { name: 'BRICK YARDS', x: size * 0.7, y: size * 0.3, r: 350, type: 'crates' },
            { name: 'CASTLE RUINS', x: size * 0.3, y: size * 0.7, r: 350, type: 'ruins' },
            { name: 'PINE FOREST HILLS', x: size * 0.65, y: size * 0.68, r: 400, type: 'forest' }
        ];

        this.buildings = [];
        this.obstacles = [];
        this.loot = [];
        
        this.blueZone = { x: this.half, y: this.half, r: size * 0.5 };
        this.whiteZone = { x: this.half, y: this.half, r: size * 0.35 };
        
        this.zonePhase = 1;
        this.zonePhaseMax = 5;
        this.zoneTimer = 90;
        this.zoneDuration = 90;
        this.isShrinking = false;
        this.shrinkTimerProgress = 0;
        this.zoneDamage = 1;
    }

    generate() {
        this.buildings = [];
        this.obstacles = [];
        this.loot = [];

        this.sectors.forEach((sec) => {
            if (sec.type === 'city') {
                const count = 6;
                for (let i = 0; i < count; i++) {
                    let bx, by, w, h;
                    let placed = false;
                    for (let attempt = 0; attempt < 50; attempt++) {
                        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                        const dist = Math.random() * sec.r * 0.75;
                        bx = sec.x + Math.cos(angle) * dist;
                        by = sec.y + Math.sin(angle) * dist;
                        
                        w = 120 + Math.floor(Math.random() * 3) * 40;
                        h = 120 + Math.floor(Math.random() * 3) * 40;
                        
                        // Enforce a 60px distance between city buildings so players can walk between them
                        if (this.isPointOnIsland(bx, by) && !this.checkBuildingOverlap(bx, by, w, h, 60)) {
                            placed = true;
                            break;
                        }
                    }
                    if (placed) {
                        this.createBuilding(bx, by, w, h, '#7f8c8d', 1);
                    }
                }
            } else if (sec.type === 'crates') {
                this.createBuilding(sec.x, sec.y, 250, 150, '#34495e', 2);
                
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
                const wallColors = ['#7f8c8d', '#95a5a6', '#5d6d7e'];
                for (let i = 0; i < 8; i++) {
                    let rx, ry, rw, rh;
                    let placed = false;
                    for (let attempt = 0; attempt < 50; attempt++) {
                        rx = sec.x + (Math.random() - 0.5) * sec.r * 1.25;
                        ry = sec.y + (Math.random() - 0.5) * sec.r * 1.25;
                        rw = 20 + Math.random() * 140;
                        rh = 20 + Math.random() * 140;
                        
                        // Enforce a 50px clearance for ruins to avoid overlaps
                        if (this.isPointOnIsland(rx, ry) && !this.checkBuildingOverlap(rx, ry, rw, rh, 50)) {
                            placed = true;
                            break;
                        }
                    }
                    if (placed) {
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
            } else if (sec.type === 'forest') {
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

        for (let i = 0; i < 180; i++) {
            const rx = (Math.random() - 0.5) * this.size * 0.9 + this.half;
            const ry = (Math.random() - 0.5) * this.size * 0.9 + this.half;

            if (this.isPointOnIsland(rx, ry)) {
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

        this.buildings.forEach((b) => {
            const lootCount = b.type === 'ruin' ? 2 : 4;
            for (let i = 0; i < lootCount; i++) {
                const lx = b.x + (Math.random() - 0.5) * (b.w - 40);
                const ly = b.y + (Math.random() - 0.5) * (b.h - 40);
                this.spawnRandomLoot(lx, ly);
            }
        });

        for (let i = 0; i < 40; i++) {
            const rx = (Math.random() - 0.5) * this.size * 0.8 + this.half;
            const ry = (Math.random() - 0.5) * this.size * 0.8 + this.half;
            if (this.isPointOnIsland(rx, ry) && !this.checkBuildingCollision(rx, ry, 25)) {
                this.spawnRandomLoot(rx, ry);
            }
        }

        this.calculateNextCircle();
        if (director.isOnline && director.isHost) {
            director.sendHostLootSync();
        }
    }

    createBuilding(cx, cy, w, h, color, scaleLootMultiplier) {
        if (!this.isPointOnIsland(cx, cy)) return;
        
        const wallThickness = 12;
        const doorWidth = 48; // Comfortable fixed door width for the player (diameter 24)
        const topWallWidth = (w - doorWidth) / 2;

        const walls = [
            // Top left wall
            { x: cx - w/2, y: cy - h/2, w: topWallWidth, h: wallThickness },
            // Top right wall
            { x: cx + w/2 - topWallWidth, y: cy - h/2, w: topWallWidth, h: wallThickness },
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

    checkBuildingOverlap(x, y, w, h, spacing = 50) {
        for (let i = 0; i < this.buildings.length; i++) {
            const b = this.buildings[i];
            const overlapX = Math.abs(x - b.x) < (w + b.w)/2 + spacing;
            const overlapY = Math.abs(y - b.y) < (h + b.h)/2 + spacing;
            if (overlapX && overlapY) return true;
        }
        return false;
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

    checkWallCollision(x, y, radius) {
        // 1. Check building walls
        for (let i = 0; i < this.buildings.length; i++) {
            const b = this.buildings[i];
            // Broad-phase proximity optimization
            if (x + radius > b.x - b.w/2 - 20 && x - radius < b.x + b.w/2 + 20 &&
                y + radius > b.y - b.h/2 - 20 && y - radius < b.y + b.h/2 + 20) {
                
                for (let j = 0; j < b.walls.length; j++) {
                    const wall = b.walls[j];
                    const cx = Math.max(wall.x, Math.min(x, wall.x + wall.w));
                    const cy = Math.max(wall.y, Math.min(y, wall.y + wall.h));
                    
                    const dx = x - cx;
                    const dy = y - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < radius) {
                        return true;
                    }
                }
            }
        }

        // 2. Check solid obstacles (crates and boulders)
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (obs.type === 'crate' || obs.type === 'boulder') {
                const dx = x - obs.x;
                const dy = y - obs.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const collRadius = (obs.w / 2) + radius;
                if (dist < collRadius) {
                    return true;
                }
            }
        }

        return false;
    }

    checkLineOfSight(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Sample every 15 pixels along the line segment to detect obstacles
        const steps = Math.ceil(dist / 15);
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const sx = x1 + dx * t;
            const sy = y1 + dy * t;
            
            // Check with a thin ray radius of 4
            if (this.checkWallCollision(sx, sy, 4)) {
                return false; // Obstacle blocks line of sight!
            }
        }
        return true; // Clear line of sight!
    }

    spawnRandomLoot(x, y) {
        const roll = Math.random();
        let item = null;

        if (roll < 0.25) {
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
            const ammoType = Math.random() > 0.5 ? 'rifle' : 'smg';
            item = { type: 'ammo', id: ammoType, name: ammoType.toUpperCase() + ' Studs', qty: ammoType === 'rifle' ? 30 : 50, color: '#f1c40f' };
        } else if (roll < 0.70) {
            const armorRoll = Math.random();
            if (armorRoll < 0.5) {
                item = { type: 'armor', id: 'armor1', name: 'Helmet (Lvl 1)', shield: 30, color: '#bdc3c7' };
            } else if (armorRoll < 0.85) {
                item = { type: 'armor', id: 'armor2', name: 'Chestplate (Lvl 2)', shield: 60, color: '#95a5a6' };
            } else {
                item = { type: 'armor', id: 'armor3', name: 'Lego SpecOps (Lvl 3)', shield: 100, color: '#34495e' };
            }
        } else {
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

    resolveCollisions(entity) {
        if (!entity || entity.state === 'plane' || entity.state === 'parachute') return;

        const radius = entity.radius || 12;
        
        this.buildings.forEach((b) => {
            if (entity.x + radius > b.x - b.w/2 - 20 && entity.x - radius < b.x + b.w/2 + 20 &&
                entity.y + radius > b.y - b.h/2 - 20 && entity.y - radius < b.y + b.h/2 + 20) {
                
                b.walls.forEach((wall) => {
                    const cx = Math.max(wall.x, Math.min(entity.x, wall.x + wall.w));
                    const cy = Math.max(wall.y, Math.min(entity.y, wall.y + wall.h));
                    
                    const dx = entity.x - cx;
                    const dy = entity.y - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < radius) {
                        if (dist > 0.05) {
                            const overlap = radius - dist;
                            entity.x += (dx / dist) * overlap;
                            entity.y += (dy / dist) * overlap;
                        } else {
                            // Player's center is exactly inside/on the wall! Push them to the nearest outer edge.
                            const leftDist = entity.x - wall.x;
                            const rightDist = (wall.x + wall.w) - entity.x;
                            const topDist = entity.y - wall.y;
                            const bottomDist = (wall.y + wall.h) - entity.y;
                            
                            const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
                            if (minDist === leftDist) {
                                entity.x -= radius;
                            } else if (minDist === rightDist) {
                                entity.x += radius;
                            } else if (minDist === topDist) {
                                entity.y -= radius;
                            } else {
                                entity.y += radius;
                            }
                        }
                    }
                });
            }
        });

        this.obstacles.forEach((obs) => {
            const dx = entity.x - obs.x;
            const dy = entity.y - obs.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
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

        const dx = entity.x - this.half;
        const dy = entity.y - this.half;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.size * 0.49;
        
        if (dist > maxDist) {
            entity.x = this.half + (dx / dist) * maxDist;
            entity.y = this.half + (dy / dist) * maxDist;
        }
    }

    updateZones(dt, onZoneStartShrink, onZoneCompleteShrink) {
        if (director.isOnline && !director.isHost) {
            return;
        }
        if (this.zonePhase > this.zonePhaseMax) return;

        if (!this.isShrinking) {
            this.zoneTimer -= dt;
            this.shrinkTimerProgress = Math.max(0, this.zoneTimer / this.zoneDuration);
            
            if (this.zoneTimer <= 0) {
                this.isShrinking = true;
                this.zoneTimer = 0;
                if (onZoneStartShrink) onZoneStartShrink(this.zonePhase);
            }
        } else {
            const dx = this.whiteZone.x - this.blueZone.x;
            const dy = this.whiteZone.y - this.blueZone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const shrinkSpeedR = 30 * dt;
            const shrinkSpeedXY = 15 * dt;

            if (this.blueZone.r > this.whiteZone.r) {
                this.blueZone.r -= shrinkSpeedR;
                if (this.blueZone.r < this.whiteZone.r) this.blueZone.r = this.whiteZone.r;
            }

            if (dist > 1) {
                this.blueZone.x += (dx / dist) * Math.min(dist, shrinkSpeedXY);
                this.blueZone.y += (dy / dist) * Math.min(dist, shrinkSpeedXY);
            }

            if (Math.abs(this.blueZone.r - this.whiteZone.r) < 2 && dist < 2) {
                this.blueZone.r = this.whiteZone.r;
                this.blueZone.x = this.whiteZone.x;
                this.blueZone.y = this.whiteZone.y;
                
                this.isShrinking = false;
                this.zonePhase++;
                
                if (this.zonePhase <= this.zonePhaseMax) {
                    this.calculateNextCircle();
                    if (onZoneCompleteShrink) onZoneCompleteShrink(this.zonePhase);
                } else {
                    this.whiteZone.r = 10;
                }
            }
        }
    }

    calculateNextCircle() {
        const ratios = [0.35, 0.22, 0.12, 0.05, 0.01];
        const index = Math.min(this.zonePhase - 1, ratios.length - 1);
        const nextR = this.size * ratios[index];
        
        const maxOffset = Math.max(0, this.blueZone.r - nextR);
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxOffset * 0.7;
        
        this.whiteZone.x = this.blueZone.x + Math.cos(angle) * dist;
        this.whiteZone.y = this.blueZone.y + Math.sin(angle) * dist;
        this.whiteZone.r = nextR;

        const durations = [90, 70, 50, 40, 30];
        this.zoneDuration = durations[index] || 30;
        this.zoneTimer = this.zoneDuration;
        
        const damages = [1, 2, 4, 8, 15];
        this.zoneDamage = damages[index] || 20;
    }

    isOutsideBlueZone(x, y) {
        const dx = x - this.blueZone.x;
        const dy = y - this.blueZone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist > this.blueZone.r;
    }

    getColors() {
        const scene = this.scene || 'grassland';
        if (scene === 'desert') {
            return {
                beach: '#edbb99',
                ground: '#f5b041',
                studs: 'rgba(211, 84, 0, 0.2)',
                ocean: '#e59866'
            };
        } else if (scene === 'urban') {
            return {
                beach: '#7f8c8d',
                ground: '#34495e',
                studs: 'rgba(52, 73, 94, 0.4)',
                ocean: '#2c3e50'
            };
        } else {
            return {
                beach: '#f9e79f',
                ground: '#2ecc71',
                studs: 'rgba(39, 174, 96, 0.25)',
                ocean: '#1b4f72'
            };
        }
    }

    drawTerrain(ctx, camera) {
        const cols = this.getColors();
        
        ctx.save();
        ctx.fillStyle = cols.beach;
        ctx.beginPath();
        ctx.arc(this.half, this.half, this.islandRadius + 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cols.ground;
        ctx.beginPath();
        ctx.arc(this.half, this.half, this.islandRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.save();
        ctx.fillStyle = cols.studs;
        for (let gx = 0; gx < this.size; gx += 120) {
            for (let gy = 0; gy < this.size; gy += 120) {
                if (this.isPointOnIsland(gx, gy)) {
                    ctx.beginPath();
                    ctx.arc(gx, gy, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();

        this.buildings.forEach((b) => {
            ctx.save();
            ctx.fillStyle = '#5d6d7e';
            ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
            
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let bx = b.x - b.w/2 + 20; bx < b.x + b.w/2; bx += 30) {
                for (let by = b.y - b.h/2 + 20; by < b.y + b.h/2; by += 30) {
                    ctx.beginPath();
                    ctx.arc(bx, by, 3, 0, Math.PI*2);
                    ctx.fill();
                }
            }

            b.walls.forEach((wall) => {
                ctx.fillStyle = b.color;
                ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

                ctx.fillStyle = 'rgba(255,255,255,0.15)';
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

        this.obstacles.forEach((obs) => {
            ctx.save();
            if (obs.type === 'tree') {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 6;
                
                ctx.fillStyle = '#784212';
                ctx.fillRect(obs.x - 4, obs.y - 4, 8, 8);
                
                ctx.fillStyle = obs.color;
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 22, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#229954';
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 16, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 10, 0, Math.PI*2); ctx.fill();
                
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath(); ctx.arc(obs.x, obs.y, 3, 0, Math.PI*2); ctx.fill();

            } else if (obs.type === 'crate') {
                const w = obs.w;
                const h = obs.h;
                ctx.fillStyle = obs.color;
                ctx.fillRect(obs.x - w/2, obs.y - h/2, w, h);
                
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.strokeRect(obs.x - w/2, obs.y - h/2, w, h);

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
            
            ctx.shadowColor = item.spec.color;
            ctx.shadowBlur = 10 + Math.sin(item.pulseTimer) * 5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(item.x, item.y, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'none';
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = item.spec.color;
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;

            ctx.save();
            ctx.translate(item.x, item.y + floatOffset);
            ctx.fillRect(-8, -6, 16, 12);
            ctx.strokeRect(-8, -6, 16, 12);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(-4, -2, 2.5, 0, Math.PI*2);
            ctx.arc(4, -2, 2.5, 0, Math.PI*2);
            ctx.fill();
            
            ctx.restore();

            ctx.fillStyle = '#fff';
            ctx.font = '600 9px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.spec.name, item.x, item.y - 12 + floatOffset);
        });
        ctx.restore();
    }

    drawZones(ctx) {
        ctx.save();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(this.whiteZone.x, this.whiteZone.y, this.whiteZone.r, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#3498db';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(this.blueZone.x, this.blueZone.y, this.blueZone.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        
        ctx.save();
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.15)';
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.arc(this.blueZone.x, this.blueZone.y, this.blueZone.r + 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}


// ============================================================================
// 6. VIEWPORT CAMERA AND 2.5D LEGO GRAPHICS RENDERER
// ============================================================================
class Camera {
    constructor(x = 1800, y = 1800) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.viewMode = 'topdown'; // 'topdown' (previous) or 'isometric'
        
        this.shakeIntensity = 0;
        this.shakeTime = 0;
    }

    update(tx, ty, dt) {
        this.targetX = tx;
        this.targetY = ty;

        const lerpSpeed = 5 * dt;
        this.x += (this.targetX - this.x) * Math.min(1, lerpSpeed);
        this.y += (this.targetY - this.y) * Math.min(1, lerpSpeed);

        this.zoom += (this.targetZoom - this.zoom) * Math.min(1, lerpSpeed);

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
        
        if (this.viewMode === 'isometric') {
            // 2.5D Isometric Transform: squash the vertical axis and rotate by 45 degrees
            ctx.scale(this.zoom, this.zoom * 0.6);
            ctx.rotate(-Math.PI / 4);
        } else {
            // 2D Top-Down View (Previous)
            ctx.scale(this.zoom, this.zoom);
        }

        let cx = -this.x;
        let cy = -this.y;

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

class GraphicsEngine {
    static drawPlane(ctx, px, py, angle, scale = 1.5) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 40;
        ctx.shadowOffsetY = 120;

        ctx.fillStyle = '#7f8c8d';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 4;

        ctx.fillRect(-150, -35, 300, 70);
        ctx.strokeRect(-150, -35, 300, 70);

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(100, -25, 45, 50);
        ctx.strokeRect(100, -25, 45, 50);
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(135, -20, 10, 10);
        ctx.fillRect(135, 10, 10, 10);

        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.moveTo(-40, -35);
        ctx.lineTo(-70, -220);
        ctx.lineTo(-20, -220);
        ctx.lineTo(25, -35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-40, 35);
        ctx.lineTo(-70, 220);
        ctx.lineTo(-20, 220);
        ctx.lineTo(25, 35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-145, -75, 30, 45);
        ctx.strokeRect(-145, -75, 30, 45);
        ctx.fillRect(-145, 30, 30, 45);
        ctx.strokeRect(-145, 30, 30, 45);

        const drawEngine = (ex, ey) => {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(ex - 20, ey - 15, 50, 30);
            ctx.strokeRect(ex - 20, ey - 15, 50, 30);
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(ex - 35, ey - 8, 15, 16);
        };

        drawEngine(-40, -110);
        drawEngine(-40, 110);

        ctx.fillStyle = '#34495e';
        ctx.fillRect(-140, -20, 15, 40);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let x = -100; x < 80; x += 30) {
            ctx.beginPath();
            ctx.arc(x, -18, 4, 0, Math.PI * 2);
            ctx.arc(x, 18, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    static drawMinifig(ctx, opts) {
        const x = opts.x || 0;
        const y = opts.y || 0;
        const angle = opts.angle || 0;
        const skinColor = opts.skinColor || '#f5b041';
        const torsoColor = opts.torsoColor || '#3498db';
        const legsColor = opts.legsColor || '#2c3e50';
        const state = opts.state || 'alive';
        const walkingFrame = opts.walkingFrame || 0;
        const activeWeapon = opts.activeWeapon || null;
        const armorLevel = opts.armorLevel || 0;
        const shield = opts.shield || 0;
        const username = opts.username || 'Minifig';
        const isPlayer = opts.isPlayer || false;
        const healthPercent = opts.healthPercent !== undefined ? opts.healthPercent : 1.0;

        if (state === 'plane' || state === 'dead') return;

        ctx.save();
        ctx.translate(x, y);

        if (state === 'parachute') {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 30;

            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-40, -75);
            ctx.moveTo(0, 0);
            ctx.lineTo(40, -75);
            ctx.stroke();

            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(0, -85, 55, Math.PI, 0);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, -85, 30, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(0, -85, 10, Math.PI, 0);
            ctx.fill();

            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -85, 55, Math.PI, 0);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        ctx.rotate(angle + Math.PI / 2);

        ctx.fillStyle = legsColor;
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.0;

        const legSweep = Math.sin(walkingFrame) * 8;

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

        // Torso
        ctx.fillStyle = torsoColor;
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-9, -10);
        ctx.lineTo(9, -10);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

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
            
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-5, -8); ctx.lineTo(-5, 8);
            ctx.moveTo(5, -8); ctx.lineTo(5, 8);
            ctx.stroke();
        }

        // Arms & Hands
        ctx.fillStyle = torsoColor;
        ctx.lineWidth = 2.0;

        const hasGun = activeWeapon !== null;

        // Left Arm
        ctx.save();
        if (hasGun) {
            ctx.translate(-10, -3);
            ctx.rotate(-0.35);
            ctx.fillRect(-3, 0, 6, 12);
            ctx.strokeRect(-3, 0, 6, 12);
            
            ctx.fillStyle = skinColor;
            ctx.beginPath(); ctx.arc(0, 13, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
            const armSweep = Math.sin(walkingFrame) * 0.4;
            ctx.translate(-11, 0);
            ctx.rotate(-armSweep);
            ctx.fillRect(-3, -2, 6, 13);
            ctx.strokeRect(-3, -2, 6, 13);
            
            ctx.fillStyle = skinColor;
            ctx.beginPath(); ctx.arc(0, 12, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();

        // Right Arm
        ctx.fillStyle = torsoColor;
        ctx.save();
        if (hasGun) {
            ctx.translate(10, -3);
            ctx.rotate(0.3);
            ctx.fillRect(-3, 0, 6, 12);
            ctx.strokeRect(-3, 0, 6, 12);
            
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

        // Weapon
        if (hasGun) {
            ctx.save();
            ctx.translate(6, -2);
            ctx.rotate(-Math.PI / 2);

            ctx.fillStyle = '#2c3e50';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;

            if (activeWeapon.id === 'pistol') {
                ctx.fillRect(-3, -6, 6, 12);
                ctx.fillRect(-2, -6, 4, -4);
                ctx.strokeRect(-3, -6, 6, 12);
            } else if (activeWeapon.id === 'smg') {
                ctx.fillRect(-4, -8, 8, 16);
                ctx.fillRect(-2, -8, 4, -8);
                ctx.fillRect(-3, 4, 6, 4);
                ctx.fillRect(2, -4, 2, 8);
                ctx.strokeRect(-4, -8, 8, 16);
            } else if (activeWeapon.id === 'shotgun') {
                ctx.fillRect(-4, -10, 8, 20);
                ctx.fillRect(-3, -12, 6, -6);
                ctx.fillStyle = '#a0522d';
                ctx.fillRect(-4, 6, 8, 8);
                ctx.strokeRect(-4, -10, 8, 20);
            } else if (activeWeapon.id === 'rifle') {
                ctx.fillRect(-4, -10, 8, 22);
                ctx.fillRect(-2, -10, 4, -12);
                ctx.fillStyle = '#d35400';
                ctx.fillRect(-4, 8, 8, 6);
                ctx.fillStyle = '#2c3e50';
                ctx.beginPath();
                ctx.moveTo(3, -2);
                ctx.lineTo(8, -6);
                ctx.lineTo(8, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (activeWeapon.id === 'sniper') {
                ctx.fillRect(-4, -12, 8, 26);
                ctx.fillRect(-1.5, -12, 3, -22);
                ctx.fillRect(-1.5, -24, 4, -2);
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(-4, 10, 8, 8);
                ctx.fillStyle = '#000';
                ctx.fillRect(-5, -6, 2, 10);
            } else if (activeWeapon.id === 'bricklauncher') {
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(-6, -14, 12, 28);
                ctx.strokeRect(-6, -14, 12, 28);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(-4, -17, 8, 3);
            }
            ctx.restore();
        }

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(2.5, -2.5, 1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(2.5, 2.5, 1, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(1.0, 0, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();

        // Helmet
        if (armorLevel > 0) {
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = armorLevel === 3 ? '#34495e' : (armorLevel === 2 ? '#7f8c8d' : '#95a5a6');
            ctx.beginPath();
            ctx.arc(0, 0, 8.5, Math.PI * 0.9, -Math.PI * 0.1);
            ctx.lineTo(3, 8.5);
            ctx.lineTo(1, 0);
            ctx.lineTo(3, -8.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            if (armorLevel === 3) {
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(4, -5, 3, 10);
                ctx.strokeRect(4, -5, 3, 10);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(0, 0, 8, Math.PI, 0);
            ctx.fill();
        }

        ctx.restore();

        // HUD indicators
        ctx.save();
        ctx.translate(x, y);

        let nameColor = '#ffffff';
        if (isPlayer) {
            nameColor = '#f1c40f';
        } else if (opts.isTeammate) {
            nameColor = '#2ecc71';
        }

        ctx.fillStyle = nameColor;
        ctx.font = '600 10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(username, 0, -22);
        ctx.shadowBlur = 0;

        if (opts.isTeammate) {
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.moveTo(-4, -32);
            ctx.lineTo(4, -32);
            ctx.lineTo(0, -26);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        if (healthPercent < 1.0 || shield > 0) {
            const barW = 28;
            const barH = 3;
            const by = -16;

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(-barW/2, by, barW, barH);

            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(-barW/2, by, barW * healthPercent, barH);

            if (shield > 0) {
                ctx.fillStyle = '#3498db';
                ctx.fillRect(-barW/2, by + barH + 1, barW * (shield / 100), 2);
            }
        }
        ctx.restore();
    }
}


// ============================================================================
// 7. CORE GAME DIRECTOR AND ORCHESTRATOR
// ============================================================================
class GameDirector {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        this.deviceType = 'desktop'; // Default placeholder
        this.input = new InputManager(this);
        this.camera = new Camera();
        this.map = new GameMap();

        this.gameState = 'menu';
        this.player = null;
        this.entities = [];
        this.bullets = [];

        this.plane = {
            x: 0, y: 0,
            startX: 0, startY: 0,
            endX: 0, endY: 0,
            angle: 0,
            progress: 0,
            speed: 0.08
        };

        this.originalBotCount = 19;
        this.aliveCount = 20;
        this.matchTime = 0;
        this.winnerWinner = false;

        this.lastTime = performance.now();

        this.menuScreen = document.getElementById('menu-screen');
        this.resultsScreen = document.getElementById('results-screen');
        
        this.initDOM();

        // Bootup Device Detection
        this.deviceType = this.detectDevice();
        this.setDeviceType(this.deviceType);
    }

    initDOM() {
        this.socket = null;
        this.netId = null;
        this.isHost = false;
        this.hostId = null;
        this.roomId = null;
        this.teammateId = null;
        this.lobbyPlayers = [];
        this.isOnline = false;
        this.connectionState = 'disconnected';
        this.lastSyncTime = 0;

        const sceneCards = document.querySelectorAll('.scene-card');
        sceneCards.forEach((card) => {
            card.addEventListener('click', (e) => {
                sfx.playClick();
                sceneCards.forEach((c) => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.textContent = 'START MATCH';
            startBtn.addEventListener('click', () => {
                sfx.playClick();
                this.triggerFullscreen();
                const modeVal = document.querySelector('#mode-toggle .toggle-btn.selected').dataset.value;
                if (modeVal === 'online') {
                    if (this.connectionState !== 'connected') {
                        this.triggerAnnouncement('CONNECTING TO SERVER...');
                        this.connectSocket();
                        setTimeout(() => {
                            if (this.connectionState === 'connected') {
                                this.joinOnlineMatchmaking();
                            } else {
                                this.triggerAnnouncement('SERVER OFFLINE. RUNNING OFFLINE FALLBACK.');
                                this.startMatchOffline();
                            }
                        }, 1200);
                    } else {
                        this.joinOnlineMatchmaking();
                    }
                } else {
                    this.startMatchOffline();
                }
            });
        }

        const modeBtns = document.querySelectorAll('#mode-toggle .toggle-btn');
        modeBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                sfx.playClick();
                modeBtns.forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                const isOnline = btn.dataset.value === 'online';
                
                const botGroup = document.getElementById('bot-count-group');
                if (botGroup) {
                    if (isOnline) {
                        botGroup.classList.add('hidden');
                    } else {
                        botGroup.classList.remove('hidden');
                    }
                }
                
                if (isOnline) {
                    this.connectSocket();
                } else {
                    this.disconnectSocket();
                }
                
                const teamVal = document.querySelector('#team-toggle .toggle-btn.selected').dataset.value;
                const duoGroup = document.getElementById('duo-code-group');
                if (duoGroup) {
                    if (isOnline && teamVal === 'duo') {
                        duoGroup.classList.remove('hidden');
                    } else {
                        duoGroup.classList.add('hidden');
                    }
                }
                
                if (startBtn) {
                    startBtn.textContent = isOnline ? 'FIND MATCH' : 'START MATCH';
                }
            });
        });

        const teamBtns = document.querySelectorAll('#team-toggle .toggle-btn');
        teamBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                sfx.playClick();
                teamBtns.forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                const isDuo = btn.dataset.value === 'duo';
                const modeVal = document.querySelector('#mode-toggle .toggle-btn.selected').dataset.value;
                
                const duoGroup = document.getElementById('duo-code-group');
                if (duoGroup) {
                    if (isDuo && modeVal === 'online') {
                        duoGroup.classList.remove('hidden');
                    } else {
                        duoGroup.classList.add('hidden');
                    }
                }
            });
        });

        this.checkServerStatus();



        document.getElementById('btn-restart').addEventListener('click', () => {
            sfx.playClick();
            this.resultsScreen.classList.add('hidden');
            this.menuScreen.classList.remove('hidden');
            this.gameState = 'menu';
        });

        for (let i = 1; i <= 3; i++) {
            const slot = document.getElementById(`w-slot-${i}`);
            const switchFn = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (this.player && this.player.state === 'alive') {
                    this.player.switchWeapon(i - 1);
                }
            };
            slot.addEventListener('click', switchFn);
            slot.addEventListener('touchstart', switchFn, { passive: false });
        }

        const dropBtn = document.getElementById('btn-drop-weapon');
        if (dropBtn) {
            const dropFn = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (this.player && this.player.state === 'alive') {
                    this.player.dropActiveWeapon(this.map);
                }
            };
            dropBtn.addEventListener('click', dropFn);
            dropBtn.addEventListener('touchstart', dropFn, { passive: false });
        }

        const options = document.querySelectorAll('.color-option');
        options.forEach((opt) => {
            opt.addEventListener('click', (e) => {
                sfx.playClick();
                options.forEach((o) => o.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        let resizeTimeout;
        const handleResize = () => {
            this.resizeCanvas();
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resizeCanvas(), 100);
            setTimeout(() => this.resizeCanvas(), 300);
            setTimeout(() => this.resizeCanvas(), 600);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        this.resizeCanvas();
    }

    resizeCanvas() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvas.width = w;
        this.canvas.height = h;

        this.minimapCanvas.width = 140;
        this.minimapCanvas.height = 140;

        this.checkOrientation();
    }

    checkOrientation() {
        const overlay = document.getElementById('orientation-overlay');
        if (!overlay) return;

        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (window.matchMedia("(pointer: coarse)").matches);
        
        if (isMobile) {
            // Highly robust orientation check:
            // 1. If physical width is greater than height, it is landscape.
            // 2. Or if modern screen.orientation type is landscape.
            // 3. Or if legacy window.orientation is 90 / -90.
            // We combine these. If ANY of them indicates landscape, we treat it as landscape!
            let isLandscape = (window.innerWidth > window.innerHeight);
            
            if (screen.orientation && screen.orientation.type) {
                if (screen.orientation.type.startsWith('landscape')) {
                    isLandscape = true;
                } else if (screen.orientation.type.startsWith('portrait')) {
                    isLandscape = false;
                }
            } else if (window.orientation !== undefined && window.orientation !== null) {
                if (Math.abs(window.orientation) === 90) {
                    isLandscape = true;
                }
            }

            if (isLandscape) {
                overlay.style.setProperty('display', 'none', 'important');
                // Scroll to top to hide browser bars on orientation update
                window.scrollTo(0, 0);
            } else {
                overlay.style.setProperty('display', 'flex', 'important');
            }
        } else {
            // Desktop: never show the warning
            overlay.style.setProperty('display', 'none', 'important');
        }
    }

    detectDevice() {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (window.matchMedia("(pointer: coarse)").matches);
        const isTV = /GoogleTV|SmartTV|Internet.TV|NetCast|NETTV|AppleTV|Boxee|Kylo|Roku|DLNADOC|CE-HTML|FireTV|AmazonTV|Silk-TV|\bTV\b/i.test(ua);
        
        if (isTV) return 'tv';
        if (isMobile) return 'mobile';
        return 'desktop';
    }

    triggerFullscreen() {
        const el = document.documentElement;
        try {
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(e => console.warn("Fullscreen error:", e));
            } else if (el.mozRequestFullScreen) { /* Firefox */
                el.mozRequestFullScreen().catch(e => console.warn("Fullscreen error:", e));
            } else if (el.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                el.webkitRequestFullscreen().catch(e => console.warn("Fullscreen error:", e));
            } else if (el.msRequestFullscreen) { /* IE/Edge */
                el.msRequestFullscreen().catch(e => console.warn("Fullscreen error:", e));
            }
        } catch (err) {
            console.warn("Fullscreen request blocked:", err);
        }
    }

    setDeviceType(type) {
        document.body.classList.remove('device-desktop', 'device-mobile', 'device-tv');
        this.deviceType = type;
        document.body.classList.add('device-' + type);
        this.updateHUDHelperPrompts();
        
        // Also update eject action-prompt on the fly if active
        const prompt = document.getElementById('action-prompt');
        if (prompt && !prompt.classList.contains('hidden')) {
            if (this.gameState === 'plane') {
                if (type === 'tv') {
                    prompt.textContent = 'PRESS [A] TO EJECT';
                } else if (type === 'mobile') {
                    prompt.textContent = 'TAP BUTTON TO EJECT';
                } else {
                    prompt.textContent = 'PRESS [SPACE] TO EJECT';
                }
            }
        }
    }

    updateHUDHelperPrompts() {
        const controlsHelp = document.getElementById('controls-help');
        if (!controlsHelp) return;

        if (this.deviceType === 'tv') {
            controlsHelp.innerHTML = `
                <div class="control-item">
                    <kbd class="keycap">X</kbd>
                    <span class="control-label">RELOAD</span>
                </div>
                <div class="control-divider"></div>
                <div class="control-item">
                    <kbd class="keycap">A</kbd>
                    <span class="control-label">LOOT</span>
                    <span id="auto-pickup-hud-status" class="auto-pickup-status"></span>
                </div>
                <div class="control-divider"></div>
                <div class="control-item">
                    <kbd class="keycap">LB</kbd>
                    <span class="control-or">/</span>
                    <kbd class="keycap">RB</kbd>
                    <span class="control-label">WEAPON SWAP</span>
                </div>
            `;
        } else {
            controlsHelp.innerHTML = `
                <div class="control-item">
                    <kbd class="keycap">R</kbd>
                    <span class="control-label">RELOAD</span>
                </div>
                <div class="control-divider"></div>
                <div class="control-item">
                    <kbd class="keycap">E</kbd>
                    <span class="control-or">/</span>
                    <kbd class="keycap">F</kbd>
                    <span class="control-label">LOOT</span>
                    <span id="auto-pickup-hud-status" class="auto-pickup-status"></span>
                </div>
            `;
        }

        if (this.player) {
            const autoHud = document.getElementById('auto-pickup-hud-status');
            if (autoHud) {
                autoHud.textContent = this.player.autoPickup ? ' (AUTO)' : '';
            }
        }
    }

    checkServerStatus() {
        const indicator = document.getElementById('server-status');
        if (!indicator) return;

        indicator.className = 'status-indicator connecting';
        indicator.textContent = 'CONNECTING...';

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const wsPort = urlParams.get('wsPort') || '8080';
            const wsHost = window.location.hostname || 'localhost';
            
            // Determine secure protocol (wss:) if running under HTTPS
            const isSecure = window.location.protocol === 'https:';
            const protocol = isSecure ? 'wss:' : 'ws:';
            
            // On HTTPS, if wsPort is standard 8080, default to secure port or empty
            let finalPort = wsPort;
            if (isSecure && !urlParams.has('wsPort')) {
                finalPort = window.location.port ? window.location.port : '';
            }
            
            const wsUrl = `${protocol}//${wsHost}${finalPort ? ':' + finalPort : ''}`;
            console.log("Checking server status at:", wsUrl);

            const tempWs = new WebSocket(wsUrl);
            tempWs.onopen = () => {
                indicator.className = 'status-indicator online';
                indicator.textContent = 'ONLINE';
                tempWs.close();
            };
            tempWs.onerror = () => {
                indicator.className = 'status-indicator offline';
                indicator.textContent = 'OFFLINE (LOCAL PLAY)';
            };
        } catch (e) {
            console.warn("WebSocket check failed (running offline mode):", e);
            indicator.className = 'status-indicator offline';
            indicator.textContent = 'OFFLINE (LOCAL PLAY)';
        }
    }

    connectSocket() {
        if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
            return;
        }

        const indicator = document.getElementById('server-status');
        if (indicator) {
            indicator.className = 'status-indicator connecting';
            indicator.textContent = 'CONNECTING...';
        }

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const wsPort = urlParams.get('wsPort') || '8080';
            const wsHost = window.location.hostname || 'localhost';
            
            const isSecure = window.location.protocol === 'https:';
            const protocol = isSecure ? 'wss:' : 'ws:';
            
            let finalPort = wsPort;
            if (isSecure && !urlParams.has('wsPort')) {
                finalPort = window.location.port ? window.location.port : '';
            }
            
            const wsUrl = `${protocol}//${wsHost}${finalPort ? ':' + finalPort : ''}`;
            console.log("Connecting to socket server at:", wsUrl);

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.connectionState = 'connected';
                if (indicator) {
                    indicator.className = 'status-indicator online';
                    indicator.textContent = 'ONLINE';
                }
                
                const startBtn = document.getElementById('btn-start-game');
                if (startBtn && document.querySelector('#mode-toggle .toggle-btn.selected').dataset.value === 'online') {
                    startBtn.textContent = 'FIND MATCH';
                    startBtn.disabled = false;
                }
            };

            this.socket.onmessage = (event) => {
                this.handleNetMessage(event.data);
            };

            this.socket.onclose = () => {
                this.connectionState = 'disconnected';
                this.isHost = false;
                this.netId = null;
                this.roomId = null;
                if (indicator) {
                    indicator.className = 'status-indicator offline';
                    indicator.textContent = 'OFFLINE (LOCAL PLAY)';
                }
                
                const startBtn = document.getElementById('btn-start-game');
                if (startBtn) {
                    const modeVal = document.querySelector('#mode-toggle .toggle-btn.selected').dataset.value;
                    if (modeVal === 'online') {
                        startBtn.textContent = 'OFFLINE LOCAL PLAY';
                        startBtn.disabled = false;
                        startBtn.onclick = () => {
                            sfx.playClick();
                            this.triggerFullscreen();
                            this.startMatchOffline();
                        };
                    }
                }
                
                if (this.isOnline && (this.gameState === 'plane' || this.gameState === 'combat')) {
                    this.isOnline = false;
                    this.triggerAnnouncement('CONNECTION LOST! RUNNING LOCAL BOT BACKFILL.');
                    this.entities.forEach(ent => {
                        if (ent instanceof Bot) {
                            ent.state = 'alive';
                        }
                    });
                }
            };

            this.socket.onerror = (err) => {
                if (indicator) {
                    indicator.className = 'status-indicator offline';
                    indicator.textContent = 'OFFLINE (LOCAL PLAY)';
                }
            };
        } catch (e) {
            console.warn("Failed to create WebSocket (running offline fallback):", e);
            this.connectionState = 'disconnected';
            if (indicator) {
                indicator.className = 'status-indicator offline';
                indicator.textContent = 'OFFLINE (LOCAL PLAY)';
            }
            const startBtn = document.getElementById('btn-start-game');
            if (startBtn) {
                startBtn.textContent = 'START MATCH';
                startBtn.disabled = false;
            }
        }
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connectionState = 'disconnected';
        this.isOnline = false;
        
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.textContent = 'START MATCH';
            startBtn.disabled = false;
            startBtn.onclick = () => {
                sfx.playClick();
                this.triggerFullscreen();
                this.startMatch();
            };
        }
    }

    joinOnlineMatchmaking() {
        const username = document.getElementById('player-name').value || 'Minifig';
        const colorOption = document.querySelector('.color-option.selected');
        const color = colorOption ? colorOption.dataset.color : '#f5b041';
        const sceneOption = document.querySelector('.scene-card.selected');
        const scene = sceneOption ? sceneOption.dataset.scene : 'grassland';
        const teamOption = document.querySelector('#team-toggle .toggle-btn.selected');
        const teamSize = teamOption ? teamOption.dataset.value : 'solo';
        const pairCode = document.getElementById('duo-code').value || '';

        this.toggleLobbyControls(false);

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.textContent = 'MATCHMAKING...';
            startBtn.disabled = true;
        }

        this.sendNetPacket({
            type: 'join',
            scene: scene,
            teamSize: teamSize,
            pairCode: pairCode,
            name: username,
            color: color
        });
    }

    toggleLobbyControls(enable) {
        const elements = ['player-name', 'auto-pickup', 'bot-count', 'duo-code'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = !enable;
        });

        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(opt => {
            opt.style.pointerEvents = enable ? 'auto' : 'none';
        });

        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.style.pointerEvents = enable ? 'auto' : 'none';
        });

        const sceneCards = document.querySelectorAll('.scene-card');
        sceneCards.forEach(card => {
            card.style.pointerEvents = enable ? 'auto' : 'none';
        });
    }

    sendNetPacket(packet) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(packet));
        }
    }

    handleNetMessage(msgStr) {
        try {
            const data = JSON.parse(msgStr);
            switch (data.type) {
                case 'joined':
                    this.netId = data.id;
                    this.roomId = data.roomId;
                    this.isHost = data.isHost;
                    this.teammateId = data.teammateId;
                    this.map.scene = data.scene;
                    
                    this.triggerAnnouncement(`JOINED LOBBY: ${data.roomId.toUpperCase()}`);
                    
                    const startBtn = document.getElementById('btn-start-game');
                    if (startBtn) {
                        if (this.isHost) {
                            startBtn.textContent = 'START MATCH (HOST)';
                            startBtn.disabled = false;
                            startBtn.onclick = () => {
                                sfx.playClick();
                                this.triggerFullscreen();
                                this.sendNetPacket({ type: 'start_match' });
                            };
                        } else {
                            startBtn.textContent = 'WAITING FOR HOST...';
                            startBtn.disabled = true;
                        }
                    }
                    break;

                case 'room_players':
                    this.isHost = data.isHost;
                    this.teammateId = data.teammateId;
                    
                    const playersCount = data.players.length;
                    this.triggerAnnouncement(`PLAYERS IN ROOM: ${playersCount} / 50`);
                    
                    const sBtn = document.getElementById('btn-start-game');
                    if (sBtn) {
                        if (this.isHost) {
                            sBtn.textContent = `START MATCH (${playersCount} PLYRS)`;
                            sBtn.disabled = false;
                            sBtn.onclick = () => {
                                sfx.playClick();
                                this.triggerFullscreen();
                                this.sendNetPacket({ type: 'start_match' });
                            };
                        } else {
                            sBtn.textContent = `WAITING (${playersCount} PLYRS)...`;
                            sBtn.disabled = true;
                        }
                    }
                    this.lobbyPlayers = data.players;
                    break;

                case 'match_start':
                    this.triggerAnnouncement('MATCH STARTING!');
                    this.startMatchOnlineActual();
                    break;

                case 'player_sync':
                    this.handlePlayerSync(data);
                    break;

                case 'game_sync':
                    this.handleGameSync(data);
                    break;

                case 'loot_sync':
                    this.handleLootSync(data);
                    break;

                case 'damage_replicated':
                    this.handleDamageReplicated(data);
                    break;

                case 'bullet_replicated':
                    this.handleBulletReplicated(data);
                    break;

                case 'elimination_replicated':
                    this.handleEliminationReplicated(data);
                    break;

                case 'host_migrated':
                    this.isHost = data.hostId === this.netId;
                    this.triggerAnnouncement(this.isHost ? 'YOU ARE NOW THE MATCH HOST!' : 'HOST MIGRATED.');
                    
                    const btn = document.getElementById('btn-start-game');
                    if (btn && this.gameState === 'menu') {
                        if (this.isHost) {
                            btn.textContent = 'START MATCH (HOST)';
                            btn.disabled = false;
                            btn.onclick = () => {
                                sfx.playClick();
                                this.triggerFullscreen();
                                this.sendNetPacket({ type: 'start_match' });
                            };
                        } else {
                            btn.textContent = 'WAITING FOR HOST...';
                            btn.disabled = true;
                        }
                    }
                    break;

                case 'player_left':
                    this.handlePlayerLeft(data.id);
                    break;
            }
        } catch (e) {
            console.error('[Net] Failed to parse message:', e);
        }
    }

    handlePlayerSync(data) {
        let peer = this.entities.find(ent => ent.isPlayer && ent !== this.player && ent.username === data.id);
        if (!peer) {
            const lobbyP = this.lobbyPlayers ? this.lobbyPlayers.find(p => p.id === data.id) : null;
            const name = lobbyP ? lobbyP.name : `Minifig_${data.id.substring(0,4)}`;
            const color = lobbyP ? lobbyP.color : '#e74c3c';
            
            peer = new Player(data.x, data.y, name, color);
            peer.isNetworkPlayer = true;
            peer.username = data.id;
            this.entities.push(peer);
        }

        peer.targetX = data.x;
        peer.targetY = data.y;
        peer.vx = data.x - peer.x;
        peer.vy = data.y - peer.y;
        peer.targetAngle = data.angle;
        peer.state = data.state;
        peer.parachuteAltitude = data.parachuteAltitude;
        peer.health = data.health;
        peer.shield = data.shield;
        peer.activeWeaponIndex = data.activeWeaponIndex;
        peer.armorLevel = data.armorLevel;
        peer.kills = data.kills;

        if (peer.health <= 0 && peer.state !== 'dead') {
            peer.state = 'dead';
            fx.spawnLegoExplode(peer.x, peer.y, '#f5b041', peer.color, '#2c3e50');
        }
    }

    handleGameSync(data) {
        data.bots.forEach(bData => {
            let bot = this.entities.find(ent => ent instanceof Bot && ent.username === bData.id);
            if (!bot) {
                bot = new Bot(bData.x, bData.y, bData.id, '#ffffff');
                this.entities.push(bot);
            }
            
            bot.targetX = bData.x;
            bot.targetY = bData.y;
            bot.vx = bData.vx;
            bot.vy = bData.vy;
            bot.targetAngle = bData.angle;
            bot.state = bData.state;
            bot.health = bData.health;
            bot.shield = bData.shield;
            bot.activeWeaponIndex = bData.activeWeaponIndex;
            bot.armorLevel = bData.armorLevel;
            
            if (bot.health <= 0 && bot.state !== 'dead') {
                bot.state = 'dead';
                fx.spawnLegoExplode(bot.x, bot.y, '#f5b041', bot.color, '#2c3e50');
            }
        });

        if (data.zone) {
            const z = data.zone;
            if (z.isShrinking && !this.map.isShrinking) {
                sfx.startZoneHum();
                this.triggerAnnouncement('SAFE ZONE SHANKING!');
            } else if (!z.isShrinking && this.map.isShrinking) {
                sfx.stopZoneHum();
                this.triggerAnnouncement('SAFE ZONE FIXED!');
            }
            
            this.map.blueZone.x = z.bx;
            this.map.blueZone.y = z.by;
            this.map.blueZone.r = z.br;
            this.map.whiteZone.x = z.wx;
            this.map.whiteZone.y = z.wy;
            this.map.whiteZone.r = z.wr;
            this.map.zoneDamage = z.damage;
            this.map.zoneTimer = z.timer;
            this.map.isShrinking = z.isShrinking;
            this.map.zonePhase = z.phase;
        }
    }

    handleLootSync(data) {
        if (this.isHost) return;
        this.map.loot = data.loot;
    }

    handleDamageReplicated(data) {
        if (data.attackerId === this.netId || (this.isHost && data.isBot)) {
            return;
        }
        const attacker = this.entities.find(e => e.username === data.attackerId);
        const target = this.entities.find(e => e.username === data.targetId);
        
        if (target && target.state === 'alive') {
            target.takeDamage(data.damage, attacker);
        }
    }

    handleBulletReplicated(data) {
        const owner = this.entities.find(ent => ent.username === data.id);
        if (!owner) return;
        
        const spec = WEAPON_TYPES[data.weaponId];
        if (!spec) return;

        const soundCalls = {
            pistol: () => sfx.playPistol(),
            smg: () => sfx.playSMG(),
            shotgun: () => sfx.playShotgun(),
            rifle: () => sfx.playRifle(),
            sniper: () => sfx.playSniper(),
            bricklauncher: () => sfx.playBrickExplosion()
        };
        if (soundCalls[spec.id]) soundCalls[spec.id]();

        const bullet = new Bullet(data.x, data.y, data.vx, data.vy, spec, owner);
        this.bullets.push(bullet);

        fx.spawnMuzzleFlash(data.x, data.y, Math.atan2(data.vy, data.vx));
    }

    handleEliminationReplicated(data) {
        this.triggerAnnouncement(`${data.killerName} ELIMINATED ${data.killedName}!`);
        
        const killed = this.entities.find(e => e.username === data.killedId);
        const killer = this.entities.find(e => e.username === data.killerId);
        
        if (killed && killed.state !== 'dead') {
            killed.state = 'dead';
            killed.health = 0;
            fx.spawnLegoExplode(killed.x, killed.y, '#f5b041', killed.color, '#2c3e50');
        }
        
        if (killer && killed && killed.state === 'dead') {
            if (killer.username !== this.netId) {
                killer.kills++;
            }
        }
    }

    handlePlayerLeft(id) {
        this.entities = this.entities.filter(ent => ent.username !== id);
        this.triggerAnnouncement('A PLAYER DISCONNECTED.');
    }

    sendHostSync() {
        if (!this.isOnline || !this.isHost) return;
        
        const botData = this.entities
            .filter(ent => ent instanceof Bot)
            .map(bot => ({
                id: bot.username,
                x: bot.x,
                y: bot.y,
                vx: bot.vx,
                vy: bot.vy,
                angle: bot.angle,
                state: bot.state,
                health: bot.health,
                shield: bot.shield,
                activeWeaponIndex: bot.activeWeaponIndex,
                armorLevel: bot.armorLevel
            }));

        this.sendNetPacket({
            type: 'host_sync',
            bots: botData,
            zone: {
                bx: this.map.blueZone.x,
                by: this.map.blueZone.y,
                br: this.map.blueZone.r,
                wx: this.map.whiteZone.x,
                wy: this.map.whiteZone.y,
                wr: this.map.whiteZone.r,
                damage: this.map.zoneDamage,
                timer: this.map.zoneTimer,
                isShrinking: this.map.isShrinking,
                phase: this.map.zonePhase
            }
        });
    }

    sendHostLootSync() {
        if (!this.isOnline || !this.isHost) return;
        this.sendNetPacket({
            type: 'host_loot_sync',
            loot: this.map.loot
        });
    }

    areTeammates(e1, e2) {
        if (!e1 || !e2) return false;
        if (e1 === e2) return true;
        
        const teamOption = document.querySelector('#team-toggle .toggle-btn.selected');
        const teamSize = teamOption ? teamOption.dataset.value : 'solo';
        if (teamSize !== 'duo') return false;

        if ((e1 === this.player && e2 === this.teammateEntity) ||
            (e2 === this.player && e1 === this.teammateEntity)) {
            return true;
        }

        if (e1.isTeammate && e2.isTeammate) {
            return true;
        }
        
        return false;
    }

    startMatchOffline() {
        this.isOnline = false;
        
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.onclick = () => {
                sfx.playClick();
                this.triggerFullscreen();
                this.startMatch();
            };
        }

        this.toggleLobbyControls(true);

        const sceneOption = document.querySelector('.scene-card.selected');
        this.map.scene = sceneOption ? sceneOption.dataset.scene : 'grassland';
        
        this.startMatch();
    }

    startMatchOnlineActual() {
        this.isOnline = true;
        this.winnerWinner = false;
        this.matchTime = 0;
        this.bullets = [];
        this.entities = [];
        
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.textContent = 'START MATCH';
            startBtn.disabled = false;
            startBtn.onclick = () => {
                sfx.playClick();
                this.triggerFullscreen();
                this.startMatch();
            };
        }

        this.toggleLobbyControls(true);

        const myLobbyData = this.lobbyPlayers.find(p => p.id === this.netId);
        const username = myLobbyData ? myLobbyData.name : 'Player1';
        const color = myLobbyData ? myLobbyData.color : '#f5b041';

        const angle = Math.random() * Math.PI * 2;
        const flightRadius = this.map.size * 0.65;
        this.plane.startX = this.map.half - Math.cos(angle) * flightRadius;
        this.plane.startY = this.map.half - Math.sin(angle) * flightRadius;
        this.plane.endX = this.map.half + Math.cos(angle) * flightRadius;
        this.plane.endY = this.map.half + Math.sin(angle) * flightRadius;
        this.plane.angle = angle;
        this.plane.x = this.plane.startX;
        this.plane.y = this.plane.startY;
        this.plane.progress = 0;
        this.plane.speed = 0.06;

        this.player = new Player(this.plane.x, this.plane.y, username, color);
        this.player.state = 'plane';
        this.player.username = username;
        
        const autoPickupCheck = document.getElementById('auto-pickup');
        this.player.autoPickup = autoPickupCheck ? autoPickupCheck.checked : true;
        this.entities.push(this.player);

        this.lobbyPlayers.forEach(p => {
            if (p.id !== this.netId) {
                const peer = new Player(this.plane.x, this.plane.y, p.name, p.color);
                peer.isNetworkPlayer = true;
                peer.username = p.id;
                peer.state = 'plane';
                this.entities.push(peer);
            }
        });

        const totalHumans = this.lobbyPlayers.length;
        const botsNeeded = 50 - totalHumans;
        
        const botNames = ['BrickSmash', 'StudSniper', 'LegoLegit', 'BuildBoy', 'MasterBuilder', 'PlatePatrol', 'MinifigMaster', 'CrateCrusher', 'BlockyBot', 'ContraLego', 'ChromeStud', 'PlasticHero', 'LegoGamer', 'StudLord', 'RedBrick', 'LegoApex', 'StudSlayer', 'BrickStorm', 'LegoNinja'];
        const botColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#bdc3c7', '#1abc9c', '#e67e22', '#d35400', '#2c3e50'];

        for (let i = 0; i < botsNeeded; i++) {
            const bName = botNames[i % botNames.length] + '#' + Math.floor(Math.random()*900 + 100);
            const bColor = botColors[Math.floor(Math.random() * botColors.length)];

            const travelOffsetAngle = angle + (Math.random() - 0.5) * 1.5;
            const flightDist = Math.random() * (flightRadius * 1.5);
            const bx = this.plane.startX + Math.cos(travelOffsetAngle) * flightDist;
            const by = this.plane.startY + Math.sin(travelOffsetAngle) * flightDist;

            const bot = new Bot(bx, by, bName, bColor);
            bot.state = 'plane';
            bot.aiTimer = 1000 + Math.random() * 6000;
            this.entities.push(bot);
        }

        const teamOption = document.querySelector('#team-toggle .toggle-btn.selected');
        const teamSize = teamOption ? teamOption.dataset.value : 'solo';
        const teammateHUD = document.getElementById('teammate-hud');
        
        if (teamSize === 'duo') {
            if (this.teammateId) {
                const tmEntity = this.entities.find(e => e.isPlayer && e.username === this.teammateId);
                if (tmEntity) {
                    this.teammateEntity = tmEntity;
                    tmEntity.isTeammate = true;
                    if (teammateHUD) {
                        teammateHUD.classList.remove('hidden');
                        document.getElementById('tm-name').textContent = tmEntity.username.substring(0, 8);
                    }
                }
            } else {
                const firstBot = this.entities.find(e => e instanceof Bot);
                if (firstBot) {
                    this.teammateEntity = firstBot;
                    firstBot.isTeammate = true;
                    firstBot.username = `[TEAM] ${firstBot.username}`;
                    if (teammateHUD) {
                        teammateHUD.classList.remove('hidden');
                        document.getElementById('tm-name').textContent = firstBot.username;
                    }
                }
            }
        } else {
            if (teammateHUD) teammateHUD.classList.add('hidden');
            this.teammateEntity = null;
        }

        this.map.generate();

        sfx.startPlaneHum();
        this.menuScreen.classList.add('hidden');
        this.gameState = 'plane';

        const prompt = document.getElementById('action-prompt');
        if (prompt) {
            if (this.deviceType === 'tv') {
                prompt.textContent = 'PRESS [A] TO EJECT';
            } else if (this.deviceType === 'mobile') {
                prompt.textContent = 'TAP BUTTON TO EJECT';
            } else {
                prompt.textContent = 'PRESS [SPACE] TO EJECT';
            }
            prompt.classList.remove('hidden');
        }

        const ejectBtn = document.getElementById('t-btn-eject');
        if (ejectBtn) ejectBtn.classList.remove('hidden');

        this.camera.x = this.plane.x;
        this.camera.y = this.plane.y;
        this.camera.targetZoom = 0.55;
    }

    startMatch() {
        const username = document.getElementById('player-name').value || 'Minifig';
        const colorOption = document.querySelector('.color-option.selected');
        const color = colorOption ? colorOption.dataset.color : '#f5b041';
        this.originalBotCount = parseInt(document.getElementById('bot-count').value);
        this.aliveCount = this.originalBotCount + 1;
        this.matchTime = 0;
        this.winnerWinner = false;

        this.map.generate();
        this.bullets = [];
        this.entities = [];

        const angle = Math.random() * Math.PI * 2;
        const flightRadius = this.map.size * 0.65;
        this.plane.startX = this.map.half - Math.cos(angle) * flightRadius;
        this.plane.startY = this.map.half - Math.sin(angle) * flightRadius;
        this.plane.endX = this.map.half + Math.cos(angle) * flightRadius;
        this.plane.endY = this.map.half + Math.sin(angle) * flightRadius;
        this.plane.angle = angle;
        this.plane.x = this.plane.startX;
        this.plane.y = this.plane.startY;
        this.plane.progress = 0;
        this.plane.speed = 0.05 + Math.random() * 0.03;

        this.player = new Player(this.plane.x, this.plane.y, username, color);
        this.player.state = 'plane';

        const autoPickupCheck = document.getElementById('auto-pickup');
        this.player.autoPickup = autoPickupCheck ? autoPickupCheck.checked : true;

        const autoHud = document.getElementById('auto-pickup-hud-status');
        if (autoHud) {
            autoHud.textContent = this.player.autoPickup ? ' (AUTO)' : '';
        }

        this.entities.push(this.player);

        for (let i = 0; i < this.originalBotCount; i++) {
            const botNames = ['BrickSmash', 'StudSniper', 'LegoLegit', 'BuildBoy', 'MasterBuilder', 'PlatePatrol', 'MinifigMaster', 'CrateCrusher', 'BlockyBot', 'ContraLego', 'ChromeStud', 'PlasticHero', 'LegoGamer', 'StudLord', 'RedBrick', 'LegoApex', 'StudSlayer', 'BrickStorm', 'LegoNinja'];
            const botColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#bdc3c7', '#1abc9c', '#e67e22', '#d35400', '#2c3e50'];
            
            const bName = botNames[i % botNames.length] + '#' + Math.floor(Math.random()*900 + 100);
            const bColor = botColors[Math.floor(Math.random() * botColors.length)];

            const travelOffsetAngle = angle + (Math.random() - 0.5) * 1.5;
            const flightDist = Math.random() * (flightRadius * 1.5);
            const bx = this.plane.startX + Math.cos(travelOffsetAngle) * flightDist;
            const by = this.plane.startY + Math.sin(travelOffsetAngle) * flightDist;

            const bot = new Bot(bx, by, bName, bColor);
            bot.state = 'plane';
            bot.aiTimer = 1000 + Math.random() * 6000;
            this.entities.push(bot);
        }

        const teamOption = document.querySelector('#team-toggle .toggle-btn.selected');
        const teamSize = teamOption ? teamOption.dataset.value : 'solo';
        const teammateHUD = document.getElementById('teammate-hud');
        
        if (teamSize === 'duo') {
            const firstBot = this.entities.find(e => e instanceof Bot);
            if (firstBot) {
                this.teammateEntity = firstBot;
                firstBot.isTeammate = true;
                firstBot.username = `[TEAM] ${firstBot.username}`;
                if (teammateHUD) {
                    teammateHUD.classList.remove('hidden');
                    document.getElementById('tm-name').textContent = firstBot.username;
                }
            }
        } else {
            if (teammateHUD) teammateHUD.classList.add('hidden');
            this.teammateEntity = null;
        }

        sfx.startPlaneHum();

        this.menuScreen.classList.add('hidden');
        this.gameState = 'plane';

        const prompt = document.getElementById('action-prompt');
        if (prompt) {
            if (this.deviceType === 'tv') {
                prompt.textContent = 'PRESS [A] TO EJECT';
            } else if (this.deviceType === 'mobile') {
                prompt.textContent = 'TAP BUTTON TO EJECT';
            } else {
                prompt.textContent = 'PRESS [SPACE] TO EJECT';
            }
            prompt.classList.remove('hidden');
        }

        document.getElementById('t-btn-eject').classList.remove('hidden');

        this.camera.x = this.plane.x;
        this.camera.y = this.plane.y;
        this.camera.targetZoom = 0.55;
    }

    ejectPlayer() {
        try {
            if (this.player && this.player.state === 'plane') {
                this.player.state = 'parachute';
                this.player.parachuteAltitude = 250;
                this.player.x = this.plane.x;
                this.player.y = this.plane.y;

                this.camera.targetZoom = 0.65;
                this.gameState = 'combat';

                try {
                    sfx.stopPlaneHum();
                    sfx.playLegoRattle(0.8);
                } catch (e) {
                    console.warn("Audio stop error during ejection:", e);
                }
            }
        } catch (e) {
            console.error("Ejection state error:", e);
        } finally {
            // Always ensure the prompts are hidden after ejection
            const prompt = document.getElementById('action-prompt');
            if (prompt) prompt.classList.add('hidden');
            const ejectBtn = document.getElementById('t-btn-eject');
            if (ejectBtn) ejectBtn.classList.add('hidden');
        }
    }

    run(currentTime) {
        const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        this.update(dt);
        this.draw();

        requestAnimationFrame((time) => this.run(time));
    }

    update(dt) {
        this.input.update(this.camera, this.player);



        if (this.gameState === 'menu') {
            fx.update(dt);
            return;
        }

        fx.update(dt);

        if (this.gameState === 'plane') {
            this.matchTime += dt;

            this.plane.progress += 0.09 * dt;
            this.plane.x = this.plane.startX + (this.plane.endX - this.plane.startX) * this.plane.progress;
            this.plane.y = this.plane.startY + (this.plane.endY - this.plane.startY) * this.plane.progress;

            this.camera.update(this.plane.x, this.plane.y, dt);

            this.entities.forEach((ent) => {
                if (ent instanceof Bot && ent.state === 'plane') {
                    ent.update(dt, this.map, (b) => this.spawnBullet(b), this.entities);
                }
            });

            if (this.plane.progress >= 1.0) {
                this.ejectPlayer();
            } else if (this.input.actions.eject) {
                this.ejectPlayer();
            }
            return;
        }

        if (this.gameState === 'combat') {
            this.matchTime += dt;

            this.map.updateZones(
                dt,
                (phase) => {
                    sfx.startZoneHum();
                    this.triggerAnnouncement('SAFE ZONE SHANKING!');
                },
                (nextPhase) => {
                    sfx.stopZoneHum();
                    this.triggerAnnouncement('SAFE ZONE FIXED!');
                }
            );

            if (this.isOnline && this.player && this.player.state !== 'dead') {
                const now = performance.now();
                if (now - this.lastSyncTime > 45) {
                    this.lastSyncTime = now;
                    this.sendNetPacket({
                        type: 'state_sync',
                        x: this.player.x,
                        y: this.player.y,
                        angle: this.player.angle,
                        state: this.player.state,
                        parachuteAltitude: this.player.parachuteAltitude,
                        health: this.player.health,
                        shield: this.player.shield,
                        activeWeaponIndex: this.player.activeWeaponIndex,
                        armorLevel: this.player.armorLevel,
                        kills: this.player.kills
                    });
                }
            }

            if (this.isOnline && this.isHost) {
                const now = performance.now();
                if (!this.lastHostSyncTime || now - this.lastHostSyncTime > 80) {
                    this.lastHostSyncTime = now;
                    this.sendHostSync();
                }
            }

            this.entities.forEach((ent) => {
                if (ent instanceof Player) {
                    ent.update(dt, this.input, this.map, (b) => this.spawnBullet(b), this.camera);
                } else if (ent instanceof Bot) {
                    ent.update(dt, this.map, (b) => this.spawnBullet(b), this.entities);
                }
            });

            this.entities.forEach((ent) => {
                if (ent.state === 'alive') {
                    if (this.map.isOutsideBlueZone(ent.x, ent.y)) {
                        ent.takeDamage(this.map.zoneDamage * dt, ent);
                        if (ent.isPlayer) {
                            this.camera.shake(1.5, 50);
                        }
                    }
                }
            });

            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                const alive = bullet.update(dt);

                if (!alive) {
                    this.bullets.splice(i, 1);
                    continue;
                }

                let hit = false;
                for (let k = 0; k < this.entities.length; k++) {
                    const ent = this.entities[k];
                    if (ent.state === 'alive' && ent !== bullet.owner) {
                        const dx = bullet.x - ent.x;
                        const dy = bullet.y - ent.y;
                        const d = Math.sqrt(dx*dx + dy*dy);

                        if (d < ent.radius + bullet.radius) {
                            if (this.areTeammates(bullet.owner, ent)) {
                                continue;
                            }

                            if (this.isOnline) {
                                if (bullet.owner === this.player || (this.isHost && bullet.owner instanceof Bot)) {
                                    const isBot = ent instanceof Bot;
                                    const targetId = ent.username;
                                    this.sendNetPacket({
                                        type: 'damage',
                                        attackerId: bullet.owner.isPlayer ? bullet.owner.username : bullet.owner.username,
                                        targetId: targetId,
                                        damage: bullet.damage,
                                        isBot: isBot
                                    });
                                    ent.takeDamage(bullet.damage, bullet.owner);
                                }
                            } else {
                                ent.takeDamage(bullet.damage, bullet.owner);
                            }
                            
                            if (bullet.weaponId === 'bricklauncher') {
                                this.triggerBrickExplosionBlast(bullet.x, bullet.y, bullet.owner);
                            }

                            hit = true;
                            break;
                        }
                    }
                }

                if (hit) {
                    this.bullets.splice(i, 1);
                    continue;
                }

                if (this.map.checkWallCollision(bullet.x, bullet.y, bullet.radius)) {
                    const bulletAngle = Math.atan2(bullet.vy, bullet.vx);
                    fx.spawnWallImpact(bullet.x, bullet.y, bulletAngle, '#bdc3c7');
                    sfx.playLegoRattle(0.18);
                    
                    if (bullet.weaponId === 'bricklauncher') {
                        this.triggerBrickExplosionBlast(bullet.x, bullet.y, bullet.owner);
                    }

                    this.bullets.splice(i, 1);
                }
            }

            if (this.player) {
                if (this.player.state === 'alive') {
                    const activeW = this.player.weapons[this.player.activeWeaponIndex];
                    const baseZoom = window.innerWidth < 900 ? 0.5 : 1.05;
                    if (activeW && activeW.id === 'sniper' && this.input.mouse.clicked) {
                        this.camera.targetZoom = baseZoom * 0.75;
                    } else {
                        this.camera.targetZoom = baseZoom;
                    }
                    this.camera.update(this.player.x, this.player.y, dt);
                } else if (this.player.state === 'dead') {
                    const aliveBots = this.entities.filter((e) => e.state !== 'dead' && e !== this.player);
                    if (aliveBots.length > 0) {
                        this.camera.update(aliveBots[0].x, aliveBots[0].y, dt);
                    }
                    
                    if (this.gameState !== 'results') {
                        setTimeout(() => this.endMatch(false), 2500);
                    }
                }
            }

            const prevCount = this.aliveCount;
            this.entities = this.entities.filter((ent) => ent.state !== 'dead' || ent.isPlayer);
            this.aliveCount = this.entities.filter((ent) => ent.state !== 'dead').length;

            if (this.aliveCount === 1 && this.player && this.player.state === 'alive' && !this.winnerWinner) {
                this.winnerWinner = true;
                setTimeout(() => this.endMatch(true), 2000);
            }
        }

        this.updateHUD();
        this.input.clearActions();
    }

    spawnBullet(b) {
        this.bullets.push(b);
    }

    triggerBrickExplosionBlast(bx, by, owner) {
        sfx.playBrickExplosion();
        fx.spawnExplosion(bx, by);
        this.camera.shake(12, 200);

        const blastRadius = 90;
        this.entities.forEach((ent) => {
            if (ent.state === 'alive') {
                const dx = ent.x - bx;
                const dy = ent.y - by;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < blastRadius) {
                    const dmgFactor = (blastRadius - dist) / blastRadius;
                    const dmg = Math.floor(WEAPON_TYPES.bricklauncher.damage * dmgFactor);
                    ent.takeDamage(dmg, owner);
                }
            }
        });
    }

    triggerAnnouncement(txt) {
        const b = document.getElementById('announcement-banner');
        b.textContent = txt;
        b.classList.add('active');
        setTimeout(() => b.classList.remove('active'), 2500);
    }

    updateHUD() {
        if (!this.player) return;

        const teammateHUD = document.getElementById('teammate-hud');
        if (this.teammateEntity) {
            if (teammateHUD) {
                teammateHUD.classList.remove('hidden');
                const tmHealthFill = document.getElementById('tm-health-fill');
                const tmShieldFill = document.getElementById('tm-shield-fill');
                if (tmHealthFill) tmHealthFill.style.width = `${Math.max(0, this.teammateEntity.health)}%`;
                if (tmShieldFill) tmShieldFill.style.width = `${Math.max(0, this.teammateEntity.shield)}%`;
                
                const tmDot = document.querySelector('.tm-dot');
                if (tmDot) {
                    if (this.teammateEntity.state === 'dead') {
                        tmDot.className = 'tm-dot';
                    } else {
                        tmDot.className = 'tm-dot active';
                    }
                }
            }
        } else {
            if (teammateHUD) teammateHUD.classList.add('hidden');
        }

        const healthPercent = Math.max(0, this.player.health / 100);
        document.getElementById('hud-health-fill').style.width = (healthPercent * 100) + '%';
        document.getElementById('hud-health-val').textContent = `${Math.ceil(this.player.health)} / 100`;

        const shieldPercent = Math.max(0, this.player.shield / 100);
        document.getElementById('hud-shield-fill').style.width = (shieldPercent * 100) + '%';
        document.getElementById('hud-shield-val').textContent = `${Math.ceil(this.player.shield)} / 100`;

        const boostPercent = Math.max(0, this.player.boost / 100);
        document.getElementById('hud-boost-fill').style.width = (boostPercent * 100) + '%';
        document.getElementById('hud-boost-val').textContent = `${Math.ceil(this.player.boost)}%`;

        document.getElementById('hud-alive').textContent = this.aliveCount;
        document.getElementById('hud-kills').textContent = this.player.kills;

        const timerVal = Math.max(0, this.map.zoneTimer);
        const mins = Math.floor(timerVal / 60);
        const secs = Math.floor(timerVal % 60);
        document.getElementById('hud-zone-timer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        const zoneLbl = document.getElementById('hud-zone-lbl');
        const timerBox = document.getElementById('hud-zone-timer');
        if (this.map.isShrinking) {
            zoneLbl.textContent = 'SHRINKING!';
            timerBox.classList.add('shrinking');
        } else {
            zoneLbl.textContent = 'NEXT CIRCLE';
            timerBox.classList.remove('shrinking');
        }

        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`w-slot-${i + 1}`);
            const w = this.player.weapons[i];
            const ammoField = document.getElementById(`w-ammo-${i + 1}`);

            if (i === this.player.activeWeaponIndex) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }

            if (w) {
                slot.classList.remove('empty');
                if (w.id === 'pistol') {
                    ammoField.textContent = `${w.currentAmmo} / ∞`;
                } else {
                    const ammoType = w.id === 'rifle' ? 'rifle' : (w.id === 'bricklauncher' ? 'special' : 'smg');
                    const reserve = this.player.ammoInventory[ammoType] || 0;
                    ammoField.textContent = `${w.currentAmmo} / ${reserve}`;
                }

                if (w.currentAmmo <= w.capacity * 0.25) {
                    ammoField.classList.add('low');
                } else {
                    ammoField.classList.remove('low');
                }
            } else {
                slot.classList.add('empty');
                ammoField.textContent = '--';
            }
        }

        const healBtn = document.getElementById('t-btn-heal');
        if (healBtn) healBtn.setAttribute('data-qty', this.player.medkitsCount);

        // Update Drop button state
        const dropBtn = document.getElementById('btn-drop-weapon');
        if (dropBtn) {
            if (this.player.activeWeaponIndex === 0 || !this.player.weapons[this.player.activeWeaponIndex]) {
                dropBtn.style.opacity = '0.35';
                dropBtn.style.cursor = 'default';
                dropBtn.style.pointerEvents = 'none';
            } else {
                dropBtn.style.opacity = '0.9';
                dropBtn.style.cursor = 'pointer';
                dropBtn.style.pointerEvents = 'auto';
            }
        }

        // Update Nearby Loot Panel
        const nearbyPanel = document.getElementById('nearby-loot-panel');
        const nearbyList = document.getElementById('nearby-loot-list');
        if (nearbyPanel && nearbyList) {
            const nearbyItems = [];
            this.map.loot.forEach((item) => {
                const dx = this.player.x - item.x;
                const dy = this.player.y - item.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 80) { // Loot radius 80px
                    nearbyItems.push({ item, dist });
                }
            });

            nearbyItems.sort((a, b) => a.dist - b.dist);

            if (nearbyItems.length > 0) {
                nearbyPanel.classList.remove('hidden');
                
                // Only reconstruct DOM if nearby loot list changed to avoid expensive redraw
                const currentIds = Array.from(nearbyList.children).map(c => c.getAttribute('data-id')).join(',');
                const newIds = nearbyItems.map(ni => ni.item.id).join(',');
                
                if (currentIds !== newIds) {
                    nearbyList.innerHTML = '';
                    nearbyItems.forEach(({ item }) => {
                        const spec = item.spec;
                        const card = document.createElement('div');
                        card.className = 'loot-item-card';
                        card.setAttribute('data-id', item.id);
                        
                        let nameColor = spec.color || '#fff';
                        let desc = spec.type.toUpperCase();
                        if (spec.type === 'weapon') {
                            desc = `WEAPON (${spec.ammo} AMMO)`;
                        } else if (spec.type === 'ammo') {
                            desc = `AMMO (${spec.qty} STUDS)`;
                        } else if (spec.type === 'armor') {
                            desc = `ARMOR (+${spec.shield} SHIELD)`;
                        } else if (spec.type === 'med') {
                            desc = spec.heal ? 'MEDKIT (+45 HP)' : `BOOST (+${spec.boost}%)`;
                        }

                        card.innerHTML = `
                            <div class="loot-item-info">
                                <span class="loot-item-name" style="color: ${nameColor};">${spec.name}</span>
                                <span class="loot-item-desc">${desc}</span>
                            </div>
                            <button class="loot-item-btn">GET</button>
                        `;

                        card.addEventListener('click', () => {
                            this.pickSpecificLootItem(item);
                        });

                        nearbyList.appendChild(card);
                    });
                }
            } else {
                nearbyPanel.classList.add('hidden');
            }
        }
    }

    pickSpecificLootItem(item) {
        if (!this.player || this.player.state === 'dead') return;
        const player = this.player;
        const map = this.map;
        
        const index = map.loot.findIndex((l) => l.id === item.id);
        if (index === -1) return;

        const spec = item.spec;
        let success = false;

        if (spec.type === 'weapon') {
            let targetSlot = 1;
            if (spec.id === 'pistol') {
                targetSlot = 0;
            } else {
                if (player.weapons[1] === null) {
                    targetSlot = 1;
                } else if (player.weapons[2] === null) {
                    targetSlot = 2;
                } else {
                    targetSlot = player.activeWeaponIndex === 0 ? 1 : player.activeWeaponIndex;
                }
            }

            const oldWeapon = player.weapons[targetSlot];
            if (oldWeapon && oldWeapon.id !== 'pistol') {
                map.loot.push({
                    x: player.x + (Math.random() - 0.5) * 20, y: player.y + (Math.random() - 0.5) * 20,
                    id: Math.random().toString(36).substr(2, 9),
                    spec: { type: 'weapon', id: oldWeapon.id, name: oldWeapon.name, color: oldWeapon.color, ammo: oldWeapon.currentAmmo },
                    pulseTimer: 0
                });
            }

            const weaponSpec = WEAPON_TYPES[spec.id];
            const capacity = weaponSpec.capacity;
            const loaded = Math.min(spec.ammo, capacity);
            const extraReserve = spec.ammo - loaded;

            player.weapons[targetSlot] = { ...weaponSpec, currentAmmo: loaded };
            player.activeWeaponIndex = targetSlot;
            
            const ammoType = spec.id === 'rifle' ? 'rifle' : (spec.id === 'bricklauncher' ? 'special' : 'smg');
            player.ammoInventory[ammoType] += extraReserve;
            
            success = true;

        } else if (spec.type === 'ammo') {
            const type = spec.id === 'rifle' ? 'rifle' : 'smg';
            player.ammoInventory[type] += spec.qty;
            success = true;

        } else if (spec.type === 'armor') {
            player.shield = Math.min(100, player.shield + spec.shield);
            success = true;

        } else if (spec.type === 'med') {
            if (spec.heal) {
                player.medkitsCount = Math.min(5, player.medkitsCount + 1);
            } else if (spec.boost) {
                player.boost = Math.min(100, player.boost + spec.boost);
            }
            success = true;
        }

        if (success) {
            sfx.playLoot();
            fx.spawnStudScatter(player.x, player.y, spec.color || '#f5b041', 5, 1.5);
            map.loot.splice(index, 1);
            
            if (this.isOnline && this.isHost) {
                this.sendHostLootSync();
            }
        }
    }

    endMatch(victory) {
        this.gameState = 'results';
        sfx.stopZoneHum();

        const title = document.getElementById('results-title');
        const subtitle = document.getElementById('results-subtitle');
        const card = document.getElementById('results-card');

        if (victory) {
            title.textContent = 'VICTORY!';
            subtitle.textContent = 'WINNER WINNER CHICKEN DINNER';
            card.className = 'menu-card results-screen victory';
            sfx.playLoot();
        } else {
            title.textContent = 'DEFEAT';
            subtitle.textContent = 'ELIMINATED IN COMBAT';
            card.className = 'menu-card results-screen defeat';
            sfx.playLegoRattle(0.8);
        }

        const rank = victory ? '#1' : `#${this.aliveCount + 1}`;
        document.getElementById('res-rank').textContent = rank;
        document.getElementById('res-kills').textContent = this.player.kills;
        
        const estDmg = this.player.kills * 100 + Math.floor(Math.random() * 80);
        document.getElementById('res-damage').textContent = estDmg;

        const min = Math.floor(this.matchTime / 60);
        const sec = Math.floor(this.matchTime % 60);
        document.getElementById('res-time').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

        this.resultsScreen.classList.remove('hidden');
    }

    draw() {
        const cols = this.map.getColors();
        this.ctx.fillStyle = cols.ocean;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'menu') {
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            fx.draw(this.ctx);
            this.ctx.restore();
            return;
        }

        this.camera.apply(this.ctx, this.canvas.width, this.canvas.height);

        this.map.drawTerrain(this.ctx, this.camera);
        this.map.drawLoot(this.ctx);

        this.entities.forEach((ent) => {
            if (ent.state === 'alive' || ent.state === 'parachute') {
                const activeWeapon = ent.weapons[ent.activeWeaponIndex];
                const hpPercent = Math.max(0, ent.health / 100);
                
                GraphicsEngine.drawMinifig(this.ctx, {
                    x: ent.x, y: ent.y,
                    angle: ent.angle,
                    skinColor: '#f5b041',
                    torsoColor: ent.color,
                    legsColor: '#2c3e50',
                    state: ent.state,
                    walkingFrame: ent.walkingFrame,
                    activeWeapon: activeWeapon,
                    armorLevel: ent.armorLevel,
                    shield: ent.shield,
                    username: ent.username,
                    isPlayer: ent.isPlayer,
                    healthPercent: hpPercent
                });
            }
        });

        this.bullets.forEach((b) => b.draw(this.ctx));
        fx.draw(this.ctx);
        this.map.drawZones(this.ctx);

        if (this.gameState === 'plane') {
            GraphicsEngine.drawPlane(this.ctx, this.plane.x, this.plane.y, this.plane.angle);
        }

        this.camera.revert(this.ctx);
        this.drawMinimap();
    }

    drawMinimap() {
        const ctx = this.minimapCtx;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;

        const cols = this.map.getColors();
        ctx.fillStyle = cols.ocean;
        ctx.fillRect(0, 0, w, h);

        if (!this.player) return;

        ctx.save();
        const mapScale = w / this.map.size;
        
        ctx.fillStyle = cols.beach;
        ctx.beginPath();
        ctx.arc(this.map.half * mapScale, this.map.half * mapScale, (this.map.islandRadius + 10) * mapScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cols.ground;
        ctx.beginPath();
        ctx.arc(this.map.half * mapScale, this.map.half * mapScale, this.map.islandRadius * mapScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(this.map.whiteZone.x * mapScale, this.map.whiteZone.y * mapScale, this.map.whiteZone.r * mapScale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.map.blueZone.x * mapScale, this.map.blueZone.y * mapScale, this.map.blueZone.r * mapScale, 0, Math.PI * 2);
        ctx.stroke();

        this.entities.forEach((ent) => {
            if (ent !== this.player && ent.state === 'alive') {
                ctx.save();
                if (ent === this.teammateEntity) {
                    ctx.fillStyle = '#2ecc71';
                    ctx.beginPath();
                    ctx.arc(ent.x * mapScale, ent.y * mapScale, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (ent instanceof Bot) {
                    ctx.fillStyle = '#e74c3c';
                    ctx.beginPath();
                    ctx.arc(ent.x * mapScale, ent.y * mapScale, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (ent.isNetworkPlayer) {
                    ctx.fillStyle = '#e74c3c';
                    ctx.beginPath();
                    ctx.arc(ent.x * mapScale, ent.y * mapScale, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });

        ctx.save();
        const px = this.player.x * mapScale;
        const py = this.player.y * mapScale;
        ctx.translate(px, py);
        ctx.rotate(this.player.angle);
        
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}

// Start Game Director immediately
const director = new GameDirector();
requestAnimationFrame((time) => director.run(time));
