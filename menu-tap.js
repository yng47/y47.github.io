document.addEventListener("DOMContentLoaded", () => {
  const isTouch = ("ontouchstart" in window);
  const menuLinks = document.querySelectorAll('.menu-link');

  menuLinks.forEach(link => {
    const frame = link.querySelector('.menuframe');

    link.addEventListener('click', (e) => {
      if (isTouch) {
        // If it's mobile and NOT already active, stop the link and show hover state
        if (!frame.classList.contains('active')) {
          e.preventDefault(); // Stop navigation
          
          // Remove active from all other frames
          document.querySelectorAll('.menuframe').forEach(f => f.classList.remove('active'));
          
          // Add active to this one
          frame.classList.add('active');
        } 
        // If it IS already active, the link (href) will function normally on the second tap
      }
      // On Desktop (isTouch = false), the link works immediately on click
    });
  });
});
