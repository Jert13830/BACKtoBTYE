
const menuToggle = document.querySelector('#menu-toggle');
const navDiv = document.querySelector('#navDiv');

const roundBtn = document.querySelector('.roundBtn');

const addComputerDialogue = document.querySelector('#addComputer');

const squareBtnClose = document.querySelector('.squareBtnClose');
let openedDialog;

const btnSearch = document.querySelector('.btnSearch');

const computerName = document.querySelector('#computer');
const manufacturerName = document.querySelector('#manufacturerName');

const computerPhoto = document.querySelector('#computerPhoto');
const computerImage = document.querySelector('.computerImage');

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
  else if (imageType === "Manufactuer") { //User Images
    formData.append("filename", fileName);
    formData.append("phototype", "logos");
    //The required size of the photo
    formData.append("photoWidth", 68);
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
      window.open("/addComputer", "_self")
    }

    if (page === "softwareList") {
      window.open("/addSoftware", "_self")
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
      //Clear form data
      clearFormState("computerForm");
      const origin = "/" + document.querySelector("#originInput").value;
      window.location.href = origin;
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

    console.log('searchBar:', searchValue);
    console.log('selection:', selectionValue);
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
  manuLogo.src = "/assets/images/logos/" + button.dataset.manufacturerName + ".webp";
  btnAddManu.textContent = "Update";

  if (mode == 'computer'){

     form.action = `/updateComputerManufacturer/${manufacturerId}`;
  }
  else if (mode == 'software'){
     form.action = `/updateSoftwareManufacturer/${manufacturerId}`;
  }
  else {
     form.action = `/updateEmulatorManufacturer/${manufacturerId}`;
  }

}

// Save form data when opening the manufacturers page
function saveFormState(formSelector, storageKey) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const data = Object.fromEntries(new FormData(form));
  sessionStorage.setItem(storageKey, JSON.stringify(data));
}

//Restore form data when going back to add computer - software - emulator pages
function restoreFormState(formSelector, storageKey) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return;

  const data = JSON.parse(raw);

  Object.entries(data).forEach(([name, value]) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) return;

    if (field.tagName === "SELECT") {
      field.value = value;
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
    else if (field.type === "checkbox") {
      field.checked = value === "on" || value === true;
    }
    else if (field.type === "radio") {
      const radio = form.querySelector(
        `input[name="${name}"][value="${value}"]`
      );
      if (radio) radio.checked = true;
    }
    else if (field.type !== "file") {
      field.value = value;
    }
  });
}


//Clear form stored data
function clearFormState(storageKey) {
  sessionStorage.removeItem(storageKey);
}

//On submit clear computer form data
document.querySelector("#computerForm")?.addEventListener("submit", () => {
    clearFormState("computerForm");
  });

//Retore computer form data when loaded
document.addEventListener("DOMContentLoaded", () => {
  restoreFormState("#computerForm", "computerForm");
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
    }
  });

}



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
    if (selectedId !== null && String(r.role) === String(selectedId)) {
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

  const select = document.querySelector("#computerManufacturerSelect");
  const selectedId = document.querySelector("#previousManufacturer").value

  // Clear existing options
  select.innerHTML = "";

  // Add placeholder
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select manufacturer…";
  placeholder.disabled = true; // prevent selecting placeholder again
  select.appendChild(placeholder);

  // Add all manufacturers
  manufacturers.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id_fab_ordinateur;
    opt.textContent = m.nom;

    // Pre-select if this matches the previous value
    if (selectedId !== null && String(m.id_fab_ordinateur) === String(selectedId)) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });

  // if nothing was selected
  if (selectedId === null) {
    select.selectedIndex = 0; // ensures placeholder is shown
  }
}

/** Update computer list **/

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
  const selectedId = document.querySelector("#previousSuccessor");

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

    // Pre-select if this matches the previous value
    if (selectedId !== null && String(m.successeur) === String(selectedId)) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });
}

/** Change computer manufacturers logo **/

function changeLogo() {

  const select = document.querySelector("#computerManufacturerSelect");
  const label = select.options[select.selectedIndex].text;
  if (select.selectedIndex < 1) {
    document.querySelector("#computerManuLogo").src = "/assets/images/logos/defaultLogo.png";
  }
  else {
    document.querySelector("#computerManuLogo").src = "/assets/images/logos/" + label + ".webp";
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


document.addEventListener("DOMContentLoaded", init);

async function init() {

  const manuImage = document.querySelector('.manuImage');
  const computerProfileImage = document.querySelector('#computerPhoto'); // or whatever the ID is
  const uploadImageComputer = document.querySelector('#uploadImageComputer'); // adjust if needed
   let manufacturers = [];

  if (manuImage || computerProfileImage || uploadImageComputer) {
    treatImages();  // only call if at least one file input might exist
  }

  const manufacturerForm = document.getElementById("computerManufacturerForm");
  if (manufacturerForm) {
    addComputer();
  }

  const userRoleForm = document.getElementById("userRoleForm");
  if (userRoleForm) {
    addRole();
  }

  manufacturerSelect = document.querySelector("#computerManufacturerSelect");
  if (manufacturerSelect) {
    await loadManufacturerList().catch(err => {
      console.error("Failed to load manufacturers:", err);
    });
  } else {
    console.log("No manufacturer select on this page — skipping loadManufacturerList");
  }

  const successorSelect = document.querySelector("#successor");
  if (successorSelect) {
    await loadComputerList().catch(err => {
      console.error("Failed to load computers:", err);
    });
  } else {
    console.log("No successor select on this page — skipping loadComputerList");
  }

  const roleSelect = document.getElementById("userRole");
  if (roleSelect) {
    await loadRoleList().catch(err => {
      console.error("Failed to load roles:", err);
    });
  } else {
    console.log("No userRole select on this page — skipping loadRoleList");
  }

  const btnModify = document.querySelector("#btnModify");
  const updateId = document.querySelector("#updateId");
  if (btnModify) {
    updateId = btnModify.value;
  }
  console.log("All relevant data loaded successfully!");
}

