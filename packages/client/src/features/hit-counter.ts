import { HitCount } from '@banana-rodeo/shared';

export const initializeHitCounter = async () => {
    const counterElement = document.getElementById('hit-counter');
    if (!counterElement) return;

    try {
        const response = await fetch('/api/hit-counter');
        const data: HitCount = await response.json();
        
        // Create retro-style counter display
        const counterHTML = `
            <div class="hit-counter-container">
                <div class="hit-counter-label">Visitors:</div>
                <div class="hit-counter-digits">
                    ${String(data.count).padStart(6, '0').split('').map(digit => 
                        `<span class="digit">${digit}</span>`
                    ).join('')}
                </div>
                <div class="hit-counter-updated">Last Updated: ${new Date(data.lastUpdated).toLocaleString()}</div>
            </div>
        `;
        
        counterElement.innerHTML = counterHTML;
    } catch (error) {
        console.error('Failed to load hit counter:', error);
        counterElement.innerHTML = '<div class="error">Hit Counter Unavailable</div>';
    }
}; 