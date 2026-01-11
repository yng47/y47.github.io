/**
 * DYNAMIC CONTENT MANAGER 
 * Features: Bi-directional Stitching, Iframe-only Killer, Landing Guard, and URL Switcher
 */

const CONFIG = {
    rootMarginStitch: '0px 0px 600px 0px', // No top margin to prevent aggressive loading
    rootMarginMemory: '1000px 0px', 
};

let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
let userHasScrolledEnough = false; 

// 1. STITCHING OBSERVER (Handles loading new pages)
const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // LANDING GUARD: Prevents the "Top" section from loading immediately on landing.
    // User must scroll down at least 150px to "activate" the previous page stitching.
    if (!userHasScrolledEnough && currentScrollY > 150) {
        userHasScrolledEnough = true;
        console.log("Stitching System: Scroll-up loading enabled.");
    }

    const isScrollingUp = currentScrollY < lastScrollY;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const trigger = entry.target;
            
            // BOTTOM TRIGGER
            if (trigger.classList.contains('next-page-trigger')) {
                loadSection(trigger.dataset.nextUrl, 'bottom', trigger);
            } 
            // TOP TRIGGER
            else if (trigger.classList.contains('prev-page-trigger')) {
                if (isScrollingUp && userHasScrolledEnough && trigger.dataset.prevUrl) {
                    loadSection(trigger.dataset.prevUrl, 'top', trigger);
                }
            }
        }
    });

    lastScrollY = currentScrollY;
}, { rootMargin: CONFIG.rootMarginStitch });

// 2. SECTION OBSERVER (Handles URL Switching and Iframe Killing)
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const section = entry.target;
        const iframes = section.querySelectorAll('iframe');

        if (entry.isIntersecting) {
            // A. URL SWITCHING
            const sectionUrl = section.getAttribute('data-url');
            if (sectionUrl && !window.location.href.includes(sectionUrl)) {
                window.history.replaceState(null, '', sectionUrl);
            }

            // B. REVIVE IFRAMES
            section.style.contentVisibility = 'visible';
            section.classList.remove('is-offscreen');
            iframes.forEach(iframe => {
                if (iframe.dataset.src) iframe.src = iframe.dataset.src;
            });
        } else {
            // C. KILL IFRAMES & NATIVE OPTIMIZE
            section.style.contentVisibility = 'auto';
            section.classList.add('is-offscreen');
            iframes.forEach(iframe => {
                if (iframe.src && iframe.src !== 'about:blank') {
                    iframe.dataset.src = iframe.src;
                    iframe.src = 'about:blank';
                }
            });
        }
    });
}, { threshold: 0.25 }); // Requires 25% visibility before changing URL

// 3. CORE LOADING LOGIC
async function loadSection(url, direction, trigger) {
    if (!url || url === "" || trigger.classList.contains('loading')) return;
    
    trigger.classList.add('loading');
    console.log(`Fetching ${direction} section: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
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
            htmlElement.style.scrollBehavior = 'auto';

            const oldHeight = container.scrollHeight;
            const oldScroll = window.scrollY;
            
            trigger.remove();
            container.insertAdjacentHTML('afterbegin', newContent);
            
            // Adjust scroll to maintain position relative to the new content
            const heightDiff = container.scrollHeight - oldHeight;
            window.scrollTo(0, oldScroll + heightDiff);
            
            htmlElement.style.scrollBehavior = originalScrollBehavior;
        }

        // Re-bind observers to the new elements
        refreshObservers();
        
        // Re-initialize slideshows (Ensures main-display is filled)
        if (window.initSlideshows) {
            window.initSlideshows();
        }

    } catch (err) {
        console.error("Stitching error:", err);
    } finally {
        trigger.classList.remove('loading');
    }
}

// 4. INITIALIZATION FUNCTION
function refreshObservers() {
    // Re-watch triggers
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => {
        stitchObserver.observe(t);
    });
    
    // Re-watch project groups
    document.querySelectorAll('.project-group').forEach(s => {
        const iframes = s.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.src && iframe.src !== 'about:blank' && !iframe.dataset.src) {
                iframe.dataset.src = iframe.src;
            }
        });
        sectionObserver.observe(s);
    });
}

// Initial Run
document.addEventListener('DOMContentLoaded', refreshObservers);
