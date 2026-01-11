/**
 * DYNAMIC CONTENT MANAGER
 * Handles Bi-directional Stitching, Iframe Memory Killing, and Scroll Correction
 */

const CONFIG = {
    rootMarginStitch: '400px', // Start fetching early for smoothness
    rootMarginMemory: '2000px 0px', // Large buffer to prevent "pop-in"
};

// Track scroll position to determine direction
let lastScrollY = window.scrollY;

// 1. STITCHING OBSERVER (Loads new pages into the current view)
const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.scrollY;
    const isScrollingUp = currentScrollY < lastScrollY;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const trigger = entry.target;
            
            // BOTTOM TRIGGER: Always load when reached
            if (trigger.classList.contains('next-page-trigger')) {
                loadSection(trigger.dataset.nextUrl, 'bottom', trigger);
            } 
            // TOP TRIGGER: Only load if the user is moving UP (prevents accidental loads on landing)
            else if (trigger.classList.contains('prev-page-trigger') && isScrollingUp) {
                loadSection(trigger.dataset.prevUrl, 'top', trigger);
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
            
            // REVIVE: Restore video source
            iframes.forEach(iframe => {
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                }
            });
        } else {
            section.classList.add('is-offscreen');

            // KILL: Clear source to free up RAM
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
    trigger.classList.add('loading');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
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
            // Disable smooth scroll temporarily for pixel-perfect math
            const htmlElement = document.documentElement;
            const originalScrollBehavior = htmlElement.style.scrollBehavior;
            htmlElement.style.scrollBehavior = 'auto';

            const oldScrollY = window.scrollY;
            const oldHeight = container.scrollHeight;
            
            trigger.remove();
            container.insertAdjacentHTML('afterbegin', newContent);
            
            // Correction: compensate for the height of added items
            const newHeight = container.scrollHeight;
            const heightDiff = newHeight - oldHeight;
            
            window.scrollTo(0, oldScrollY + heightDiff);

            // Restore original scroll behavior
            htmlElement.style.scrollBehavior = originalScrollBehavior;
        }

        // Setup observers for new content
        refreshObservers();
        
        // Re-run slideshow logic for newly added projects
        if (typeof initSlideshows === "function") {
            initSlideshows();
        }

    } catch (err) {
        console.error("Stitching failed:", err);
    }
}

function refreshObservers() {
    // Watch stitching triggers
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => {
        stitchObserver.observe(t);
    });
    
    // Watch project groups for memory/iframe management
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

// Initial initialization
document.addEventListener('DOMContentLoaded', refreshObservers);