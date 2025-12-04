const { PrismaClient } = require('@prisma/client');

const validateComputerManufacturer = require("../middleware/extensions/validateComputerManufacturer");

const prisma = new PrismaClient().$extends(validateComputerManufacturer);

const errors = { }

exports.listComputerManufacturer = async (req, res) => {

}

//Add a Computer Manufacturer
exports.addComputerManufacturer = async (req, res) => {
    const name = req.body.computerManufacturerName.trim();
    const errors = {};  //

    try {
        //CHECK for an existing Computer Manufacturer with the same name
        const exists = await prisma.fabricantOrdinateur.findFirst({
            where: { nom: name }
        });

        if (exists) {
            errors.computerManufacturerName = "Manufacturer already exists";

            return res.render("pages/addComputer.twig", {
                errors,
                reopenDialog: true
            });
        }

        // Create manufacturer
        const manufacturer = await prisma.fabricantOrdinateur.create({
            data: { nom: name }
        });

        //Create computer manufacturer logo photo
        await prisma.photo.create({
            data: {
                    path: `/assets/images/logos/${manufacturer.nom}.webp`,
                    alt: `${manufacturer.nom}'s company logo`,
                    ownerId: manufacturer.id_fab_ordinateur,
                    ownerType: "computerManufacturer"
                 }
});

        /*console.log("ID:", manufacturer.id_fab_ordinateur);
         console.log("Path:", "/assets/images/logos/" + manufacturer.nom + ".webp");
         console.log("ALT:", manufacturer.nom + "'s company logo");*/


        return res.redirect("/addComputer");

    } catch (error) {

        // If it's our custom validation extension
        if (error.details) {
            return res.render("pages/addComputer.twig", {
                errors: error.details,
                reopenDialog: true
            });
        }

        // Handle Prisma unique constraint errors
        if (error.code === "P2002") {
            errors.computerManufacturerName = "Manufacturer already exists";
            return res.render("pages/addComputer.twig", {
                errors,
                reopenDialog: true
            });
        }

        // Unknown error
        errors.computerManufacturerName = "An unexpected error occurred.";
        console.error(error);

        return res.render("pages/addComputer.twig", {
            errors,
            reopenDialog: true
        });
    }
};


exports.removeComputerManufacturer = async (req, res) => {

}

exports.displayUpdateComputerManufacturer = async (req, res) => {

}

exports.updateComputerManufacturer = async (req, res) => {

}

