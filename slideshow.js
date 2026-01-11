/**
 * Portfolio Work Page Logic
 * Handles Slideshows and Anchor Scrolling
 */

document.addEventListener("DOMContentLoaded", () => {
    initSlideshows();
    handleInitialAnchor();
});

function initSlideshows() {
    // We only target slideshows that haven't been set up yet
    const slideshows = document.querySelectorAll('.slideshow-unit:not(.is-initialized)');

    slideshows.forEach(unit => {
        const mainImg = unit.querySelector('.active-main');
        const thumbs = unit.querySelectorAll('.thumb');
        const prevBtn = unit.querySelector('.prev');
        const nextBtn = unit.querySelector('.next');
        let currentIndex = 0;

        if (!mainImg || thumbs.length === 0) return;

        // Mark as initialized so we don't bind listeners twice if stitched
        unit.classList.add('is-initialized');

        const updateGallery = (index) => {
            currentIndex = index;
            
            // 1. Swap the image
            const highResSrc = thumbs[currentIndex].getAttribute('data-full');
            
            // Reset blur-reveal for the new image
            mainImg.classList.remove('loaded');
            mainImg.src = highResSrc;

            // Handle the reveal once the new image is fetched
            mainImg.onload = () => mainImg.classList.add('loaded');
            if (mainImg.complete) mainImg.classList.add('loaded');
            
            // 2. Update active UI
            thumbs.forEach((t, i) => {
                t.classList.toggle('active', i === currentIndex);
            });

            // 3. AUTO-SCROLL THUMBNAILS
            thumbs[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        };

        // Click on thumbnail
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => updateGallery(index));
        });

        // Click on arrows
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const nextIndex = (currentIndex + 1) % thumbs.length;
                updateGallery(nextIndex);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const prevIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
                updateGallery(prevIndex);
            });
        }
    });
}

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