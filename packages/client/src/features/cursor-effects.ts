import { CursorEffect } from '@banana-rodeo/shared';

// Use static path for cursor image
const bananaTrailImage = '/assets/gifs/DancingBanana.gif';

const TRAIL_LENGTH = 20;
const TRAIL_DELAY = 100;

export const initializeCursorEffects = () => {
    const trailElements: HTMLImageElement[] = [];
    let lastX = 0;
    let lastY = 0;

    // Create trail elements
    for (let i = 0; i < TRAIL_LENGTH; i++) {
        const trail = document.createElement('img');
        trail.src = bananaTrailImage;
        trail.style.position = 'fixed';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9999';
        trail.style.opacity = `${1 - (i / TRAIL_LENGTH)}`;
        trail.style.width = '16px';
        trail.style.height = '16px';
        document.body.appendChild(trail);
        trailElements.push(trail);
    }

    // Update trail positions
    const updateTrail = (x: number, y: number) => {
        lastX = x;
        lastY = y;
        
        trailElements.forEach((trail, index) => {
            setTimeout(() => {
                trail.style.left = `${x}px`;
                trail.style.top = `${y}px`;
            }, index * TRAIL_DELAY);
        });
    };

    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            updateTrail(e.clientX, e.clientY);
        });
    });
}; 