const { PrismaClient } = require('@prisma/client');
const validateComputer = require("../middleware/extensions/validateComputer");

const prisma = new PrismaClient().$extends(validateComputer);

const errors = {};

const fs = require('fs');


// Show homepage
exports.displayHome = async (req,res)=>{
   try {
    const computers = await prisma.ordinateur.findMany({
      include:
      {
        photos: true,
        fabricantOrdinateur: true,
        popularites: true,
        raretes: true,
      },
    });

    res.render("pages/home.twig", {
      title: "Home",
      computers,
      error: null,
    });

  } catch (error) {
    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
        computers
      });
    }

    // Unknown error
    errors.computerName = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/home.twig", {
      errors,
      computers
    });
  }

}

// Show computer list page

exports.displayComputerList = async (req, res) => {
  try {
    const computers = await prisma.ordinateur.findMany({
      include:
      {
        photos: true,
        fabricantOrdinateur: true,
        popularites: true,
        raretes: true,
      },
    });

    res.render("pages/computerList.twig", {
      title: "Computer List",
      computers,
      error: null,
    });

  } catch (error) {
    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
        computers
      });
    }

    // Unknown error
    errors.computerName = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/home.twig", {
      errors,
      computers
    });
  }

}



//Show add computer screen
exports.displayAddComputer = (req, res) => {
  res.render("pages/addComputer.twig", {
    title: "Add Computer",
    error: null,
  })
}

//Get the list of Computer
exports.listComputer = async (req, res) => {
  try {
    const computers = await prisma.ordinateur.findMany();

    return res.json({
      success: true,
      computers
    });

  } catch (error) {
    console.error("Error retrieving computers:", error);

    return res.status(500).json({
      success: false,
      error: "Unexpected error while retrieving computers."
    });
  }
};

//Create computer
exports.postComputer = async (req, res) => {
  const data = req.body;
  const name = req.body.computer.trim();

  console.log(data);

  try {
    const exists = await prisma.ordinateur.findFirst({
      where: { nom: name }
    });

    if (exists) {
      errors.computerName = "Computer already exists";

      return res.render("pages/addComputer.twig", {
        errors,
        data
      });
    }

    // Create computer
    const comput = await prisma.ordinateur.create({
      data: {
        nom: name,
        annee: Number(req.body.manufacturerYear),
        cpuType: Number(req.body.cpuType),
        cpu: req.body.cpu,
        vitesseHorloge: Number(req.body.clockSpeed),
        ram: Number(req.body.ram),
        rom: Number(req.body.rom),
        graphique: req.body.graphics,
        nbCouleurs: Number(req.body.nbColours),
        info: req.body.computerInfo,
        son: req.body.sound,
        successeur: Number(req.body.successor),
        id_fab_ordinateur: Number(req.body.fabricantId)
      }
    });

    let filePath = fs.existsSync(`./public/assets/images/computers/${comput.nom}.webp`);
    console.log(`${comput.nom}.webp exists:`, filePath);

    if (filePath) {
      filePath = `/assets/images/computers/${comput.nom}.webp`;  // URL for browser
    } else {
      filePath = "/assets/images/computers/defaultComputer.webp";
      console.log("Computer does not exist:", filePath);
    }

    //Save computer photo
    await prisma.photo.create({
      data: {
        id_ordinateur: comput.id_ordinateur,
        alt: `${comput.nom} computer`,
        path: filePath,
      },
    });

    return res.redirect("/computerList");

  } catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/addComputer.twig", {
        errors: error.details,
        data
      });
    }

    // Unknown error
    errors.computerName = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/addComputer.twig", {
      errors,
      data
    });
  }

}

