/**
 * confessional.ts — "Celestial Uplink" page controller.
 *
 * The wooden lattice parts (the channel opens), triggering a power-on sequence:
 * the rig hails the Great Big Banana In The Sky, gets no answer, and intercepts
 * an inbound transmission — a confession beamed up to the deity.
 *
 * Controls (Hallicrafters-style panel):
 *   Band   — cycle 2024 / 2025 (years with no clips = dead air + static)
 *   Tuner  — retune to the next transmission (white-noise burst + needle slides)
 *   Level  — step the volume
 *   Power  — hold / resume
 *
 * Shares the site's auth gate, hit counter, and custom cursor.
 */
import { handleAuthRedirect } from './auth.js';
import { initializePageStats } from './page-stats.js';
import { initializeCursor } from './cursor.js';
import { ConfessionStream, type StreamEvent } from './confession-audio.js';
import { StaticNoise } from './static-noise.js';

const MANIFEST_URL = '/audio/confessions.json';
const BANDS = ['2024', '2025'];
const LEVELS = [0.33, 0.66, 1.0]; // ascending — each click steps up
const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

document.addEventListener('DOMContentLoaded', (): void => {
    handleAuthRedirect();
    void initializePageStats();
    initializeCursor();

    const booth = document.querySelector<HTMLElement>('.booth');
    if (!booth) return;

    const rig = booth.querySelector<HTMLElement>('.rig');
    const status = document.getElementById('rig-status');
    const freq = document.getElementById('freq');
    const bandLabel = document.getElementById('band-label');
    const needle = document.getElementById('dial-needle');
    const power = document.getElementById('power');
    const tunerKnob = document.querySelector<HTMLElement>('#tuner .knob__face');
    const levelKnob = document.querySelector<HTMLElement>('#level .knob__face');
    const bandKnob = document.querySelector<HTMLElement>('#band .band__knob');
    const smeterNeedle = document.getElementById('smeter-needle');

    // One shared AudioContext: feeds the static bursts and the signal analyser.
    let audioCtx: AudioContext | null = null;
    let stat: StaticNoise | null = null;
    const ensureAudio = (): void => {
        if (!audioCtx) {
            audioCtx = new AudioContext();
            stat = new StaticNoise(audioCtx);
        }
        if (audioCtx.state === 'suspended') void audioCtx.resume();
        stream.attach(audioCtx); // build graph in-gesture (idempotent)
    };

    let bandIdx = 0;
    let levelIdx = 1; // start mid so the first click steps up toward full
    let powered = true;
    let deadAir = false;
    let tunerRot = 0;

    const setStatus = (t: string): void => { if (status) status.textContent = t; };

    // Knobs rest at their default position: Band on 2024 (left), Level on full.
    const bandRotation = (idx: number): number => idx * 45 - 45;
    const levelRotation = (idx: number): number => 45 - idx * 45;
    if (bandKnob) bandKnob.style.transform = `rotate(${bandRotation(0)}deg)`;
    if (levelKnob) levelKnob.style.transform = `rotate(${levelRotation(levelIdx)}deg)`;

    const setBandVisual = (year: string): void => {
        if (bandLabel) bandLabel.textContent = year;
    };

    const updateDial = (): void => {
        const s = stream.station;
        if (needle) needle.style.left = `${s.pct}%`;
        if (freq) freq.textContent = s.freq;
    };

    const stream = new ConfessionStream(MANIFEST_URL, (e: StreamEvent): void => {
        switch (e) {
            case 'playing':
                deadAir = false;
                booth.dataset.playing = 'true';
                booth.removeAttribute('data-signal');
                power?.setAttribute('data-on', 'true');
                setStatus('RECEIVING');
                updateDial();
                break;
            case 'paused':
                booth.dataset.playing = 'false';
                setStatus(deadAir ? 'DEAD AIR' : powered ? 'SIGNAL HELD' : 'POWER OFF');
                break;
            case 'tuning':
                deadAir = false;
                booth.dataset.playing = 'false';
                setStatus('RETUNING…');
                updateDial();
                break;
            case 'empty':
                deadAir = true;
                booth.dataset.playing = 'false';
                booth.dataset.signal = 'dead';
                setStatus('DEAD AIR');
                if (freq) freq.textContent = '--.---';
                break;
            case 'blocked':
                // Browser blocked the delayed play — present as powered-down so the
                // Power toggle visibly resumes it from a fresh gesture.
                booth.dataset.playing = 'false';
                powered = false;
                power?.setAttribute('data-on', 'false');
                if (rig) rig.dataset.power = 'off';
                setStatus('SIGNAL HELD');
                break;
        }
    });

    void stream.load();
    stream.setVolume(LEVELS[levelIdx]);

    // Drive the S-meter from the real signal amplitude (rests when silent/held/dead).
    let meter = 0;
    const driveMeter = (): void => {
        const booting = rig?.dataset.booting === 'true';
        const target = booting ? 0 : Math.min(1, stream.signalLevel() * 3.4);
        meter += (target - meter) * 0.3; // smooth toward the live level
        if (smeterNeedle) smeterNeedle.style.transform = `rotate(${-52 + meter * 74}deg)`;
        requestAnimationFrame(driveMeter);
    };
    requestAnimationFrame(driveMeter);

    // Power-on sequence: hail the heavens, fail, intercept.
    const runUplink = async (): Promise<void> => {
        if (rig) rig.dataset.booting = 'true';
        setStatus('INITIATING UPLINK…');
        await delay(900);
        setStatus('HAILING THE HEAVENS…');
        await delay(1100);
        setStatus('…NO RESPONSE');
        await delay(900);
        if (!stream.isReady) {
            if (rig) rig.dataset.booting = 'false';
            setStatus('DEAD AIR');
            return;
        }
        setStatus('⚠ SIGNAL INTERCEPTED');
        await delay(700);
        if (rig) rig.dataset.booting = 'false';
        stream.reveal(); // fade the intercepted signal in (it's been playing silently)
        booth.dataset.playing = 'true';
        setStatus('RECEIVING');
        updateDial();
    };

    const openChannel = (): void => {
        if (booth.dataset.state === 'inside') return;
        booth.dataset.state = 'inside'; // lattice parts
        ensureAudio();                  // build graph + resume context in-gesture
        stream.openSilent();            // start playing (silent) within the gesture
        void runUplink();
    };

    document.getElementById('enter-btn')?.addEventListener('click', openChannel);
    booth.querySelector('.threshold')?.addEventListener('click', openChannel);

    // Tuner → static burst + retune to the next interception.
    document.getElementById('tuner')?.addEventListener('click', () => {
        if (!powered) return;
        stat?.burst();
        tunerRot += 150;
        if (tunerKnob) tunerKnob.style.transform = `rotate(${tunerRot}deg)`;
        stream.next();
    });

    // Level → step the volume (●●● → ●●○ → ●○○).
    document.getElementById('level')?.addEventListener('click', () => {
        levelIdx = (levelIdx + 1) % LEVELS.length;
        stream.setVolume(LEVELS[levelIdx]);
        if (levelKnob) levelKnob.style.transform = `rotate(${levelRotation(levelIdx)}deg)`;
    });

    // Band → static burst + switch year (2025 has no clips yet = dead air).
    document.getElementById('band')?.addEventListener('click', () => {
        stat?.burst();
        bandIdx = (bandIdx + 1) % BANDS.length;
        const year = BANDS[bandIdx];
        if (bandKnob) bandKnob.style.transform = `rotate(${bandRotation(bandIdx)}deg)`;
        const hasSignal = stream.setBand(year);
        setBandVisual(year);
        if (hasSignal && powered) stream.start();
        else if (!hasSignal) stream.pause();
    });

    // Power → hold / resume.
    power?.addEventListener('click', () => {
        powered = !powered;
        power.setAttribute('data-on', String(powered));
        if (rig) rig.dataset.power = powered ? 'on' : 'off';
        if (powered) stream.resume();
        else { stream.pause(); setStatus('POWER OFF'); }
    });
});
