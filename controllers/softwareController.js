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

    console.log("Software : ", softwares);

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

  console.log(data);

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
        id_fab_logiciel: Number(data.manufacturerSelect),
      }
    });


    let filePath = fs.existsSync(`./public/assets/images/software/${name}.webp`);
    console.log(`${name}.webp exists:`, filePath);

    if (filePath) {
      filePath = `/assets/images/software/${name}.webp`;
    } else {
      filePath = "/assets/images/software/defaultSoftware.webp";
      console.log("Software does not exist:", filePath);
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
    const { softwaResearchbar, selection } = req.body;

    // WHERE the searchBar the software title, software manufacturer's name or is
    const where = softwaResearchbar
      ? {
        OR: [
          {
            nom: {
              contains: softwaResearchbar,
            },
          },
          {
            fabricantLogiciel: {
              nom: {
                contains: softwaResearchbar,
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

      console.log("Deleting versions");

      //Delete all versions of software
      await prisma.version.deleteMany({
        where: { id_logiciel: toDelete }
      });

      console.log("Deleting photo ", toDelete);
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
      console.log("Deleting physical photo ");
      let filePath = fs.existsSync(`./public/assets/images/software/${softwareToDelete.nom}.webp`);
      console.log(`${softwareToDelete.nom}.webp exists:`, filePath);

      if (filePath) {
        fs.unlink(`./public/assets/images/software/${softwareToDelete.nom}.webp`, (err) => {
          if (err) throw err;
          console.log("File deleted");
        });
      }

      console.log("Deleting software");
      //Delete the software
      await prisma.logiciel.delete({
        where: {
          id_logiciel: toDelete
        }
      });



      console.log("Software deleted returning");

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

  const manufacturerName = req.body.manufacturerName;
  const nameBeforeChange = req.body.nameBeforeChange;
  const manufacturerId = parseInt(req.params.id);
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers



  const logoDir = path.join(__dirname, "../public/assets/images/logos");

  const nameChanged = manufacturerName !== nameBeforeChange;
  const newLogoUploaded = !!req.file;

  const oldLogoFs = path.join(logoDir, `${nameBeforeChange}.webp`);
  const newLogoFs = path.join(logoDir, `${manufacturerName}.webp`);

  const logoUrl = `/assets/images/logos/${manufacturerName}.webp`;
  let manufacturers = [];

  console.log("Data : ", req.body);

  try {

    //send this data back to fill table if there is an error
    manufacturers = await prisma.fabricantOrdinateur.findMany({
      include:
      {
        photos: true,
      },
    });

    //Find if a manufacturer has the same name
    const manufacturerNameExists = await prisma.fabricantOrdinateur.findFirst({
      where: { nom: manufacturerName }
    });

    //Check if the id number is the same as the current one we are changing
    if (manufacturerNameExists && manufacturerId !== manufacturerNameExists.id_fab_ordinateur) {
      //The name already exists
      errors.manufacturerName = "The manufacturer already exists"
      return res.render("pages/manufacturerList.twig", {
        manufacturers,
        errors,
        mode: "computer",
        title: "Computer Manufacturer",
      });
    }

    //Update photo

    //Handle filesystem
    if (nameChanged && !newLogoUploaded && fs.existsSync(oldLogoFs)) {
      //Name changed only  - copy old logo
      await fsPromises.copyFile(oldLogoFs, newLogoFs);
    }

    if (newLogoUploaded) {
      //New logo uploaded - save logo
      await fsPromises.writeFile(newLogoFs, req.file.buffer);
    }

    if (!fs.existsSync(newLogoFs)) {
      //No logo - use dfault logo
      const defaultLogo = path.join(logoDir, "defaultLogo.webp");
      await fsPromises.copyFile(defaultLogo, newLogoFs);
    }

    //Update database
    await prisma.$transaction([
      prisma.photo.updateMany({
        where: { id_fab_ordinateur: manufacturerId },
        data: {
          alt: `${manufacturerName} logo`,
          path: logoUrl,
        },
      }),
      prisma.fabricantOrdinateur.update({
        where: { id_fab_ordinateur: manufacturerId },
        data: { nom: manufacturerName },
      }),
    ]);

    //Cleanup old logo file ONLY if name changed
    if (nameChanged && fs.existsSync(oldLogoFs)) {
      await fsPromises.unlink(oldLogoFs);
    }

    //Return to the list of computer manufacturers
    res.redirect("/showComputerManufacturers");

  } catch (error) {
    console.error("Update Computer Manufacturer Error:", error);

    // Prisma unique constraint
    if (error.code === "P2002") {
      errors.manufacturerName = "The manufacturer already exists";

      return res.render("pages/manufacturerList.twig", {
        manufacturers,
        errors,
        mode: "computer",
        title: "Computer Manufacturer",
      });
    }

    // Prisma extension validation error
    if (error.details?.manufacturerName) {
      return res.render("pages/manufacturerList.twig", {
        manufacturers,
        errors: error.details,
        mode: "computer",
        title: "Computer Manufacturer",
      });
    }

    // Fallback
    errors.global = "An unexpected error occurred. Please try again.";

    return res.status(500).render("pages/manufacturerList.twig", {
      manufacturers,
      errors,
      mode: "computer",
      title: "Computer Manufacturer",
    });
  }
}

exports.softwareDetailSelect = async (req, res) => {
  const origin = req.query.origin;

  console.log("Origin : ", origin);

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

    console.log("Here is the computer data : ", data);

    const computers = [
      ...new Map(
        data.versions.flatMap(v => v.ordinateur)
          .map(o => [o.id_ordinateur, o])
      ).values()
    ];

    console.log("Computers : ", computers);

    res.render("pages/addSoftware.twig", {
      title: "Software Details",
      data,
      origin,
      computers,
    });
  }
  catch (error) {
    req.session.errorRequest = "Software data could not be sent";
    console.log("Software data could not be sent");
    res.redirect("/pages/softwareList.twig");
  }
}

exports.showUpdateSoftware = async (req, res) => {
  console.log("Ready to show");
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const softwareId = Number(req.params.id);

  console.log("Software data : ", req.body);

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

    console.log("Data for updating : ", data);

    const computers = [
      ...new Map(
        data.versions.flatMap(v => v.ordinateur)
          .map(o => [o.id_ordinateur, o])
      ).values()
    ];

    const computerIds = computers.map(c => c.id_ordinateur);

    console.log("COMPUTERS : ", computers);

    res.render("pages/addSoftware.twig", {
      title: "Software Details",
      data,
      transaction: "update",
      computerIds,
    });
  }
  catch (error) {
    req.session.errorRequest = "Software data could not be sent";
    console.log("Software data could not be sent");
    res.redirect("/softwareList");
  }
};