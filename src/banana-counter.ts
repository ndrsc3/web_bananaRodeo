import { bananaHooks } from './banana-hooks.js';

let personal = 0;
let localCollective = 0;
let multiplier = 1;
let multiplierTimer: ReturnType<typeof setTimeout> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;

let personalEl: HTMLElement | null = null;
let collectiveEl: HTMLElement | null = null;
let multiplierWidget: HTMLElement | null = null;

function formatCount(n: number): string {
  return String(Math.max(0, n)).padStart(6, '0');
}

function updateDisplay(): void {
  if (personalEl) personalEl.textContent = formatCount(personal);
  if (collectiveEl) collectiveEl.textContent = formatCount(localCollective);
}

function startMultiplierDisplay(duration: number): void {
  if (!multiplierWidget) return;
  multiplierWidget.style.display = 'block';
  let remaining = Math.ceil(duration / 1000);
  multiplierWidget.textContent = `🌟 ×5 BONUS — ${remaining}s`;
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remaining--;
    if (multiplierWidget) multiplierWidget.textContent = `🌟 ×5 BONUS — ${remaining}s`;
    if (remaining <= 0 && countdownInterval) clearInterval(countdownInterval);
  }, 1000);
}

function stopMultiplierDisplay(): void {
  if (multiplierWidget) multiplierWidget.style.display = 'none';
  if (countdownInterval) clearInterval(countdownInterval);
}

export async function initCounter(): Promise<void> {
  personalEl = document.getElementById('personalCount');
  collectiveEl = document.getElementById('collectiveCount');
  multiplierWidget = document.getElementById('multiplierWidget');

  // Fetch collective total once at game start
  try {
    const res = await fetch('/api/banana-counter');
    if (res.ok) {
      const data = await res.json();
      localCollective = data.total ?? 0;
    }
  } catch {
    localCollective = 0;
  }
  updateDisplay();

  // Normal + golden click — increment both counts locally
  bananaHooks.on('banana:click', ({ isRotten }) => {
    if (isRotten) return;
    personal += multiplier;
    localCollective += multiplier;
    updateDisplay();
  });

  // Rotten click — subtract from both
  bananaHooks.on('banana:rotten', () => {
    const delta = -3;
    personal = Math.max(0, personal + delta);
    localCollective = Math.max(0, localCollective + delta);
    updateDisplay();
  });

  // Golden click — start multiplier
  bananaHooks.on('banana:golden', () => {
    bananaHooks.emit('multiplier:start', { duration: 10000 });
  });

  bananaHooks.on('multiplier:start', ({ duration }) => {
    multiplier = 5;
    startMultiplierDisplay(duration);
    if (multiplierTimer) clearTimeout(multiplierTimer);
    multiplierTimer = setTimeout(() => {
      multiplier = 1;
      bananaHooks.emit('multiplier:end', {});
    }, duration);
  });

  bananaHooks.on('multiplier:end', () => {
    multiplier = 1;
    stopMultiplierDisplay();
  });
}

export function getPersonalCount(): number {
  return personal;
}

export async function flushCounter(): Promise<number> {
  if (personal === 0) return localCollective;
  try {
    const res = await fetch('/api/banana-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: personal }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.total ?? localCollective;
    }
  } catch {
    // best-effort flush
  }
  return localCollective;
}
