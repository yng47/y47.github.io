/**
 * Portfolio Work Page Logic
 * Handles Slideshows and Anchor Scrolling
 */

document.addEventListener("DOMContentLoaded", () => {
    initSlideshows();
    handleInitialAnchor();
});

// Attach to window so dynamic-content.js can always find it
window.initSlideshows = function() {
    const slideshows = document.querySelectorAll('.slideshow-unit:not(.is-initialized)');

    slideshows.forEach(unit => {
        const mainImg = unit.querySelector('.active-main');
        const thumbs = unit.querySelectorAll('.thumb');
        const prevBtn = unit.querySelector('.prev');
        const nextBtn = unit.querySelector('.next');
        let currentIndex = 0;

        if (!mainImg || thumbs.length === 0) return;

        // Hoisted function declaration to avoid "Initialization" errors
        function updateGallery(index) {
            currentIndex = index;
            const highResSrc = thumbs[currentIndex].getAttribute('data-full');
            
            // Handle image swap and blur reveal
            mainImg.classList.remove('loaded');
            mainImg.src = highResSrc;

            mainImg.onload = () => mainImg.classList.add('loaded');
            if (mainImg.complete) mainImg.classList.add('loaded');
            
            // UI Updates
            thumbs.forEach((t, i) => {
                t.classList.toggle('active', i === currentIndex);
            });

            // Scroll thumbnail into view
            thumbs[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }

        // Mark as initialized BEFORE calling updateGallery
        unit.classList.add('is-initialized');

        // Load first image immediately
        updateGallery(0);

        // Listeners
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => updateGallery(index));
        });

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateGallery((currentIndex + 1) % thumbs.length);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateGallery((currentIndex - 1 + thumbs.length) % thumbs.length);
            });
        }
    });
};

function handleInitialAnchor() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }
}
