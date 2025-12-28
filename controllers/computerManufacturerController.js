const { PrismaClient } = require('@prisma/client');

const validateComputerManufacturer = require("../middleware/extensions/validateComputerManufacturer");

const prisma = new PrismaClient().$extends(validateComputerManufacturer);

const errors = {}
const fs = require('fs');


//Get the list of Computer Manufacturers
exports.listComputerManufacturer = async (req, res) => {
    try {
        const manufacturers = await prisma.fabricantOrdinateur.findMany();

        return res.json({
            success: true,
            manufacturers
        });

    } catch (error) {
        console.error("Error retrieving manufacturers:", error);

        return res.status(500).json({
            success: false,
            error: "Unexpected error while retrieving manufacturers."
        });
    }
};

//Add a Computer Manufacturer
exports.addComputerManufacturer = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers
    const name = req.body.computerManufacturerName.trim();
    try {

        //send this data back to fill table if there is an error
        const computerManufactuers = await prisma.fabricantOrdinateur.findMany({
            include:
            {
                photos: true,
            },
        });


        const exists = await prisma.fabricantOrdinateur.findFirst({
            where: { nom: name }
        });

        if (exists) {
            //The computer manufacturer already exists
            errors.computerManufacturerName = "The manufacturer already exists"
            return res.render("pages/computerManufacturerList.twig", {
                computerManufactuers,
                errors,
            });
        }

        //Create the Computer manufacturer
        const manufacturer = await prisma.fabricantOrdinateur.create({
            data: { nom: name }
        });

        //Create computer manufacturer logo photo
        await prisma.photo.create({
            data: {
                id_fab_ordinateur: manufacturer.id_fab_ordinateur,
                alt: `${manufacturer.nom}'s company logo`,
                path: `/assets/images/logos/${manufacturer.nom}.webp`,

            },
        });

        res.redirect("/showComputerManufacturers");

    } catch (error) {
        console.error("Add Computer Manufacturer Error:", error);

        if (error.code === "P2002") {
            errors.computerManufacturerName = "The manufacturer already exists";

            return res.render("pages/computerManufacturerList.twig", {
                data,
                errors,
            });
        }

        // Fallback: generic server error
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/computerManufacturerList.twig", {
            data,
            errors,
        });
    }
}


exports.updateComputerManufacturerList = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const action = req.body.buttons; // "delete-123" or "modify-123"

    //Delete the manufacturer
    if (action.startsWith("delete-")) {
        let toDelete = action.split("-")[1];
        toDelete = parseInt(toDelete);

        try {

            //send this data back to fill table if there is an error
            const computerManufactuers = await prisma.fabricantOrdinateur.findMany({
                include:
                {
                    photos: true,
                },
            });

            //Is the computer manufacturer associated with any computer, if so we can't delete it
            const manufacturerExists = await prisma.fabricantOrdinateur.findFirst({
                where: { id_fab_ordinateur: toDelete }
            });

            const exists = await prisma.Ordinateur.findFirst({
                where: { id_fab_ordinateur: manufacturerExists.id_fab_ordinateur }
            });


            if (exists) {
                //The computer manufacturer is associated with at least one computer an can not to deleted
                errors.computerManufacturerName = "The manufacturer is associated with at least one computer and can not be deleted"
                return res.render("pages/computerManufacturerList.twig", {
                    computerManufactuers,
                    errors,
                });
            }

            console.log("Deleting photo ", toDelete);

            //Delete the computer manufacturer logo
            await prisma.photo.deleteMany({
                where: {
                    id_fab_ordinateur: toDelete,
                },
            });

            console.log("Deleting manu");
            //Delete the computer manufacturer
            await prisma.fabricantOrdinateur.delete({
                where: {
                    id_fab_ordinateur: toDelete
                }
            });

            console.log("Manu deleted returning");

            //Return to the list of computer manufacturers
            res.redirect("/showComputerManufacturers");

        } catch (error) {

            errors.computerManufacturerName = "The computer manufacturer could not be deleted"
            res.render("pages/computerManufacturerList.twig", {
                errors,
            });

        }

    } else if (action.startsWith("modify-")) {
        let id = action.split("-")[1];

        id = parseInt(id);
        // handle modify

        res.redirect("/updateComputerManufacturer/" + id);

    }
};

exports.removeComputerManufacturer = async (req, res) => {

}

exports.displayUpdateComputerManufacturer = async (req, res) => {

}

exports.updateComputerManufacturer = async (req, res) => {

    const manufacturerName = req.body.computerManufacturerName;
    const manufacturerId = parseInt(req.params.id);

    try {

        //send this data back to fill table if there is an error
        const computerManufactuers = await prisma.fabricantOrdinateur.findMany({
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
            errors.computerManufacturerName = "The manufacturer already exists"
            return res.render("pages/computerManufacturerList.twig", {
                computerManufactuers,
                errors,
            });
        }

        //Update photo

        let filePath = fs.existsSync(`./public/assets/images/logos/${manufacturerName}.webp`);
        console.log(`${manufacturerName}.webp exists:`, filePath);

        if (filePath) {
            filePath = `/assets/images/logos/${manufacturerName}.webp`;  // URL for browser
        } else {
            filePath = "/assets/images/logos/defaultLogo.webp";
            console.log("Computer does not exist:", filePath);
        }

        await prisma.$transaction([
            prisma.photo.updateMany({
                where: { id_fab_ordinateur: manufacturerId },
                data: {
                    alt: `${manufacturerName} logo`,
                    path: filePath,
                },
            }),
            prisma.fabricantOrdinateur.update({
                where: { id_fab_ordinateur: manufacturerId },
                data: { nom: manufacturerName },
            }),
        ]);

        //Return to the list of computer manufacturers
        res.redirect("/showComputerManufacturers");

    } catch (error) {

        if (error.code === 'P2002') {
            //Duplicate manufacturer)
            errors.computerManufacturerName = "Manufacturer already exists";
            return res.render('pages/computerManufacturerList.twig', {
                errors,
                computerManufactuers,
            });
        } else {
            errors.computerManufacturerName = "Unknown error";
            return res.render('pages/computerManufacturerList.twig', {
                errors,
            });

        }
    }
}

exports.showComputerManufacturers = async (req, res) => {
    try {

        const computerManufactuers = await prisma.fabricantOrdinateur.findMany({
            include:
            {
                photos: true,
            },
        });

        res.render("pages/computerManufacturerList.twig", {
            computerManufactuers,
        });
    } catch (error) {
        req.session.errorRequest = "Error loading list";
        res.redirect("/error");
    }
};