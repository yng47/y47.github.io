/**
 * DYNAMIC CONTENT MANAGER
 * Handles Bi-directional Stitching, Iframe Memory Killing, and Scroll Correction
 */

const CONFIG = {
    rootMarginStitch: '10% 0px 400px 0px', 
    rootMarginMemory: '2000px 0px', 
};

let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

// 1. STITCHING OBSERVER
const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const isAtTop = currentScrollY <= 5;
    const isScrollingUp = currentScrollY < lastScrollY || isAtTop;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const trigger = entry.target;
            
            if (trigger.classList.contains('next-page-trigger')) {
                console.log("Trigger: Bottom reached. Direction: Down.");
                loadSection(trigger.dataset.nextUrl, 'bottom', trigger);
            } 
            else if (trigger.classList.contains('prev-page-trigger')) {
                console.log("Trigger: Top reached. isScrollingUp:", isScrollingUp);
                if (isScrollingUp && trigger.dataset.prevUrl && trigger.dataset.prevUrl !== "") {
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
            iframes.forEach(iframe => { if (iframe.dataset.src) iframe.src = iframe.dataset.src; });
        } else {
            section.classList.add('is-offscreen');
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
    
    console.log(`Starting fetch for: ${url} (Direction: ${direction})`);
    trigger.classList.add('loading');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newArea = doc.querySelector('#content-stitching-area');
        
        if (!newArea) {
            console.error("Critical: Could not find #content-stitching-area in fetched page.");
            return;
        }

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

        console.log(`Success: ${url} stitched.`);
        refreshObservers();
        if (typeof initSlideshows === "function") initSlideshows();

    } catch (err) {
        console.error("Stitching failed:", err);
    } finally {
        trigger.classList.remove('loading');
    }
}

function refreshObservers() {
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => stitchObserver.observe(t));
    document.querySelectorAll('.project-group').forEach(s => {
        const iframes = s.querySelectorAll('iframe');
        iframes.forEach(iframe => { if (!iframe.dataset.src && iframe.src !== 'about:blank') iframe.dataset.src = iframe.src; });
        memoryObserver.observe(s);
    });
}

document.addEventListener('DOMContentLoaded', refreshObservers);
