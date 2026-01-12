const { PrismaClient } = require('@prisma/client');
const validateComputer = require("../middleware/extensions/validateComputer");

const prisma = new PrismaClient().$extends(validateComputer);

const errors = {};

const fs = require('fs');


// Show community
exports.displayCommunity = async (req, res) => {
  try {
    const posts = await prisma.article.findMany({
      include: {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: true,
      },
    });

    res.render("pages/community.twig", {
      title: "Community",
      posts,
      error: null,
    });

  } catch (error) {

    console.log ("ERROR !!!");

    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
      });
    }
    // Unknown error
    console.error(error);
     res.redirect("/home")

}}

