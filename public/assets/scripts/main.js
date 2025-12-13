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

/** Computer Carrousel **/
const slider = document.getElementById("sliderContainer");
const cardWidth = 330;


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
    formData.append("photoWidth", 68  );
    formData.append("photoHeight", 20);
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


function treatImages(){

  if (manuImage) {
    manuImage.addEventListener("change", () => {
      const files = Array.from(manuImage.files);
      //No files selected
      if (!files.length) return;


      const value = computerManufacturerName.value?.trim();
      if (value) { //Test if a manufacturer name has been given

        fileName = computerManufacturerName.value;


        loadImage(files, "Manufactuer", fileName, "#manuLogo");

      // document.querySelector("#computerManuLogo").src = "/assets/images/logos/" + fileName + ".webp";

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
        document.querySelector("#computerNameErrors").textContent = "Please enter a computer name";
      }
    });
  }

}

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
  console.log("About called");
  openedDialog = aboutDialog;
});


function addComputer() {
    const dialog = document.getElementById("addComputerManufacturer");
    const form = document.getElementById("computerManufacturerForm");
    const errorBox = document.getElementById("errorComputerManufacturer"); // add_elem in form

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Stops the parent page from being refreshed and loosing data

        const formData = new FormData(form);

        const response = await fetch("/addComputerManufacturer", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
           loadManufacturerList(); //update manufacturer list
            dialog.close();


            return;
        }

        // Show error
        errorBox.textContent = data.error;
       
    });
}


function init() {
    addComputer();
    loadManufacturerList();
    treatImages();
     loadComputerList();
}


document.addEventListener("DOMContentLoaded", init);


async function loadManufacturerList() {
    const errorBox = document.getElementById("manufacturerErrors");

    try {
        const response = await fetch("/listComputerManufacturer", {
            method: "GET"
        });

        const data = await response.json();

        if (!data.success) {
            errorBox.textContent = data.error;
            return;
        }

        updateManufacturerSelect(data.manufacturers);

    } catch (err) {
        errorBox.textContent = "Failed to load manufacturer list.";
    }
}

function updateManufacturerSelect(manufacturers) {
    const select = document.getElementById("computerManufacturerSelect");
    // Clear existing options
    select.innerHTML = "";

    // Add placeholder
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select manufacturer…";
    select.appendChild(placeholder);

    // Add all manufacturers
    manufacturers.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id_fab_ordinateur;
        opt.textContent = m.nom;

       /* if (String(m.id_fab_ordinateur) === selectedManufacturer) {
             opt.selected = true;
        }*/
        select.appendChild(opt);
    });

}

async function loadComputerList() {

    const errorBox = document.getElementById("successorErrors");
    try {
        const response = await fetch("/listComputer", {
            method: "GET"
        });

        const data = await response.json();

        if (!data.success) {
            errorBox.textContent = data.error;
            return;
        }

        updateComputerSelect(data.computers);

    } catch (err) {
        errorBox.textContent = "Failed to load computer list.";
    }
}

function updateComputerSelect(computers) {

    const select = document.querySelector("#successor");

    // Clear existing options
    select.innerHTML = "";

    // Add placeholder
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select computer…";
    select.appendChild(placeholder);

    // Add all computers
    computers.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id_ordinateur;
        opt.textContent = m.nom;
        select.appendChild(opt);
    });
}


function changeLogo(){
  
  const select = document.querySelector("#computerManufacturerSelect");
  const label = select.options[select.selectedIndex].text;
  if (select.selectedIndex < 1){
     document.querySelector("#computerManuLogo").src = "/assets/images/logos/defaultLogo.webp";
  }
  else
  {
       document.querySelector("#computerManuLogo").src = "/assets/images/logos/" + label + ".webp";
  }
}

/********  Carousel scroll ******/

 function slideRight()
 {

    slider.scrollBy({
        left: cardWidth,
        behavior: "smooth"
    });

 }

 function slideLeft()
 {

     slider.scrollBy({
        left: -cardWidth,
        behavior: "smooth"
    });

 }