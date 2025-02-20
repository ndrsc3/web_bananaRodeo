import { initializePageStats } from './features/page-stats.js';
import { initializeAnimations } from './core/animations.js';
import { lazyLoadImages } from './core/image-loader.js';

document.addEventListener('DOMContentLoaded', (): void => {
    // Initialize features
    initializePageStats();
    initializeAnimations();
    lazyLoadImages();

    // Mobile menu toggle
    const mobileMenuBtn: HTMLElement | null = document.querySelector('.mobile-menu-btn');
    const navList: HTMLElement | null = document.querySelector('.nav-list');

    if (mobileMenuBtn && navList) {
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', function(this: HTMLElement) {
            mobileMenuBtn.classList.toggle('active');
            navList.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!mobileMenuBtn.contains(target) && !navList.contains(target)) {
                mobileMenuBtn.classList.remove('active');
                navList.classList.remove('active');
            }
        });

        // Handle window resize
        window.addEventListener('resize', (): void => {
            if (window.innerWidth > 768) {
                mobileMenuBtn.classList.remove('active');
                navList.classList.remove('active');
            }
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
}); 