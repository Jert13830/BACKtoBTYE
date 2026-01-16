//const { PrismaClient } = require("../generated/prisma/client");
const { PrismaClient } = require('@prisma/client');
const hashExtension = require("../middleware/extensions/hashPassword");
const validateUser = require("../middleware/extensions/validateUser");
const prisma = new PrismaClient().$extends(validateUser).$extends(hashExtension);

// Importing bcrypt for password hashing and comparison
const bcrypt = require('bcrypt');

const fs = require('fs/promises');



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
    console.error(error);

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
      if (await bcrypt.compareSync(req.body.password, user.motDePasse)) {
        //If the password matches then the User is added to the session
        req.session.user = {
          id: user.id_utilisateur,
          pseudo: user.pseudo,
          email: user.email,
          role: user.roleUtilisateurs?.[0]?.role?.role
        };

        console.log("User:", req.session.user);
        req.app.loginStatus = true;
        // Redirect to the homepage
        res.redirect('/')

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
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const email = req.body.email.toLowerCase().trim();
  const pseudo = req.body.usernameProfile.trim();
  const data = req.body;
  console.log("User ERROR");
  console.log(data);
  try {

    // Check the two passwords match
    console.log("The password is : " + req.body.password + "( and the confirmeed : " + req.body.confirmPassword);
    if (req.body.password == req.body.confirmPassword) {

      // Check to see if the Email address is already registered

      const userEmail = await prisma.utilisateur.findUnique({
        where: {
          email: email
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
            pseudo: pseudo,
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
              pseudo: pseudo,
              email: email,
              // password is hashed via prisma extension bcrypt
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
          console.log(req.body);


          const iRole = await prisma.role.findFirst({
            where: {
              role: req.body.userRole,
            }
          });


          await prisma.roleUtilisateur.create({
            data: {
              id_role: iRole.id_role,
              id_utilisateur: user.id_utilisateur,

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
    console.error(error);

    return res.render("pages/registry.twig", {
      errors,
      data
    });
  }


}

//Get user role list
exports.listUserRoles = async (req, res) => {
  console.log("Fetching Roles");
  try {
    const roles = await prisma.role.findMany();
    console.log("Got list, come back");
    return res.json({
      success: true,
      roles,
    });

  } catch (error) {
    console.error("Error retrieving user roles:", error);

    return res.status(500).json({
      success: false,
      error: "Unexpected error while retrieving user roles."
    });
  }
};

exports.updateUserList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  console.log(req.body);
  const action = req.body.buttons; // "delete-123" or "modify-123"

  //Delete the role
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {

      //Users will be sent if an Error occurs
      const users = await prisma.utilisateur.findMany();

      //Delete the roleUtilisateur entry before deleting the user

      console.log("Check if exists");
      const exists = await prisma.roleUtilisateur.findFirst({
        where: {
          id_utilisateur: toDelete,
        }
      });

      if (exists) {
        console.log("Remove if exists");
        console.log("user exists");
        await prisma.roleUtilisateur.deleteMany({
          where: {
            id_utilisateur: toDelete
          }
        });
      }

      //Delete User 
      console.log("Check if exists");
      await prisma.utilisateur.delete({
        where: {
          id_utilisateur: toDelete
        }
      });

      res.redirect("/userList")
    } catch (error) {

      errors.userError = "The user could not be deleted"
      res.render("pages/userList.twig", {
        errors,
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

  console.log(req.body);
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
  console.log("Data to update");
  console.log("Req Body: ", req.body);
  console.log("UserID: ", userId);
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
        return res.render("pages/registry.twig", {
          errors: { email: "The user is already registered" },
          data,
          transaction: "update",
        });
      }
    }

    //Email address is the same or available

    //Find the photo and change the name

    const fs = require('fs/promises');
    const path = require('path');

    if (data.usernameProfile !== actualUser.pseudo && actualUser.photo) {

      const oldPath = path.join(
        __dirname,
        `../public/assets/images/users/${actualUser.pseudo}.webp`
      );

      const newPath = path.join(
        __dirname,
        `../public/assets/images/users/${data.usernameProfile}.webp`
      );

      try {
        await fs.rename(oldPath, newPath);

        await prisma.photo.update({
          where: { id_photo: actualUser.photo.id_photo },
          data: {
            path: `/assets/images/users/${data.usernameProfile}.webp`
          }
        });

      } catch (err) {
        console.error("Image rename failed:", err);
        //place default image
        await prisma.photo.update({
          where: { id_photo: actualUser.photo.id_photo },
          data: {
            path: `/assets/images/users/defaultUserImage.webp`
          }
        });

      }
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
      console.log("The role is : ", req.body.userRole);

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

      console.log("iRole.id_role : ", indexRole);

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
    console.error("Error updating user data:", error);

    return res.render("pages/registry.twig", {
      errors: {
        global: "An unexpected error occurred while updating your profile."
      },
      data,
      transaction: "update"
    });
  }

}

exports.updateUser = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const userId = parseInt(req.params.id);

  console.log("COMING THROUGH !!!");

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

    console.log("User ID: " + userId + " Session : " + req.session.user.id);
    if (userId !== req.session.user.id) {
      data.administratorChange = true;
    }

    return res.render("pages/registry.twig", {
      data,
      transaction: "update",
    });

  } catch (error) {
    console.error(error);
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

exports.updatePassword = async (req, res) => {

  console.log(req.body);
  const data = req.body;
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  console.log("The session user : ", req.session.user);

  const userId = req.session.user.id;

  try {
    // Get the old password from the database
    const userDb = await prisma.utilisateur.findUnique({
      where: {
        id_utilisateur: userId,
      }
    })

    if (await bcrypt.compareSync(data.currentPassword, userDb.motDePasse)) {
      //If the password matches then the we check the new password and the confirmed password


      if (data.newPassword == data.confirmPassword) {
        //Hash the password
        const hashedPassword = bcrypt.hashSync(data.newPassword, 12);
        data.newPassword = hashedPassword;
        console.log ("We are back from hashing",userId);
        
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
        return res.render("pages/registry.twig", {
          transaction: "update",
          data,
          errors,

        });
      }
    }
    else {
      // If the password is incorrect return error
      errors.password = "Incorrect password";
      return res.render("pages/registry.twig", {
        data,
        transaction: "update",
        errors,

      });

    }

  }
  catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/registry.twig", {
        errors: error.details,
        data,
        transaction: "update",
      });
    }

    // Unknown error
    errors.connection = "An unexpected error occurred.";
    console.error(error);

    return res.render("pages/registry.twig", {
      errors,
      data,
      transaction: "update"
    });
  }
}

exports.resetPassword = async (req, res) => {

  console.log("Me FIRST !!");

  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  let data = req.body;

  console.log("Req Body: ", req.body);

  const userId = parseInt(req.params.id); //User to be reset


  try {

    // check to see if the connected user is an administrator, if not no need to continue
    console.log("Session User : ", req.session.user);

    if (req.session.user.role !== "administrator") {
      errors.passwordReset = "You are not authorised to reset this password";

      //get user to be changed details
      data = await prisma.utilisateur.findUnique({
        where: {
          //id_utilisateur: req.session.user.id,
          id_utilisateur: userId,
        }
      })

      /*const data = {
      id:userData.id_utilisateur,   
      usernameProfile: userData.pseudo,
      email: userData.email,
      }*/

      console.log("The user is : ", data);

      return res.render("pages/registry.twig", {
        errors,
        data,
        transaction: "update"
      });
    }

    // if adminstrator

    console.log("Administrator : ", req.session.user.nom)
    console.log("User : ", userId);

    // find the user to be updated
    const userToChange = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: userId }
    });

    // if the user doesn't exist return
    if (!userToChange) {
      errors.passwordReset = "User not found";
      return res.redirect("/updateUser/" + userId);
    }

    //Hash the temporary password and save it 
    const hashedPassword = bcrypt.hashSync("Reset123", 12);
    const newPassword = hashedPassword;

    // change the password.
    await prisma.utilisateur.update({
      where: {
        id_utilisateur: userId,
      },
      data: {
        motDePasse: newPassword,
      }

    })

    res.redirect("/connect")

  } catch (error) {
    console.error("Reset password error:", error);

    errors.passwordReset = "An unexpected error occurred while resetting the password.";

    return res.redirect("/updateUser/" + userId);
  }

}


exports.userLogout = async (req, res) => {
  req.app.loginStatus = false;
  req.session.destroy()
  res.redirect('/')
}

