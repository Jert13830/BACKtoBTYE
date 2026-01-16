const { PrismaClient } = require('@prisma/client');
const validateCommunity = require("../middleware/extensions/validateCommunity");

const prisma = new PrismaClient().$extends(validateCommunity);

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


    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
      });
    }
    // Unknown error
    console.error(error);
    res.redirect("/")

  }
}

exports.showAddPost = async (req, res) => {
  const user = req.session.user;
  res.render("pages/writeMessage.twig", {
    title: "New post",
    user,
    error: null,
  });
}

exports.addPost = async (req, res) => {
  const data = req.body;


  let post = [];
  const user = req.session.user; //Get the current username

  try {

    const title = req.body.postTitle.trim();  //get the post title

    const exists = await prisma.article.findFirst({
      where: {
        titre: title,
        id_utilisateur: user.id_utilisateur
      }
    });

    if (exists) {
      errors.post = "You already have a post with this name.";

      return res.render("pages/writeMessage.twig", {
        errors,
        data,
        post,
        mode: "post",
      });
    }


    // Create post
    post = await prisma.article.create({
      data: {
        titre: title,
        texte: req.body.postMessage,
        date: new Date(),
        id_categorie: Number(req.body.categorySelect),
        id_ordinateur: Number(req.body.computerSelect),
        id_utilisateur: user.id,
      },

    });

    //Create post photo
    let filePath = fs.existsSync(`./public/assets/images/post/${title}.webp`);
  

    if (filePath) {
      filePath = `/assets/images/post/${title}.webp`;
    } else {
      filePath = "/assets/images/post/defaultPost.webp";
    }

    //Save post photo
    await prisma.photo.create({
      data: {
        id_article : post.id_article ,
        alt: `${title} post`,
        path: filePath,
      },
    });

    //Open post list
    return res.redirect("/displayCommunity");

  } catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/writeMessage.twig", {
        errors: error.details,
        data,
      });
    }

    // Unknown error
    errors.emulator = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/writeMessage.twig", {
      errors,
      data,
    });
  }
}

exports.readPost = async (req, res) => {
}

exports.deletePost = async (req, res) => {
}

exports.updatePost = async (req, res) => {
}

exports.commentPost = async (req, res) => {
}

exports.likePost = async (req, res) => {
}
