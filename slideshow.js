/**
 * Portfolio Work Page Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    initSlideshows();
    handleInitialAnchor();
});

// 1. Define the function OUTSIDE the loop so it is "hoisted" and ready
function updateGallery(unit, index, thumbs, mainImg) {
    const highResSrc = thumbs[index].getAttribute('data-full');
    
    mainImg.classList.remove('loaded');
    mainImg.src = highResSrc;

    mainImg.onload = () => mainImg.classList.add('loaded');
    if (mainImg.complete) mainImg.classList.add('loaded');
    
    thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });

    thumbs[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
    });
}

window.initSlideshows = function() {
    const slideshows = document.querySelectorAll('.slideshow-unit:not(.is-initialized)');

    slideshows.forEach(unit => {
        const mainImg = unit.querySelector('.active-main');
        const thumbs = unit.querySelectorAll('.thumb');
        const prevBtn = unit.querySelector('.prev');
        const nextBtn = unit.querySelector('.next');
        let currentIndex = 0;

        if (!mainImg || thumbs.length === 0) return;

        unit.classList.add('is-initialized');

        // Initial load
        updateGallery(unit, 0, thumbs, mainImg);

        // Listeners
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentIndex = index;
                updateGallery(unit, currentIndex, thumbs, mainImg);
            });
        });

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % thumbs.length;
                updateGallery(unit, currentIndex, thumbs, mainImg);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
                updateGallery(unit, currentIndex, thumbs, mainImg);
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
