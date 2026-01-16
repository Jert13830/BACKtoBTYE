const { PrismaClient } = require('@prisma/client');

const validateComputerManufacturer = require("../middleware/extensions/validateManufacturer");

const prisma = new PrismaClient().$extends(validateComputerManufacturer);

//const errors = {}
const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");


//Get the list of Computer Manufacturers
exports.listComputerManufacturer = async (req, res) => {
    let manufacturers = [];
    try {
        manufacturers = await prisma.fabricantOrdinateur.findMany();

        return res.json({
            success: true,
            manufacturers,
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

    const logoDir = path.join(__dirname, "../public/assets/images/logos");

    const defaultLogo = path.join(logoDir, "defaultLogo.webp");
    let manufacturers = [];

    try {

        //send this data back to fill table if there is an error
        manufacturers = await prisma.fabricantOrdinateur.findMany({
            include:
            {
                photos: true,
            },
        });

        if (typeof req.body.manufacturerName !== "string") {
            errors.manufacturerName = "Invalid manufacturer name";
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "computer",
                 title: "Computer Manufacturer",
                errors,
            });
        }

        const name = req.body.manufacturerName.trim();

        if (!name) {
            errors.manufacturerName = "Manufacturer name cannot be empty";
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "computer",
                title: "Computer Manufacturer",
                errors,
            });
        }
        const logoPath = path.join(logoDir, `${name}.webp`);

        const exists = await prisma.fabricantOrdinateur.findFirst({
            where: { nom: name }
        });

        if (exists) {
            //The computer manufacturer already exists
            errors.manufacturerName = "The manufacturer already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "computer",
                title: "Computer Manufacturer",
                errors,
            });
        }

        //Create the Computer manufacturer
        const manufacturer = await prisma.fabricantOrdinateur.create({
            data: { nom: name }
        });


        // Create computer manufacturer logo photo
        if (!fs.existsSync(logoPath)) {
            await fsPromises.copyFile(defaultLogo, logoPath);
        }


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


exports.updateComputerManufacturerList = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const action = req.body.buttons; // "delete-123" or "modify-123"
    let manufacturers = [];

    //Delete the manufacturer
    if (action.startsWith("delete-")) {
        let toDelete = action.split("-")[1];
        toDelete = parseInt(toDelete);

        try {

            //send this data back to fill table if there is an error
            manufacturers = await prisma.fabricantOrdinateur.findMany({
                include:
                {
                    photos: true,
                },
            });

            //Is the computer manufacturer associated with any computer, if so we can't delete it
            const manufacturerExists = await prisma.fabricantOrdinateur.findFirst({
                where: { id_fab_ordinateur: toDelete }
            });

            if (!manufacturerExists) {
                errors.manufacturerName = "Manufacturer not found";
                return res.render("pages/manufacturerList.twig", {
                    errors,
                    mode: "computer"
                });
            }

            const exists = await prisma.ordinateur.findFirst({
                where: { id_fab_ordinateur: manufacturerExists.id_fab_ordinateur }
            });


            if (exists) {
                //The computer manufacturer is associated with at least one computer an can not to deleted
                errors.manufacturerName = "The manufacturer is associated with at least one computer and can not be deleted"
                return res.render("pages/manufacturerList.twig", {
                    manufacturers,
                    errors,
                    mode: "computer",
                    title: "Computer Manufacturer",
                });
            }

            //Delete the computer manufacturer logo
            await prisma.photo.deleteMany({
                where: {
                    id_fab_ordinateur: toDelete,
                },
            });

          
            //Delete the computer manufacturer
            await prisma.fabricantOrdinateur.delete({
                where: {
                    id_fab_ordinateur: toDelete
                }
            });

           

            //Return to the list of computer manufacturers
            res.redirect("/showComputerManufacturers");

        } catch (error) {

            errors.manufacturerName = "The computer manufacturer could not be deleted"
            res.render("pages/manufacturerList.twig", {
                errors,
                mode: "computer",
                title: "Computer Manufacturer",
            });

        }

    } else if (action.startsWith("modify-")) {
        let id = action.split("-")[1];

        id = parseInt(id);
        // handle modify

        res.redirect("/updateComputerManufacturer/" + id);

    }
};


exports.updateComputerManufacturer = async (req, res) => {

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

exports.showComputerManufacturers = async (req, res) => {
    let manufacturers = [];
    try {

        manufacturers = await prisma.fabricantOrdinateur.findMany({
            include:
            {
                photos: true,
            },
        });

        res.render("pages/manufacturerList.twig", {
            manufacturers,
            mode: "computer",
            title: "Computer Manufacturer"

        });
    } catch (error) {
        req.session.errorRequest = "Error loading list";
        res.redirect("/error");
    }
};