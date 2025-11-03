const computerRouter = require("express").Router();
const computerController = require("../controllers/computerController");

computerRouter.get('/home',computerController.displayHome);

module.exports = computerRouter;