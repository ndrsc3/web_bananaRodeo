import { CursorConfig, CursorState, CursorTrail } from './types.js';

export class Cursor {
    private config: CursorConfig;
    private state: CursorState;
    private cursorElement!: HTMLElement;
    private trailElements: HTMLElement[] = [];
    private animationFrameId: number | null = null;
    private containerElement: HTMLElement;

    constructor(config: CursorConfig = {}, container: HTMLElement) {
        this.containerElement = container;
        this.config = {
            image: config.image,
            trail: {
                type: config.trail?.type || 'none',
                emoji: config.trail?.emoji,
                length: config.trail?.length || 10,
                spacing: config.trail?.spacing || 5,
                size: config.trail?.size || 20
            }
        };

        this.state = {
            x: 0,
            y: 0,
            trail: []
        };

        this.initialize();
    }

    private initialize(): void {
        // Hide default cursor only on the container and its children
        const styleElement = document.createElement('style');
        const containerId = `cursor-container-${Date.now()}`;
        this.containerElement.id = containerId;
        styleElement.textContent = `
            #${containerId}, #${containerId} * {
                cursor: none !important;
            }
            #${containerId} a {
                cursor: none !important;
            }
        `;
        document.head.appendChild(styleElement);

        // Create cursor element
        this.cursorElement = document.createElement('div');
        this.cursorElement.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            width: 32px;
            height: 32px;
            transform: translate(-50%, -50%) scale(1);
            transition: transform 0.2s ease;
        `;

        if (this.config.image) {
            this.cursorElement.style.backgroundImage = `url(${this.config.image})`;
            this.cursorElement.style.backgroundSize = 'contain';
            this.cursorElement.style.backgroundRepeat = 'no-repeat';
        }

        // Create trail elements if needed
        if (this.config.trail?.type !== 'none') {
            for (let i = 0; i < (this.config.trail?.length || 0); i++) {
                const trailElement = document.createElement('div');
                trailElement.style.cssText = `
                    position: fixed;
                    pointer-events: none;
                    z-index: 9998;
                    width: ${(this.config.trail?.size || 20)}px;
                    height: ${(this.config.trail?.size || 20)}px;
                    transform: translate(-50%, -50%);
                    opacity: ${1 - (i / (this.config.trail?.length || 1))};
                `;

                if (this.config.trail?.type === 'emoji' && this.config.trail?.emoji) {
                    trailElement.textContent = this.config.trail.emoji;
                }

                this.trailElements.push(trailElement);
                document.body.appendChild(trailElement);
            }
        }

        document.body.appendChild(this.cursorElement);
        this.setupEventListeners();
        this.startAnimation();
    }

    private setupEventListeners(): void {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.state.x = e.clientX;
            this.state.y = e.clientY;
            this.state.trail.unshift({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
            this.state.trail = this.state.trail.slice(0, this.config.trail?.length || 0);
        });

        // Handle hover states for links only
        this.containerElement.addEventListener('mouseover', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A') {
                this.cursorElement.style.transform = 'translate(-50%, -50%) scale(1.2) rotate(15deg)';
            }
        });

        this.containerElement.addEventListener('mouseout', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A') {
                this.cursorElement.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
            }
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursorElement.style.display = 'none';
        });

        document.addEventListener('mouseenter', () => {
            this.cursorElement.style.display = 'block';
        });
    }

    private updateCursor(): void {
        this.cursorElement.style.left = `${this.state.x}px`;
        this.cursorElement.style.top = `${this.state.y}px`;
    }

    private updateTrail(): void {
        if (this.config.trail?.type === 'none') return;

        this.trailElements.forEach((element, index) => {
            const trailPoint = this.state.trail[index];
            if (!trailPoint) return;

            element.style.left = `${trailPoint.x}px`;
            element.style.top = `${trailPoint.y}px`;

            if (this.config.trail?.type === 'rainbow') {
                const hue = (index * 360) / (this.config.trail?.length || 1);
                element.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
            }
        });
    }

    private startAnimation(): void {
        const animate = () => {
            this.updateCursor();
            this.updateTrail();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    public destroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Remove the style element
        const styleElement = document.querySelector(`style[data-cursor-${this.containerElement.id}]`);
        if (styleElement) {
            styleElement.remove();
        }
        // Remove container ID
        this.containerElement.removeAttribute('id');
        
        this.cursorElement.remove();
        this.trailElements.forEach(element => element.remove());
    }
}

// Initialize cursor with default configuration
export function initializeCursor(): void {
    const cursorConfigElement = document.querySelector('[data-cursor-config]');
    if (!cursorConfigElement) return; // Only initialize if config element exists

    try {
        const config = JSON.parse(cursorConfigElement.getAttribute('data-cursor-config') || '{}');
        new Cursor(config, document.body);
    } catch (e) {
        console.warn('Invalid cursor configuration:', e);
    }
} 