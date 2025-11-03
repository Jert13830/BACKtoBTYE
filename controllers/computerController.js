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