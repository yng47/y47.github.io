/**
 * DYNAMIC CONTENT MANAGER
 */

const CONFIG = {
    rootMarginStitch: '0px 0px 400px 0px', // Removed top margin to stop accidental loads
    rootMarginMemory: '1000px 0px', 
};

let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
let userHasScrolled = false; 

const stitchObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // GUARD: You must scroll DOWN significantly before the TOP trigger is allowed to work
    if (!userHasScrolled && currentScrollY > 100) {
        userHasScrolled = true;
        console.log("Stitcher Active: Scroll-up loading now enabled.");
    }

    const isScrollingUp = currentScrollY < lastScrollY;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const trigger = entry.target;
            if (trigger.classList.contains('next-page-trigger')) {
                loadSection(trigger.dataset.nextUrl, 'bottom', trigger);
            } 
            else if (trigger.classList.contains('prev-page-trigger')) {
                // Only load if we are moving up AND we have already scrolled down once
                if (isScrollingUp && userHasScrolled && trigger.dataset.prevUrl) {
                    loadSection(trigger.dataset.prevUrl, 'top', trigger);
                }
            }
        }
    });
    lastScrollY = currentScrollY;
}, { rootMargin: CONFIG.rootMarginStitch });

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const section = entry.target;
        if (entry.isIntersecting) {
            // URL Update
            const sectionUrl = section.getAttribute('data-url');
            if (sectionUrl && !window.location.href.includes(sectionUrl)) {
                window.history.replaceState(null, '', sectionUrl);
                console.log("URL updated to:", sectionUrl);
            }
            
            section.style.contentVisibility = 'visible';
            const iframes = section.querySelectorAll('iframe');
            iframes.forEach(iframe => { if (iframe.dataset.src) iframe.src = iframe.dataset.src; });
        } else {
            section.style.contentVisibility = 'auto';
            const iframes = section.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                if (iframe.src && iframe.src !== 'about:blank') {
                    iframe.dataset.src = iframe.src;
                    iframe.src = 'about:blank';
                }
            });
        }
    });
}, { threshold: 0.3 }); // 30% of section must be visible to trigger URL change

async function loadSection(url, direction, trigger) {
    if (!url || trigger.classList.contains('loading')) return;
    trigger.classList.add('loading');

    try {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newArea = doc.querySelector('#content-stitching-area');
        
        if (!newArea) return;
        const container = document.getElementById('content-stitching-area');

        if (direction === 'bottom') {
            trigger.remove();
            container.insertAdjacentHTML('beforeend', newArea.innerHTML);
        } else {
            const htmlElement = document.documentElement;
            htmlElement.style.scrollBehavior = 'auto';
            const oldHeight = container.scrollHeight;
            const oldScroll = window.scrollY;
            
            trigger.remove();
            container.insertAdjacentHTML('afterbegin', newArea.innerHTML);
            
            window.scrollTo(0, oldScroll + (container.scrollHeight - oldHeight));
            htmlElement.style.scrollBehavior = 'smooth';
        }

        refreshObservers();
        if (window.initSlideshows) window.initSlideshows();

    } catch (err) { console.error(err); } 
    finally { trigger.classList.remove('loading'); }
}

function refreshObservers() {
    document.querySelectorAll('.next-page-trigger, .prev-page-trigger').forEach(t => stitchObserver.observe(t));
    document.querySelectorAll('.project-group').forEach(s => sectionObserver.observe(s));
}

document.addEventListener('DOMContentLoaded', refreshObservers);
