import { initializePageStats } from './page-stats.js';
import { handleAuthRedirect } from './auth.js';
import { initializeCursor } from './cursor.js';

document.addEventListener('DOMContentLoaded', (): void => {
    // Check authentication first
    handleAuthRedirect();

    // Initialize features
    initializePageStats();
    initializeCursor();

    // Easter egg: 3rd dancing banana in header → leaderboard
    const eggBanana = document.getElementById('dancing-banana-3');
    if (eggBanana) {
        eggBanana.style.cursor = 'pointer';
        eggBanana.addEventListener('click', () => {
            window.location.href = '/pages/leaderboard.html';
        });
    }
});
