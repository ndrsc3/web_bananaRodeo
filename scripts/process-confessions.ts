/**
 * process-confessions.ts — Banana Confessional audio pipeline
 *
 * Reads year-organized source WAVs, applies the locked web-prep + FX chain via
 * ffmpeg, and regenerates the manifest the booth page streams from.
 *
 * Source (owner-side, year-organized; timestamped filenames preserved):
 *   ../../_capture/audio/web_bananaRodeo/confessions/<year>/*.wav
 *   (override with CONFESSIONS_SRC=/abs/path)
 *
 * Output:
 *   public/audio/confessions/<year>/<same-timestamp-name>.mp3   (local copies)
 *   public/audio/confessions.json                               (committed manifest)
 *
 * Hosting modes (manifest URLs):
 *   - Local (default):       /audio/confessions/<year>/<name>.mp3  (served from public/)
 *   - Blob (BLOB_READ_WRITE_TOKEN set): each MP3 is uploaded to Vercel Blob and
 *     the manifest holds the public Blob URL — so production playback works
 *     without the (gitignored) binaries in the deploy.
 *
 * FX chain (locked 260603):
 *   denoise → telephone(300–3400) → pitch ↓0.85 → light reverb → loudnorm
 *
 * Anonymity is enforced at the presentation layer (the booth screen shows no
 * date/name/metadata). Source timestamps are treated as anonymous and kept.
 *
 * Requires: ffmpeg + ffprobe on PATH. For Blob mode: BLOB_READ_WRITE_TOKEN.
 * Run:  npm run process-confessions
 * Blob: BLOB_READ_WRITE_TOKEN=… npm run process-confessions
 */
import { execFileSync } from 'child_process';
import { readdirSync, mkdirSync, writeFileSync, readFileSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { put } from '@vercel/blob';

const PITCH = 0.85; // pitch-down factor (locked)
const BITRATE = '64k'; // mono voice
const LOUDNORM = 'loudnorm=I=-16:TP=-1.5:LRA=11';
const REVERB = 'aecho=0.8:0.9:50:0.25'; // light
const TELEPHONE = 'highpass=f=300,lowpass=f=3400';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const useBlob = !!BLOB_TOKEN;

const SRC_ROOT = process.env.CONFESSIONS_SRC
    ? resolve(process.env.CONFESSIONS_SRC)
    : resolve(process.cwd(), '../../_capture/audio/web_bananaRodeo/confessions');
const OUT_ROOT = resolve(process.cwd(), 'public/audio/confessions');
const MANIFEST = resolve(process.cwd(), 'public/audio/confessions.json');

function ffprobe(file: string, entries: string): string {
    return execFileSync(
        'ffprobe',
        ['-v', 'error', '-select_streams', 'a:0', '-show_entries', entries, '-of', 'csv=p=0', file],
        { encoding: 'utf8' },
    ).trim();
}

function sampleRate(file: string): number {
    return parseInt(ffprobe(file, 'stream=sample_rate'), 10) || 48000;
}

function durationSec(file: string): number {
    const d = execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
        { encoding: 'utf8' },
    ).trim();
    return Math.round(parseFloat(d) * 10) / 10;
}

/** Build the per-file filtergraph (pitch math depends on the source sample rate). */
function filterChain(sr: number): string {
    const lowered = Math.round(sr * PITCH); // asetrate target → lowers pitch + slows
    const atempo = (sr / lowered).toFixed(6); // restore original duration
    return [
        'afftdn',
        TELEPHONE,
        `asetrate=${lowered}`,
        `aresample=${sr}`,
        `atempo=${atempo}`,
        REVERB,
        LOUDNORM,
    ].join(',');
}

async function main(): Promise<void> {
    if (!existsSync(SRC_ROOT)) {
        console.error(`Source not found: ${SRC_ROOT}`);
        console.error('Set CONFESSIONS_SRC or place WAVs under confessions/<year>/.');
        process.exit(1);
    }

    console.log(useBlob ? 'Mode: Vercel Blob (uploading)' : 'Mode: local (no BLOB_READ_WRITE_TOKEN)');

    const years = readdirSync(SRC_ROOT).filter((d) => statSync(join(SRC_ROOT, d)).isDirectory());
    const clips: { url: string; duration: number }[] = [];
    let processed = 0;

    for (const year of years.sort()) {
        const srcDir = join(SRC_ROOT, year);
        const outDir = join(OUT_ROOT, year);
        mkdirSync(outDir, { recursive: true });

        const wavs = readdirSync(srcDir)
            .filter((f) => f.toLowerCase().endsWith('.wav'))
            .sort();

        for (const wav of wavs) {
            const src = join(srcDir, wav);
            const name = wav.replace(/\.wav$/i, '.mp3');
            const out = join(outDir, name);
            const sr = sampleRate(src);

            execFileSync('ffmpeg', [
                '-y', '-v', 'error',
                '-i', src,
                '-ac', '1',
                '-af', filterChain(sr),
                '-b:a', BITRATE,
                '-map_metadata', '-1',
                out,
            ]);

            let url = `/audio/confessions/${year}/${name}`;
            if (useBlob) {
                const res = await put(`confessions/${year}/${name}`, readFileSync(out), {
                    access: 'public',
                    contentType: 'audio/mpeg',
                    token: BLOB_TOKEN,
                    addRandomSuffix: false,
                    allowOverwrite: true,
                });
                url = res.url;
            }

            clips.push({ url, duration: durationSec(out) });
            processed++;
            console.log(`  ✓ ${year}/${name}`);
        }
    }

    // Shuffle happens client-side; manifest order is just source order.
    writeFileSync(MANIFEST, JSON.stringify({ version: 1, clips }, null, 2) + '\n');

    const total = clips.reduce((s, c) => s + c.duration, 0);
    console.log(
        `\nProcessed ${processed} clip(s) across ${years.length} year(s) — ` +
            `${(total / 60).toFixed(1)} min total.\nManifest → ${MANIFEST}`,
    );
    if (!useBlob) {
        console.log('NOTE: local mode — manifest points at gitignored MP3s. Set ' +
            'BLOB_READ_WRITE_TOKEN to upload + write Blob URLs for production.');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
