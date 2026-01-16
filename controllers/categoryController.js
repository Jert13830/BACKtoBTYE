const { PrismaClient } = require('@prisma/client');
const validateCategory = require("../middleware/extensions/validateCategory");

const prisma = new PrismaClient().$extends(validateCategory);

const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");

exports.showCategory = async (req, res) => {
    let manufacturers = [];
    try {

        manufacturers = await prisma.categorie.findMany();

        console.log("Manufacturers data : ", manufacturers);

        res.render("pages/manufacturerList.twig", {
            manufacturers,
            mode: "category",
            title: "Category"
        });
    } catch (error) {
        req.session.errorRequest = "Error loading list";
        res.redirect("/error");
    }
};

//Get the list of categories
exports.listCategory = async (req, res) => {
    let categories = [];

    console.log("Passed by here");
    
    try {
        categories = await prisma.categorie.findMany();
        return res.json({
            success: true,
            categories,
        });

    } catch (error) {
        console.error("Error retrieving categories:", error);

        return res.status(500).json({
            success: false,
            error: "Unexpected error while retrieving categories."
        });
    }
};

//Add a category
exports.addCategory = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    let manufacturers = [];
    const name = req.body.manufacturerName.trim();

     console.log("Adding category. Name : ", name);

    try {

        //send this data back to fill table if there is an error
        manufacturers = await prisma.categorie.findMany();

        const exists = await prisma.categorie.findFirst({
            where: { categorie: name }
        });

        if (exists) {
            //The category already exists
            errors.manufacturerName = "The category already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                mode: "category",
                title: "Category",
                errors,
            });
        }

        //Create the category
        await prisma.categorie.create({
            data: { categorie: name }
        });


        res.redirect("/showCategory");

    } catch (error) {
        console.error("Add category Error:", error);

        // Prisma unique constraint
        if (error.code === "P2002") {
            errors.manufacturerName = "The category already exists";

            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "category",
                title: "Category",
            });
        }

        // Prisma extension validation error
        if (error.details?.manufacturerName) {
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors: error.details,
                mode: "category",
                title: "Category",
            });
        }

        // Fallback
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/manufacturerList.twig", {
            manufacturers,
            errors,
            mode: "category",
            title: "Category",
        });
    }
}

exports.updateCategoryList = async (req, res) => {
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const action = req.body.buttons; // "delete-123" or "modify-123"
    let manufacturers = [];

    //Delete the manufacturer
    if (action.startsWith("delete-")) {
        let toDelete = action.split("-")[1];
        toDelete = parseInt(toDelete);

        try {

            //send this data back to fill table if there is an error
            manufacturers = await prisma.categorie.findMany();

            //Check to see if the category exists
            const categoryExists = await prisma.categorie.findFirst({
                where: { id_categorie: toDelete }
            });

            if (!categoryExists) {
                errors.manufacturerName = "Category not found";
                return res.render("pages/manufacturerList.twig", {
                    errors,
                    mode: "category",
                    manufacturers,
                    title: "Category",
                });
            }

            const exists = await prisma.article.findFirst({
                where: { id_categorie: categoryExists.id_categorie}
            });


            if (exists) {
                //The category is associated with at least one article an can not to deleted
                errors.manufacturerName = "The category is associated with at least one article an can not to deleted"
                return res.render("pages/manufacturerList.twig", {
                    manufacturers,
                    errors,
                    mode: "category",
                    title: "Category",
                });
            }

            console.log("Deleting category");
            //Delete the category
            await prisma.categorie.delete({
                where: {
                    id_categorie : toDelete
                }
            });

            //Return to the list of categories
            res.redirect("/showCategory");

        } catch (error) {

            errors.manufacturerName = "The category could not be deleted"
            res.render("pages/manufacturerList.twig", {
                errors,
                mode: "category",
                title: "Category",
            });

        }

    } else if (action.startsWith("modify-")) {
        let id = action.split("-")[1];

        id = parseInt(id);
        // handle modify

        res.redirect("/updateCategory/" + id);

    }
};


exports.updateCategory = async (req, res) => {

    const manufacturerName = req.body.manufacturerName;
    const nameBeforeChange = req.body.nameBeforeChange;
    const manufacturerId = parseInt(req.params.id);
    const errors = {};  //Safer to create errors{} each time, no errors from other controllers

    const nameChanged = manufacturerName !== nameBeforeChange;

    let manufacturers = [];
    console.log("Data : ", req.body);

    try {

        //send this data back to fill table if there is an error
        manufacturers = await prisma.categorie.findMany();

        //Find if a category has the same name
        const categoryNameExists = await prisma.categorie.findFirst({
            where: { categorie : manufacturerName }
        });

        //Check if the id number is the same as the current one we are changing
        if (categoryNameExists && manufacturerId !== categoryNameExists.id_categorie) {
            //The name already exists
            errors.manufacturerName = "The category already exists"
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "category",
                title: "Category",
            });
        }


        const existing = await prisma.categorie.findFirst({
            where: { categorie : nameBeforeChange }
        });

        await prisma.categorie.update({
                where: { id_categorie :existing.id_categorie},
                data: {
                  categorie: manufacturerName,
                },
              });


        //Return to the list of categories
        res.redirect("/showCategory");

    } catch (error) {
        console.error("Update category error:", error);

        // Prisma unique constraint
        if (error.code === "P2002") {
            errors.manufacturerName = "The category already exists";

            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors,
                mode: "category",
                title: "Category",
            });
        }

        // Prisma extension validation error
        if (error.details?.manufacturerName) {
            return res.render("pages/manufacturerList.twig", {
                manufacturers,
                errors: error.details,
                mode: "category",
                title: "Category",
            });
        }

        // Fallback
        errors.global = "An unexpected error occurred. Please try again.";

        return res.status(500).render("pages/manufacturerList.twig", {
            manufacturers,
            errors,
            mode: "category",
            title: "Category",
        });
    }
}

exports.filterPostByCategory = async (req, res) => {

    let posts =[];

  try {
    const categoryName = req.params.id;

    // Find the computer
    const category = await prisma.categorie.findFirst({
      where: {
        categorie: categoryName,
      },
    });

    if (!category) {
      return res.render("pages/community.twig", {
        posts,
        message: "Category not found",
      });
    }

    // Find post
    posts = await prisma.article.findMany({
      where: {
        id_categorie: category.id_categorie,
      },
      include: {
        utilisateur: true,
        photos: true,
        ordinateur: true,
      },
    });

    // Render result
    res.render("pages/community.twig", {
      posts,
    });

  } catch (error) {
    console.error(error);
    res.render("pages/emulatorList.twig", {
      posts,
      error: "An error occurred",
    });
  }
};
