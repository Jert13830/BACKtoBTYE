const { PrismaClient } = require('@prisma/client');
const validateCommunity = require("../middleware/extensions/validateCommunity");

const prisma = new PrismaClient().$extends(validateCommunity);

const errors = {};

const fs = require('fs');
const fsPromises = require("fs/promises");

const path = require("path");


// Show community
exports.displayCommunity = async (req, res) => {
  const user = req.session.user;
  try {
    const posts = await prisma.article.findMany({
      include: {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: true,
        photo: true,
      },
    });

    res.render("pages/community.twig", {
      title: "Community",
      posts,
      user,
      error: null,
    });

  } catch (error) {


    if (error.details) {
      return res.render("pages/home.twig", {
        errors: error.details,
      });
    }
    // Unknown error

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
        id_utilisateur: user.id
      }
    });

   
    if (exists) {
      errors.post = "You already have a post with this title.";

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
        id_article: post.id_article,
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


    return res.render("pages/writeMessage.twig", {
      errors,
      data,
    });
  }
}

exports.readPost = async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const user = req.session.user;

  if (isNaN(postId)) {
    return res.redirect("/displayCommunity");
  }

  try {
    const data = await prisma.article.findUnique({
      where: {
        id_article: postId,
      },
      include: {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: {
          select: {
            pseudo: true,
            photo: {
              select: {
                path: true,
                alt: true,
              }
            }
          }
        },
        commentaires: {
          include: {
            utilisateur: {
              select: {
                id_utilisateur: true,
                pseudo: true,
                photo: {
                  select: {
                    path: true,
                    alt: true,
                  }
                }
              }
            }
          },
          orderBy: {
            date: 'desc',     // newest comments first (optional but nice)
          }
        }
      }
    });

    if (!data) {
      return res.redirect("/displayCommunity");
    }

    // Check if current user liked the post
    const checkPostLike = await prisma.articleLike.findFirst({
      where: {
        id_article: data.id_article,
        id_utilisateur: user?.id,
      }
    });

    const likedPost = !!checkPostLike;

    res.render("pages/readMessage.twig", {
      title: "Message",
      data,
      user,
      likedPost,
      error: null,
    });

  } catch (error) {
    res.redirect("/displayCommunity");
  }
};

exports.updatePostList = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const action = req.body.buttons; // "delete-123" or "modify-123"

  let posts = [];

  //Delete the post
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);
    let posts = [];

    try {

      //send this data back to fill table if there is an error
      posts = await prisma.article.findMany({
        include: {
          categorie: true,
          articleLikes: true,
          ordinateur: true,
          utilisateur: true,
          photo: true,
        },
      });


      //Delete the post photo
      await prisma.photo.delete({
        where: {
          id_article: toDelete,
        },
      });

      //get post name for deleting image
      const postToDelete = await prisma.article.findFirst({
        where: {
          id_article: toDelete,
        }
      });

      //delete the photo from the folder
      let filePath = fs.existsSync(`./public/assets/images/post/${postToDelete.titre}.webp`);


      if (filePath) {
        fs.unlink(`./public/assets/images/post/${postToDelete.titre}.webp`, (err) => {
          if (err) throw err;
        });
      }

      //Delete comments
      await prisma.commentaire.deleteMany({
        where: {
          id_article: toDelete,
        }
      });

      //Delete likes
      await prisma.articleLike.deleteMany({
        where: {
          id_article: toDelete,
        }
      });

      //Delete the post
      await prisma.article.delete({
        where: {
          id_article: toDelete,
        }
      });

      //Return to the list of emulator
      res.redirect("/displayCommunity");

    } catch (error) {

      errors.post = "The post could not be deleted"
      res.render("pages/community.twig", {
        errors,
        mode: "post",
        title: "Community",
      });

    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify
    res.redirect("/showUpdatePost/" + id);

  }
};

exports.showUpdatePost = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const postId = Number(req.params.id);

  try {
    const data = await prisma.article.findUnique({
      where: {
        id_article: postId,
      },
      include:
      {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: true,
        photo: true,

      },
    })


    res.render("pages/writeMessage.twig", {
      title: "Post",
      data,
      transaction: "update",
    });
  }
  catch (error) {
    req.session.errorRequest = "Post data could not be sent";
    res.redirect("/community");
  }
};


exports.updatePost = async (req, res) => {

  const data = req.body;

  const postTitle = data.postTitle;
  const postTitleBefore = data.postTitleBefore;
  const postId = parseInt(req.params.id);
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const imageDir = path.join(__dirname, "../public/assets/images/post");

  const nameChanged = postTitle !== postTitleBefore;
  const newImageUploaded = req.file ? true : false;

  const oldImageFs = path.join(imageDir, `${postTitleBefore}.webp`);
  const newImageFs = path.join(imageDir, `${postTitle}.webp`);

  const imageUrl = `/assets/images/post/${postTitle}.webp`;
  let posts = [];

  try {

    //send this data back to fill table if there is an error
    posts = await prisma.article.findMany({
      include: {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: true,
        photo: true,
      },
    })


    const originalPost = await prisma.article.findFirst({
      where: {
        id_article: postId,
      }
    });


    //Find if a post by the same user has the same title 
    const postExists = await prisma.article.findFirst({
      where: {
        titre: postTitleBefore,
        id_utilisateur: originalPost.id_utilisateur,
      }
    });



    //Check if the id number is the same as the current one we are changing
    if (postExists && postId !== postExists.id_article) {
      //The name already exists

      errors.post = "The title already exists"
      return res.render("pages/writeMessage.twig", {
        posts,
        errors,
        mode: "post",
        title: "Details",
        tranaction: "update",
      });
    }

    //Update photo
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
      const defaultImage = path.join(imageDir, "defaultPost.webp");
      await fsPromises.copyFile(defaultImage, newImageFs);
    }

    const photo = await prisma.photo.findFirst({
      where: { id_article: postId },
    });

    if (photo) {
      await prisma.photo.update({
        where: { id_photo: photo.id_photo },
        data: {
          alt: `${postTitle} image`,
          path: imageUrl,
        },
      });
    }

    //Update post (article)
    await prisma.article.update({
      where: { id_article: postId },
      data: {
        titre: data.postTitle,
        texte: data.postMessage,
        date: new Date(),
        id_categorie: Number(data.categorySelect),
        id_ordinateur: Number(data.computerSelect),
        id_utilisateur: originalPost.id_utilisateur,
      },
    });


    //Cleanup old image file ONLY if name changed
    if (nameChanged && fs.existsSync(oldImageFs)) {
      await fsPromises.unlink(oldImageFs);
    }

    //Return to the list of message
    res.redirect("/displayCommunity");

  } catch (error) {


    // Prisma unique constraint
    if (error.code === "P2002") {
      errors.post = "The post title already exists";

      return res.render("pages/writeMessage.twig", {
        posts,
        errors,
        mode: "post",
        title: "Post",
        tranaction: "update",
      });
    }

    // Prisma extension validation error
    if (error.details?.postTitle) {
      return res.render("pages/writeMessage.twig", {
        posts,
        errors: error.details,
        mode: "post",
        title: "Post",
        tranaction: "update",
      });
    }

    // Fallback
    errors.global = "An unexpected error occurred. Please try again.";

    return res.status(500).render("pages/writeMessage.twig", {
      posts,
      errors,
      mode: "post",
      title: "Post",
      tranaction: "update",
    });
  }
}


exports.filterPostByCategory = async (req, res) => {
  const categoryName = req.params.category;
  let posts = [];
  let errors = {};


  try {

    if (categoryName == "all") {
      return res.redirect("/displayCommunity");
    }

    // Find the category
    const categoryExists = await prisma.categorie.findFirst({
      where: {
        categorie: categoryName,
      },
    });

    //Category wasn't found
    if (!categoryExists) {
      return res.render("pages/community.twig", {
        posts: [],
        errors: {
          post: "Category not found"
        }
      });
    }


    // Find the articles with this category
    posts = await prisma.article.findMany({
      where: {
        id_categorie: categoryExists.id_categorie,
      },
      include: {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: true,
      },
    });

    // Render result
    res.render("pages/community.twig", {
      posts,
    });

  } catch (error) {
    res.render("pages/community.twig", {
      posts,
      errors: {
        post: "An error occurred"
      },
    });
  }

}

exports.sortPostByDetails = async (req, res) => {
  const detailName = req.params.detail;
  const dir = req.query.dir;

  let posts = [];
  let errors = {};

  let usernameDir = "";
  let subjectDir = "";
  let dateDir = "";
  let systemDir = "";
  let likesDir = "";


  try {

    let orderBy;

    if (detailName === "subject") {
      orderBy = { titre: dir };
      subjectDir = dir;
    } else if (detailName === "date") {
      orderBy = { date: dir };
      dateDir = dir;
    } else if (detailName === "username") {
      orderBy = {
        utilisateur: {
          pseudo: dir
        }
      };
      usernameDir = dir;
    } else if (detailName === "system") {
      orderBy = {
        ordinateur: {
          nom: dir
        }
      };
      systemDir = dir;

    } else {
      // sort by number of likes
      orderBy = {
        articleLikes: {
          _count: dir
        }
      };
      likesDir = dir;
    }


    posts = await prisma.article.findMany({
      orderBy,
      include: {
        categorie: true,
        articleLikes: true,
        ordinateur: true,
        utilisateur: true,
      },
    });

    res.render('pages/community.twig',
      {
        title: "Community",
        posts,
        subjectDir,
        dateDir,
        systemDir,
        usernameDir,
        likesDir,
      });
  }
  catch (error) {
    // Custom validation extension
    if (error.details) {
      return res.render("pages/community.twig", {
        errors: error.details,
        posts,
      });
    }

    // Unknown error
    return res.render("pages/community.twig", {
      errors,
      posts,
    });
  }
}

exports.postReact = async (req, res) => {
  try {
    let { postId, userId, action } = req.body;

    postId = parseInt(postId, 10);
    userId = parseInt(userId, 10);

    const data = req.body;


    if (!postId || !userId || !action) {
      return res.status(400).send("Missing data");
    }

    if (action === "like") {
      const exists = await prisma.articleLike.findFirst({
        where: {
          id_article: postId,
          id_utilisateur: userId,
        }
      });

      if (exists) {
        await prisma.articleLike.delete({
          where: {
            id_article_like: exists.id_article_like,
          }
        });
      } else {
        await prisma.articleLike.create({
          data: {
            id_article: postId,
            id_utilisateur: userId,
            score: 1,
          }
        });
      }

      return res.redirect(`/readPost/${postId}`);
    }

    if (action === "comment") {
      return res.redirect(`/commentPost/${postId}`);
    }

    return res.status(400).send("Unknown action");

  } catch (err) {
    
    return res.status(500).send("Server error");
  }
};

exports.commentPost = async (req, res) => {
  let data = req.body;
  const postId = parseInt(req.params.id);

  res.render("pages/writeComment.twig", {
    title: "Comment",
    data,
    error: null,
    postId,
  });

};


exports.addComment = async (req, res) => {
  const commentData = req.body;
  const postId = Number(req.body.postId);
  const user = req.session.user; //Get the current user
  try {

    //create the comment
    post = await prisma.commentaire.create({
      data: {
        texte: commentData.commentMessage,
        date: new Date(),
        id_article: postId,
        id_utilisateur: user.id,
      },

    });

    return res.redirect(`/readPost/${postId}`);

  } catch (error) {
    res.render("pages/writeComment.twig", {
      title: "Comment",
      postId,
      commentData,
      errors: {
        comment: "An error occurred"
      },
    });
  }
}

exports.updateComment = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers

  const action = req.body.buttons; // "delete-123" or "modify-123"
  const postId = Number(req.body.postId);

  //Delete the comment
  if (action.startsWith("delete-")) {
    let toDelete = action.split("-")[1];
    toDelete = parseInt(toDelete);

    try {
      //Delete the comment

      await prisma.commentaire.delete({
        where: {
          id_commentaire: toDelete,
        },
      });

      //Return to the post
      res.redirect(`/readPost/${postId}`);

    } catch (error) {

      errors.post = "The comment could not be deleted"
      res.redirect(`/readPost/${postId}`);
    }

  } else if (action.startsWith("modify-")) {
    let id = action.split("-")[1];

    id = parseInt(id);
    // handle modify
    res.redirect(`/showUpdateComment/${id}?post=${postId}`);
  }
};


exports.editComment = async (req, res) => {
  const postId = Number(req.body.postId);
  const commentId = Number(req.params.id);

  try {
    await prisma.commentaire.update({
      where: {
        id_commentaire: commentId,
      },
      data: {
        texte: req.body.commentMessage,
      },
    });

    // Return to the post
    res.redirect(`/readPost/${postId}`);

  } catch (error) {
    console.error("Error updating comment:", error);

    // Always go back to the post, even if it failed
    errors.post="An error occurred";
    return res.redirect(`/readPost/${postId}?error=editComment`);
  }
}


exports.showUpdateComment = async (req, res) => {
  const errors = {};  //Safer to create errors{} each time, no errors from other controllers
  const commentId = Number(req.params.id);
  const postId = Number(req.query.post);

  try {
    const data = await prisma.commentaire.findUnique({
      where: {
        id_commentaire: commentId,
      },
      include:
      {
        utilisateur: {
          select: {
            id_utilisateur: true,
            pseudo: true,
            photo: {
              select: {
                path: true,
                alt: true,
              }
            }
          }
        }
      },
    })

    res.render("pages/writeComment.twig", {
      title: "Comment",
      data,
      postId,
      transaction: "update",
    });
  }
  catch (error) {
    req.session.errorRequest = "Comment data could not be sent";
    return res.redirect(`/readPost/${postId}`);
  }
};