/**
 * DYNAMIC CONTENT MANAGER
 * Handles Bi-directional Stitching, Iframe Memory Killing, and Scroll Detection
 */

const CONFIG = {
    rootMarginStitch: '10% 0px 400px 0px', 
    rootMarginMemory: '2000px 0px', 
};

let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
let userHasScrolled = false; // Guard to prevent auto-loading previous pages on landing

// 1. STITCHING OBSERVER
const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Check if user has actually moved significantly (prevents landing trigger)
    if (!userHasScrolled && Math.abs(currentScrollY - lastScrollY) > 20) {
        userHasScrolled = true;
    }

    const isAtTop = currentScrollY <= 5;
    const isScrollingUp = currentScrollY < lastScrollY || isAtTop;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const trigger = entry.target;
            
            // BOTTOM TRIGGER
            if (trigger.classList.contains('next-page-trigger')) {
                console.log("Trigger: Bottom reached.");
                loadSection(trigger.dataset.nextUrl, 'bottom', trigger);
            } 
            // TOP TRIGGER (Only fires if user intentionally scrolled up)
            else if (trigger.classList.contains('prev-page-trigger')) {
                if (isScrollingUp && userHasScrolled && trigger.dataset.prevUrl) {
                    console.log("Trigger: Top reached via upward scroll.");
                    loadSection(trigger.dataset.prevUrl, 'top', trigger);
                }
            }
        }
    });

    lastScrollY = currentScrollY;
}, { rootMargin: CONFIG.rootMarginStitch });

// 2. MEMORY OBSERVER (Toggles visibility and kills/revives Iframes)
const memoryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const section = entry.target;
        const iframes = section.querySelectorAll('iframe');
        
        if (entry.isIntersecting) {
            section.classList.remove('is-offscreen');
            // REVIVE: Put source back
            iframes.forEach(iframe => {
                if (iframe.dataset.src) iframe.src = iframe.dataset.src;
            });
        } else {
            section.classList.add('is-offscreen');
            // KILL: Empty source to save CPU/RAM
            iframes.forEach(iframe => {
                if (iframe.src && iframe.src !== 'about:blank') {
                    iframe.dataset.src = iframe.src;
                    iframe.src = 'about:blank';
                }
            });
        }
    });
}, { rootMargin: CONFIG.rootMarginMemory });

async function loadSection(url, direction, trigger) {
    if (!url || trigger.classList.contains('loading')) return;
    
    console.log(`Fetching: ${url}`);
    trigger.classList.add('loading');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newArea = doc.querySelector('#content-stitching-area');
        
        if (!newArea) return;

        const container = document.getElementById('content-stitching-area');
        const newContent = newArea.innerHTML;

        if (direction === 'bottom') {
            trigger.remove();
            container.insertAdjacentHTML('beforeend', newContent);
        } 
        else if (direction === 'top') {
            const htmlElement = document.documentElement;
            const originalScrollBehavior = htmlElement.style.scrollBehavior;
            htmlElement.style.scrollBehavior = 'auto'; // Instant jump for math

            const oldScrollY = window.scrollY;
            const oldHeight = container.scrollHeight;
            
            trigger.remove();
            container.insertAdjacentHTML('afterbegin', newContent);
            
            const newHeight = container.scrollHeight;
            const heightDiff = newHeight - oldHeight;
            
            window.scrollTo(0, oldScrollY + heightDiff);
            htmlElement.style.scrollBehavior = originalScrollBehavior;
        }

        // Re-initialize for new content
        refreshObservers();
        
        // Ensure slideshows run. window.initSlideshows is called from slideshow.js
        if (typeof window.initSlideshows === "function") {
            window.initSlideshows();
        }

    } catch (err) {
        console.error("Stitching failed:", err);
    } finally {
        trigger.classList.remove('loading');
    }
}

function refreshObservers() {
    // Stitch triggers
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => stitchObserver.observe(t));
    
    // Project groups (Memory/Iframe management)
    document.querySelectorAll('.project-group').forEach(s => {
        const iframes = s.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (!iframe.dataset.src && iframe.src !== 'about:blank') {
                iframe.dataset.src = iframe.src;
            }
        });
        memoryObserver.observe(s);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    refreshObservers();
});
