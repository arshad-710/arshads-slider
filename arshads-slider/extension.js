/**
 * Arshad’s Slider - Webflow Designer Extension
 * Main Logic for interacting with the Webflow Designer API
 */

// Wait for Webflow to be ready
window.addEventListener('load', () => {
    console.log("Arshad's Slider Extension Initialized");
    pollForWebflow();
});

function pollForWebflow() {
    let attempts = 0;
    const maxAttempts = 20; // 5 seconds total
    const interval = setInterval(() => {
        attempts++;
        if (typeof webflow !== 'undefined') {
            clearInterval(interval);
            console.log("Webflow API Connected");
            initializeExtension();
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.error("Webflow API Connection Timeout");
        }
    }, 250);
}

async function initializeExtension() {
    const createBtn = document.getElementById('create-slider');
    const updateBtn = document.getElementById('update-slider');
    const form = document.getElementById('slider-form');

    // Subscribe to selection changes to show "Update" button if a slider is selected
    if (window.webflow) {
        webflow.subscribe('selection', async (element) => {
            if (element) {
                const attributes = await element.getAttributes();
                const isSlider = attributes.some(attr => attr.name === 'data-arshad-slider');
                if (isSlider) {
                    updateBtn.style.display = 'block';
                    createBtn.style.display = 'none';
                    // Optional: fill form with existing settings
                    // loadSliderSettings(element);
                } else {
                    updateBtn.style.display = 'none';
                    createBtn.style.display = 'block';
                }
            }
        });
    }

    createBtn.addEventListener('click', async () => {
        if (typeof webflow === 'undefined') {
            alert("🚀 ACTION REQUIRED: APP NOT CONNECTED\n\n1. If you just updated GitHub, wait 60 seconds.\n2. In Webflow Designer, press CTRL + R (or CMD + R) to refresh.\n3. Launch the App from the 'Apps' menu.");
            return;
        }

        try {
            const config = getFormConfig();
            await createSliderInWebflow(config);
            console.log("Slider created successfully!");
        } catch (error) {
            console.error("Arshad Slider Error:", error);
            alert("Error: " + error.message);
        }
    });

    updateBtn.addEventListener('click', async () => {
        if (typeof webflow === 'undefined') return;
        const element = await webflow.getSelectedElement();
        if (element) {
            const config = getFormConfig();
            await updateSliderInWebflow(element, config);
        }
    });
}

function getFormConfig() {
    const autoplayEnabled = document.getElementById('autoplay-enabled').value === 'true';

    return {
        loop: document.getElementById('loop').value === 'true',
        speed: parseInt(document.getElementById('speed').value),
        initialSlide: parseInt(document.getElementById('initialSlide').value),
        centeredSlides: document.getElementById('centeredSlides').value === 'true',
        autoplay: autoplayEnabled ? {
            delay: parseInt(document.getElementById('autoplay-delay').value),
            disableOnInteraction: false,
            pauseOnHover: document.getElementById('pauseOnHover').value === 'true'
        } : false,
        navigation: document.getElementById('nav-enabled').value === 'true',
        pagination: document.getElementById('pag-enabled').value === 'true' ? {
            type: document.getElementById('pag-type').value,
            clickable: document.getElementById('pag-clickable').value === 'true'
        } : false,
        effect: document.getElementById('effect').value,
        grabCursor: document.getElementById('grabCursor').value === 'true',
        slidesPerView: parseInt(document.getElementById('spv-desktop').value),
        spaceBetween: parseInt(document.getElementById('spaceBetween').value),
        breakpoints: {
            480: {
                slidesPerView: parseInt(document.getElementById('spv-mobile').value),
                spaceBetween: 10
            },
            768: {
                slidesPerView: parseInt(document.getElementById('spv-tablet').value),
                spaceBetween: 20
            },
            1200: {
                slidesPerView: parseInt(document.getElementById('spv-desktop').value),
                spaceBetween: parseInt(document.getElementById('spaceBetween').value)
            }
        }
    };
}

/**
 * Creates the Swiper DOM structure in Webflow
 */
async function createSliderInWebflow(config) {
    // Generate a unique ID for this slider
    const sliderId = 'arshad-slider-' + Math.floor(Math.random() * 10000);

    // Get the current page to insert the slider
    const selectedElement = await webflow.getSelectedElement();

    // Create Main Wrapper
    const mainWrapper = await webflow.createDOM(webflow.elementPresets.DivBlock);
    await mainWrapper.setStyles({
        position: 'relative',
        width: '100%',
        margin: '20px 0'
    });
    await mainWrapper.setAttribute('class', `arshad-slider-wrapper-main ${sliderId}`);

    // Create Swiper Container
    const container = await webflow.createDOM(webflow.elementPresets.DivBlock);
    await container.setAttribute('class', 'arshad-slide-container swiper');
    await container.setAttribute('data-arshad-slider', 'true');
    await container.setAttribute('data-swiper-config', JSON.stringify(config));

    // Create Swiper Wrapper
    const wrapper = await webflow.createDOM(webflow.elementPresets.DivBlock);
    await wrapper.setAttribute('class', 'arshad-slide-wrapper swiper-wrapper');

    // Create 3 dummy slides
    for (let i = 1; i <= 3; i++) {
        const slide = await webflow.createDOM(webflow.elementPresets.DivBlock);
        await slide.setAttribute('class', 'arshad-slide-item swiper-slide');
        await slide.setStyles({
            height: '300px',
            backgroundColor: '#222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            borderRadius: '8px'
        });
        const text = await webflow.createDOM(webflow.elementPresets.DivBlock);
        await text.setTextContent(`Arshad Slide ${i}`);
        await slide.append(text);
        await wrapper.append(slide);
    }

    await container.append(wrapper);

    // Add Pagination if enabled
    if (config.pagination) {
        const pag = await webflow.createDOM(webflow.elementPresets.DivBlock);
        await pag.setAttribute('class', 'arshad-slide-pagination swiper-pagination');
        await container.append(pag);
    }

    // Add Navigation if enabled
    if (config.navigation) {
        const next = await webflow.createDOM(webflow.elementPresets.DivBlock);
        await next.setAttribute('class', 'arshad-slide-next swiper-button-next');
        const prev = await webflow.createDOM(webflow.elementPresets.DivBlock);
        await prev.setAttribute('class', 'arshad-slide-prev swiper-button-prev');
        await container.append(next);
        await container.append(prev);
    }

    await mainWrapper.append(container);

    // Insert into Webflow
    if (selectedElement) {
        await selectedElement.append(mainWrapper);
    } else {
        const root = await webflow.getRootElement();
        await root.append(mainWrapper);
    }
}

/**
 * Injects required Swiper CSS/JS into the page via an Embed element
 */
async function injectRequiredScripts() {
    // Check if script already exists on page
    const root = await webflow.getRootElement();
    const children = await root.getChildren();
    const scriptExists = children.some(async (child) => {
        const classes = await child.getAttributes();
        return classes.some(attr => attr.name === 'class' && attr.value.includes('arshad-slider-scripts'));
    });

    if (scriptExists) return;

    // Create Embed element
    // Note: If webflow.elementPresets.Embed is not available, we use a custom code block injection if possible
    // For this version, we will instruct the user or use a Div with a custom attribute that the init script handles

    const setupInfo = `
    <!-- Arshad's Slider Setup -->
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
    <script>
        // Inline Swiper Init Logic (Simplified for Embed)
        (function() {
            function init() {
                document.querySelectorAll('.arshad-slide-container.swiper').forEach(el => {
                    if (el.swiper) return;
                    const config = JSON.parse(el.getAttribute('data-swiper-config'));
                    new Swiper(el, {
                        ...config,
                        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                        pagination: { el: '.swiper-pagination', clickable: true }
                    });
                });
            }
            window.addEventListener('load', init);
            // Re-init for Webflow interactions/tabs
            setInterval(init, 2000);
        })();
    </script>
    `;

    console.log("Arshad's Slider: Please ensure the initialization script is added to your project settings.");
}

async function findElementByClass(className) {
    // Utility to find if element already exists
    return null; // Simplified for now
}
