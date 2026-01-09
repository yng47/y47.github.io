document.addEventListener("DOMContentLoaded", () => {
  if ("ontouchstart" in window) {
    
    // Function to handle toggle logic
    const setupToggle = (selector) => {
      const items = document.querySelectorAll(selector);
      items.forEach(item => {
        item.addEventListener('click', (e) => {
          // Remove active from others in THIS group only
          items.forEach(i => { if(i !== item) i.classList.remove('active'); });
          // Toggle the clicked one
          item.classList.toggle('active');
        });
      });
    };

    // Initialize for both groups
    setupToggle('.menuframe');
    setupToggle('.sl_img_frame');
  }
});
