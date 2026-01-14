const menuBtn = document.getElementById('menuBtn');
const popupMenu = document.getElementById('popupMenu');  

menuBtn.addEventListener('click', (e) => {
    popupMenu.classList.toggle('show');
    // Toggle the active class on the button itself
    menuBtn.classList.toggle('active');
     
    e.stopPropagation();
}); 

document.addEventListener('click', (event) => {
    if (!popupMenu.contains(event.target)) {
        popupMenu.classList.remove('show');
        // Remove the active class when clicking outside
        menuBtn.classList.remove('active');
    }

});



