//const { PrismaClient } = require("../generated/prisma/client");
const { PrismaClient } = require('@prisma/client');
const hashExtension = require("../middleware/extensions/hashPassword");
const validateUser = require("../middleware/extensions/validateUser");
const prisma = new PrismaClient().$extends(validateUser).$extends(hashExtension);

// Importing bcrypt for password hashing and comparison
const bcrypt = require('bcrypt');

const errors = {};

const fs = require('fs/promises');



/*
// Show Homepage
exports.displayHome = async (req,res)=>{
    res.render("pages/home.twig", {
    title: "Homepage",
    error: null
  })
}*/


//Show About
exports.displayAbout = async (req, res) => {
  res.render("pages/about.twig", {
    title: "About",
    error: null
  })
}


//Show connect
exports.displayconnect = async (req, res) => {
  res.render("pages/connect.twig", {
    title: "Connect",
    error: null
  })
}

//User connection
exports.connect = async (req, res) => {
  const data = req.body;
  try {
    // research email
    const user = await prisma.utilisateur.findUnique({
      where: {
        email: req.body.email
      }
    })
    if (user) {
      // Check the password
      if (bcrypt.compareSync(req.body.password, user.motDePasse)) {
        //If the password matches then the User is added to the session
        req.session.user = user
        req.app.loginStatus = true;
        // Redirect to the homepage
         res.redirect('/home')

      } else {
        // If the password is incorrect return error
        //errors.connection = "Incorrect connection details";
        errors.connection = "Incorrect password";
        return res.render("pages/connect.twig", {
          errors,
          data
        });

      }
    } else {
      // If the email is incorrect return error
      //errors.connection = "Incorrect connection details";
      errors.connection = "Incorrect email";
      return res.render("pages/connect.twig", {
        errors,
        data
      });
    }
  } catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/connect.twig", {
        errors: error.details,
        data
      });
    }

    // Unknown error
    errors.connection = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/connect.twig", {
      errors,
      data
    });
  }
}

exports.registration = async (req, res) => {
  res.render("pages/registry.twig", {
    title: "Registration",
    error: null
  })
}


exports.registerUser = async (req, res) => {
  const data = req.body;
  try {

    // Check the two passwords match
    if (req.body.password == req.body.confirmPassword) {

      // Check to see if the Email address is already registered
      const userEmail = await prisma.utilisateur.findUnique({
        where: {
          email: req.body.email
        }
      })

      if (userEmail) {
        //The email adress is already in use
        console.log("You are already registered");
        //errors.duplicateEmail = "You are already registered";
        return res.render("pages/registry.twig", {
          duplicateEmail: "You are already registered",
          data,
        });

      }
      else {
        console.log("Going to test username");
        //Check to see if the Username is already used
        const userProfile = await prisma.utilisateur.findFirst({
          where: {
            pseudo: req.body.usernameProfile,
          }
        });

        console.log("Moving on " + req.body.usernameProfile);

        if (userProfile) {

          console.log("Username already exists");

          //The username is already in use
          //errors.duplicateUser = "The Username is already in use";
          return res.render("pages/registry.twig", {
            duplicateUser: "The Username is already in use",
            data,
          });

        }
        else {

          console.log("Creating user");
          console.log(req.body);

          //It is a new user - create the user   
          const user = await prisma.utilisateur.create({
            data: {
              pseudo: req.body.usernameProfile,
              email: req.body.email,
              motDePasse: req.body.password,
            }
          });

          console.log("User created");

          console.log("Ready to create photo");

          //Create the photo entry      

          const filePath = `/assets/images/users/${req.body.usernameProfile}.webp`;

          try {
            await fs.access(filePath);

            console.log("User photo exists");
            // file exists
          } catch {
            // file does not exist
            console.log("User photo doesn't exists");
            // filePath = "/assets/images/users/defaultUserImage.webp";
          }

          console.log("Save photo ", filePath);

          //Save User profile photo
          const userPhoto = await prisma.photo.create({
            data: {
              id_utilisateur: user.id_utilisateur,
              alt: `Profile photo of ${user.pseudo}`,
              path: filePath,
            },
          });

          console.log("Save role")
          /*await prisma.photo.create({
            data: {
              id_utilisateur: user.id_utilisateur,
              alt: `Profile photo of ${user.pseudo}`,
              path: filePath,
            },
          });*/

          // Redirect to the connect page to log in
          res.redirect('/connect');
        }

      }

    }
    else {
      // The two passwords don't match
      // errors.confirmPassword = "The passwords do not match";

      return res.render("pages/registry.twig", {
        confirmPassword: "The passwords do not match",
        data,
      });
    }
  }
  catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/registry.twig", {
        errors: error.details,
        data
      });
    }

    // Unknown error
    errors.usernameProfile = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/registry.twig", {
      errors,
      data
    });
  }


}

exports.userLogout = async (req, res) => {
  req.app.loginStatus = false;
  req.session.destroy()
  res.redirect('/home')
}