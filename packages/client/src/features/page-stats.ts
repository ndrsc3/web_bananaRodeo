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
        console.info('🍌 PageStats: Initializing', { 
            pageUrl: this.pageUrl,
            element: element.outerHTML
        });
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            console.debug('🍌 PageStats: Starting initialization');
            await this.incrementAndDisplay();
            
            this.intervalId = window.setInterval(() => {
                console.debug('🍌 PageStats: Running scheduled update');
                this.updateDisplay();
            }, this.updateInterval);
            
            console.info('🍌 PageStats: Initialized successfully', { 
                updateInterval: this.updateInterval 
            });
        } catch (error) {
            console.error('🍌 PageStats: Initialization failed', { error });
        }
    }

    private async incrementAndDisplay(): Promise<void> {
        try {
            console.debug('🍌 PageStats: Incrementing hits', { pageUrl: this.pageUrl });
            const response = await incrementHits(this.pageUrl);
            
            if (response.success && typeof response.data === 'number') {
                console.info('🍌 PageStats: Increment successful', { 
                    pageUrl: this.pageUrl,
                    newHitCount: response.data 
                });
                this.updateCounter(response.data);
            } else {
                console.warn('🍌 PageStats: Invalid increment response', { 
                    pageUrl: this.pageUrl,
                    response 
                });
            }
        } catch (error) {
            console.error('🍌 PageStats: Increment failed', { 
                pageUrl: this.pageUrl,
                error 
            });
        }
    }

    private async updateDisplay(): Promise<void> {
        try {
            console.debug('🍌 PageStats: Updating display', { pageUrl: this.pageUrl });
            const response = await getPageHits(this.pageUrl);
            
            if (response.success && response.data) {
                const pageData = response.data;
                if (pageData.hasHitCounter && typeof pageData.hits === 'number') {
                    console.info('🍌 PageStats: Display updated', { 
                        pageUrl: this.pageUrl,
                        hits: pageData.hits 
                    });
                    this.updateCounter(pageData.hits);
                } else {
                    console.warn('🍌 PageStats: Invalid page data', { 
                        pageUrl: this.pageUrl,
                        pageData 
                    });
                }
            }
        } catch (error) {
            console.error('🍌 PageStats: Update failed', { 
                pageUrl: this.pageUrl,
                error 
            });
        }
    }

    private updateCounter(count: number): void {
        const formattedCount = `Visitors: ${count.toString().padStart(6, '0')}`;
        this.element.textContent = formattedCount;
        
        this.element.classList.add(this.blinkClass);
        setTimeout(() => {
            this.element.classList.remove(this.blinkClass);
        }, 1000);

        console.debug('🍌 PageStats: Counter updated', { 
            count,
            formattedDisplay: formattedCount 
        });
    }

    public destroy(): void {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            console.info('🍌 PageStats: Destroyed', { pageUrl: this.pageUrl });
        }
    }
}

export function initializePageStats(): void {
    const statsElements = document.querySelectorAll('.page-stats');
    console.info('Initializing page stats elements', { 
        elementCount: statsElements.length 
    });
    
    statsElements.forEach(element => {
        if (element instanceof HTMLElement) {
            new PageStats(element);
        }
    });
} 