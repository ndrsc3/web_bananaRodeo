import { incrementHits } from './kv-client.js';

/**
 * Updates the hit counter display with a blinking effect
 */
function updateCounter(element: HTMLElement, count: number): void {
    // Format number with leading zeros (6 digits)
    const formattedCount = count.toString().padStart(6, '0');
    element.textContent = formattedCount;
    
    // Add blink effect
    element.classList.add('blink');
    setTimeout(() => {
        element.classList.remove('blink');
    }, 1000);
}

/**
 * Initialize hit counter for a page - web 1.0 style
 */
export async function initializePageStats(): Promise<void> {
    const statsElement = document.querySelector('.hit-count');
    if (!(statsElement instanceof HTMLElement)) return;

    try {
        const pageUrl = window.location.pathname;
        const count = await incrementHits(pageUrl);
        updateCounter(statsElement, count);
    } catch (error) {
        console.error('[HitCounter] Failed to update counter:', error);
        statsElement.textContent = '------';
    }
} 