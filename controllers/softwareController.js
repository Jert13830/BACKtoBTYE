const { PrismaClient } = require('@prisma/client');
const validateSoftware = require("../middleware/extensions/validateSoftware");

const prisma = new PrismaClient().$extends(validateSoftware);


const errors = {};

const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");

//Show add software page
exports.addSoftware = (req, res) => {
  res.render("pages/addSoftware.twig", {
    title: "Add Software",
    error: null,
  })
}

exports.displaySoftwareList = async (req, res) => {
  try {
    const softwares = await prisma.logiciel.findMany({
      include: {
        photos: true,
        fabricantLogiciel: true,
        versions: {
          include: {
            ordinateur: true,
          },
        },
      },
    })

    

    res.render("pages/softwareList.twig", {
      title: "Software",
      softwares,
      error: null,
    });

  } catch (error) {
    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
        softwares
      });
    }

    // Unknown error
    errors.software = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/home.twig", {
      errors,
    });
  }

}


//Create software
exports.postSoftware = async (req, res) => {
  const data = req.body;

  

  try {

    const name = req.body.softwareName.trim();
    const exists = await prisma.logiciel.findFirst({
      where: { nom: name }
    });

    if (exists) {
      errors.software = "Software title already exists";

      return res.render("pages/addSoftware.twig", {
        errors,
        data,
        mode: "software",
      });
    }

    // Create software
    const softwares = await prisma.Logiciel.create({
      data: {
        nom: name,
        annee: Number(data.annee),
        lien: data.softwareLink,
        details: data.detailsInfo,
        langue: data.language,
        id_fab_logiciel: Number(data.softwareManufacturerSelect),
      }
    });


    let filePath = fs.existsSync(`./public/assets/images/software/${name}.webp`);
    

    if (filePath) {
      filePath = `/assets/images/software/${name}.webp`;
    } else {
      filePath = "/assets/images/software/defaultSoftware.webp";
      
    }

    //Save computer photo
    await prisma.photo.create({
      data: {
        id_logiciel: softwares.id_logiciel,
        alt: `${name} software`,
        path: filePath,
      },
    });


    //Create different version enteries for each computer

    //Make sure that computerSelect is an array even if one item selected
    const computers = Array.isArray(data.computerSelect)
      ? data.computerSelect
      : [data.computerSelect];


    for (const computer of computers) {
      await prisma.version.create({
        data: {
          id_logiciel: softwares.id_logiciel,
          id_ordinateur: Number(computer),
        },
      });
    }

    //Open software list
    return res.redirect("/displaySoftwareList");

  } catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/addSoftware.twig", {
        errors: error.details,
        data,
      });
    }

    // Unknown error
    errors.software = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/addSoftware.twig", {
      errors,
      data,
    });
  }

}

exports.filterSoftwareList = async (req, res) => {
  try {
    const { softwareResearchbar, selection } = req.body;

    // WHERE the searchBar the software title, software manufacturer's name or is
    const where = softwareResearchbar
      ? {
        OR: [
          {
            nom: {
              contains: softwareResearchbar,
            },
          },
          {
            fabricantLogiciel: {
              nom: {
                contains: softwareResearchbar,
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

    const softwares = await prisma.logiciel.findMany({
      where,
      orderBy,
      include: {
        photos: true,
        fabricantLogiciel: true,
        versions: {
          include: {
            ordinateur: true,
          },
        },
      },
    });

    res.render('pages/softwareList.twig', { softwares });
  }
  catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/softwareList.twig", {
        errors: error.details,
        data
      });
    }

    // Unknown error
    console.error(error);

    return res.render("pages/softwareList.twig", {
      errors,
      data
    });
  }

};

exports.filterByComputer = async (req, res) => {
  try {
    const computerName = req.params.id;


    // Find the computer
    const ordinateur = await prisma.ordinateur.findFirst({
      where: {
        nom: computerName,
      },
    });

    if (!ordinateur) {
      return res.render("pages/softwareList.twig", {
        softwares: [],
        message: "Computer not found",
      });
    }

    // Find logiciels via versions table
    const softwares = await prisma.logiciel.findMany({
      where: {
        versions: {
          some: {
            id_ordinateur: ordinateur.id_ordinateur,
          },
        },
      },
      include: {
        fabricantLogiciel: true,
        photos: true,
        versions: {
          where: {
            id_ordinateur: ordinateur.id_ordinateur,
          },
          include: {
            ordinateur: true,
          },
        },
      },
    });

    // Render result
    res.render("pages/softwareList.twig", {
      softwares,
      ordinateur,
    });

  } catch (error) {
    console.error(error);
    res.render("pages/softwareList.twig", {
      softwares: [],
      error: "An error occurred",
    });
  }
};

exports.updateSoftwareList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const action = req.body.buttons; // "delete-123" or "modify-123"
  let softwares = [];

  //Delete the software
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {

      //send this data back to fill table if there is an error
      const softwares = await prisma.logiciel.findMany({
        include: {
          photos: true,
          fabricantLogiciel: true,
          versions: {
            include: {
              ordinateur: true,
            },
          },
        },
      })

     

      //Delete all versions of software
      await prisma.version.deleteMany({
        where: { id_logiciel: toDelete }
      });

   
      //Delete the software photo logo
      await prisma.photo.deleteMany({
        where: {
          id_logiciel: toDelete,
        },
      });

      //get software name for deleting image
      const softwareToDelete = await prisma.logiciel.findFirst({
        where: {
          id_logiciel: toDelete
        }
      });

      //delete the photo from the folder
      let filePath = fs.existsSync(`./public/assets/images/software/${softwareToDelete.nom}.webp`);
      
      if (filePath) {
        fs.unlink(`./public/assets/images/software/${softwareToDelete.nom}.webp`, (err) => {
          if (err) throw err;
        });
      }

      //Delete the software
      await prisma.logiciel.delete({
        where: {
          id_logiciel: toDelete
        }
      });

      //Return to the list of software
      res.redirect("/displaySoftwareList");

    } catch (error) {

      errors.softwareName = "The software could not be deleted"
      res.render("pages/softwareList.twig", {
        errors,
        mode: "software",
        title: "Software",
      });

    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify

    res.redirect("/showUpdateSoftware/" + id);

  }
};


exports.updateSoftware = async (req, res) => {

  const softwareName = req.body.softwareName;
  const softwareNameBeforeChange = req.body.softwareNameBeforeChange;
  const softwareId = parseInt(req.params.id);
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const data = req.body;
  const imageDir = path.join(__dirname, "../public/assets/images/software");

  const nameChanged = softwareName !== softwareNameBeforeChange;
  const newImageUploaded = !!req.file;

  const oldImageFs = path.join(imageDir, `${softwareNameBeforeChange}.webp`);
  const newImageFs = path.join(imageDir, `${softwareName}.webp`);

  const imageUrl = `/assets/images/software/${softwareName}.webp`;
  let softwares = [];

 

  try {

    //send this data back to fill table if there is an error
    const softwares = await prisma.logiciel.findMany({
      include: {
        photos: true,
        fabricantLogiciel: true,
        versions: {
          include: {
            ordinateur: true,
          },
        },
      },
    })

    //Find if a software has the same name
    const softwareNameExists = await prisma.logiciel.findFirst({
      where: { nom: softwareName }
    });

    //Check if the id number is the same as the current one we are changing
    if (softwareNameExists && softwareId !== softwareNameExists.id_logiciel) {
      //The name already exists
      errors.softwareName = "The software title already exists"
      return res.render("pages/softwareList.twig", {
        softwares,
        errors,
        mode: "software",
        title: "Software",
        tranaction: "update",
      });
    }

    //Update photo
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
      const defaultImage = path.join(imageDir, "defaultSoftware.webp");
      await fsPromises.copyFile(defaultImage, newImageFs);
    }

    //Delete all versions of software
    await prisma.version.deleteMany({
      where: { id_logiciel: softwareId }
    });

    //Recreate versions
    //Make sure that computerSelect is an array even if one item selected
    const computers = Array.isArray(data.computerSelect)
      ? data.computerSelect
      : [data.computerSelect];


    for (const computer of computers) {
      await prisma.version.create({
        data: {
          id_logiciel: softwareId,
          id_ordinateur: Number(computer),
        },
      });
    }


    const photo = await prisma.photo.findFirst({
      where: { id_logiciel: softwareId },
    });

    if (photo) {
      await prisma.photo.update({
        where: { id_photo: photo.id_photo },
        data: {
          alt: `${softwareName} image`,
          path: imageUrl,
        },
      });
    }

    await prisma.logiciel.update({
      where: { id_logiciel: softwareId },
      data: {
        nom: softwareName,
        annee: Number(data.annee),
        lien: data.softwareLink,
        details: data.detailsInfo,
        langue: data.language,
        id_fab_logiciel: Number(data.softwareManufacturerSelect),
      },
    });



    //Cleanup old image file ONLY if name changed
    if (nameChanged && fs.existsSync(oldImageFs)) {
      await fsPromises.unlink(oldImageFs);
    }

    //Return to the list of software
    res.redirect("/displaySoftwareList");

  } catch (error) {
    console.error("Update software Error:", error);

    // Prisma unique constraint
    if (error.code === "P2002") {
      errors.manufacturerName = "The software title already exists";

      return res.render("pages/softwareList.twig", {
        softwares,
        errors,
        mode: "software",
        title: "Software",
        tranaction: "update",
      });
    }

    // Prisma extension validation error
    if (error.details?.softwareName) {
      return res.render("pages/softwareList.twig", {
        softwares,
        errors: error.details,
        mode: "software",
        title: "Software",
        tranaction: "update",
      });
    }

    // Fallback
    errors.global = "An unexpected error occurred. Please try again.";

    return res.status(500).render("pages/softwareList.twig", {
      softwares,
      errors,
      mode: "software",
      title: "Software",
      tranaction: "update",
    });
  }
}

exports.softwareDetailSelect = async (req, res) => {
  const origin = req.query.origin;


  try {
    const data = await prisma.logiciel.findUnique({
      where: {
        id_logiciel: Number(req.params.id_logiciel)
      },
      include:
      {
        photos: true,
        fabricantLogiciel: true,
        versions: {
          include: {
            ordinateur: true,
          },
        },
      },
    })

  

    const computers = [
      ...new Map(
        data.versions.flatMap(v => v.ordinateur)
          .map(o => [o.id_ordinateur, o])
      ).values()
    ];

    const computerIds = [
      ...new Map(
        data.versions.flatMap(v => v.ordinateur)
          .map(o => [o.id_ordinateur, o])
      ).keys()
    ];

    res.render("pages/addSoftware.twig", {
      title: "Software Details",
      data,
      origin,
      computers,
      computerIds,
    });
  }
  catch (error) {
    req.session.errorRequest = "Software data could not be sent";
 
    res.redirect("/pages/softwareList.twig");
  }
}

exports.showUpdateSoftware = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const softwareId = Number(req.params.id);


  try {
    const data = await prisma.logiciel.findUnique({
      where: {
        id_logiciel: softwareId,
      },
      include:
      {
        photos: true,
        fabricantLogiciel: true,
        versions: {
          include: {
            ordinateur: true,
          },
        },
      },
    })

    

    const computers = [
      ...new Map(
        data.versions.flatMap(v => v.ordinateur)
          .map(o => [o.id_ordinateur, o])
      ).values()
    ];

    //Change values to numbers
    const computerIds = computers.map(c => Number(c.id_ordinateur));


    res.render("pages/addSoftware.twig", {
      title: "Software Details",
      data,
      transaction: "update",
      computerIds,
    });
  }
  catch (error) {
    req.session.errorRequest = "Software data could not be sent";
    res.redirect("/softwareList");
  }
};