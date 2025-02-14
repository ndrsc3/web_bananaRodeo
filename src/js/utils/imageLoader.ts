// Image loading utility
export const lazyLoadImages = (): void => {
    const images: NodeListOf<HTMLImageElement> = document.querySelectorAll('[data-src]');
    
    const imageObserver: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                const dataSrc = img.dataset.src;
                if (dataSrc) {
                    img.src = dataSrc;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}; 