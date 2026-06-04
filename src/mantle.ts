/**
 * The Mantle — a live "digital frame" composited into the seascape painting above
 * the La Finka mantel. Cycles through the JCPenney-shoot photos (processed by the
 * underScore image pipeline into /assets/mantle/, listed in manifest.json).
 *
 * Two stacked <img> elements crossfade; each photo is shown "contained" on a dark
 * screen so portrait and landscape shots both sit cleanly inside the frame.
 */

const POOL_DIR = '/assets/mantle';
const MANIFEST = `${POOL_DIR}/manifest.json`;
const INTERVAL = 5000; // ms between photos

interface Photo {
    file: string;
    w: number;
    h: number;
}

async function loadPool(): Promise<Photo[]> {
    try {
        const res = await fetch(MANIFEST, { cache: 'no-store' });
        if (!res.ok) return [];
        const data: unknown = await res.json();
        if (!Array.isArray(data)) return [];
        return data
            .map((e): Photo | null => {
                if (typeof e === 'string') return { file: e, w: 4, h: 3 };
                if (e && typeof e === 'object' && 'file' in e) {
                    const o = e as Record<string, unknown>;
                    return { file: String(o.file), w: Number(o.w) || 4, h: Number(o.h) || 3 };
                }
                return null;
            })
            .filter((p): p is Photo => p !== null);
    } catch {
        return [];
    }
}

export async function initializeMantle(): Promise<void> {
    const frame = document.getElementById('mantle-frame');
    if (!frame) return;

    const pool = await loadPool();
    if (pool.length === 0) {
        frame.classList.add('is-empty'); // CSS shows the "awaiting photos" placeholder
        return;
    }

    const imgA = document.createElement('img');
    const imgB = document.createElement('img');
    imgA.className = 'mantle-photo';
    imgB.className = 'mantle-photo';
    imgA.alt = 'A photo from the JCPenney shoot';
    imgB.alt = '';
    frame.append(imgA, imgB);

    let idx = 0;
    let front = imgA;
    let back = imgB;

    const show = (i: number): void => {
        idx = ((i % pool.length) + pool.length) % pool.length;
        back.onload = (): void => {
            back.classList.add('is-visible');
            front.classList.remove('is-visible');
            [front, back] = [back, front];
        };
        back.onerror = (): void => show(idx + 1); // skip a broken file
        back.src = `${POOL_DIR}/${pool[idx].file}`;
    };

    show(0);

    let timer = window.setInterval(() => show(idx + 1), INTERVAL);
    const advance = (): void => {
        show(idx + 1);
        window.clearInterval(timer);
        timer = window.setInterval(() => show(idx + 1), INTERVAL);
    };
    frame.addEventListener('click', advance);
}
