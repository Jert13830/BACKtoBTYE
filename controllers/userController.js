//const { PrismaClient } = require("../generated/prisma/client");
const { PrismaClient } = require('@prisma/client');
const validateUser = require("../middleware/extensions/validateUser");

const prisma = new PrismaClient().$extends(validateUser);

/*
// Show Homepage
exports.displayHome = async (req,res)=>{
    res.render("pages/home.twig", {
    title: "Homepage",
    error: null
  })
}*/

/*
//Show About
exports.displayAbout = async (req,res)=>{
    res.render("pages/about.twig", {
    title: "About",
    error: null
  })
}
*/

//Show connect
exports.displayconnect = async (req,res)=>{
    res.render("pages/connect.twig", {
    title: "connect",
    error: null
  })
}