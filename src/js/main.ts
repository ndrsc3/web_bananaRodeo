import { initializeAnimations } from './utils/animations';
import { lazyLoadImages } from './utils/imageLoader';

document.addEventListener('DOMContentLoaded', (): void => {
    // Initialize utilities
    initializeAnimations();
    lazyLoadImages();

    // Mobile menu toggle
    const mobileMenuBtn: HTMLElement | null = document.querySelector('.mobile-menu-btn');
    const mainNav: HTMLElement | null = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function(this: HTMLElement) {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Handle dropdown menus on mobile
    const dropdowns: NodeListOf<HTMLElement> = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach((dropdown: HTMLElement) => {
        dropdown.addEventListener('click', function(this: HTMLElement, e: Event) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdownContent = this.querySelector('.dropdown-content');
                dropdownContent?.classList.toggle('show');
            }
        });
    });

    // Scroll reveal
    const revealElements: NodeListOf<HTMLElement> = document.querySelectorAll('.reveal-on-scroll');
    
    function checkReveal(): void {
        revealElements.forEach((element: HTMLElement) => {
            const elementTop: number = element.getBoundingClientRect().top;
            const windowHeight: number = window.innerHeight;
            
            if (elementTop < windowHeight * 0.85) {
                element.classList.add('revealed');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Initial check
}); 