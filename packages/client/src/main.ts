import { initializePageStats } from './page-stats.js';
import { handleAuthRedirect } from './auth.js';
import { initializeCursor } from './cursor.js';

document.addEventListener('DOMContentLoaded', (): void => {
    // Check authentication first
    handleAuthRedirect();
    
    // Initialize features
    initializePageStats();
    initializeCursor();
}); 