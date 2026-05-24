// Procedural audio generator using the Web Audio API (Zero external assets required!)
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
        this.masterVolume.gain.setValueAtTime(0.3, this.ctx.currentTime); // Standard comfortable volume
        this.masterVolume.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Helper to generate a quick burst of white noise for explosions, gunshots, etc.
    createNoiseBuffer() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
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

        // Add a bit of snap noise
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

        // Snappy high noise
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

        // Loud sharp noise crack
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseGain = this.ctx.createGain();
        
        // Dynamic highpass filter for the rifle crackle
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
        
        // Deep low frequency punch
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

        // Massive white noise blast
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
        
        // Thunderous low frequency boom
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

        // Intense echo white noise
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

        // Big low bass explosion
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

        // Scattered LEGO plastic impact rattle
        for (let i = 0; i < 6; i++) {
            const timeOffset = Math.random() * 0.3;
            setTimeout(() => this.playLegoRattle(0.2), timeOffset * 1000);
        }
    }

    // Classic Lego assembly / disassembly click/rattle sound!
    playLegoRattle(intensity = 0.5) {
        this.init(); this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const clicks = Math.floor(Math.random() * 3) + 3; // 3 to 5 quick plastic clicks

        for (let i = 0; i < clicks; i++) {
            const clickTime = now + (i * 0.035) + (Math.random() * 0.015);
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            // LEGO studs/plastic click is high-pitched and metallic
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
        const notes = [261.63, 329.63, 392.00, 523.25]; // Beautiful rising C-Major arpeggio

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
        
        // Beautiful ambient swell
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
        osc.frequency.setValueAtTime(45, now); // Very low rumble

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(45.5, now); // Add chorusing beat

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 1.0); // Gentle fade in

        // Apply a filter to remove harsh high frequencies
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
        node.gain.gain.linearRampToValueAtTime(0.001, now + 0.5); // Fade out

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
        osc.frequency.setValueAtTime(65, now); // Low electrical drone

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2, now); // 2Hz oscillation
        lfoGain.gain.setValueAtTime(1.5, now); // Vibrate the main frequency

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.5); // Fade in

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency); // Modulate frequency for wobbly electric sound
        
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

export const sfx = new SoundController();
