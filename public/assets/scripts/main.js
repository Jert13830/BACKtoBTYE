const menuToggle = document.querySelector('#menu-toggle');
const navDiv = document.querySelector('#navDiv');

const roundBtn = document.querySelector('.roundBtn');

const addComputerDialogue = document.querySelector('#addComputer');

const squareBtnClose = document.querySelector('.squareBtnClose');
let openedDialog;

const computerName = document.querySelector('#computer');
const computerManufacturerName = document.querySelector('#computerManufacturerName');

const computerPhoto = document.querySelector('#computerPhoto');
const computerImage = document.querySelector('.computerImage');

const manuLogo = document.querySelector('#manuLogo');
const manuImage = document.querySelector('.manuImage');

const addComputerManu = document.querySelector('#addComputerManu');

const computerManuDialog = document.querySelector('#addComputerManufacturer');

const aboutBtn = document.querySelector("#aboutBtn");
const aboutDialog = document.querySelector("#aboutDialog");

let computerPhotoPath = '/assets/images/';
let statusText = "";
let fileName = "";

//Deal with images use Multer and Sharp to load, resize and reformat images to .webp
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
      window.open("/addComputer", "_self")
    }

  });
}

//close button
if (squareBtnClose) {
  document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.squareBtnClose');
      if (!closeBtn) return;

      const page = closeBtn.dataset.page;

      if (page === 'addComputer') {
        window.location.href = '/computerList';
      } 
      
      // Find if we're inside an open dialog
      const dialog = closeBtn.closest('dialog');
      if (dialog && dialog.open) {
          dialog.close();
      } 
  });
}


document.addEventListener('DOMContentLoaded', () => {

  if (manuImage) {
    manuImage.addEventListener("change", () => {
      const files = Array.from(manuImage.files);
      //No files selected
      if (!files.length) return;


      const value = computerManufacturerName.value?.trim();
      if (value) { //Test if a manufacturer name has been given

        fileName = computerManufacturerName.value;

        alert(fileName);

        loadImage(files, "Manufactuer", fileName, "#manuLogo");
      }
      else{
        document.querySelector("#errorComputerManufacturer").textContent = "Please enter a manfacturer's name";
      }
    });
  }

  if (computerImage) {
    computerImage.addEventListener("change", () => {
      const files = Array.from(computerImage.files);

      //No files selected
      if (!files.length) return;

      const value = computerName.value?.trim();
      if (value) { //Test if a computer name has been given
        fileName = computerName.value;
        loadImage(files, "Computer", fileName, "#computerPhoto");
      }
      else {
        alert("Fill in name");
      }
    });
  }

});

//Star rating 
document.querySelector("#rarity").addEventListener("click", function (e) {
  const child = e.target;
  const nList = document.querySelector("#rarityStars");
  lightStars(child, nList);
});

document.querySelector("#popularity").addEventListener("click", function (e) {
  const child = e.target;
  const nList = document.querySelector("#popularityStars");
  lightStars(child, nList);
});

function lightStars(child, nList) {
  const parent = child.parentNode;
  const nEntry = nList.getElementsByTagName("li");

  // Convert HTMLCollection to array and get index
  const index = [...parent.children].indexOf(child);

  for (let i = 0; i < nEntry.length; i++) {

    if (i <= index) {
      nEntry[i].classList.remove('star-unselected');
      nEntry[i].classList.add('star-selected');
    }
    else {
      nEntry[i].classList.remove('star-selected');
      nEntry[i].classList.add('star-unselected');
    }

  }
}


addComputerManu.addEventListener("click", function (e) {
  addComputerManufacturer.showModal();
  openedDialog = addComputerManufacturer;
});

//Open About dialog
aboutBtn.addEventListener("click", function (e) {
 aboutDialog.showModal();
  openedDialog = aboutDialog;
});