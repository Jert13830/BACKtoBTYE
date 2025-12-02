//const { PrismaClient } = require("../generated/prisma/client");
const { PrismaClient } = require("../generated/prisma/index.js");
const validateComputer = require("../middleware/extensions/validateComputer");

const prisma = new PrismaClient().$extends(validateComputer);


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

// Show computer list 
exports.displayComputerList = async (req,res)=>{
    res.render("pages/computerList.twig", {
    title: "Computer List",
    error: null,
  })
}

//Show add computer screen
exports.displayAddComputer = (req, res) => {
    res.render("pages/addComputer.twig",{
        title: "Add Computer",
        error: null,
    })
}


exports.postComputer = (req, res) => {
}

