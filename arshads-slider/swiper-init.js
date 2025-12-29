/**
 * Arshad’s Slider - Swiper Initialization Script
 * This script should be placed in the <footer> or Site Settings of the Webflow project.
 */

(function () {
    // 1. Load Swiper CSS/JS dynamically if not already present
    function loadAssets(callback) {
        let swiperJSLoaded = !!window.Swiper;
        let swiperCSSLoaded = !!document.querySelector('link[href*="swiper-bundle.min.css"]');

        if (!swiperCSSLoaded) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
            document.head.appendChild(link);
        }

        if (!swiperJSLoaded) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
            script.onload = callback;
            document.body.appendChild(script);
        } else {
            callback();
        }
    }

    // 2. Initialize all Sliders
    function initSliders() {
        const sliderContainers = document.querySelectorAll('.arshad-slide-container.swiper');

        sliderContainers.forEach(container => {
            // Avoid double initialization
            if (container.swiper) return;

            const configStr = container.getAttribute('data-swiper-config');
            if (!configStr) return;

            try {
                const config = JSON.parse(configStr);

                // Add default classes for navigation/pagination if they exist
                const finalConfig = {
                    ...config,
                    navigation: config.navigation ? {
                        nextEl: container.querySelector('.swiper-button-next'),
                        prevEl: container.querySelector('.swiper-button-prev'),
                    } : false,
                    pagination: config.pagination ? {
                        el: container.querySelector('.swiper-pagination'),
                        type: config.pagination.type,
                        clickable: config.pagination.clickable
                    } : false,
                };

                // Initialize Swiper
                new Swiper(container, finalConfig);
                console.log("Initialized Arshad Slider:", container);
            } catch (e) {
                console.error("Failed to parse Swiper config for:", container, e);
            }
        });
    }

    // Run when assets are ready
    loadAssets(() => {
        // Initial run
        initSliders();

        // Support for Webflow CMS / Ajax content (Observer)
        const observer = new MutationObserver((mutations) => {
            initSliders();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });

})();

// Add some default styles for Arshad's Slider
const style = document.createElement('style');
style.textContent = `
    .arshad-slide-container {
        width: 100%;
        height: auto;
        overflow: hidden;
    }
    .arshad-slide-item {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    /* Arrows styling to ensure they show on dark/light */
    .arshad-slide-next, .arshad-slide-prev {
        color: #007aff !important;
    }
    .swiper-pagination-bullet-active {
        background: #007aff !important;
    }
`;
document.head.appendChild(style);
