/**
 * Portfolio Work Page Logic
 * Handles Slideshows and Anchor Scrolling
 */

document.addEventListener("DOMContentLoaded", () => {
    initSlideshows();
    handleInitialAnchor();
});

function initSlideshows() {
    const slideshows = document.querySelectorAll('.slideshow-unit:not(.is-initialized)');

    slideshows.forEach(unit => {
        const mainImg = unit.querySelector('.active-main');
        const thumbs = unit.querySelectorAll('.thumb');
        const prevBtn = unit.querySelector('.prev');
        const nextBtn = unit.querySelector('.next');
        let currentIndex = 0;

        if (!mainImg || thumbs.length === 0) return;

        // 1. DEFINE the function first
        const updateGallery = (index) => {
            currentIndex = index;
            const highResSrc = thumbs[currentIndex].getAttribute('data-full');
            
            mainImg.classList.remove('loaded');
            mainImg.src = highResSrc;

            mainImg.onload = () => mainImg.classList.add('loaded');
            if (mainImg.complete) mainImg.classList.add('loaded');
            
            thumbs.forEach((t, i) => {
                t.classList.toggle('active', i === currentIndex);
            });

            thumbs[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        };

        // 2. MARK as initialized
        unit.classList.add('is-initialized');

        // 3. NOW it is safe to call it for the first image
        updateGallery(0);

        // 4. Set up listeners
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
