const { PrismaClient } = require('@prisma/client');
const validateEmulatorManufacturer = require("../middleware/extensions/validateManufacturer");

const prisma = new PrismaClient().$extends(validateEmulatorManufacturer);


const errors = {};

const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");

exports.showEmulatorManufacturers = async (req, res) => {
    let manufacturers = [];
    try {

        manufacturers = await prisma.fabricantEmulateur.findMany({
            include:
            {
                photos: true,
            },
        });

        res.render("pages/manufacturerList.twig", {
            manufacturers,
            mode: "emulator",
            title: "Emulator Manufacturer"
        });
    } catch (error) {
        req.session.errorRequest = "Error loading list";
        res.redirect("/error");
    }
};

//Get the list of Emulator Manufacturers
exports.listEmulatorManufacturer = async (req, res) => {
    let manufacturers = [];
    try {
        manufacturers = await prisma.fabricantEmulateur.findMany();
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

//Add a Emulator Manufacturer
exports.addEmulatorManufacturer = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const logoDir = path.join(__dirname, "../public/assets/images/logos");

    const defaultLogo = path.join(logoDir, "defaultLogo.webp");
    let manufacturers = [];

    try {

        //send this data back to fill table if there is an error
        manufacturers = await prisma.fabricantEmulateur.findMany({
            include:
            {
                photos: true,
            },
        });

        if (typeof req.body.manufacturerName !== "string") {
            errors.manufacturerName = "Invalid manufacturer name";
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "emulator",
                title: "Emulator Manufacturer",
                errors,
            });
        }

        const name = req.body.manufacturerName.trim();
        const logoPath = path.join(logoDir, `${name}.webp`);

        const exists = await prisma.fabricantEmulateur.findFirst({
            where: { nom: name }
        });

        if (exists) {
            //The emulator manufacturer already exists
            errors.manufacturerName = "The manufacturer already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "emulator",
                title: "Emulator Manufacturer",
                errors,
            });
        }

        //Create the emulator manufacturer
        const manufacturer = await prisma.fabricantEmulateur.create({
            data: { nom: name }
        });


        // Create emulator manufacturer logo photo
        if (!fs.existsSync(logoPath)) {
            await fsPromises.copyFile(defaultLogo, logoPath);
        }


        await prisma.photo.create({
            data: {
                id_fab_emulateur: manufacturer.id_fab_emulateur,
                alt: `${manufacturer.nom}'s company logo`,
                path: `/assets/images/logos/${manufacturer.nom}.webp`,

            },
        });

        res.redirect("/showEmulatorManufacturers");

    } catch (error) {
        console.error("Add Emulator Manufacturer Error:", error);

        // Prisma unique constraint
        if (error.code === "P2002") {
            errors.manufacturerName = "The manufacturer already exists";

            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "emulator",
                title: "Emulator Manufacturer",
            });
        }

        // Prisma extension validation error
        if (error.details?.manufacturerName) {
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors: error.details,
                mode: "emulator",
                title: "Emulator Manufacturer",
            });
        }

        // Fallback
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/manufacturerList.twig", {
            manufacturers,
            errors,
            mode: "emulator",
            title: "Emulator Manufacturer",
        });
    }
}

exports.updateEmulatorManufacturerList = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const action = req.body.buttons; // "delete-123" or "modify-123"
    let manufacturers = [];

    //Delete the manufacturer
    if (action.startsWith("delete-")) {
        let toDelete = action.split("-")[1];
        toDelete = parseInt(toDelete);

        try {

            //send this data back to fill table if there is an error
            manufacturers = await prisma.fabricantEmulateur.findMany({
                include:
                {
                    photos: true,
                },
            });

            //Is the emulator manufacturer associated with any emulator, if so we can't delete it
            const manufacturerExists = await prisma.fabricantEmulateur.findFirst({
                where: { id_fab_emulateur: toDelete }
            });

            if (!manufacturerExists) {
                errors.manufacturerName = "Manufacturer not found";
                return res.render("pages/manufacturerList.twig", {
                    errors,
                    mode: "emulator",
                    manufacturers,
                    title: "Emulator Manufacturer",
                });
            }

            const exists = await prisma.emulateur.findFirst({
                where: { id_fab_emulateur: manufacturerExists.id_fab_emulateur }
            });


            if (exists) {
                //The emulator manufacturer is associated with at least one emulator an can not to deleted
                errors.manufacturerName = "The manufacturer is associated with at least one emulator and can not be deleted"
                return res.render("pages/manufacturerList.twig", {
                    manufacturers,
                    errors,
                    mode: "emulator",
                    title: "Emulator Manufacturer",
                });
            }

            console.log("Deleting photo ", toDelete);

            //Delete the emulator manufacturer logo
            await prisma.photo.deleteMany({
                where: {
                    id_fab_emulateur: toDelete,
                },
            });

            console.log("Deleting manu");
            //Delete the emulator manufacturer
            await prisma.fabricantEmulateur.delete({
                where: {
                    id_fab_emulateur: toDelete
                }
            });

            console.log("Manu deleted returning");

            //Return to the list of emulator manufacturers
            res.redirect("/showEmulatorManufacturers");

        } catch (error) {

            errors.manufacturerName = "The emulator manufacturer could not be deleted"
            res.render("pages/manufacturerList.twig", {
                errors,
                mode: "emulator",
                title: "Emulator Manufacturer",
            });

        }

    } else if (action.startsWith("modify-")) {
        let id = action.split("-")[1];

        id = parseInt(id);
        // handle modify

        res.redirect("/updateEmulatorManufacturer/" + id);

    }
};


exports.updateEmulatorManufacturer = async (req, res) => {

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
        manufacturers = await prisma.fabricantEmulateur.findMany({
            include:
            {
                photos: true,
            },
        });

        //Find if a manufacturer has the same name
        const manufacturerNameExists = await prisma.fabricantEmulateur.findFirst({
            where: { nom: manufacturerName }
        });

        //Check if the id number is the same as the current one we are changing
        if (manufacturerNameExists && manufacturerId !== manufacturerNameExists.id_fab_emulateur) {
            //The name already exists
            errors.manufacturerName = "The manufacturer already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "emulator",
                title: "Emulator Manufacturer",
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
                where: { id_fab_emulateur: manufacturerId },
                data: {
                    alt: `${manufacturerName} logo`,
                    path: logoUrl,
                },
            }),
            prisma.fabricantEmulateur.update({
                where: { id_fab_emulateur: manufacturerId },
                data: { nom: manufacturerName },
            }),
        ]);

        //Cleanup old logo file ONLY if name changed
        if (nameChanged && fs.existsSync(oldLogoFs)) {
            await fsPromises.unlink(oldLogoFs);
        }

        //Return to the list of emulator manufacturers
        res.redirect("/showEmulatorManufacturers");

    } catch (error) {
        console.error("Update Emulator Manufacturer Error:", error);

        // Prisma unique constraint
        if (error.code === "P2002") {
            errors.manufacturerName = "The manufacturer already exists";

            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "emulator",
                title: "Emulator Manufacturer",
            });
        }

        // Prisma extension validation error
        if (error.details?.manufacturerName) {
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors: error.details,
                mode: "emulator",
                title: "Emulator Manufacturer",
            });
        }

        // Fallback
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/manufacturerList.twig", {
            manufacturers,
            errors,
            mode: "emulator",
            title: "Emulator Manufacturer",
        });
    }
}
