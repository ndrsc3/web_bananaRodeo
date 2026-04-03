import { bananaHooks } from './banana-hooks.js';

const GOLDEN_CHANCE = 1 / 30;
const ROTTEN_CHANCE = 1 / 40;
const SPAWN_INTERVAL_MS = 1000;

const activeBananas = new Set<HTMLElement>();
let rainContainer: HTMLElement | null = null;
let isReversed = false;
let isShrunk = false;

// --- Particle helpers ---

function createSplitBanana(x: number, y: number, angle: number): void {
  const el = document.createElement('div');
  el.className = 'banana banana-split small';
  el.textContent = '🍌';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.setProperty('--split-x', Math.cos(angle) * 100 + 'px');
  el.style.setProperty('--split-y', Math.sin(angle) * 100 + 'px');
  rainContainer!.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function createBurstBanana(x: number, y: number, angle: number, distance: number): void {
  const el = document.createElement('div');
  el.className = 'banana banana-burst';
  el.textContent = '🍌';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.setProperty('--burst-x', Math.cos(angle) * distance + 'px');
  el.style.setProperty('--burst-y', Math.sin(angle) * distance + 'px');
  rainContainer!.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// --- Banana factory ---

function createBanana(): void {
  if (!rainContainer) return;

  const el = document.createElement('div');

  const roll = Math.random();
  const isGolden = roll < GOLDEN_CHANCE;
  const isRotten = !isGolden && roll < GOLDEN_CHANCE + ROTTEN_CHANCE;

  const sizes = ['small', 'medium', 'large'];
  const size = sizes[Math.floor(Math.random() * sizes.length)];

  el.className = 'banana ' + size;
  if (isGolden) el.classList.add('banana-golden');
  if (isRotten) el.classList.add('banana-rotten');
  if (isReversed) el.classList.add('banana-reverse');
  if (isShrunk) {
    el.classList.remove('medium', 'large');
    el.classList.add('small');
  }

  el.textContent = '🍌';
  el.style.left = Math.random() * 100 + 'vw';

  // Set animation to play once so animationend fires for cleanup
  let duration = Math.random() * 3 + 5;
  if (size === 'small') duration *= 0.9;
  if (size === 'large') duration *= 1.1;
  el.style.animationDuration = duration + 's';
  el.style.animationIterationCount = '1';

  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    activeBananas.delete(el);
    el.remove();

    if (isGolden) {
      bananaHooks.emit('banana:golden', { x: cx, y: cy });
    } else if (isRotten) {
      bananaHooks.emit('banana:rotten', { x: cx, y: cy });
      // Rotten splat — 3 pieces fly out
      for (let i = 0; i < 3; i++) {
        const angle = (i * (Math.PI * 2)) / 3 + Math.random() * 0.5;
        createSplitBanana(cx, cy, angle);
      }
    } else {
      // Normal split
      for (let i = 0; i < 3; i++) {
        const angle = (i * (Math.PI * 2)) / 3 + Math.random() * 0.5;
        createSplitBanana(cx, cy, angle);
      }
    }

    bananaHooks.emit('banana:click', { x: cx, y: cy, size, isGolden, isRotten });
  });

  el.addEventListener('animationend', () => {
    activeBananas.delete(el);
    el.remove();
  });

  rainContainer.appendChild(el);
  activeBananas.add(el);
}

// --- Rain control ---

export function startRain(containerId = 'bananaRain'): void {
  rainContainer = document.getElementById(containerId);
  if (!rainContainer) return;

  // Golden burst
  bananaHooks.on('banana:golden', ({ x, y }) => {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 80 + Math.random() * 80;
      createBurstBanana(x, y, angle, distance);
    }
  });

  // Rotten rain effects
  bananaHooks.on('banana:rotten', () => {
    bananaHooks.emit('rain:shrink-all', {});
    bananaHooks.emit('rain:reverse', { duration: 5000 });
  });

  // Rain state listeners
  bananaHooks.on('rain:shrink-all', () => {
    isShrunk = true;
    activeBananas.forEach((b) => {
      b.classList.remove('medium', 'large');
      b.classList.add('small');
    });
  });

  bananaHooks.on('rain:reverse', ({ duration }) => {
    isReversed = true;
    activeBananas.forEach((b) => b.classList.add('banana-reverse'));
    setTimeout(() => bananaHooks.emit('rain:restore', {}), duration);
  });

  bananaHooks.on('rain:restore', () => {
    isReversed = false;
    isShrunk = false;
    activeBananas.forEach((b) => b.classList.remove('banana-reverse'));
  });

  createBanana();
  setInterval(createBanana, SPAWN_INTERVAL_MS);
}
