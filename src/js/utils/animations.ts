// Animation utility
export const initializeAnimations = (): void => {
    const animatedElements: NodeListOf<HTMLElement> = document.querySelectorAll('[data-animation]');
    
    const animationObserver: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target as HTMLElement;
                const animation = element.dataset.animation;
                if (animation) {
                    element.classList.add(animation);
                }
            }
        });
    });

    animatedElements.forEach(element => animationObserver.observe(element));
}; 