const { PrismaClient } = require('@prisma/client');
const validateComputer = require("../middleware/extensions/validateComputer");

const prisma = new PrismaClient().$extends(validateComputer);

const errors = {};

const fs = require('fs');




// Show homepage
exports.displayHome = async (req, res) => {

let lastOuting = null;
let latestNews = null;
const errors = {};

  try {

    //Get the computer data
    const computers = await prisma.ordinateur.findMany({
      include:
      {
        photos: true,
        fabricantOrdinateur: true,
        popularites: true,
        raretes: true,
      },
    });

    //Get last outing
    const findOuting = await prisma.categorie.findFirst({
      where: {
        categorie: "Outings",
      }
    });

    if (findOuting) {

      lastOuting = await prisma.article.findFirst({
        where: {
          id_categorie: findOuting.id_categorie,
        },
        orderBy: {
          date: 'desc',
        }
      });
    }

    //Get lastest news

    const findNews = await prisma.categorie.findFirst({
      where: {
        categorie: "News",
      }
    });

    if (findNews) {

      latestNews = await prisma.article.findFirst({
        where: {
          id_categorie: findNews.id_categorie,
        },
        orderBy: {
          date: 'desc',
        }
      });
    }

    res.render("pages/home.twig", {
      title: "Home",
      computers,
      lastOuting,
      latestNews,
      error: null,
    });

  } catch (error) {
    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
        computers: [],
      });
    }

    // Unknown error
    errors.computerName = "An unexpected error occurred.";


    return res.render("pages/home.twig", {
      errors,
      computers: [],
    });
  }

}

// Show computer list page

exports.displayComputerList = async (req, res) => {

  let computers = [];

  try {
    computers = await prisma.ordinateur.findMany({
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

exports.displayAddComputerUpdate = (req, res) => {
  const bkgClass = req.params.bg;
 
  res.render("pages/addComputer.twig", {
    title: "Update Computer",
    error: null,
    bkgClass,
    transaction: "update",
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


    return res.status(500).json({
      success: false,
      error: "Unexpected error while retrieving computers."
    });
  }
};

//Create computer
exports.postComputer = async (req, res) => {
  const data = req.body;

  const bkgClass = "bg-1";

  try {

    const name = req.body.nom.trim();
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
        annee: Number(req.body.annee),
        cpuType: Number(req.body.cpuType),
        cpu: req.body.cpu,
        vitesseHorloge: Number(req.body.clockSpeed),
        ram: Number(req.body.ram),
        rom: Number(req.body.rom),
        graphique: req.body.graphique,
        nbCouleurs: Number(req.body.nbColours),
        info: req.body.info,
        son: req.body.son,
        successeur: Number(req.body.successor),
        id_fab_ordinateur: Number(req.body.fabricantId)
      }
    });

    let filePath = fs.existsSync(`./public/assets/images/computers/${comput.nom}.webp`);

    if (filePath) {
      filePath = `/assets/images/computers/${comput.nom}.webp`;  // URL for browser
    } else {
      filePath = "/assets/images/computers/defaultComputer.webp";

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



    return res.render("pages/computerList.twig", {
      errors,
      data
    });
  }

};

exports.computerDetailSelect = async (req, res) => {
  const bkgClass = req.query.bg;
  const origin = req.query.origin;


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

    res.redirect("/computerList");
  }
}

exports.updateComputerList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers


  const action = req.body.buttons; // "delete-123" or "modify-123"

  const user = req.session.user;
  let computers=[];

  //Delete the computer
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {

      //Computers will be sent if an Error occurs
      computers = await prisma.ordinateur.findMany({
      include:
      {
        photos: true,
        fabricantOrdinateur: true,
        popularites: true,
        raretes: true,
      },
    });

      //Delete computer
      await prisma.ordinateur.delete({
        where: {
          id_ordinateur: toDelete
        }
      });


      res.redirect("/computerList");
    } catch (error) {

      errors.computer = "The computer could not be deleted, it is associated with other files.";
     
      res.render("pages/computerList.twig", {
        title: "Computer List",
        computers,
        errors,
      });

    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];
    let bg = action.split("-")[3];

    id = parseInt(id);
    bg = parseInt(bg);

    // handle modify


    res.redirect(`/showUpdateComputer/${id}?bg=${bg}`);

  }
};

exports.showUpdateComputer = async (req, res) => {

  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const computerId = Number(req.params.id);
  const bg = Number(req.query.bg);



  const bkgClass = "bg-" + bg;



  try {
    const data = await prisma.ordinateur.findUnique({
      where: {
        id_ordinateur: computerId,
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

    res.render("pages/addComputer.twig", {
      title: "Computer Details",
      data,
      transaction: "update",
      successeur,
      bkgClass,
    });
  }
  catch (error) {
    req.session.errorRequest = "Computer data could not be sent";

    res.redirect("/computerList");
  }
};

exports.updateComputer = async (req, res) => {
  const data = req.body;

  const computerId = Number(req.params.id);


  const name = req.body.nom.trim();

  const bkgClass = req.query.bg;

  try {

    //Check if a computer of the same name already exists
    const exists = await prisma.ordinateur.findFirst({
      where: { nom: name }
    });



    if (exists && computerId !== exists.id_ordinateur) {
      errors.computerName = "Computer already exists";

      return res.render("pages/addComputer.twig", {
        errors,
        transaction: "update",
        data,
        bkgClass,
      });
    }

    // Update computer
    const comput = await prisma.ordinateur.update({
      where: { id_ordinateur: computerId },
      data: {
        nom: name,
        annee: Number(req.body.annee),
        cpuType: Number(req.body.cpuType),
        cpu: req.body.cpu,
        vitesseHorloge: Number(req.body.clockSpeed),
        ram: Number(req.body.ram),
        rom: Number(req.body.rom),
        graphique: req.body.graphique,
        nbCouleurs: Number(req.body.nbColours),
        son: req.body.son,
        successeur: Number(req.body.successor),
        id_fab_ordinateur: Number(req.body.fabricantId),
        info: req.body.info,
      }
    });


    let filePath = fs.existsSync(`./public/assets/images/computers/${comput.nom}.webp`);

    if (filePath) {
      filePath = `/assets/images/computers/${comput.nom}.webp`;  // URL for browser
    } else {
      filePath = "/assets/images/computers/defaultComputer.webp";

    }


    const existingPhoto = await prisma.photo.findFirst({
      where: {
        id_ordinateur: computerId,
      }
    });

    if (!existingPhoto) {
      console.log("No photo found for this computer");
    } else {
      await prisma.photo.update({
        where: {
          id_photo: existingPhoto.id_photo,
        },
        data: {
          alt: `${comput.nom} computer`,
          path: filePath,
        },
      });
    }


    return res.redirect("/computerList");

  } catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/addComputer.twig", {
        errors: error.details,
        transaction: "update",
        data,
        bkgClass,
      });
    }

    // Unknown error
    errors.computerName = "An unexpected error occurred.";
    return res.render("pages/addComputer.twig", {
      errors,
      transaction: "update",
      data,
      bkgClass,
    });
  }
}


exports.rateComputer = async (req, res) => {
  const data = req.body;

  const ratingType = data.ratingType === "rarityStars" ? "rarityRating" : "popularityRating";

  if (ratingType == "popularityRating") {
    //find if the user has already rated the computer
    const popRatingExists = await prisma.popularite.findFirst({
      where: {
        id_ordinateur: Number(data.computerId),
        id_utilisateur: Number(data.userId),
      }
    });

    //if found update it
    if (popRatingExists) {
      await prisma.popularite.update({
        where: {
          id_popularite: popRatingExists.id_popularite
        },
        data:
        {
          score: Number(data.rating),
        },
      });
    }
    else {
      //ceate a new rating
      await prisma.popularite.create({
        data: {

          score: Number(data.rating),
          id_ordinateur: Number(data.computerId),
          id_utilisateur: Number(data.userId),
        },
      });

    }


  }
  else {
    //find if the user has already rated the computer
    const rarRatingExists = await prisma.rarete.findFirst({
      where: {
        id_ordinateur: Number(data.computerId),
        id_utilisateur: Number(data.userId),
      }
    });

    //if found update it
    if (rarRatingExists) {
      await prisma.rarete.update({
        where: {
          id_rarete: rarRatingExists.id_rarete,
        },
        data:
        {
          score: Number(data.rating),
        },
      });
    }
    else {
      //ceate a new rating
      await prisma.rarete.create({
        data: {

          score: Number(data.rating),
          id_ordinateur: Number(data.computerId),
          id_utilisateur: Number(data.userId),
        },
      });

    }
  }

  res.sendStatus(200);
};