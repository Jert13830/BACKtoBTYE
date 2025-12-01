//const { Prisma } = require("@prisma/client");
//const prisma = new PrismaClient();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.listComputerManufacturer = async (req,res)=>{
   
}

exports.addComputerManufacturer = async (req,res)=>{
     console.log(req.body);
    try {
        const computerManufacturer = await prisma.fabricantOrdinateur.create({
            data: {
                nom: "Hello",
            }
        })
        res.redirect("/addComputer")
    } catch (error) {
        res.render("pages/home.twig")
    }
}


exports.removeComputerManufacturer = async (req,res)=>{
    
}

exports.displayUpdateComputerManufacturer = async (req,res)=>{
   
}

exports.updateComputerManufacturer = async (req,res)=>{
 
}

