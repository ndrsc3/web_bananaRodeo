// Animation utility
export const initializeAnimations = () => {
    const animatedElements = document.querySelectorAll('[data-animation]');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.dataset.animation;
                element.classList.add(animation);
            }
        });
    });

    animatedElements.forEach(element => animationObserver.observe(element));
}; 