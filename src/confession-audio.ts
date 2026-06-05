/**
 * confession-audio.ts — the rig's audio engine.
 *
 * Plays intercepted transmissions as a continuous shuffle-bag (every clip once
 * before repeats), auto-advances, and exposes retune / hold / resume / volume /
 * band. The signal is routed through WebAudio (gain → speakers, plus a pre-gain
 * analyser tap) so the S-meter reads the true signal regardless of volume.
 *
 * Autoplay + no-pops strategy: playback ALWAYS begins at gain 0 (so the
 * play()/pause() clicks are silent), started inside the open gesture; the boot
 * sequence is purely visual; `reveal()` fades the gain in when the uplink lands.
 * Every gain change is a short linear ramp.
 */

export interface Clip {
    url: string;
    duration?: number;
}

export type StreamEvent = 'playing' | 'paused' | 'tuning' | 'empty' | 'blocked';

export class ConfessionStream {
    private audio = new Audio();
    private clips: Clip[] = [];
    private bag: number[] = [];
    private current = -1;
    private year = '';
    private ready = false;
    private pendingStart = false;
    private transitioning = false;
    private silent = false; // true while the boot animation runs
    private ctx: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private gain: GainNode | null = null;
    private wave: Uint8Array | null = null;
    private volume = 1;

    constructor(
        private manifestUrl: string,
        private emit: (e: StreamEvent) => void,
    ) {
        this.audio.preload = 'auto';
        // Allow the analyser to read cross-origin (Vercel Blob) audio without tainting.
        this.audio.crossOrigin = 'anonymous';
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('playing', () => {
            if (this.silent) return; // boot phase — not user-meaningful yet
            this.transitioning = false;
            this.emit('playing');
        });
        this.audio.addEventListener('pause', () => {
            if (this.silent || this.transitioning || this.audio.ended) return;
            this.emit('paused');
        });
    }

    async load(): Promise<void> {
        try {
            const res = await fetch(this.manifestUrl, { cache: 'no-cache' });
            const data = (await res.json()) as { clips?: Clip[] };
            this.clips = Array.isArray(data.clips) ? data.clips.filter((c) => c?.url) : [];
        } catch {
            this.clips = [];
        }

        if (!this.clips.length) {
            this.emit('empty');
            return;
        }

        this.year = this.bands[0] ?? '';
        this.refillBag();
        this.cue();
        this.ready = true;

        if (this.pendingStart) {
            this.pendingStart = false;
            this.openSilent();
        }
    }

    private clipYear(i: number): string {
        const m = this.clips[i]?.url.match(/\/(\d{4})\//);
        return m ? m[1] : '';
    }

    get bands(): string[] {
        return [...new Set(this.clips.map((_, i) => this.clipYear(i)).filter(Boolean))].sort();
    }

    private refillBag(): void {
        const idx = this.clips.map((_, i) => i).filter((i) => this.clipYear(i) === this.year);
        for (let i = idx.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        if (idx.length > 1 && idx[idx.length - 1] === this.current) {
            [idx[0], idx[idx.length - 1]] = [idx[idx.length - 1], idx[0]];
        }
        this.bag = idx;
    }

    private cue(): void {
        if (!this.bag.length) this.refillBag();
        this.current = this.bag.pop() as number;
        this.audio.src = this.clips[this.current].url;
    }

    /** Build the WebAudio graph. Call inside the open gesture (context resumed). */
    attach(ctx: AudioContext): void {
        if (this.analyser) return;
        this.ctx = ctx;
        const source = ctx.createMediaElementSource(this.audio);
        this.gain = ctx.createGain();
        this.gain.gain.value = 0; // always start silent
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.gain);
        this.gain.connect(ctx.destination);
        source.connect(this.analyser); // pre-gain tap — meter is volume-independent
        this.wave = new Uint8Array(this.analyser.fftSize);
    }

    private rampGain(target: number, sec = 0.05): void {
        if (!this.gain || !this.ctx) return;
        const now = this.ctx.currentTime;
        const g = this.gain.gain;
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(target, now + sec);
    }

    private silenceNow(): void {
        if (!this.gain || !this.ctx) return;
        this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    }

    private play(): void {
        if (this.ctx?.state === 'suspended') void this.ctx.resume();
        const p = this.audio.play();
        if (p) p.catch(() => this.emit('blocked'));
    }

    setVolume(v: number): void {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.gain) {
            if (!this.silent && !this.audio.paused) this.rampGain(this.volume);
        } else {
            this.audio.volume = this.volume;
        }
    }

    /** Begin playing silently during the boot (call inside the open gesture). */
    openSilent(): void {
        if (!this.ready) {
            this.pendingStart = true;
            return;
        }
        this.silent = true;
        this.silenceNow();
        this.audio.currentTime = 0;
        this.play();
    }

    /** Fade the intercepted signal in when the uplink lands. */
    reveal(): void {
        this.silent = false;
        this.rampGain(this.volume, 0.6);
    }

    /** Play the current clip audibly (band switch / resume), fading in from 0. */
    start(): void {
        if (!this.ready) {
            this.pendingStart = true;
            return;
        }
        this.silent = false;
        this.silenceNow();
        this.audio.currentTime = 0;
        this.play();
        this.rampGain(this.volume, 0.12);
    }

    pause(): void {
        if (!this.ready || this.audio.paused) return;
        this.rampGain(0, 0.06);
        const a = this.audio;
        setTimeout(() => {
            if (!a.paused) a.pause();
        }, 70);
    }

    resume(): void {
        if (!this.ready || !this.audio.paused) return;
        this.silenceNow();
        this.play();
        this.rampGain(this.volume, 0.12);
    }

    setBand(year: string): boolean {
        this.year = year;
        this.refillBag();
        if (!this.bag.length) {
            this.current = -1;
            this.emit('empty');
            return false;
        }
        this.cue();
        return true;
    }

    /** Retune to the next intercepted transmission (fades in, masked by static). */
    next(): void {
        if (!this.ready) return;
        this.transitioning = true;
        this.cue();
        if (!this.silent) this.emit('tuning');
        this.silenceNow();
        this.audio.currentTime = 0;
        this.play();
        this.rampGain(this.silent ? 0 : this.volume, 0.12);
    }

    /** RMS amplitude of the transmission right now (~0 when silent/held/dead). */
    signalLevel(): number {
        if (!this.analyser || !this.wave) return 0;
        this.analyser.getByteTimeDomainData(this.wave);
        let sum = 0;
        for (let i = 0; i < this.wave.length; i++) {
            const d = (this.wave[i] - 128) / 128;
            sum += d * d;
        }
        return Math.sqrt(sum / this.wave.length);
    }

    get station(): { pct: number; freq: string } {
        if (this.current < 0 || !this.clips.length) return { pct: 50, freq: '--.---' };
        const pct = ((this.current + 0.5) / this.clips.length) * 100;
        const freq = (3.5 + (pct / 100) * (30 - 3.5)).toFixed(3);
        return { pct, freq };
    }

    get isReady(): boolean {
        return this.ready;
    }

    get isPaused(): boolean {
        return this.audio.paused;
    }
}
