import { CursorEffect, Web1Asset } from '@banana-rodeo/shared';

// Dynamic imports for better performance
const loadCursorEffects = async () => {
    const { initializeCursorEffects } = await import('./features/cursor-effects');
    initializeCursorEffects();
};

const loadHitCounter = async () => {
    const { initializeHitCounter } = await import('./features/hit-counter');
    initializeHitCounter();
};

const loadWebamp = async () => {
    const { initializeWebamp } = await import('./features/webamp');
    initializeWebamp();
};

// Initialize features
document.addEventListener('DOMContentLoaded', () => {
    loadCursorEffects();
    loadHitCounter();
    loadWebamp();
}); 