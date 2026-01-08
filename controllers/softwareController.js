const { PrismaClient } = require('@prisma/client');
const validateSoftwarer = require("../middleware/extensions/validateSofware");

const prisma = new PrismaClient().$extends(validateSoftwarer);


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
        const software = await prisma.logiciel.findMany({
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

        console.log("Software : ", software);

        res.render("pages/softwareList.twig", {
            title: "Software",
            software,
            error: null,
        });

    } catch (error) {
        if (error.details) {
            return res.render("pages/home.twig", {
                errors: error.details,
                software
            });
        }

        // Unknown error
        errors.softwareName = "An unexpected error occurred.";
        console.error(error);

        return res.render("pages/home.twig", {
            errors,
        });
    }

}

exports.showSoftwareManufacturers = async (req, res) => {
    let manufacturers = [];
    try {

        manufacturers = await prisma.fabricantLogiciel.findMany({
            include:
            {
                photos: true,
            },
        });

        res.render("pages/manufacturerList.twig", {
            manufacturers,
            mode: "software",
            title: "Software Manufacturer"
        });
    } catch (error) {
        req.session.errorRequest = "Error loading list";
        res.redirect("/error");
    }
};

//Get the list of Computer Manufacturers
exports.listSoftwareManufacturer = async (req, res) => {
    let manufacturers = [];
    try {
        manufacturers = await prisma.fabricantLogiciel.findMany();
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

//Add a Software Manufacturer
exports.addSoftwareManufacturer = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const logoDir = path.join(__dirname, "../public/assets/images/logos");

    const defaultLogo = path.join(logoDir, "defaultLogo.webp");
    let manufacturers = [];

    try {

        //send this data back to fill table if there is an error
        manufacturers = await prisma.fabricantLogiciel.findMany({
            include:
            {
                photos: true,
            },
        });

        if (typeof req.body.manufacturerName !== "string") {
            errors.manufacturerName = "Invalid manufacturer name";
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "software",
                title: "Software Manufacturer",
                errors,
            });
        }

        const name = req.body.manufacturerName.trim();
        const logoPath = path.join(logoDir, `${name}.webp`);

        const exists = await prisma.fabricantLogiciel.findFirst({
            where: { nom: name }
        });

        if (exists) {
            //The software manufacturer already exists
            errors.manufacturerName = "The manufacturer already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "software",
                title: "Software Manufacturer",
                errors,
            });
        }

        //Create the software manufacturer
        const manufacturer = await prisma.fabricantLogiciel.create({
            data: { nom: name }
        });


        // Create software manufacturer logo photo
        if (!fs.existsSync(logoPath)) {
            await fsPromises.copyFile(defaultLogo, logoPath);
        }


        await prisma.photo.create({
            data: {
                id_fab_logiciel: manufacturer.id_fab_logiciel,
                alt: `${manufacturer.nom}'s company logo`,
                path: `/assets/images/logos/${manufacturer.nom}.webp`,

            },
        });

        res.redirect("/showSoftwareManufacturers");

    } catch (error) {
        console.error("Add Software Manufacturer Error:", error);

        // Prisma unique constraint
        if (error.code === "P2002") {
            errors.manufacturerName = "The manufacturer already exists";

            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "software",
                title: "Software Manufacturer",
            });
        }

        // Prisma extension validation error
        if (error.details?.manufacturerName) {
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors: error.details,
                mode: "software",
                title: "Software Manufacturer",
            });
        }

        // Fallback
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/manufacturerList.twig", {
            manufacturers,
            errors,
            mode: "software",
            title: "Software Manufacturer",
        });
    }
}

exports.updateSoftwareManufacturerList = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const action = req.body.buttons; // "delete-123" or "modify-123"
    let manufacturers = [];

    //Delete the manufacturer
    if (action.startsWith("delete-")) {
        let toDelete = action.split("-")[1];
        toDelete = parseInt(toDelete);

        try {

            //send this data back to fill table if there is an error
            manufacturers = await prisma.fabricantLogiciel.findMany({
                include:
                {
                    photos: true,
                },
            });

            //Is the software manufacturer associated with any software, if so we can't delete it
            const manufacturerExists = await prisma.fabricantLogiciel.findFirst({
                where: { id_fab_logiciel: toDelete }
            });

            if (!manufacturerExists) {
                errors.manufacturerName = "Manufacturer not found";
                return res.render("pages/manufacturerList.twig", {
                    errors,
                    mode: "software",
                    manufacturers,
                    title: "Software Manufacturer",
                });
            }

            const exists = await prisma.logiciel.findFirst({
                where: { id_fab_logiciel: manufacturerExists.id_fab_logiciel }
            });


            if (exists) {
                //The software manufacturer is associated with at least one software an can not to deleted
                errors.manufacturerName = "The manufacturer is associated with at least one software and can not be deleted"
                return res.render("pages/manufacturerList.twig", {
                    manufacturers,
                    errors,
                    mode: "software",
                    title: "Software Manufacturer",
                });
            }

            console.log("Deleting photo ", toDelete);

            //Delete the software manufacturer logo
            await prisma.photo.deleteMany({
                where: {
                    id_fab_logiciel: toDelete,
                },
            });

            console.log("Deleting manu");
            //Delete the software manufacturer
            await prisma.fabricantLogiciel.delete({
                where: {
                    id_fab_logiciel: toDelete
                }
            });

            console.log("Manu deleted returning");

            //Return to the list of software manufacturers
            res.redirect("/showSoftwareManufacturers");

        } catch (error) {

            errors.manufacturerName = "The software manufacturer could not be deleted"
            res.render("pages/manufacturerList.twig", {
                errors,
                mode: "software",
                title: "Software Manufacturer",
            });

        }

    } else if (action.startsWith("modify-")) {
        let id = action.split("-")[1];

        id = parseInt(id);
        // handle modify

        res.redirect("/updateSoftwareManufacturer/" + id);

    }
};


exports.updateSoftwareManufacturer = async (req, res) => {

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
        manufacturers = await prisma.fabricantLogiciel.findMany({
            include:
            {
                photos: true,
            },
        });

        //Find if a manufacturer has the same name
        const manufacturerNameExists = await prisma.fabricantLogiciel.findFirst({
            where: { nom: manufacturerName }
        });

        //Check if the id number is the same as the current one we are changing
        if (manufacturerNameExists && manufacturerId !== manufacturerNameExists.id_fab_logiciel) {
            //The name already exists
            errors.manufacturerName = "The manufacturer already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "software",
                title: "Software Manufacturer",
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
                where: { id_fab_logiciel: manufacturerId },
                data: {
                    alt: `${manufacturerName} logo`,
                    path: logoUrl,
                },
            }),
            prisma.fabricantLogiciel.update({
                where: { id_fab_logiciel: manufacturerId },
                data: { nom: manufacturerName },
            }),
        ]);

        //Cleanup old logo file ONLY if name changed
        if (nameChanged && fs.existsSync(oldLogoFs)) {
            await fsPromises.unlink(oldLogoFs);
        }

        //Return to the list of software manufacturers
        res.redirect("/showSoftwareManufacturers");

    } catch (error) {
        console.error("Update Software Manufacturer Error:", error);

        // Prisma unique constraint
        if (error.code === "P2002") {
            errors.manufacturerName = "The manufacturer already exists";

            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "software",
                title: "Software Manufacturer",
            });
        }

        // Prisma extension validation error
        if (error.details?.manufacturerName) {
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors: error.details,
                mode: "software",
                title: "Software Manufacturer",
            });
        }

        // Fallback
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/manufacturerList.twig", {
            manufacturers,
            errors,
            mode: "software",
            title: "Software Manufacturer",
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
            errors.softwareName = "Software title already exists";

            return res.render("pages/addSoftware.twig", {
                errors,
                data,
                mode: "software",
            });
        }

        // Create software
        const software = await prisma.Logiciel.create({
            data: {
                nom: name,
                annee: Number(data.manufacturerYear),
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
                id_logiciel: software.id_logiciel,
                alt: `${name} software`,
                path: filePath,
            },
        });

        //Create different version enteries for each computer
        data.computerSelect.forEach(async (computer) => {
            await prisma.version.create({
                data: {
                    id_logiciel :  software.id_logiciel,
                    id_ordinateur : Number(computer),
                },
            });
        });

        res.render("pages/softwareList.twig", {
            title: "Software",
            software,
            error: null,
        });

    } catch (error) {
        // Custom validation extension
        if (error.details) {
            return res.render("pages/addSoftware.twig", {
                errors: error.details,
                data,
            });
        }

        // Unknown error
        errors.softwareName = "An unexpected error occurred.";
        console.error(error);

        return res.render("pages/addSoftware.twig", {
            errors,
            data,
        });
    }

}