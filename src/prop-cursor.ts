/**
 * Photobooth prop cursors — shared prop definitions, and a follower that can
 * wear one at any size.
 *
 * There are two ways to put a prop under the pointer, and the difference is the
 * whole reason this module exists:
 *
 *   nativeCursor(prop)   A CSS `cursor: url(…) hx hy` value. Cheap and free —
 *                        but the browser draws the image at its intrinsic size.
 *                        There is no scale knob, custom cursors are capped near
 *                        128px (over that the cursor is silently *dropped*), and
 *                        Safari's SVG-cursor support is patchy. Correct for the
 *                        small wall thumbnails, where small is what we want.
 *
 *   createPropFollower() Hides the native cursor over one element and tracks the
 *                        pointer with a real <img>. Any size, no cap, animatable,
 *                        and Safari treats it as an ordinary image. Correct for
 *                        the enlarged photo, where the prop should grow with it.
 *
 * The hotspot is authored once per prop — hx/hy, in the SVG's own pixels — and
 * both paths read it: the native cursor takes it verbatim, the follower takes it
 * as a fraction of whatever size it happens to render at.
 *
 * Not to be confused with src/cursor.ts, which is a different animal: a
 * page-wide novelty cursor with trails, opt-in via [data-cursor-config], fixed
 * at 32px and with no hotspot concept. Nothing here builds on it.
 */

export interface PropDef {
    /** Asset basename in PROP_DIR, and the id persisted by the picker. */
    id: string;
    label: string;
    /** Hotspot, in the SVG's own pixels — the point that sits on the pointer. */
    hx: number;
    hy: number;
    /** The SVG's intrinsic size. MUST match its width/height attributes: it is
     *  both the size the native cursor draws at and the base the follower
     *  scales, so a mismatch skews the hotspot at every size but 1×. */
    w: number;
    h: number;
}

export const PROP_DIR = '/assets/icons/cursors';

export const PROPS: ReadonlyArray<PropDef> = [
    { id: 'granny-glasses', label: 'Granny glasses', hx: 24, hy: 16, w: 50, h: 33 },
    { id: 'lennon-glasses', label: 'Round glasses', hx: 22, hy: 15, w: 48, h: 28 },
    { id: 'cateye-glasses', label: 'Cat-eye glasses', hx: 27, hy: 13, w: 52, h: 28 },
    { id: 'star-glasses', label: 'Star glasses', hx: 27, hy: 12, w: 54, h: 30 },
    { id: 'mustache', label: 'Mustache', hx: 26, hy: 12, w: 52, h: 24 },
    { id: 'lips', label: 'Lips', hx: 22, hy: 13, w: 44, h: 30 },
    { id: 'tophat', label: 'Top hat', hx: 20, hy: 29, w: 40, h: 40 },
    { id: 'cowboyhat', label: 'Cowboy hat', hx: 24, hy: 18, w: 48, h: 34 },
    { id: 'partyhat', label: 'Party hat', hx: 17, hy: 24, w: 34, h: 42 },
    { id: 'monocle', label: 'Monocle', hx: 18, hy: 16, w: 40, h: 40 },
];

export const propSrc = (prop: PropDef): string => `${PROP_DIR}/${prop.id}.svg`;

/** Lookup by id, falling back to the first prop so callers never handle undefined. */
export const propById = (id: string | null | undefined): PropDef =>
    PROPS.find((p) => p.id === id) ?? PROPS[0];

/** A CSS `cursor` value for this prop — hotspot included. Callers must still
 *  append a keyword fallback (`…, zoom-in`): a url() cursor list that doesn't
 *  end in a keyword is invalid, and the element silently inherits instead. */
export const nativeCursor = (prop: PropDef): string =>
    `url('${propSrc(prop)}') ${prop.hx} ${prop.hy}`;

/** Target width at which a prop draws at its authored size. Wider targets scale
 *  the prop up proportionally, so the enlarged photo gets big goggles while the
 *  props keep their relative sizes.
 *
 *  This is the tuning knob: RAISE it to shrink the worn prop, lower it to grow.
 *  A landscape photo fills roughly 1240px on a 1440×900 screen, so 420 puts the
 *  granny glasses near 150px across — noticeably bigger than the 50px cursor on
 *  the wall, without the prop swallowing the face it's sitting on. */
const REFERENCE_WIDTH = 420;
const MIN_SCALE = 1.5; // never smaller than the wall's native cursor
const MAX_SCALE = 6; // and never a prop that eats the photo

export interface PropFollower {
    /** Swap the worn prop; keeps position and scale. */
    setProp(prop: PropDef): void;
    /** Re-measure the target and rescale. Called automatically on resize. */
    refresh(): void;
    /** Park the prop off-screen — e.g. when the view it belongs to closes. */
    hide(): void;
    /** Restore the native cursor and remove the element. */
    destroy(): void;
}

/**
 * Wear a prop over `target`, scaled to the target's width.
 *
 * Returns `null` when the device has no fine pointer (touch, where there is no
 * cursor to enlarge and no hover to track). Callers should treat that as "leave
 * the native cursor alone" rather than as a failure.
 */
export function createPropFollower(target: HTMLElement, layer: HTMLElement): PropFollower | null {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return null;

    let prop = PROPS[0];
    let scale = MIN_SCALE;
    let x = 0;
    let y = 0;

    const img = document.createElement('img');
    img.className = 'pw-prop-follower';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.src = propSrc(prop);
    layer.appendChild(img);

    // Inline, so the native cursor comes back on destroy() and stays untouched
    // on the no-fine-pointer path above — no global stylesheet surgery.
    const nativeCursorStyle = target.style.cursor;
    target.style.cursor = 'none';

    // Split deliberately: place() runs on every pointer move and touches only
    // `transform`, so the prop rides the compositor. resize() writes geometry
    // and is called only when the scale or the prop itself actually changes —
    // doing it per move would relayout and re-raster the drop-shadow each time.
    const resize = (): void => {
        img.style.width = `${prop.w * scale}px`;
        img.style.height = `${prop.h * scale}px`;
    };

    const place = (): void => {
        // Hotspot is authored in the SVG's own pixels — as a fraction of the
        // prop's rendered size it lands on the pointer at any scale.
        img.style.transform = `translate3d(${x - prop.hx * scale}px, ${y - prop.hy * scale}px, 0)`;
    };

    const show = (px: number, py: number): void => {
        x = px;
        y = py;
        img.classList.add('is-visible');
        place();
    };

    const onLeave = (): void => img.classList.remove('is-visible');

    // Where the pointer is right now, tracked document-wide — the target's own
    // pointermove can't tell us, because the case we need it for is the one
    // where the pointer never moves. Passive: we only ever read.
    let lastX = 0;
    let lastY = 0;
    let pointerSeen = false;
    const onDocMove = (e: PointerEvent): void => {
        if (e.pointerType === 'touch') return;
        lastX = e.clientX;
        lastY = e.clientY;
        pointerSeen = true;
    };

    /** The target can appear *under* a stationary pointer — click a frame and
     *  don't move, and no pointermove ever fires on the enlarged photo. Since
     *  the native cursor is off, that would leave nothing at all under the hand.
     *  So on every (re)measure, reveal the prop if the pointer is already over
     *  the target. If it isn't, stay hidden: the backdrop has its own cursor. */
    const revealIfUnderPointer = (): void => {
        if (!pointerSeen) return;
        const r = target.getBoundingClientRect();
        const inside = lastX >= r.left && lastX <= r.right && lastY >= r.top && lastY <= r.bottom;
        if (inside) show(lastX, lastY);
    };

    const measure = (): void => {
        const width = target.getBoundingClientRect().width;
        if (width <= 0) return; // hidden (display:none) — keep the last good scale
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / REFERENCE_WIDTH));
        resize();
        place();
        revealIfUnderPointer();
    };

    const onMove = (e: PointerEvent): void => {
        if (e.pointerType === 'touch') return;
        show(e.clientX, e.clientY);
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointermove', onDocMove, { passive: true });

    // The target resizes when the window does and when it swaps to a photo of a
    // different shape — both change the scale the prop should draw at.
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    measure();

    return {
        setProp(next: PropDef): void {
            prop = next;
            img.src = propSrc(next);
            resize();
            place();
        },
        refresh: measure,
        hide: onLeave,
        destroy(): void {
            observer.disconnect();
            target.removeEventListener('pointermove', onMove);
            target.removeEventListener('pointerleave', onLeave);
            document.removeEventListener('pointermove', onDocMove);
            target.style.cursor = nativeCursorStyle;
            img.remove();
        },
    };
}
