

const menuToggle = document.querySelector('#menu-toggle');
const navDiv = document.querySelector('#navDiv');

const roundBtn = document.querySelector('.roundBtn');
const addComputerDialogue = document.querySelector('#addComputer');

const closeModalBtn = document.querySelector('.squareBtnClose');
let openedDialog;


const computerName = document.querySelector("#computer");
const manufacturerName = document.querySelector("#manufacturer");

const computerPhoto = document.querySelector("#computerPhoto");
const computerImage = document.querySelector(".computerImage");


const manuLogo = document.querySelector("#manuLogo");
const manuImage = document.querySelector(".manuImage");



let computerPhotoPath = '/assets/images/';
let statusText = "";
let fileName = "";



async function loadImage(files, imageType, fileName, sourcePhoto) {

  if (!files?.length) return; // No images

  const formData = new FormData();

  // If one image, use "file", else use "files"
  if (files.length === 1) {
    formData.append("file", files[0], files[0].name);
  } else {
    files.forEach((file, i) => {
      // multiple files for future use
      const fileName = file.name || `image-${i + 1}.png`;
      formData.append("files", file, fileName);
    });
  }
  // Metadata - this will name the file and put it into an certain folder
  if (imageType === "Computer") { //Computer Images
    formData.append("filename", fileName);
    formData.append("phototype", "computers");
    //The required size of the photo
    formData.append("photoWidth", 300);
    formData.append("photoHeight", 200);
  }
  else if (imageType === "Profile") { //User Images
    formData.append("filename", fileName);
    formData.append("phototype", "users");
    //The required size of the photo
    formData.append("photoWidth", 180);
    formData.append("photoHeight", 180);
  }
  else if (imageType === "Manufactuer") { //User Images
    formData.append("filename", fileName);
    formData.append("phototype", "logos");
    //The required size of the photo
    formData.append("photoWidth", 70);
    formData.append("photoHeight", 47);
  }

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      //computerProfileIamge.innerHTML = "";  

      const urls = data.files || [data.path];


      //Keep only the latest copy of the computer/user the file with the same computer/user name is crushed
      for (const url of urls) {   //this replaces urls.forEach((url) as can not use await

        const response = await fetch(url);

        //Creates Binary Large Object (BOLB) to hold new image with the possible same name.
        //The image does not refresh if the same URL (name+path) is used when replacing images with another.
        const blob = await response.blob();

        document.querySelector(sourcePhoto).src = URL.createObjectURL(blob);

      }

    } else {
      console.log("Upload failed.");
    }
  } catch (err) {
    console.error(err);

  }
}

// Toggle the side menu when on mobeil
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navDiv.classList.toggle('active');
});

// Close side menu when link clicked
document.querySelectorAll('#navBtns button').forEach(btn => {
  btn.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navDiv.classList.remove('active');
  });
});

//Add button 
if (roundBtn) {
  roundBtn.addEventListener('click', () => {
    const page = roundBtn.dataset.page; // get which page the button was clicked in

    if (page === "computerList") {
      addComputerDialogue.showModal();
      openedDialog = addComputerDialogue;
    }

  });
}


//Close button modal window
function setupModalCloseBehavior() {
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      if (e.target.closest('.squareBtnClose') || e.target === dialog) {
        dialog.close();
      }
    });
  });
}

// Each time a dialogue is created
setupModalCloseBehavior();

/*function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }*/


document.addEventListener('DOMContentLoaded', () => {

  if (manuImage) {
    manuImage.addEventListener("change", () => {
       const files = Array.from(manuImage.files);

    //No files
    if (!files.length) return;

    fileName = manufacturerName.value;

    loadImage(files, "Manufactuer", fileName, "#manuLogo");
    });
  }

  if (computerImage) {
    computerImage.addEventListener("change", () => {
      const files = Array.from(computerImage.files);


      //No files
      if (!files.length) return;


      fileName = computerName.value;
      loadImage(files, "Computer", fileName, "#computerPhoto");
    });
  }
});



//Star rating 

const rarityRating = document.querySelector("#rarityRating");

document.querySelector("#rarity").addEventListener("click", function(e) {
    const child = e.target;
    const parent = child.parentNode;

    // Convert HTMLCollection to array and get index
    const index = [...parent.children].indexOf(child);
    alert(index);

    rarityRating.value = 2;
   alert(rarityRating.value); // nth-child (1-based)

   // unselect all stars
    let i = 0;

    [...parent.children].forEach(child => {

                if (i <= index){
                  child.classList.add('active');
                  child.classList.add('selected');
                }
                else {
                  child.classList.remove('selected');
                  child.classList.remove('active');
                }  

                i++;
  
            });

           
});