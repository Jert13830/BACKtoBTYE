const { PrismaClient } = require('@prisma/client');

const validateComputerManufacturer = require("../middleware/extensions/validateComputerManufacturer");

const prisma = new PrismaClient().$extends(validateComputerManufacturer);

const errors = { }

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
    const name = req.body.computerManufacturerName.trim();

    try {
        const exists = await prisma.fabricantOrdinateur.findFirst({
            where: { nom: name }
        });

        if (exists) {
            return res.json({
                success: false,
                error: "Manufacturer already exists"
            });
        }

        //Create the Computer manufacturer
        const manufacturer = await prisma.fabricantOrdinateur.create({
            data: { nom: name }
        });

        //Create computer manufacturer logo photo
        await prisma.photo.create({
            data: { id_fab_ordinateur: manufacturer.id_fab_ordinateur,
                    alt: `${manufacturer.nom}'s company logo`,
                    path: `/assets/images/logos/${manufacturer.nom}.webp`,

             },
        });

        return res.json({
            success: true,
            id: manufacturer.id ?? manufacturer.code,
            name
        });

    } catch (error) {

        return res.json({
            success: false,
            error: error.details?.computerManufacturerName || "Unexpected error"
        });
    }
};


exports.removeComputerManufacturer = async (req, res) => {

}

exports.displayUpdateComputerManufacturer = async (req, res) => {

}

exports.updateComputerManufacturer = async (req, res) => {

}

