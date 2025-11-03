const toggleBtn = document.querySelector("#menu-toggle");
const nav = document.querySelector("#navDiv");

toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.toggle("active");
    nav.classList.toggle("active");
  });