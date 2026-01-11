const { PrismaClient } = require('@prisma/client');
const validateEmulator = require("../middleware/extensions/validateEmulator");

const prisma = new PrismaClient().$extends(validateEmulator);


const errors = {};

const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");

//Show add emulator page
exports.addEmulator = (req, res) => {
  res.render("pages/addEmulator.twig", {
    title: "Add Emulator",
    error: null,
  })
}

exports.displayEmulatorList = async (req, res) => {
  try {
    const emulators = await prisma.emulateur.findMany({
      include: {
        photos: true,
        ordinateur: true,
        fabricantEmulateur: true,
      },
    })

    res.render("pages/emulatorList.twig", {
      title: "Emulator",
      emulators,
      error: null,
    });

  } catch (error) {
    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
        emulators
      });
    }

    // Unknown error
    errors.emulator = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/home.twig", {
      errors,
    });
  }

}


//Create emulator
exports.postEmulator = async (req, res) => {
  const data = req.body;

  console.log(data);

  try {

    const name = req.body.emulatorName.trim();
    const exists = await prisma.emulateur.findFirst({
      where: { nom: name }
    });

    if (exists) {
      errors.emulator = "Emulator title already exists";

      return res.render("pages/addEmulator.twig", {
        errors,
        data,
        mode: "emulator",
      });
    }
    

    // Create emulator
    const emulators = await prisma.emulateur.create({
      data: {
        nom: name,
        annee: Number(data.annee),
        lien: data.emulatorLink,
        details: data.detailsInfo,
        langue: data.language,
        id_fab_emulateur: Number(data.emulatorManufacturerSelect),
        id_ordinateur: Number(data.computerSelect),
        
      }
    });

    let filePath = fs.existsSync(`./public/assets/images/emulator/${name}.webp`);
    console.log(`${name}.webp exists:`, filePath);

    if (filePath) {
      filePath = `/assets/images/emulator/${name}.webp`;
    } else {
      filePath = "/assets/images/emulator/defaultEmulator.webp";
      console.log("Emulator does not exist:", filePath);
    }

    //Save emulator photo
    await prisma.photo.create({
      data: {
        id_emulateur: emulators.id_emulateur,
        alt: `${name} emulator`,
        path: filePath,
      },
    });

    //Open emulator list
    return res.redirect("/displayEmulatorList");

  } catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/addEmulator.twig", {
        errors: error.details,
        data,
      });
    }

    // Unknown error
    errors.emulator = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/addEmulator.twig", {
      errors,
      data,
    });
  }

}

exports.filterEmulatorList = async (req, res) => {
  try {
    const { emulatorResearchbar, selection } = req.body;

    // WHERE the searchBar the emulator title, emulator manufacturer's name or is
    const where = emulatorResearchbar
      ? {
        OR: [
          {
            nom: {
              contains: emulatorResearchbar,
            },
          },
          {
            fabricantEmulateur: {
              nom: {
                contains: emulatorResearchbar,
              },
            },
          },
        ],
      }
      : undefined;

    let orderBy;

    orderBy = {
      annee: 'asc',
    };

    const emulators = await prisma.emulateur.findMany({
      where,
      orderBy,
      include: {
        photos: true,
        fabricantEmulateur: true,
        ordinateur: true,
      },
    });

    res.render('pages/emulatorList.twig', { emulators });
  }
  catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/emulatorList.twig", {
        errors: error.details,
        data
      });
    }

    // Unknown error
    console.error(error);

    return res.render("pages/emulatorList.twig", {
      errors,
      data
    });
  }

};

exports.filterEmulatorByComputer = async (req, res) => {
  try {
    const computerName = req.params.id;


    // Find the computer
    const ordinateur = await prisma.ordinateur.findFirst({
      where: {
        nom: computerName,
      },
    });

    if (!ordinateur) {
      return res.render("pages/emulatorList.twig", {
        emulators: [],
        message: "Computer not found",
      });
    }

    // Find emulators table
    const emulators = await prisma.emulateur.findMany({
      where: {
        id_ordinateur: ordinateur.id_ordinateur,
      },
      include: {
        fabricantEmulateur: true,
        photos: true,
        ordinateur: true,
      },
    });

    // Render result
    res.render("pages/emulatorList.twig", {
      emulators,
      ordinateur,
    });

  } catch (error) {
    console.error(error);
    res.render("pages/emulatorList.twig", {
      emulators: [],
      error: "An error occurred",
    });
  }
};

exports.updateEmulatorList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const action = req.body.buttons; // "delete-123" or "modify-123"

  console.log("ACTION : ",action);

  let emulators = [];

  //Delete the emulator
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {

      //send this data back to fill table if there is an error
      const emulators = await prisma.emulateur.findMany({
        include: {
          photos: true,
          fabricantEmulateur: true,
          ordinateur: true,
        },
      });

      console.log("Deleting photo ", toDelete);
      //Delete the emulator photo logo
      await prisma.photo.deleteMany({
        where: {
          id_emulateur: toDelete,
        },
      });

      //get emulator name for deleting image
      const emulatorToDelete = await prisma.emulateur.findFirst({
        where: {
          id_emulateur: toDelete
        }
      });

      //delete the photo from the folder
      console.log("Deleting physical photo ");
      let filePath = fs.existsSync(`./public/assets/images/emulator/${emulatorToDelete.nom}.webp`);
      console.log(`${emulatorToDelete.nom}.webp exists:`, filePath);

      if (filePath) {
        fs.unlink(`./public/assets/images/emulator/${emulatorToDelete.nom}.webp`, (err) => {
          if (err) throw err;
          console.log("File deleted");
        });
      }

      console.log("Deleting emulator");
      //Delete the emulator
      await prisma.emulateur.delete({
        where: {
          id_emulateur: toDelete
        }
      });

      console.log("Emulator deleted returning");

      //Return to the list of emulator
      res.redirect("/displayEmulatorList");

    } catch (error) {

      errors.manufacturerName = "The emulator could not be deleted"
      res.render("pages/emulatorList.twig", {
        errors,
        mode: "emulator",
        title: "Emulator",
      });

    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify
    console.log("ID : ",id);
    res.redirect("/showUpdateEmulator/" + id);

  }
};


exports.updateEmulator = async (req, res) => {

  const emulatorName = req.body.emulatorName;
  const emulatorNameBeforeChange = req.body.emulatorNameBeforeChange;
  const emulatorId = parseInt(req.params.id);
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const data = req.body;
  const imageDir = path.join(__dirname, "../public/assets/images/emulator");

  const nameChanged = emulatorName !== emulatorNameBeforeChange;
  const newImageUploaded = !!req.file;

  const oldImageFs = path.join(imageDir, `${emulatorNameBeforeChange}.webp`);
  const newImageFs = path.join(imageDir, `${emulatorName}.webp`);

  const imageUrl = `/assets/images/emulator/${emulatorName}.webp`;
  let emulators = [];

  console.log("Data to be UPDATED: ", req.body);

  try {

    //send this data back to fill table if there is an error
    const emulators = await prisma.emulateur.findMany({
      include: {
        photos: true,
        fabricantEmulateur: true,
        ordinateur: true,
      },
    })

    //Find if a emulator has the same name
    const emulatorNameExists = await prisma.emulateur.findFirst({
      where: { nom: emulatorName }
    });

    console.log("UPDATING : check if emulator exists");

    //Check if the id number is the same as the current one we are changing
    if (emulatorNameExists && emulatorId !== emulatorNameExists.id_emulateur) {
      //The name already exists
      console.log("Emulator : ", emulatorName);
      console.log("UPDATING : Error with name or ID ", emulatorNameExists.id_emulateur, emulatorId);
      errors.manufacturerName = "The emulator title already exists"
      return res.render("pages/emulatorList.twig", {
        emulators,
        errors,
        mode: "emulator",
        title: "Emulator",
        tranaction: "update",
      });
    }

    //Update photo
    console.log("UPDATING : updating photo");
    //Handle filesystem
    if (nameChanged && !newImageUploaded && fs.existsSync(oldImageFs)) {
      //Name changed only  - copy old image
      await fsPromises.copyFile(oldImageFs, newImageFs);
    }

    if (newImageUploaded) {
      //New image uploaded - save image
      await fsPromises.writeFile(newImageFs, req.file.buffer);
    }

    if (!fs.existsSync(newImageFs)) {
      //No image - use default image
      const defaultImage = path.join(imageDir, "defaultEmulator.webp");
      await fsPromises.copyFile(defaultImage, newImageFs);
    }

    const photo = await prisma.photo.findFirst({
      where: { id_emulateur: emulatorId },
    });

    if (photo) {
      await prisma.photo.update({
        where: { id_photo: photo.id_photo },
        data: {
          alt: `${emulatorName} image`,
          path: imageUrl,
        },
      });
    }

    console.log("UPDATING :emulator");
    await prisma.emulateur.update({
      where: { id_emulateur: emulatorId },
      data: {
        nom: emulatorName,
        annee: Number(data.annee),
        lien: data.emulatorLink,
        details: data.detailsInfo,
        langue: data.language,
        id_fab_emulateur: Number(data.emulatorManufacturerSelect),
        id_ordinateur : Number(data.computerSelect),
      },
    });


    console.log("UPDATING : updated database");

    //Cleanup old image file ONLY if name changed
    if (nameChanged && fs.existsSync(oldImageFs)) {
      await fsPromises.unlink(oldImageFs);
    }

    //Return to the list of emulator
    res.redirect("/displayEmulatorList");

  } catch (error) {
    console.error("Update emulator Error:", error);

    // Prisma unique constraint
    if (error.code === "P2002") {
      errors.manufacturerName = "The emulator title already exists";

      return res.render("pages/emulatorList.twig", {
        emulators,
        errors,
        mode: "emulator",
        title: "Emulator",
        tranaction: "update",
      });
    }

    // Prisma extension validation error
    if (error.details?.emulatorName) {
      return res.render("pages/emulatorList.twig", {
        emulators,
        errors: error.details,
        mode: "emulator",
        title: "Emulator",
        tranaction: "update",
      });
    }

    // Fallback
    errors.global = "An unexpected error occurred. Please try again.";

    return res.status(500).render("pages/emulatorList.twig", {
      emulators,
      errors,
      mode: "emulator",
      title: "Emulator",
      tranaction: "update",
    });
  }
}

exports.emulatorDetailSelect = async (req, res) => {
  const origin = req.query.origin;

  try {
    const data = await prisma.emulateur.findUnique({
      where: {
        id_emulateur: Number(req.params.id)
      },
      include:
      {
        photos: true,
        fabricantEmulateur: true,
        ordinateur: true,
      },
    })

    console.log("Here is the computer data : ", data);


    res.render("pages/addEmulator.twig", {
      title: "Emulator Details",
      data,
      origin,
    });
  }
  catch (error) {
    req.session.errorRequest = "Emulator data could not be sent";
    console.log("Emulator data could not be sent");
    res.redirect("/pages/emulatorList.twig");
  }
}

exports.showUpdateEmulator = async (req, res) => {
  console.log("Ready to show");
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const emulatorId = Number(req.params.id);

  console.log("Updating Emulator : ", emulatorId);

  try {
    const data = await prisma.emulateur.findUnique({
      where: {
        id_emulateur: emulatorId,
      },
      include:
      {
        photos: true,
        fabricantEmulateur: true,
        ordinateur: true,
       
      },
    })

    //console.log("Data for updating : ", data);
    console.log("Data coming back: ",data);
    res.render("pages/addEmulator.twig", {
      title: "Emulator Details",
      data,
      transaction: "update",
    });
  }
  catch (error) {
    req.session.errorRequest = "Emulator data could not be sent";
    console.log("Emulator data could not be sent");
    res.redirect("/emulatorList");
  }
};