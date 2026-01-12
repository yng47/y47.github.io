document.addEventListener("DOMContentLoaded", () => {
    initSlideshows();
});

function initSlideshows() {
    const slideshows = document.querySelectorAll('.slideshow-unit');

    slideshows.forEach(unit => {
        const mainImg = unit.querySelector('.active-main');
        const thumbs = unit.querySelectorAll('.thumb');
        const prevBtn = unit.querySelector('.prev');
        const nextBtn = unit.querySelector('.next');
        let currentIndex = 0;

        if (!mainImg || thumbs.length === 0) return;

        // Added 'isInitial' parameter to prevent jumping on load
        function updateGallery(index, isInitial = false) {
            currentIndex = index;
            const highResSrc = thumbs[currentIndex].getAttribute('data-full');
            mainImg.src = highResSrc;
            
            thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
            
            // ONLY scroll into view if it's NOT the first time loading
            if (!isInitial) {
                thumbs[currentIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }

        // Pass 'true' here to tell the function: "Don't jump the screen yet"
        updateGallery(0, true);

        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => updateGallery(index));
        });

        if (nextBtn) nextBtn.addEventListener('click', () => updateGallery((currentIndex + 1) % thumbs.length));
        if (prevBtn) prevBtn.addEventListener('click', () => updateGallery((currentIndex - 1 + thumbs.length) % thumbs.length));
    });
}
