const { PrismaClient } = require("../generated/prisma/client");

const prisma = new PrismaClient();

// Show homepage
exports.displayHome = async (req,res)=>{
    res.render("pages/home.twig", {
    title: "Homepage",
    error: null,
    duplicateSiret: null,
    confirmPassword: null
  })
}

// Show computer list
exports.displayComputerList = async (req,res)=>{
    res.render("pages/computerList.twig", {
    title: "Computer List",
    error: null,
    duplicateSiret: null,
    confirmPassword: null
  })
}

