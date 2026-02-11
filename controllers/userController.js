//const { PrismaClient } = require("../generated/prisma/client");
const { PrismaClient } = require('@prisma/client');
const hashExtension = require("../middleware/extensions/hashPassword");
const validateUser = require("../middleware/extensions/validateUser");
const prisma = new PrismaClient().$extends(validateUser).$extends(hashExtension);
const sendEmailConfirmAccount = require("../routers/mailer");

//used to generate the reset password token
const crypto = require("crypto");

// Importing bcrypt for password hashing and comparison
const bcrypt = require('bcrypt');

const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");



/*
// Show Homepage
exports.displayHome = async (req,res)=>{
    res.render("pages/home.twig", {
    title: "Homepage",
    error: null
  })
}*/

exports.showUserRoles = async (req, res) => {
  try {

    const roles = await prisma.role.findMany();

    res.render("pages/roleList.twig", {
      roles,
    });
  } catch (error) {
    req.session.errorRequest = "Error loading list";
    res.redirect("/error");
  }
};


exports.displayUserList = async (req, res) => {
  const errors = {};
  const data = req.body;
  try {
    const users = await prisma.utilisateur.findMany({
      include: {
        roleUtilisateurs: {
          include: {
            role: true
          }
        }
      }
    })

    res.render("pages/userList.twig", {
      title: "User List",
      users,
      error: null,
    });

  } catch (error) {
    if (error.details) {
      return res.render("pages/registry.twig", {
        errors: error.details,
        users
      });
    }

    // Unknown error

    return res.render("pages/registry.twig", {
      errors,
    });
  }
};



//Show About
exports.displayAbout = async (req, res) => {
  res.render("pages/about.twig", {
    title: "About",
    error: null
  })
}

//Show GDPR
exports.displayGDPR = async (req, res) => {
  res.render("pages/gdpr.twig", {
    title: "GDPR",
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
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const email = req.body.email.toLowerCase().trim();
  const data = req.body;

  try {
    // research email
    const user = await prisma.utilisateur.findUnique({
      where: {
        email: email
      }, include: {
        roleUtilisateurs: { include: { role: true } },
      }
    })
    if (user) {
      // Check the password
      if (await bcrypt.compare(req.body.password, user.motDePasse)) {
        //If the password matches then the User is added to the session
        req.session.user = {
          id: user.id_utilisateur,
          pseudo: user.pseudo,
          email: user.email,
          role: user.roleUtilisateurs?.[0]?.role?.role
        };

        req.app.loginStatus = true;
        // Redirect to the homepage
        res.redirect('/')

      } else {
        // If the password is incorrect return error
        //errors.connection = "Incorrect connection details";
        errors.connection = "Invalid email or password";
        return res.render("pages/connect.twig", {
          errors,
          data
        });

      }
    } else {
      // If the email is incorrect return error
      //errors.connection = "Incorrect connection details";
      errors.connection = "Invalid email or password";
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


    return res.render("pages/connect.twig", {
      errors,
      data
    });
  }
}

exports.registration = async (req, res) => {
  res.render("pages/registry.twig", {
    title: "Registration",
    transaction: "update",

    error: null
  })
}

exports.newRegistration = async (req, res) => {
  res.render("pages/registry.twig", {
    title: "Registration",
    clearData:   true,
    error: null
  })
}


exports.registerUser = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const email = req.body.email.toLowerCase().trim();
  const pseudo = req.body.usernameProfile.trim();
  const data = req.body;

  let userRoleID = 0;

  try {

    // Check the two passwords match
    if (req.body.password == req.body.confirmPassword) {

      // Check to see if the Email address is already registered
      const userEmail = await prisma.utilisateur.findUnique({
        where: {
          email: email
        }
      })

      if (userEmail) {
        //The email adress is already in use
        //errors.duplicateEmail = "You are already registered";
        return res.render("pages/registry.twig", {
          duplicateEmail: "You are already registered",
          data,
        });

      }
      else {
        //Check to see if the Username is already used
        const userProfile = await prisma.utilisateur.findFirst({
          where: {
            pseudo: pseudo,
          }
        });

        if (userProfile) {
          //The username is already in use
          //errors.duplicateUser = "The Username is already in use";
          return res.render("pages/registry.twig", {
            duplicateUser: "The Username is already in use",
            data,
          });
        }
        else {
          //It is a new user - create the user   
          const newUser = await prisma.utilisateur.create({
            data: {
              pseudo: pseudo,
              email: email,
              // password is hashed via prisma extension bcrypt, no raw password
              motDePasse: req.body.password,
            }
          });

          //if data.userRole = 'user' default value when the user sets up their own account

          if (data.userRole == "user") {
            const findUser = await prisma.role.findFirst({
              where: {
                role: data.userRole,
              }

            });

            if (!findUser) {
              throw new Error(`Role "${data.userRole}" not found`);
            }

            userRoleID = findUser.id_role;
          }
          else {
            userRoleID = data.userRole;
          }

          await prisma.roleUtilisateur.create({
            data: {
              id_role: parseInt(userRoleID),
              id_utilisateur: newUser.id_utilisateur,

            },
          });

          //Create the photo entry      
          let filePath = fs.existsSync(`./public/assets/images/users/${req.body.usernameProfile}.webp`);

          if (filePath) {
            filePath = `/assets/images/users/${req.body.usernameProfile}.webp`;  // URL for browser
          } else {
            filePath = "/assets/images/users/defaultUserImage.webp";

          }

          //Save User profile photo
          const userPhoto = await prisma.photo.create({
            data: {
              id_utilisateur: newUser.id_utilisateur,
              alt: `Profile photo of ${newUser.pseudo}`,
              path: filePath,
            },
          });

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


    return res.render("pages/registry.twig", {
      errors,
      data
    });
  }


}

//Get user role list
exports.listUserRoles = async (req, res) => {

  try {
    const roles = await prisma.role.findMany();

    return res.json({
      success: true,
      roles,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: "Unexpected error while retrieving user roles."
    });
  }
};

exports.updateUserList = async (req, res) => {
  const errors = {};
  const action = req.body.buttons;

  if (action.startsWith("delete-")) {
    let toDelete = parseInt(action.split("-")[1]);

    let users = []; // default for error case

    try {

      users = await prisma.utilisateur.findMany({
        include: {
          roleUtilisateurs: {
            include: {
              role: true
            }
          }
        }
      });

      //delete user

      const exists = await prisma.roleUtilisateur.findFirst({
        where: { id_utilisateur: toDelete }
      });

      if (exists) {
        //The user must be deleted in order - this can no done using cascade delete by Prisma, but there is more control here

        //Delete articles (Posts)
        await prisma.article.deleteMany({
          where: { id_utilisateur: toDelete }
        });

        //Delete articlelikes
        await prisma.articleLike.deleteMany({
          where: { id_utilisateur: toDelete }
        });

        //Delete comments
        await prisma.commentaire.deleteMany({
          where: { id_utilisateur: toDelete }
        });

        //Delete popularity
        await prisma.popularite.deleteMany({
          where: { id_utilisateur: toDelete }
        });

        //Delete rarity
        await prisma.rarete.deleteMany({
          where: { id_utilisateur: toDelete }
        });

        //Delete photo - should only be one by on the safe side.
        await prisma.photo.deleteMany({
          where: {
            id_utilisateur: toDelete,
          },
        });

        const userPhotoToDelete = await prisma.utilisateur.findFirst({
          where: { id_utilisateur: toDelete }
        });

        //Delete photo on server

        //delete the photo from the folder
        let filePath = fs.existsSync(`./public/assets/images/users/${userPhotoToDelete.pseudo}.webp`);


        if (filePath) {
          fs.unlink(`./public/assets/images/users/${userPhotoToDelete.pseudo}.webp`, (err) => {
            if (err) throw err;
          });
        }

        //Delete role
        await prisma.roleUtilisateur.deleteMany({
          where: { id_utilisateur: toDelete }
        });

        //Delete user
        await prisma.utilisateur.delete({
          where: { id_utilisateur: toDelete }
        });

        res.redirect("/userList");
      } else {
        errors.userError = "The user not found";
        res.render("pages/userList.twig", {
          title: "User List",
          users,
          errors
        });
      }

    } catch (error) {
      console.error("Error during delete operation:");
      console.error(error);

      if (error.code) {
        console.error("Prisma error code:", error.code);
      }
      if (error.meta) {
        console.error("Meta:", error.meta);
      }

      errors.userError = "The user could not be deleted";

      // Fetch users so the list still shows
      try {
        users = await prisma.utilisateur.findMany({
          include: {
            roleUtilisateurs: { include: { role: true } }
          }
        });
      } catch (e2) {
        console.error("Failed to reload user list:", e2);
      }

      res.render("pages/userList.twig", {
        title: "User List",
        users,
        errors
      });
    }
  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify

    res.redirect("/updateUser/" + id);

  }
};


exports.treatRoleList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers


  const action = req.body.buttons; // "delete-123" or "modify-123"

  //Delete the role
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {

      //Roles will be sent if an Error occurs
      const roles = await prisma.role.findMany();

      //Test if role is associated with at least one user
      const exists = await prisma.roleUtilisateur.findFirst({
        where: { id_role: toDelete }
      });

      if (exists) {
        errors.userRoleTitle = "There are users associated with this role";
        return res.render("pages/roleList.twig", {
          errors,
          roles,
        });
      }

      //only delete Role if no user are associated with the role
      const deleteRole = await prisma.role.delete({
        where: {
          id_role: toDelete
        }
      })
      res.redirect("/showUserRoles")
    } catch (error) {

      req.session.errorRequest = "The role could not be deleted"
      res.redirect("/registry")

    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify

    res.redirect("/updateUser/" + id);

  }
};

exports.updateUserInfo = async (req, res) => {

  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const userId = parseInt(req.params.id);
  const data = req.body; // To be sent back if there is an error
  data.id = data.backupId;

  const username = req.body.usernameProfile;
  const usernameBeforeChange = req.body.usernameProfileBeforeChange;
  const imageDir = path.join(__dirname, "../public/assets/images/users");

  const nameChanged = username !== usernameBeforeChange;
  const newImageUploaded = !!req.file;

  const oldImageFs = path.join(imageDir, `${usernameBeforeChange}.webp`);
  const newImageFs = path.join(imageDir, `${username}.webp`);

  const imageUrl = `/assets/images/emulator/${username}.webp`;

  try {
    //Get actual user information
    const actualUser = await prisma.utilisateur.findFirst({
      where: { id_utilisateur: userId },
      include: {
        roleUtilisateurs: { include: { role: true } },
        photo: true
      }
    })

    //The actual user doesn't exist - this should not be impossible
    if (!actualUser) {
      return res.render("pages/registry.twig", {
        errors: { usernameProfile: "User not found" },
        transaction: "update"
      });
    }
    //Check the if username is the same, if not, that the username is not in use 

    if (data.usernameProfile !== actualUser.pseudo) {
      const usernameInUse = await prisma.utilisateur.findFirst({
        where: { pseudo: data.usernameProfile }
      });

      //name already in use
      if (usernameInUse) {
        data.usernameProfile = actualUser.pseudo;
        return res.render("pages/registry.twig", {
          errors: { usernameProfile: "Username already in use" },
          data,
          transaction: "update",
        });
      }
    }

    //The username is the same or available

    //Check that the email addresses are the same or not already in use
    if (data.email !== actualUser.email) {
      const emailInUse = await prisma.utilisateur.findFirst({
        where: { email: data.email }
      });

      //Email already in use
      if (emailInUse) {
        data.email = actualUser.email;
        return res.render("pages/registry.twig", {
          errors: { email: "The user is already registered" },
          data,
          transaction: "update",
        });
      }
    }

    //Email address is the same or available

    //Find the photo and change the name
    //Handle filesystem
    if (nameChanged && !newImageUploaded && fs.existsSync(oldImageFs)) {
      //Name changed only  - copy old image
      await fsPromises.copyFile(oldImageFs, newImageFs);
    }

    if (newImageUploaded) {
      //New image uploaded - save image
      await fsPromises.writeFile(newImageFs, req.file.buffer);
    }

    if (!fs.existsSync(newImageFs)) {
      //No image - use default image
      const defaultImage = path.join(imageDir, "defaultUserImage.webp");
      await fsPromises.copyFile(defaultImage, newImageFs);
    }

    const photo = await prisma.photo.findFirst({
      where: { id_utilisateur: userId },
    });

    if (photo) {
      await prisma.photo.update({
        where: { id_photo: photo.id_photo },
        data: {
          alt: `${username} image`,
          path: imageUrl,
        },
      });
    }

    //Now update the user account

    await prisma.utilisateur.update({
      where: {
        id_utilisateur: userId,
      },
      data: {
        pseudo: data.usernameProfile,
        email: data.email,
      },
    });

    //Update the Role

    const roleLink = await prisma.roleUtilisateur.findFirst({
      where: {
        id_utilisateur: userId,
      },
    });

    if (roleLink) {
      let indexRole = 0;

      if (isNaN(req.body.userRole)) {
        const iRole = await prisma.role.findFirst({
          where: {
            role: req.body.userRole,
          }
        });

        indexRole = iRole.id_role;
      }
      else {
        indexRole = req.body.userRole;
      }

      await prisma.roleUtilisateur.update({
        where: {
          id_role_utilisateur: roleLink.id_role_utilisateur,
        },
        data: {
          id_role: Number(indexRole),
        },
      });
    } else {
      // Safety fallback (should not happen normally)
      await prisma.roleUtilisateur.create({
        data: {
          id_utilisateur: userId,
          id_role: Number(req.body.userRole),
        },
      });
    }

    //Everything went well return to Home page
    return res.redirect('/');
  }
  catch (error) {
    errors.usernameProfile = "An unexpected error occurred."
    return res.render("pages/registry.twig", {
      errors,
      data,
      transaction: "update"
    });
  }

}

exports.updateUser = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.utilisateur.findFirst({
      where: { id_utilisateur: userId },
      include: {
        roleUtilisateurs: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return res.render("pages/userList.twig", {
        errors: { userError: "User not found" }
      });
    }

    const data = [];
    data.id = user.id_utilisateur;
    data.usernameProfile = user.pseudo;
    data.email = user.email;
    data.password = "******";
    data.confirmPassword = "******";
    data.userRole = user.roleUtilisateurs[0].role.role;

    if (userId !== req.session.user.id) {
      data.administratorChange = true;
    }

    return res.render("pages/registry.twig", {
      data,
      transaction: "update",
    });

  } catch (error) {

    return res.render("pages/userList.twig", {
      errors: { userError: "Unknown error" }
    });
  }
};


//Update Role Title
exports.updateRoleText = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const roleTitle = req.body.updateRoleText;

  if (!/^[a-z][a-z0-9_-]{2,29}$/.test(roleTitle)) {
    return res.render("pages/roleList.twig", {
      errors: {
        userRoleTitle: "Lowercase letters (3–30 characters max)"
      }
    });
  }

  try {
    //Get Roles to be returned if error occurs
    const roles = await prisma.role.findMany();

    //Test if role exists already
    const exists = await prisma.role.findFirst({
      where: { role: req.body.updateRoleText }
    });


    if (exists) {
      errors.userRoleTitle = "Role already exists";
      return res.render("pages/roleList.twig", {
        errors,
        roles,
      });
    }

    //Update role
    await prisma.role.update({
      where: {
        id_role: Number(req.body.roleId),
      },
      data: {
        role: req.body.updateRoleText,
      },
    });
    res.redirect("/showUserRoles")
  } catch (error) {

    if (error.code === 'P2002') {
      //Duplicate Role)
      errors.userRoleTitle = "Role already exists";
      return res.render('pages/roleList.twig', {
        errors,
        roles,
      });
    } else {
      errors.userRoleTitle = "Unknown error";
      return res.render('pages/roleList.twig', {
        errors,
      });

    }
  }
}


//Add Role
exports.postRole = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const roleTitle = req.body.userRoleTitle;

  if (!/^[a-z][a-z0-9_-]{2,29}$/.test(roleTitle)) {
    return res.render("pages/roleList.twig", {
      errors: {
        userRoleTitle: "Lowercase letters (3–30 characters max)"
      }
    });
  }

  try {
    //Get Roles to be returned if error occurs
    const roles = await prisma.role.findMany();

    //Test if role exists already
    const exists = await prisma.role.findFirst({
      where: { role: req.body.userRoleTitle }
    });


    if (exists) {
      errors.userRoleTitle = "Role already exists";
      return res.render("pages/roleList.twig", {
        errors,
        roles,
      });
    }

    //Add role
    await prisma.role.create({
      data: {
        role: req.body.userRoleTitle,

      }
    })

    res.redirect("/showUserRoles")
  } catch (error) {

    if (error.code === 'P2002') {
      //Duplicate Role)
      errors.userRoleTitle = "Role already exists";
      return res.render('pages/roleList.twig', {
        errors,
        roles,
      });
    } else {
      errors.userRoleTitle = "Unknown error";
      return res.render('pages/roleList.twig', {
        errors,
      });

    }
  }
}

exports.updateForgottenPassword = async (req, res) => {

  const tokenUser = req.body;
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const userId = parseInt(tokenUser.utilisateurId);

  try {

    // test that the two passwords are the same
    if (tokenUser.newPassword == tokenUser.confirmPassword) {
      // change the password.
      await prisma.utilisateur.update({
        where: {
          id_utilisateur: userId,
        },
        data: {
          motDePasse: tokenUser.newPassword,
        }

      })

      res.redirect("/connect")
    }
    else {
      // If the passwords don't match return error
      errors.password = "The passwords don't match";
      res.render("pages/forgottenPassword.twig", {
        title: "Password Update",
        errors,
        tokenUser,
      });
    }
  }
  catch (error) {

    errors.connection = "An unexpected error occurred.";

    return res.redirect("/home");
  }
}

exports.updatePassword = async (req, res) => {

  const data = req.body;
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  let userDb = {}; //user from the database which needs to be sent back if an error occurs

  const userId = req.session.user.id;

  try {
    // Get the old password from the database
    userDb = await prisma.utilisateur.findFirst({
      where: {
        id_utilisateur: userId,
      }
    })


    if (await bcrypt.compareSync(data.currentPassword, userDb.motDePasse)) {
      //If the password matches then the we check the new password and the confirmed password

      if (data.newPassword == data.confirmPassword) {

        // change the password.
        await prisma.utilisateur.update({
          where: {
            id_utilisateur: userId,
          },
          data: {
            motDePasse: data.newPassword,
          }

        })

        res.redirect("/connect")

      }
      else {
        // If the passwords don't match return error
        errors.password = "The passwords don't match";
        data = userDb; //set data to the database user data

        return res.render("pages/registry.twig", {
          errors: { password: "The passwords are not correct" },
          openDialog: "updatePassword",
          transaction: "update",
          data,
        });



      }
    }
    else {
      // If the password is incorrect return error
      errors.password = "Incorrect password";
      return res.render("pages/registry.twig", {
        errors,
        data,
        openDialog: "updatePassword",
        transaction: "update",
      });

    }

  }
  catch (error) {

    // Custom validation extension
    if (error.details) {
      errors.password = error.details;
      return res.render("pages/registry.twig", {
        errors,
        data,
        openDialog: "updatePassword",
        transaction: "update",
      });
    }

    // Unknown error
    errors.password = "An unexpected error occurred.";
    return res.render("pages/registry.twig", {
      errors,
      data,
      openDialog: "updatePassword",
      transaction: "update"
    });
  }
}

async function generateTokenLink(user) {

  //Create token and hash it
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  //Get the exipry time now + 30 minutes  
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  //Save token to database to be compared later  
  await prisma.passwordResetToken.create({
    data: {
      utilisateurId: user.id_utilisateur,
      token: tokenHash,
      expiresAt: expiresAt,
      createdAt: new Date(),
    },
  });

  //Return the reset password link with token to be sent in an email
   return `https://john-thompson.ri7.tech/resetForgottenPassword?token=${token}`;
  //return `http://localhost:3000/resetForgottenPassword?token=${token}`;
}


exports.resetPassword = async (req, res) => {

  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  let data = req.body;

  // Get email either from the user forggeting their password or an administrator demand to reset a user's password
  const userEmail = data.email;

  try {

    if (data.email) {
      //Find the user whos password is to be changed using the email address
      data = await prisma.utilisateur.findUnique({
        where: {
          email: data.email,
        }
      })

      /**** CHECK IF A USER FOUND ****/
      if (!data) {
        errors.connection = "Email address not found";
        return res.render("pages/connect.twig", {
          errors,
        });
      }

      /********** DELETE ANY EXISTING RESET PASSWORD TOKENS **********************/

      await prisma.passwordResetToken.delete({
        where: {
          utilisateurId: data.id_utilisateur,
        },
      });

      /********** CREATE AND GET NEW RESET EMAIL TOKEN AND LINK **********************/


      const resetLink = await generateTokenLink(data);


      /********** SEND EMAIL TO RESET PASSWORD **********************/

      //This is the email content to, subject, text, html
      await sendEmailConfirmAccount(
        data.email,
        "Demand to reset password",
        "",
        `
              <h1>BACKtoBYTE</h1>
              <p>
                Hello <b>${data.pseudo}</b>
              </p>

            <p>You have requested to reset your password.</p>
            <a
                href="${resetLink}"
                style="background:#D3CBCB;color:#3C3C43;
                padding:10px 16px;
                text-decoration:none;
                border-radius:4px;
                display:inline-block;"
            >
                Reset your password
            </a>
            <br>
            <p>If you did not initiate this request, please ignore this email. Your account will remain secure.</p>
            </div>
        `
      );
      /***********************************************/

      //Test if the session user is NULL, then the user is not an administrator
      if (req.session.user == null) {
        //If they are not an adminastrator go to the connect screen with a message email sent
        errors.connection = "A reset email has been sent";
        return res.render("pages/connect.twig", {
          errors,
        });
      }
      else {
        //Go to the connect screen
        res.redirect("/connect")
      }

    }
    else {
      /*The email is empty, then it can only be a user asking to reset their password 
         as the administrator option can not be sent without something in the email field*/
      errors.connection = "An email address is required";
      return res.render("pages/connect.twig", {
        errors,
      });

    }

  } catch (error) {

    errors.connection = "An unexpected blue beard error occurred while resetting the password.";
    return res.render("pages/connect.twig", {
      errors,
    });
  }

}


exports.resetForgottenPassword = async (req, res) => {

  const errors = {};

  try {
    const receivedTokenHash = crypto
      .createHash("sha256")
      .update(req.query.token)
      .digest("hex");

    //Find the token if it exists and it has not expired
    const tokenUser = await prisma.passwordResetToken.findFirst({
      where: {
        token: receivedTokenHash,
        expiresAt: { gt: new Date() }
      }
    });

    if (!tokenUser) {
      //Invalid token screen
      errors.link = "Please make a new password reset request.";
      return res.render("pages/tokenInvalid.twig", {
        errors,
      });
    }

    res.render("pages/forgottenPassword.twig", {
      title: "Password Update",
      error: null,
      tokenUser,
    });
  }
  catch (error) {
    console.error("Password reset token lookup failed:", error);

    // Generic error
    errors.link = "An unexpected error occurred. Please try again later."
    res.status(500).render("pages/tokenInvalid.twig", {
      errors,
    });
  }
};


exports.userLogout = async (req, res) => {
  req.app.loginStatus = false;
  req.session.destroy()
  res.redirect('/')
}

