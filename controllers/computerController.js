const { PrismaClient } = require('@prisma/client');
const validateComputer = require("../middleware/extensions/validateComputer");

const prisma = new PrismaClient().$extends(validateComputer);

const errors = { };

/*
// Show homepage
exports.displayHome = async (req,res)=>{
    res.render("pages/home.twig", {
    title: "Homepage",
    error: null,
    duplicateSiret: null,
    confirmPassword: null
  })
}*/

// Show computer list page
exports.displayComputerList = async (req, res) => {
  res.render("pages/computerList.twig", {
    title: "Computer List",
    error: null,
  })
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

    //Save computer photo
    await prisma.photo.create({
      data: {
        id_ordinateur: comput.id_ordinateur,
        alt: `${comput.nom} computer`,
        path: `/assets/images/computers/${comput.nom}.webp`,

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

