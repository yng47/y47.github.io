/**
 * DYNAMIC CONTENT MANAGER
 * Features: Bi-directional Stitching, Iframe-only Killer, Landing Guard, and URL Switcher
 */

const CONFIG = {
    rootMarginStitch: '10% 0px 400px 0px', 
    rootMarginMemory: '1000px 0px', 
};

let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
let userHasScrolled = false; 

// 1. STITCHING OBSERVER (Handles loading new pages)
const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
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
                if (isScrollingUp && userHasScrolled && trigger.dataset.prevUrl) {
                    loadSection(trigger.dataset.prevUrl, 'top', trigger);
                }
            }
        }
    });

    lastScrollY = currentScrollY;
}, { rootMargin: CONFIG.rootMarginStitch });

// 2. MEMORY & URL OBSERVER
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const section = entry.target;
        const iframes = section.querySelectorAll('iframe');

        if (entry.isIntersecting) {
            // A. URL SWITCHING LOGIC
            // Updates URL to match the section's data-url attribute
            const sectionUrl = section.getAttribute('data-url');
            if (sectionUrl && window.location.pathname !== sectionUrl) {
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
}, { threshold: 0.2, rootMargin: '-10% 0px -10% 0px' }); 
// Threshold ensures we are actually looking at the section before changing URL

// 3. CORE LOADING LOGIC
async function loadSection(url, direction, trigger) {
    if (!url || url === "" || trigger.classList.contains('loading')) return;
    
    trigger.classList.add('loading');

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
            htmlElement.style.scrollBehavior = 'auto';

            const oldScrollY = window.scrollY;
            const oldHeight = container.scrollHeight;
            
            trigger.remove();
            container.insertAdjacentHTML('afterbegin', newContent);
            
            const newHeight = container.scrollHeight;
            const heightDiff = newHeight - oldHeight;
            
            window.scrollTo(0, oldScrollY + heightDiff);
            htmlElement.style.scrollBehavior = originalScrollBehavior;
        }

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

function refreshObservers() {
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => {
        stitchObserver.observe(t);
    });
    
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

document.addEventListener('DOMContentLoaded', refreshObservers);
