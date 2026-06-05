/**
 * static-noise.ts — WebAudio white-noise bursts for the rig.
 *
 * A short hiss of static played when tuning between transmissions or switching
 * bands. Uses a shared AudioContext (the same one that analyses the signal for
 * the S-meter); a 1s noise buffer is built once and reused per burst.
 */
export class StaticNoise {
    private buffer: AudioBuffer | null = null;

    constructor(private ctx: AudioContext) {}

    private ensureBuffer(): void {
        if (this.buffer) return;
        const len = this.ctx.sampleRate; // 1 second of noise
        this.buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }

    /** A burst of static that fades in fast and tails out over `duration` seconds. */
    burst(duration = 0.45, peak = 0.2): void {
        if (this.ctx.state === 'suspended') void this.ctx.resume();
        this.ensureBuffer();
        if (!this.buffer) return;
        const t = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffer;
        src.loop = true;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        src.connect(gain).connect(this.ctx.destination);
        src.start(t);
        src.stop(t + duration + 0.05);
    }
}
