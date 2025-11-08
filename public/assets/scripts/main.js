const menuToggle = document.querySelector('#menu-toggle');
const navDiv = document.querySelector('#navDiv');

const roundBtn = document.querySelector('.roundBtn');
const addComputerDialogue = document.querySelector('#addComputer');


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

roundBtn.addEventListener('click', () => {
  const page = roundBtn.dataset.page; // get which page the button was clicked in
    
    if(page === "computerList"){
        addComputerDialogue.showModal();
    }


});