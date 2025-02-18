import { PageData, APIResponse } from '@banana-rodeo/shared';
import { getPageHits, incrementHits } from '../../../core/kv-client';

export class HitCounter {
    private element: HTMLElement;
    private pageUrl: string;
    private blinkClass = 'blink';
    private updateInterval: number = 30000; // 30 seconds
    private intervalId?: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.pageUrl = window.location.pathname;
        this.initialize();
    }

    private async initialize(): Promise<void> {
        // Initial increment and display
        await this.incrementAndDisplay();

        // Set up periodic updates
        this.intervalId = window.setInterval(() => {
            this.updateDisplay();
        }, this.updateInterval);
    }

    private async incrementAndDisplay(): Promise<void> {
        const response = await incrementHits(this.pageUrl);
        if (response.success && typeof response.data === 'number') {
            this.updateCounter(response.data);
        }
    }

    private async updateDisplay(): Promise<void> {
        const response = await getPageHits(this.pageUrl);
        if (response.success && response.data) {
            const pageData = response.data;
            if (pageData.hasHitCounter && typeof pageData.hits === 'number') {
                this.updateCounter(pageData.hits);
            }
        }
    }

    private updateCounter(count: number): void {
        // Format number with leading zeros (6 digits)
        const formattedCount = count.toString().padStart(6, '0');
        this.element.textContent = formattedCount;
        
        // Add blink effect
        this.element.classList.add(this.blinkClass);
        setTimeout(() => {
            this.element.classList.remove(this.blinkClass);
        }, 1000);
    }

    public destroy(): void {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
    }
} 