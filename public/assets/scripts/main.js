
const menuToggle = document.querySelector('#menu-toggle');
const navDiv = document.querySelector('#navDiv');

const roundBtn = document.querySelector('.roundBtn');

const addComputerDialogue = document.querySelector('#addComputer');

const squareBtnClose = document.querySelector('.squareBtnClose');
const squareBtnCloseb = document.querySelector('.squareBtnCloseb');
let openedDialog;

const btnSearch = document.querySelector('.btnSearch');
const btnComment = document.querySelector('btnComment');

const computerName = document.querySelector('#computer');
const manufacturerName = document.querySelector('#manufacturerName');

const computerPhoto = document.querySelector('#computerPhoto');
const softwarePhoto = document.querySelector('#softwarePhoto');
const emulatorPhoto = document.querySelector('#emulatorPhoto');
const computerImage = document.querySelector('.computerImage');
const postImage = document.querySelector('.postImage');

const manuLogo = document.querySelector('#manuLogo');
const manuImage = document.querySelector('.manuImage');

const addComputerManu = document.querySelector('#addComputerManu');

const manuDialog = document.querySelector('#addManufacturer');
const searchComputerBar = document.querySelector("#searchComputerBar");

const profileImage = document.querySelector("#profileImage");
const profileContainer = document.querySelector("#profileContainer");
const uploadImageProfile = document.querySelector("#uploadImageProfile");
const usernameProfile = document.querySelector('#usernameProfile');

const searchInput = document.getElementById('searchBar');
const btnResearch = document.getElementById('btnResearch');

/** Computer Carrousel **/
const slider = document.querySelector(".sliderContainer");
const cardWidth = 330;
const intervalTime = 3000; //3 seconds

//this holds the current manufacturer type computer / software / emulator
const manufacturerMode = localStorage.getItem('mode') || 'default';

//Treat the images
const computerProfileImage = document.querySelector('#computerPhoto');
const uploadImageComputer = document.querySelector('#uploadImageComputer');
const softwareProfileImage = document.querySelector('#softwarePhoto');
const uploadImageSoftware = document.querySelector('#uploadImageSoftware');
const emulatorProfileImage = document.querySelector('#emulatorPhoto');
const uploadImageEmulator = document.querySelector('#uploadImageEmulator');
const postProfileImage = document.querySelector('#postPhoto');
const uploadImagePost = document.querySelector('#uploadImagePost');

const postTitle = document.querySelector("#postTitle");

const sideBarComputerList = document.querySelector("#sideBarComputerList");
const sideBarCategoryList = document.querySelector("#sideBarCategoryList");

let manufacturers = [];


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
    formData.append("photoWidth", 150);
    formData.append("photoHeight", 150);
  }
  else if (imageType === "Software") { //Software Images
    formData.append("filename", fileName);
    formData.append("phototype", "software");
    //The required size of the photo
    formData.append("photoWidth", 166);
    formData.append("photoHeight", 250);
  }
  else if (imageType === "Emulator") { //Emulator Images
    formData.append("filename", fileName);
    formData.append("phototype", "emulator");
    //The required size of the photo
    formData.append("photoWidth", 300);
    formData.append("photoHeight", 200);
  }
  else if (imageType === "Manufactuer") { // manufacturer logos
    formData.append("filename", fileName);
    formData.append("phototype", "logos");
    //The required size of the photo
    formData.append("photoWidth", 80);
    formData.append("photoHeight", 53);
  }
  else if (imageType === "Post") { //Post Images
    formData.append("filename", fileName);
    formData.append("phototype", "post");
    //The required size of the photo
    formData.append("photoWidth", 300);
    formData.append("photoHeight", 200);
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

// Toggle the side menu when on mobile
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
      //localStorage.setItem('mode', 'computer');
      window.open("/addComputer", "_self")
    }

    if (page === "softwareList") {
      localStorage.setItem('mode', 'software');
      window.open("/addSoftware", "_self")
    }

    if (page === "emulatorList") {
      localStorage.setItem('mode', 'emulator');
      window.open("/addEmulator", "_self")
    }

  });
}



//close button
if (squareBtnClose || squareBtnCloseb) {

  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.squareBtnClose') || e.target.closest('.squareBtnCloseb');
    if (!closeBtn) return;

    const page = closeBtn.dataset.page;

    if (page === 'addComputer') {
      //Clear form data
      clearFormState("computerForm");
      const origin = "/" + document.querySelector("#originInput").value;
      window.location.href = origin;
    }

    if (page === 'readMessage') {
      window.location.href = "/displayCommunity"
    }

    if (page === 'writeComment') {
      window.location.href = "/displayCommunity"
    }

    
    if (page === 'about') {
      window.location.href = "/";
    }

    if (page === 'connect') {
      window.location.href = "/";
    }

    if (page === 'addSoftware') {
      //Clear form data
      clearFormState("softwareForm");
      //const origin = "/" + document.querySelector("#originInput").value;
      window.location.href = "/displaySoftwareList";
    }

    if (page === 'addEmulator') {
      //Clear form data
      clearFormState("emulatorForm");
      window.location.href = "/displayEmulatorList";
    }

    if (page === 'registration') {
      //Clear form data
      clearFormState("registrationForm");
      window.location.href = "/connect";
    }

    if (page === 'writeMessage') {
      window.location.href = "/displayCommunity";
    }

    // Find if we're inside an open dialog
    const dialog = closeBtn.closest('dialog');
    if (dialog && dialog.open) {
      dialog.close();
    }
  });
}

/*function openUserRole(){
  const addUserRole = document.querySelector("#addUserRole");
   addUserRole.showModal();
    openedDialog = addUserRole;
}*/

/**** search computer ****/

if (btnSearch) {
  btnSearch.addEventListener("click", function (e) {
    searchComputer.showModal();
    openedDialog = searchComputer;
  });
}


function openUpdatePasswordDialog(button) {

  const updatePasswordDialog = document.querySelector("#updatePasswordDialog");
  const passwordChangeUserId = document.querySelector("#passwordChangeUserId");

  updatePasswordDialog.showModal();

  passwordChangeUserId.value = button.dataset.userId;

  openedDialog = updatePasswordDialog;
}

if (btnResearch) {
  btnResearch.addEventListener('click', () => {
    // Search text
    const searchValue = searchInput.value.trim();

    // Selected radio value
    const selectedRadio = document.querySelector('input[name="selection"]:checked');
    const selectionValue = selectedRadio ? selectedRadio.value : null;

  });
}

function updateRole(button) {
  updateRoleDialog.showModal();
  const updateRoleText = document.querySelector("#updateRoleText");
  const roleId = document.querySelector("#roleId");



  updateRoleText.value = button.dataset.roleName;
  roleId.value = button.dataset.roleId;

  openedDialog = updateRoleDialog;


}

function updateManufacturer(button, mode) {
  const manufacturerName = document.querySelector("#manufacturerName");
  const nameBeforeChange = document.querySelector("#nameBeforeChange");
  const manuLogo = document.querySelector("#manuLogo");
  const btnAddManu = document.querySelector("#btnAddManu");
  const updateId = document.querySelector("#updateId");
  const form = document.getElementById("newManufactureForm");
  const manufacturerId = button.dataset.manufacturerId;

  manufacturerName.value = button.dataset.manufacturerName;
  nameBeforeChange.value = button.dataset.manufacturerName;

  updateId.value = manufacturerId;
  if (mode != 'category') {
    manuLogo.src = "/assets/images/logos/" + button.dataset.manufacturerName + ".webp";
  }
  btnAddManu.textContent = "Update";

  if (mode == 'computer') {
    form.action = `/updateComputerManufacturer/${manufacturerId}`;
  }
  else if (mode == 'software') {
    form.action = `/updateSoftwareManufacturer/${manufacturerId}`;
  }
  else if (mode == 'emulator') {
    form.action = `/updateEmulatorManufacturer/${manufacturerId}`;

  }
  else {
    form.action = `/updateCategory/${manufacturerId}`;
  }

}

// Save form data when opening when navigating to + tasks
function saveFormState(formSelector, storageKey) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const data = {};

  Array.from(form.elements).forEach(el => {
    if (!el.name || el.type === "file") return;

    if (el.tagName === "SELECT" && el.multiple) {
      data[el.name] = Array.from(el.selectedOptions).map(o => o.value);
    } else if (el.type === "checkbox") {
      data[el.name] = el.checked;
    } else if (el.type === "radio") {
      if (el.checked) data[el.name] = el.value;
    } else {
      data[el.name] = el.value;
    }
  });

  const payload = {
    data,
    savedAt: Date.now()
  };

  sessionStorage.setItem(storageKey, JSON.stringify(payload));
}



//Restore form data when going back to add computer - software - emulator pages - limit to 1 minutes
function restoreFormState(formSelector, storageKey, maxAgeMinutes = 1) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return;

  const payload = JSON.parse(raw);
  const maxAge = maxAgeMinutes * 60 * 1000;

  if (Date.now() - payload.savedAt > maxAge) {
    sessionStorage.removeItem(storageKey);
    return;
  }

  const data = payload.data;

  Array.from(form.elements).forEach(el => {
    if (!el.name || !(el.name in data)) return;

    if (el.tagName === "SELECT" && el.multiple) {
      Array.from(el.options).forEach(o => {
        o.selected = data[el.name].includes(o.value);
      });
    } else if (el.type === "checkbox") {
      el.checked = data[el.name];
    } else if (el.type === "radio") {
      el.checked = el.value === data[el.name];
    } else {
      el.value = data[el.name];
    }
  });
}

//clear form data when leaving page
window.addEventListener("pagehide", () => {
  const keys = document.body.dataset.formKeys;
  if (!keys) return;

  keys.split(",").forEach(k => {
    sessionStorage.removeItem(k.trim());
  });
});



//Clear form stored data
function clearFormState(storageKey) {
  sessionStorage.removeItem(storageKey);
}

//Clean up any stray data
function clearAllFormData() {
  clearFormState("computerForm");
  clearFormState("softwareForm");
  clearFormState("emulatorForm");
  clearFormState("registrationForm");
}


//On submit clear computer form data
document.querySelector("#computerForm")?.addEventListener("submit", () => {
  clearFormState("computerForm");
});

//On submit clear software form data
document.querySelector("#softwareForm")?.addEventListener("submit", () => {
  clearFormState("softwareForm");
});

//On submit clear emulator form data
document.querySelector("#emulatorForm")?.addEventListener("submit", () => {
  clearFormState("emulatorForm");
});

//Retore computer form data when loaded
document.addEventListener("DOMContentLoaded", () => {

  restoreFormState("#computerForm", "computerForm");

});



//Retore software form data when loaded
document.addEventListener("DOMContentLoaded", () => {
  restoreFormState("#softwareForm", "softwareForm");
});

//Retore emulator form data when loaded
document.addEventListener("DOMContentLoaded", () => {
  restoreFormState("#emulatorForm", "emulatorForm");
});
//Retore registration form data when loaded
document.addEventListener("DOMContentLoaded", () => {
  restoreFormState("#registrationForm", "registrationForm");
});

function treatImages() {

  if (manuImage) {
    manuImage.addEventListener("change", () => {
      const files = Array.from(manuImage.files);
      //No files selected
      if (!files.length) return;

      const value = manufacturerName.value?.trim();
      if (value) { //Test if a manufacturer name has been given

        fileName = manufacturerName.value;

        loadImage(files, "Manufactuer", fileName, "#manuLogo");

        // document.querySelector("#computerManuLogo").src = "/assets/images/logos/" + fileName + ".webp";

      }
      else {
        document.querySelector("#errorManufacturer").textContent = "Please enter a manfacturer's name";
        manuImage.value = ""; // clears file input, user must reselect
      }
    });
  }


  if (computerProfileImage) {
    computerProfileImage.addEventListener("click", () => {
      uploadImageComputer.click();
    });

    uploadImageComputer.addEventListener("change", () => {
      const files = Array.from(uploadImageComputer.files);

      //No files selected
      if (!files.length) return;

      const value = computer.value?.trim();

      if (value) { //Test if a user name has been given
        fileName = computer.value;
        loadImage(files, "Computer", fileName, "#computerPhoto");
      }

      else {
        document.querySelector("#computerNameErrors").textContent = "Please enter a computer name";
        uploadImageComputer.value = ""; // clears file input, user must reselect
      }
    });

  }

  if (postProfileImage) {
    postProfileImage.addEventListener("click", () => {
      uploadImagePost.click();
    });

    uploadImagePost.addEventListener("change", () => {
      const files = Array.from(uploadImagePost.files);


      //No files selected
      if (!files.length) return;
      const value = postTitle.value?.trim();


      if (value) { //Test if a title has been given

        fileName = value;
        loadImage(files, "Post", fileName, "#postPhoto");
      }

      else {

        document.querySelector("#postNameErrors").textContent = "Enter a post title";
        uploadImagePost.value = ""; // clears file input, user must reselect
      }
    });

  }


  if (softwareProfileImage) {
    softwareProfileImage.addEventListener("click", () => {
      uploadImageSoftware.click();
    });

    uploadImageSoftware.addEventListener("change", () => {
      const files = Array.from(uploadImageSoftware.files);


      //No files selected
      if (!files.length) return;

      const value = softwareName.value?.trim();

      if (value) { //Test if a user name has been given
        fileName = value;
        loadImage(files, "Software", fileName, "#softwarePhoto");
      }
      else {
        document.querySelector(".manufacturerErrors").textContent = "Please enter a software title";
        uploadImageSoftware.value = ""; // clears file input, user must reselect
      }
    });

  }

  if (emulatorProfileImage) {
    emulatorProfileImage.addEventListener("click", () => {
      uploadImageEmulator.click();
    });

    uploadImageEmulator.addEventListener("change", () => {
      const files = Array.from(uploadImageEmulator.files);

      //No files selected
      if (!files.length) return;

      const value = emulatorName.value?.trim();

      if (value) { //Test if a user name has been given
        fileName = value;
        loadImage(files, "Emulator", fileName, "#emulatorPhoto");
      }
      else {
        document.querySelector(".manufacturerErrors").textContent = "Please enter a emulator title";
        uploadImageEmulator.value = ""; // clears file input, user must reselect
      }
    });

  }
}



const rarity = document.querySelector("#rarity");

if (rarity) {
  //Star rating 
  rarity.addEventListener("click", function (e) {
    const child = e.target;
    const nList = document.querySelector("#rarityStars");
    lightStars(child, nList);

  });
}


function manufacturerLogoClick() {
  const logoPath = document.querySelector("#logoPath");
  logoPath.click();

  logoPath.addEventListener("change", () => {
    const files = Array.from(logoPath.files);

    //No files selected
    if (!files.length) return;

    const manufacturerName = document.querySelector("#manufacturerName");

    const value = manufacturerName.value?.trim();

    if (value) { //Test if a computer manufacturer name has been given
      fileName = value;

      loadImage(files, "Manufactuer", fileName, "#manuLogo");
      // loadImage(files, "Logo", fileName, "#manuLogo");
    }

    else {
      document.querySelector("#manufacturerNameErrors").textContent = "Please enter a computer manufacturer's name";
      logoPath.value = ""; // clears file input, user must reselect
    }
  });

}

const popularity = document.querySelector("#popularity");

if (popularity) {
  popularity.addEventListener("click", function (e) {
    const child = e.target;
    const nList = document.querySelector("#popularityStars");
    lightStars(child, nList);


  });
}


/****** profile photo  ******/

if (profileContainer) {
  profileContainer.addEventListener("click", () => {
    uploadImageProfile.click();
  });

  uploadImageProfile.addEventListener("change", () => {
    const files = Array.from(uploadImageProfile.files);

    //No files selected
    if (!files.length) return;

    const value = usernameProfile.value?.trim();

    if (value) { //Test if a user name has been given
      fileName = usernameProfile.value;
      loadImage(files, "Profile", fileName, "#profileImage");
    }

    else {
      document.querySelector("#errorUsernameProfile").textContent = "Please enter a username";
      uploadImageProfile.value = ""; // clears file input, user must reselect
    }
  });

}

function preLightStars(listId, ratingValue) {

  const nList = document.getElementById(listId);
  
  if (!nList) return;

  const nEntry = nList.getElementsByTagName("li");
  const rating = Number(ratingValue) || 0; 

  for (let i = 0; i < nEntry.length; i++) {
    if (i < rating) {  
      nEntry[i].classList.remove('star-unselected');
      nEntry[i].classList.add('star-selected');
    } else {
      nEntry[i].classList.remove('star-selected');
      nEntry[i].classList.add('star-unselected');
    }
  }

  // Set hidden input (same logic)
  if (listId === "rarityStars") {
    document.querySelector('input[name="rarityRating"]').value = rating;
  }
  if (listId === "popularityStars") {
    document.querySelector('input[name="popularityRating"]').value = rating;
  }

  // IMPORTANT: do NOT call updateRating() here
}

function lightStars(child, nList) {
  const parent = child.parentNode;
  const nEntry = nList.getElementsByTagName("li");

  const index = [...parent.children].indexOf(child);
  const rating = index + 1;

  // Colour stars
  for (let i = 0; i < nEntry.length; i++) {
    if (i <= index) {
      nEntry[i].classList.remove('star-unselected');
      nEntry[i].classList.add('star-selected');
    } else {
      nEntry[i].classList.remove('star-selected');
      nEntry[i].classList.add('star-unselected');
    }
  }

  // Store value in hidden input
  if (nList.id === "rarityStars") {
    document.querySelector('input[name="rarityRating"]').value = rating;
  }

  if (nList.id === "popularityStars") {
    document.querySelector('input[name="popularityRating"]').value = rating;
  }

  updateRating(nList.id, rating);
}

function updateRating(type, rating) {
  const computerId = document.getElementById("id_ordinateur").value;
  const userId = document.getElementById("userId").value;

if (!computerId || !userId) {
    console.error("Missing computerId or userId");
    return;
  }

  console.log("Hello ", rating);


  fetch("/rateComputer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      computerId,
      userId,
      ratingType: type,      
      rating
    })
  });



}

/*if (addComputerManu) {
  addComputerManu.addEventListener("click", function (e) {
    addComputerManufacturer.showModal();
    openedDialog = addComputerManufacturer;
  });
}*/

function addComputer() {
  const dialog = document.getElementById("addComputerManufacturer");
  const form = document.getElementById("computerManufacturerForm");
  const errorBox = document.getElementById("errorComputerManufacturer");

  // Only add listener if the form exists 
  if (!form || !errorBox) {
    return;
  }

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

function addRole() {
  const dialog = document.getElementById("userRoleForm");
  const form = document.getElementById("addUserRoleForm");
  const errorBox = document.getElementById("errorUserRoleTitle");
  // Only add listener if the form exists 
  if (!form || !errorBox) {
    return;
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); //Stops the parent page from being refreshed and loosing data

    const formData = new FormData(form);
    const response = await fetch("/addUserRole", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      loadRoleList(); //update role list
      dialog.close();


      return;
    }

    // Show error
    errorBox.textContent = data.error;

  });
}


/** Update user role list **/

async function loadRoleList() {

  const response = await fetch('/listUserRoles');
  const selectedId = document.querySelector("#previousRole").value

  const data = await response.json();

  if (!data.success) return;

  const select = document.getElementById('userRole');
  select.innerHTML = '';

  data.roles.forEach(r => {
    const option = document.createElement('option');
    option.value = r.id_role;
    option.textContent = r.role;

    // Pre-select if this matches the previous value
    if (selectedId !== null && String(r.role) === String(selectedId)) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

async function loadCategoryList() {

  const response = await fetch('/listCategory');
  const selectedId = document.querySelector("#previousCategory").value

  const data = await response.json();

  if (!data.success) return;

  const select = document.querySelector('#categorySelect');
  select.innerHTML = '';

  data.categories.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id_categorie;
    option.textContent = c.categorie;

    // Pre-select if this matches the previous value
    if (selectedId !== null && String(c.id_categorie) === String(selectedId)) {
      option.selected = true;
    }
    select.appendChild(option);
  });


}

function openUserRole() {

  document.getElementById('userRoleForm').showModal();
  openedDialog = addUserRole;
}

function updateRoleSelect(roles) {

  const select = document.querySelector("#userRole");
  const selectedId = document.querySelector("#previousRole").value

  // Clear existing options
  select.innerHTML = "";

  // Add placeholder
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select role …";
  placeholder.disabled = true; // prevent selecting placeholder again
  select.appendChild(placeholder);

  // Add all es
  roles.forEach(m => {
    const opt = document.createElement("option");
    opt.value = r.id_role;
    opt.textContent = r.role;

    // Pre-select if this matches the previous value
    if (selectedId !== null && String(r.id_role) === String(selectedId)) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });

  // if nothing was selected
  if (selectedId === null) {
    select.selectedIndex = 0; // ensures placeholder is shown
  }
}

/** Update computer manufacturer list **/

async function loadManufacturerList() {
  const errorBox = document.querySelector(".manufacturerErrors");
  let response;

  try {
    if (manufacturerMode === "computer") {
      response = await fetch("/listComputerManufacturer", {
        method: "GET"
      });
    }
    else if (manufacturerMode === "software") {
      response = await fetch("/listSoftwareManufacturer", {
        method: "GET"
      });
    }
    else {
      response = await fetch("/listEmulatorManufacturer", {
        method: "GET"
      });
    }

    const data = await response.json();


    if (!data.success) {

      errorBox.textContent = data.error;
      return;
    }

    updateManufacturerSelect(data.manufacturers);

  } catch (err) {
    //errorBox.textContent = "Failed to load manufacturer list.";
  }
}

function updateManufacturerSelect(manufacturers) {

  let select = "";

  if (manufacturerMode === "computer") {
    select = document.querySelector("#computerManufacturerSelect")
  }
  else if (manufacturerMode === "software") {
    select = document.querySelector("#softwareManufacturerSelect");
  }
  else {
    select = document.querySelector("#emulatorManufacturerSelect");
  }

  if (!select) {
    return;
  }

  let selectedId = null;

  let previousChoice = ""
  if (manufacturerMode === "computer") {
    previousChoice = document.querySelector("#previousComputerManufacturer");
  }
  else if (manufacturerMode === "software") {
    previousChoice = document.querySelector("#previousManufacturer");
  }
  else {
    previousChoice = document.querySelector("#previousEmulatorManufacturer");
  }

  if (previousChoice) {
    selectedId = previousChoice.value;
  }

  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select manufacturer…";
  placeholder.disabled = true;
  select.appendChild(placeholder);

  manufacturers.forEach(m => {
    const opt = document.createElement("option");

    if (manufacturerMode === "computer") {
      opt.value = m.id_fab_ordinateur;
    } else if (manufacturerMode === "software") {
      opt.value = m.id_fab_logiciel;
    } else {
      opt.value = m.id_fab_emulateur;
    }

    opt.textContent = m.nom;

    if (selectedId !== null && String(opt.value) === String(selectedId)) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });

  //The selected index is equal 0 if NULL else the value selected
  select.selectedIndex = selectedId === null ? 0 : select.selectedIndex;
}

/** Update computer list **/

async function loadComputerList() {

  try {
    const response = await fetch("/listComputer", { method: "GET" });
    const data = await response.json();

    if (!data.success) {
      errorBox.textContent = data.error;
      return;
    }

    updateComputerSelect(data.computers);

  } catch (err) {
    console.error("Fetch computer list failed:", err);
  }
}

function updateComputerSelect(computers) {

  let select = ""

  if (manufacturerMode === "computer") {
    select = document.querySelector("#successor");
  }
  else {
    select = document.querySelector(".computerSelect");
  }

  if (!select) {
    return;
  }

  let previousChoice = ""

  if (manufacturerMode === "computer") {
    previousChoice = document.querySelector("#previousSuccessor");
  }
  else {
    previousChoice = document.querySelector("#previousComputer");
  }

  if (previousChoice) {
    selectedId = previousChoice.value;
  }

  select.innerHTML = "";

  // Add placeholder
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select computer…";
  select.appendChild(placeholder);

  // Add all computers
  computers.forEach(comp => {
    const opt = document.createElement("option");
    opt.value = comp.id_ordinateur;
    opt.textContent = comp.nom;

    // Pre-select if this matches the previous value
    if (selectedId !== null && String(opt.value) === String(selectedId)) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });
  //The selected index is equal 0 if NULL else the value selected
  select.selectedIndex = selectedId === null ? 0 : select.selectedIndex;

  if (manufacturerMode === "emulator") {
    const prevId = document.querySelector("#previousComputerSelect")?.value;
    if (prevId) {
      const select = document.querySelector(".computerSelect");
      select.value = String(prevId);
    }
  }

  if (manufacturerMode === "software") {
    // NOW apply preselection
    applyPreselection();
  }
}

/** Change manufacturers logo **/

function changeLogo() {

  let select = "";

  if (manufacturerMode === "computer") {
    select = document.querySelector("#computerManufacturerSelect");
  }
  else if (manufacturerMode === "software") {
    select = document.querySelector("#softwareManufacturerSelect");
  }
  else {
    select = document.querySelector("#emulatorManufacturerSelect");
  }

  const label = select.options[select.selectedIndex].text;

  if (select.selectedIndex < 1) {
    if (manufacturerMode === "computer") {
      document.querySelector("#computerManuLogo").src = "/assets/images/logos/defaultLogo.png";
    }
    else if (manufacturerMode === "software") {
      document.querySelector("#softwareManufacturerLogo").src = "/assets/images/logos/defaultLogo.png";
    }
    else {
      document.querySelector("#emulatorManufacturerLogo").src = "/assets/images/logos/defaultLogo.png";
    }
  }
  else {
    if (manufacturerMode === "computer") {
      document.querySelector("#computerManuLogo").src = "/assets/images/logos/" + label + ".webp";
    }
    else if (manufacturerMode === "software") {
      document.querySelector("#softwareManufacturerLogo").src = "/assets/images/logos/" + label + ".webp";
    }
    else {
      document.querySelector("#emulatorManufacturerLogo").src = "/assets/images/logos/" + label + ".webp";
    }
  }
}

/********  Carousel scroll ******/

function slideRight() {
 slider.scrollBy({
    left: cardWidth,
    behavior: "smooth"
  });

  
}

function slideLeft() {

  slider.scrollBy({
    left: -cardWidth,
    behavior: "smooth"
  });


}

//This is to make the carousel turn automatically
document.addEventListener("DOMContentLoaded", () => {

  //set up timer every 3 seconds scrollNext is called
	let autoScroll = setInterval(scrollNext, intervalTime);

	function scrollNext() {
    //The images scroll until th last then the counter is reset to zero causing the images to loop
		if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
			slider.scrollLeft = 0;
		} else {
			slideRight() ;
		}
	}

  //The user clicks on the carousel or moves the mouse off the carousel this starts the loop again
	slider.addEventListener("mouseenter", () => {
		clearInterval(autoScroll);
	});

	slider.addEventListener("mouseleave", () => {
		autoScroll = setInterval(scrollNext, intervalTime);
	});
});

async function loadSystemList() {

  const errorBox = document.querySelector("#systemLoadErrors");

  try {
    const response = await fetch("/listComputer", {
      method: "GET"
    });

    const data = await response.json();

    if (!data.success) {
      errorBox.textContent = data.error;
      return;
    }

    // Add all computers
    data.computers.forEach(computer => {
      let para = document.createElement('p');
      sideBarComputerList.appendChild(para);



      const name = computer.nom;

      const link = document.createElement("a");
      if (manufacturerMode == "software") {
        link.href = `/filterByComputer/${encodeURIComponent(name)}`;
      }
      else if (manufacturerMode == "emulator") {
        link.href = `/filterEmulatorByComputer/${encodeURIComponent(name)}`;
      }

      link.textContent = name;

      para.appendChild(link);



    });

  } catch (err) {
    errorBox.textContent = "Failed to load computer system list.";
  }
}

async function loadCategorySideList() {

  const errorBox = document.querySelector("#categoryLoadErrors");

  try {
    const response = await fetch("/listCategory", {
      method: "GET"
    });

    const data = await response.json();

    if (!data.success) {
      errorBox.textContent = data.error;
      return;
    }

    // Add all categories
    data.categories.forEach(category => {
      let para = document.createElement('p');
      sideBarCategoryList.appendChild(para);



      const categoryName = category.categorie;

      const link = document.createElement("a");

      link.href = `/filterPostByCategory/${encodeURIComponent(categoryName)}`;


      link.textContent = categoryName;

      para.appendChild(link);

    });

  } catch (err) {
    errorBox.textContent = "Failed to load category list.";
  }
}

document.addEventListener("DOMContentLoaded", init);

async function init() {

  if (sideBarComputerList) {
    loadSystemList();
  }

  if (sideBarCategoryList) {
    loadCategorySideList();
  }

  if (manuImage || computerProfileImage || uploadImageComputer) {
    treatImages();  // only call if at least one file input might exist
  }

  if (softwareProfileImage || uploadImageSoftware || uploadImagePost) {

    treatImages();  // only call if at least one file input might exist
  }

  if (emulatorProfileImage || uploadImageEmulator) {

    treatImages();  // only call if at least one file input might exist
  }

  let manufacturerForm = document.getElementById("computerManufacturerForm");
  if (manufacturerForm) {
    addComputer();
  }

  const userRoleForm = document.getElementById("userRoleForm");
  if (userRoleForm) {
    addRole();
  }

  //Fill the manufacturer select lists

  if (manufacturerMode === "computer") {
    manufacturerSelect = document.querySelector("#computerManufacturerSelect");
  }
  else if (manufacturerMode === "software") {
    manufacturerSelect = document.querySelector("#softwareManufacturerSelect");
  }
  else {
    manufacturerSelect = document.querySelector("#emulatorManufacturerSelect");
  }

  if (manufacturerSelect) {
    await loadManufacturerList().catch(err => {
    });
  } else {
    console.log("No manufacturer select on this page — skipping loadManufacturerList");
  }

  const successorSelect = document.querySelector("#successor");
  if (successorSelect) {
    await loadComputerList().catch(err => {
    });
  } else {
    console.log("No successor select on this page — skipping loadComputerList");
  }

  const computerSelect = document.querySelector(".computerSelect");
  if (computerSelect) {
    await loadComputerList().catch(err => {
    });
  } else {
    console.log("No computer select on this page — skipping loadComputerList");
  }

  const categorySelect = document.querySelector("#categorySelect");
  if (categorySelect) {
    await loadCategoryList().catch(err => {

    });
  } else {
    console.log("No category select on this page — skipping loadCategoryList");
  }

  const roleSelect = document.getElementById("userRole");
  if (roleSelect) {
    await loadRoleList().catch(err => {
    });
  } else {
    console.log("No userRole select on this page — skipping loadRoleList");
  }

  let btnModify = document.querySelector("#btnModify");
  let updateId = document.querySelector("#updateId");
  if (btnModify) {
    updateId = btnModify.value;
  }

}

//Get the multi selected computer system for the software
function applyPreselection() {
  const ids = new Set(window.PRESELECTED_COMPUTERS.map(String));
  const select = document.querySelector(".computerSelect");

  [...select.options].forEach(opt => {
    if (ids.has(opt.value)) {
      opt.selected = true;
    }
  });
}

function sortPostTableBy(el) {

  let sortElement = document.querySelector(`#${el}Sort`);
  if (!sortElement) {
    return;
  }

  if (sortElement.value === '' || sortElement.value === "desc") {
    sortElement.value = "asc";
    window.location.href = `/sortPostByDetails/${el}?dir=asc`;
  } else {
    sortElement.value = "desc";
    window.location.href = `/sortPostByDetails/${el}?dir=desc`;
  }
}

