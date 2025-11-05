const menuToggle = document.getElementById('menu-toggle');
  const navDiv = document.getElementById('navDiv');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navDiv.classList.toggle('active');
  });

  // Optional: close when clicking a link
  document.querySelectorAll('#navBtns button').forEach(btn => {
    btn.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navDiv.classList.remove('active');
    });
  });