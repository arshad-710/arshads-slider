/**
 * Arshad’s Slider - Webflow Designer Extension
 * Main Logic for interacting with the Webflow Designer API
 */

// Global state for connection
let isConnected = false;

// 1. Initialize immediately (so buttons work)
document.addEventListener('DOMContentLoaded', () => {
    console.log("Arshad's Slider UI Ready");
    initializeExtension();
    pollForWebflow();
});

// 2. Poll for the Webflow API object
function pollForWebflow() {
    const statusEl = document.getElementById('connection-status');
    let attempts = 0;
    const maxAttempts = 30; // 7.5 seconds

    const interval = setInterval(() => {
        attempts++;
        if (typeof webflow !== 'undefined') {
            clearInterval(interval);
            isConnected = true;
            statusEl.innerText = "🟢 Connected to Webflow Designer";
            statusEl.style.color = "#4ade80";
            console.log("Webflow API Connected");
            setupSelectionListener();
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            statusEl.innerText = "❌ Connection Failed (Is this Webflow?)";
            statusEl.style.color = "#ff4d4d";
            console.error("Webflow API Connection Timeout");
        }
    }, 250);
}

// 3. Setup Button Listeners immediately
async function initializeExtension() {
    const createBtn = document.getElementById('create-slider');
    const updateBtn = document.getElementById('update-slider');

    createBtn.addEventListener('click', async () => {
        console.log("Create Button Clicked");
        if (!isConnected) {
            alert("🚀 APP NOT CONNECTED YET\n\n1. Wait for the green '🟢 Connected' text at the top.\n2. In Webflow, press CTRL + SHIFT + R to force refresh.\n3. Make sure you are inside the Webflow Designer.");
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
        if (!isConnected) return;
        try {
            const element = await webflow.getSelectedElement();
            if (element) {
                const config = getFormConfig();
                await updateSliderInWebflow(element, config);
            }
        } catch (e) {
            console.error(e);
        }
    });
}

// 4. Setup selection only after connected
async function setupSelectionListener() {
    const createBtn = document.getElementById('create-slider');
    const updateBtn = document.getElementById('update-slider');

    webflow.subscribe('selection', async (element) => {
        if (element) {
            try {
                const attributes = await element.getAttributes();
                const isSlider = attributes.some(attr => attr.name === 'data-arshad-slider');
                if (isSlider) {
                    updateBtn.style.display = 'block';
                    createBtn.style.display = 'none';
                } else {
                    updateBtn.style.display = 'none';
                    createBtn.style.display = 'block';
                }
            } catch (e) {
                console.warn("Selection skip:", e);
            }
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

async function updateSliderInWebflow(element, config) {
    // Basic update logic: update the config attribute
    await element.setAttribute('data-swiper-config', JSON.stringify(config));
    alert("Slider settings updated! Refresh the page to see changes in preview.");
}
