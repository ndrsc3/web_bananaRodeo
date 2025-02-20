import { getPageHits, incrementHits } from '../core/kv-client.js';

export class PageStats {
    private element: HTMLElement;
    private pageUrl: string;
    private blinkClass = 'blink';
    private updateInterval: number = 30000; // 30 seconds
    private intervalId?: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.pageUrl = window.location.pathname;
        console.log('[PageStats] Initializing for page:', this.pageUrl);
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            console.log('[PageStats] Starting initialization');
            await this.incrementAndDisplay();
            
            this.intervalId = window.setInterval(() => {
                this.updateDisplay();
            }, this.updateInterval);
            console.log('[PageStats] Initialized successfully');
        } catch (error) {
            console.error('[PageStats] Initialization failed:', error);
        }
    }

    private async incrementAndDisplay(): Promise<void> {
        try {
            console.log('[PageStats] Attempting to increment hits');
            const response = await incrementHits(this.pageUrl);
            console.log('[PageStats] Increment response:', response);
            
            if (response.success && typeof response.data === 'number') {
                this.updateCounter(response.data);
            } else {
                console.warn('[PageStats] Invalid response format:', response);
            }
        } catch (error) {
            console.error('[PageStats] Error incrementing hits:', error);
        }
    }

    private async updateDisplay(): Promise<void> {
        try {
            console.log('[PageStats] Updating display');
            const response = await getPageHits(this.pageUrl);
            console.log('[PageStats] Update response:', response);
            
            if (response.success && response.data) {
                const pageData = response.data;
                if (pageData.hasHitCounter && typeof pageData.hits === 'number') {
                    this.updateCounter(pageData.hits);
                } else {
                    console.warn('[PageStats] Invalid page data format:', pageData);
                }
            }
        } catch (error) {
            console.error('[PageStats] Error updating display:', error);
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

export function initializePageStats(): void {
    const statsElements = document.querySelectorAll('.page-stats');
    statsElements.forEach(element => {
        if (element instanceof HTMLElement) {
            new PageStats(element);
        }
    });
} 