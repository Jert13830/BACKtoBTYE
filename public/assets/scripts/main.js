const menuToggle = document.querySelector('#menu-toggle');
const navDiv = document.querySelector('#navDiv');

const roundBtn = document.querySelector('.roundBtn');
const addComputerDialogue = document.querySelector('#addComputer');

const closeModalBtn = document.querySelector('.squareBtnClose');
let openedDialog;

const computerProfilePhoto = document.querySelector(".image img");
const computerImage = document.querySelector(".computerImage");
const computerProfileIamge =  document.querySelector("#computerProfileIamge");



let computerPhotoPath  = '/assets/images/';


//let file;
//let img;

/*computerImage.onchange = async function() {
 
  computerProfilePhoto.src = URL.createObjectURL(computerImage.files[0]);
  file = computerImage.files[0];
  img = await loadImage(file);

  //Resize to 486px * 336px
  const canvas = document.createElement('canvas');
  canvas.width  = 486;
  canvas.height = 336;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 486, 336);

// ---- Convert to WebP blob ----
fileBlob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.90));

const photofile = document.querySelector('#computer').value + '.webp';
alert(photofile);
await saveToFolder(fileBlob, photofile);
  
}


async function saveToFolder(blob, filename){

    let directoryHandle  ='/assets/images/';
    const fileHandle = await directoryHandle.getFileHandle(filename, {create:true});
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
}*/


/***********************************/
computerImage.addEventListener("change", async () => {
  const files = computerImage.files;
  if (!files.length) return;

  // Clear previews and reset state
 computerProfileIamge.innerHTML = "";
  resizedBlobs = [];

  // Loop through all selected images
  for (const file of files) {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 486;
      canvas.height = 336;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 486, 336);

      // Convert canvas to Blob
      canvas.toBlob(
        (blob) => {
          resizedBlobs.push({ blob, name: file.name });
          statusText.textContent = `${resizedBlobs.length} image(s) ready to upload!`;
        },
        "image/png",
        0.9
      );

      
    };

    img.src = URL.createObjectURL(file);

    loadImage();
  }
});

// Upload to server
async function loadImage(){
  if (!resizedBlobs?.length) return alert("Please select an image first!");

  statusText.textContent = "Uploading...";

  const formData = new FormData();

  // 👇 If one image, use "file", else use "files"
  if (resizedBlobs.length === 1) {
    formData.append("file", resizedBlobs[0].blob, resizedBlobs[0].name);
  } else {
    resizedBlobs.forEach((fileData, i) => {
      formData.append("files", fileData.blob, fileData.name || `image-${i + 1}.png`);
    });
  }

  // Metadata (optional)
  formData.append("filename", "amstradcpc464");
  formData.append("phototype", "computers");

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      statusText.textContent = "✅ Upload complete!";
      uploadedPreview.innerHTML = "";

      const urls = data.files || [data.path];
      urls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.style.width = "120px";
        img.style.margin = "5px";
        uploadedPreview.appendChild(img);
      });
    } else {
      statusText.textContent = "❌ Upload failed.";
    }
  } catch (err) {
    console.error(err);
    statusText.textContent = "❌ Error uploading images.";
  }
}

/***********************************/

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navDiv.classList.toggle('active');
});

// Close when clicking a link
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
        openedDialog = addComputerDialogue;
    }

   

});

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
