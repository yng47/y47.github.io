// menu-tap.js
document.addEventListener("DOMContentLoaded", () => {
  // Only activate tap on touch devices
  if ("ontouchstart" in window) {
    const menuframes = document.querySelectorAll('.menuframe');

    menuframes.forEach(frame => {
      frame.addEventListener('click', () => {
        // Remove active from all
        menuframes.forEach(f => f.classList.remove('active'));
        // Activate tapped frame
        frame.classList.add('active');
      });
    });
  }
});
