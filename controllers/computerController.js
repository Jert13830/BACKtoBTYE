const { PrismaClient } = require('@prisma/client');
const validateComputer = require("../middleware/extensions/validateComputer");

const prisma = new PrismaClient().$extends(validateComputer);

const errors = {};

const fs = require('fs');


// Show homepage
exports.displayHome = async (req, res) => {
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
  const bkgClass = "bg-1";
  res.render("pages/addComputer.twig", {
    title: "Add Computer",
    error: null,
    bkgClass,
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

  console.log(data);

  const name = req.body.computer.trim();
  const bkgClass = "bg-1";

  try {
    const exists = await prisma.ordinateur.findFirst({
      where: { nom: name }
    });

    if (exists) {
      errors.computerName = "Computer already exists";

      return res.render("pages/addComputer.twig", {
        errors,
        data,
        bkgClass,
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
        data,
        bkgClass,
      });
    }

    // Unknown error
    errors.computerName = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/addComputer.twig", {
      errors,
      data,
      bkgClass,
    });
  }

}

exports.filterComputerList = async (req, res) => {
  try {
    const { searchBar, selection } = req.body;

    // WHERE the searchBar the computer's name, computer manufacturer's name or is empty
    const where = searchBar
      ? {
        OR: [
          {
            nom: {
              contains: searchBar,
            },
          },
          {
            fabricantOrdinateur: {
              nom: {
                contains: searchBar,
              },
            },
          },
        ],
      }
      : undefined;

    // The radio buttons all for sorting by manufactured Year or Manufacturer(sorted by year)
    let orderBy;

    if (selection === 'year') {
      orderBy = {
        annee: 'asc',
      };
    } else if (selection === 'manufacturer') {
      orderBy = [
        {
          fabricantOrdinateur: {
            nom: 'asc',
          },
        },
        {
          annee: 'asc',
        },
      ];
    }

    // The query, and the Manufacturer table has to be returned too
    const computers = await prisma.ordinateur.findMany({
      where,
      orderBy,
      include: {
        fabricantOrdinateur: true,
      },
    });

    res.render('pages/computerList.twig', { computers });
  }
  catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/computerList.twig", {
        errors: error.details,
        data
      });
    }

    // Unknown error
    console.error(error);

    return res.render("pages/computerList.twig", {
      errors,
      data
    });
  }

};

exports.computerDetailSelect = async (req, res) => {
  const bkgClass = req.query.bg;
  const origin = req.query.origin;

  console.log(origin);

  try {
    const data = await prisma.ordinateur.findUnique({
      where: {
        id_ordinateur: Number(req.params.id_ordinateur)
      },
      include:
      {
        photos: true,
        fabricantOrdinateur: true,
        popularites: true,
        raretes: true,
      },
    })

    const successeur = await prisma.ordinateur.findUnique({
      where: {
        id_ordinateur: data.successeur,
      }
  })

    console.log("Here is the computer data : ", data);

    
    res.render("pages/addComputer.twig", {
      title: "Computer Details",
      bkgClass,
      data,
      origin,
      successeur,
    });
  }
  catch (error) {
    req.session.errorRequest = "Computer data could not be sent";
    console.log("Computer data could not be sent");
    res.redirect("/computerList");
  }
}

exports.updateComputerList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  console.log(req.body);
  const action = req.body.buttons; // "delete-123" or "modify-123"

  const user = req.session.user;

  //Delete the role
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {

      //Computers will be sent if an Error occurs
      const computers = await prisma.ordinateur.findMany();

      console.log ("You are : ",user.role);

   
        //Delete computer
        await prisma.ordinateur.delete({
          where: {
            id_ordinateur: toDelete
          }
        });
      

      res.redirect("/computerList")
    } catch (error) {

      errors.userError = "The computer could not be deleted"
      res.render("pages/computerList.twig", {
        errors,
      });

    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify

    res.redirect("/updateComputer/" + id);

  }
};