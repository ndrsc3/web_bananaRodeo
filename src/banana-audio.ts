import { bananaHooks } from './banana-hooks.js';

const STORAGE_KEY = 'banana-audio-muted';

let muted = true;
let clickAudio: HTMLAudioElement | null = null;
let rottenAudio: HTMLAudioElement | null = null;
let toggleBtn: HTMLButtonElement | null = null;

function play(sound: 'click' | 'rotten'): void {
  if (muted) return;
  const audio = sound === 'click' ? clickAudio : rottenAudio;
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function updateToggle(): void {
  if (!toggleBtn) return;
  toggleBtn.textContent = muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
}

export function toggleMute(): void {
  muted = !muted;
  localStorage.setItem(STORAGE_KEY, String(muted));
  updateToggle();
}

export function initAudio(btnId = 'audioToggle'): void {
  // Read persisted state — default muted
  const stored = localStorage.getItem(STORAGE_KEY);
  muted = stored === null ? true : stored === 'true';

  // Preload sounds (placed at public/assets/audio/)
  clickAudio = new Audio('/assets/audio/banana-click.mp3');
  clickAudio.preload = 'auto';
  rottenAudio = new Audio('/assets/audio/rotten-banana.mp3');
  rottenAudio.preload = 'auto';

  // Wire toggle button
  toggleBtn = document.getElementById(btnId) as HTMLButtonElement | null;
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMute);
    updateToggle();
  }

  // Hook handlers — skip click sound on rotten (sad clown plays instead)
  bananaHooks.on('banana:click', ({ isRotten }) => {
    if (!isRotten) play('click');
  });
  bananaHooks.on('banana:rotten', () => play('rotten'));
}
