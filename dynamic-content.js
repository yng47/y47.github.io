/**
 * DYNAMIC CONTENT MANAGER
 * Features: Bi-directional Stitching, Iframe-only Killer, and Landing Guard
 */

const CONFIG = {
    rootMarginStitch: '10% 0px 400px 0px', 
    rootMarginMemory: '1000px 0px', 
};

let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
let userHasScrolled = false; // Prevents loading previous page on landing

// 1. STITCHING OBSERVER (Handles loading new pages)
const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Guard: User must scroll at least 50px before "Previous" triggers are active
    if (!userHasScrolled && Math.abs(currentScrollY - lastScrollY) > 50) {
        userHasScrolled = true;
    }

    const isScrollingUp = currentScrollY < lastScrollY;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const trigger = entry.target;
            
            if (trigger.classList.contains('next-page-trigger')) {
                loadSection(trigger.dataset.nextUrl, 'bottom', trigger);
            } 
            else if (trigger.classList.contains('prev-page-trigger')) {
                // Only load top if user consciously scrolled UP and we aren't at landing
                if (isScrollingUp && userHasScrolled && trigger.dataset.prevUrl) {
                    loadSection(trigger.dataset.prevUrl, 'top', trigger);
                }
            }
        }
    });

    lastScrollY = currentScrollY;
}, { rootMargin: CONFIG.rootMarginStitch });

// 2. MEMORY OBSERVER (Kills Iframes + Native Image Optimization)
const memoryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const section = entry.target;
        const iframes = section.querySelectorAll('iframe');

        if (entry.isIntersecting) {
            // REVIVE IFRAMES
            section.style.contentVisibility = 'visible';
            section.classList.remove('is-offscreen');
            
            iframes.forEach(iframe => {
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    console.log("Iframe Revived:", iframe.dataset.src);
                }
            });
        } else {
            // KILL IFRAMES + NATIVE OPTIMIZE IMAGES
            section.style.contentVisibility = 'auto'; // Browser skips rendering far-away images
            section.classList.add('is-offscreen');

            iframes.forEach(iframe => {
                if (iframe.src && iframe.src !== 'about:blank') {
                    iframe.dataset.src = iframe.src; // Store real URL
                    iframe.src = 'about:blank';      // Kill process
                    console.log("Iframe Killed to save RAM");
                }
            });
        }
    });
}, { rootMargin: CONFIG.rootMarginMemory });

// 3. CORE LOADING LOGIC
async function loadSection(url, direction, trigger) {
    if (!url || url === "" || trigger.classList.contains('loading')) return;
    
    trigger.classList.add('loading');
    console.log(`Stitching: ${url} to ${direction}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        
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
            htmlElement.style.scrollBehavior = 'auto'; // Disable smooth for math

            const oldScrollY = window.scrollY;
            const oldHeight = container.scrollHeight;
            
            trigger.remove();
            container.insertAdjacentHTML('afterbegin', newContent);
            
            const newHeight = container.scrollHeight;
            const heightDiff = newHeight - oldHeight;
            
            window.scrollTo(0, oldScrollY + heightDiff);
            htmlElement.style.scrollBehavior = originalScrollBehavior;
        }

        // Re-run setup for the new HTML
        refreshObservers();
        if (typeof window.initSlideshows === "function") {
            window.initSlideshows();
        }

    } catch (err) {
        console.error("Stitching error:", err);
    } finally {
        trigger.classList.remove('loading');
    }
}

// 4. INITIALIZATION
function refreshObservers() {
    // Observe Triggers
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => {
        stitchObserver.observe(t);
    });
    
    // Observe Project Groups
    document.querySelectorAll('.project-group').forEach(s => {
        // Pre-capture iframe sources for the killer
        const iframes = s.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.src && iframe.src !== 'about:blank' && !iframe.dataset.src) {
                iframe.dataset.src = iframe.src;
            }
        });
        memoryObserver.observe(s);
    });
}

document.addEventListener('DOMContentLoaded', refreshObservers);
