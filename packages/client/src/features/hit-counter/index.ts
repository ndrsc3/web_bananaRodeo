import { HitCounter } from './components/HitCounter';

export function initializeHitCounters(): void {
    const hitCounters = document.querySelectorAll('.hit-counter');
    
    hitCounters.forEach(counter => {
        if (counter instanceof HTMLElement) {
            new HitCounter(counter);
        }
    });
}

export { HitCounter }; 