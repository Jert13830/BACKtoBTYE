const computerRouter = require("express").Router();
const computerController = require("../controllers/computerController");

computerRouter.get('/home',computerController.displayHome);
computerRouter.get('/computerList',computerController.displayComputerList);

module.exports = computerRouter;