/**
 * audio.js - Procedural SFX via Web Audio API
 * No external files — all sounds synthesized.
 */

let _ctx = null;

function _ac() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
}

let _sfxEnabled = true;
let _musicEnabled = true;
let _musicNode = null;
let _musicType = null;
let _activeLoop = null;

function _play(fn) {
    if (!_sfxEnabled) return;
    try { fn(_ac()); } catch (_) {}
}

export function setSFXEnabled(v) { _sfxEnabled = v; }
export function setMusicEnabled(v) { 
    _musicEnabled = v;
    if (_musicEnabled) {
        if (_activeLoop) _activeLoop.gain.gain.setTargetAtTime(_activeLoop.targetVol, _ac().currentTime, 0.1);
    } else {
        if (_activeLoop) _activeLoop.gain.gain.setTargetAtTime(0, _ac().currentTime, 0.1);
    }
}

export function initAudio() {
    try { _ac(); } catch (_) {}
}

// Shoot — base "pew"
export function sfxShoot() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(800, t);
        o.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.start(t); o.stop(t + 0.12);
    });
}

// Specialized Shots
export function sfxMechShoot() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sawtooth';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.22);
    });
}

export function sfxNinjaShoot() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'triangle';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(1200, t);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.05);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        o.start(t); o.stop(t + 0.06);
    });
}

export function sfxArcherShoot() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(600, t);
        o.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.start(t); o.stop(t + 0.1);
    });
}

export function sfxDJShoot() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'square';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(440, t);
        o.frequency.linearRampToValueAtTime(880, t + 0.05);
        o.frequency.linearRampToValueAtTime(440, t + 0.1);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.start(t); o.stop(t + 0.12);
    });
}

// Hit — short noise burst
export function sfxHit() {
    _play(ac => {
        const N = Math.ceil(ac.sampleRate * 0.07);
        const buf = ac.createBuffer(1, N, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < N; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / N);
        const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2;
        src.buffer = buf;
        src.connect(f); f.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.32, ac.currentTime);
        src.start(ac.currentTime);
    });
}

// Death — low explosion thud
export function sfxDeath() {
    _play(ac => {
        const N = Math.ceil(ac.sampleRate * 0.28);
        const buf = ac.createBuffer(1, N, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < N; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / N, 2);
        const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        f.type = 'lowpass';
        const t = ac.currentTime;
        f.frequency.setValueAtTime(700, t);
        f.frequency.exponentialRampToValueAtTime(55, t + 0.22);
        src.buffer = buf;
        src.connect(f); f.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.65, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        src.start(t);
    });
}

// Pickup — rising ping (gem / ammo)
export function sfxPickup() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(880, t);
        o.frequency.linearRampToValueAtTime(1760, t + 0.1);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        o.start(t); o.stop(t + 0.14);
    });
}

// Super — ascending three-note sweep
export function sfxSuper() {
    _play(ac => {
        [0, 0.07, 0.14].forEach((delay, i) => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'sawtooth';
            const t = ac.currentTime + delay;
            o.frequency.setValueAtTime(300 + i * 180, t);
            o.frequency.exponentialRampToValueAtTime(1200 + i * 300, t + 0.22);
            g.gain.setValueAtTime(0.2, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            o.start(t); o.stop(t + 0.25);
        });
    });
}

// Player hit — descending impact
export function sfxPlayerHit() {
    _play(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sawtooth';
        const t = ac.currentTime;
        o.frequency.setValueAtTime(380, t);
        o.frequency.exponentialRampToValueAtTime(75, t + 0.18);
        g.gain.setValueAtTime(0.28, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.start(t); o.stop(t + 0.2);
    });
}

export function stopMusic() {
    if (_musicNode) clearTimeout(_musicNode);
    _musicNode = null;
    _musicType = null;
}

export function playMusic(type) {
    if (_musicType === type) return;
    stopMusic();
    _musicType = type;
    
    _play(ac => {
        const tempo = type === 'battle' ? 140 : 105;
        const secondsPerBeat = 60 / tempo;
        
        // Simple procedural loop using an oscillator and a repeating trigger
        const gain = ac.createGain();
        gain.gain.value = 0.04; // Very quiet background
        gain.connect(ac.destination);
        
        const scheduleBeat = (time) => {
            const osc = ac.createOscillator();
            const g = ac.createGain();
            osc.connect(g);
            g.connect(gain);
            
            // Only play if music is enabled
            if (!_musicEnabled) {
                g.gain.setValueAtTime(0, time);
            } else if (type === 'battle') {
                // Intense techno-style beat
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(55, time);
                osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
                g.gain.setValueAtTime(0.4, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            } else {
                // Chill menu pulse
                osc.type = 'sine';
                osc.frequency.setValueAtTime(80, time);
                g.gain.setValueAtTime(0.3, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            }
            
            osc.start(time);
            osc.stop(time + 0.4);
            
            // Schedule next beat
            if (_musicType === type) {
                const nextTime = time + secondsPerBeat;
                _musicNode = setTimeout(() => scheduleBeat(nextTime), (nextTime - ac.currentTime) * 1000);
            }
        };
        
        scheduleBeat(ac.currentTime);
    });
}



