document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll('.active-main');
    
    images.forEach(img => {
        // If the image is already in cache
        if (img.complete) {
            img.classList.add('loaded');
        }
        
        // When the image finishes loading
        img.addEventListener('load', function() {
            img.classList.add('loaded');
        });
    });
});