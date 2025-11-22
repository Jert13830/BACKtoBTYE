const computerRouter = require("express").Router();
const computerController = require("../controllers/computerController");

const authGuard = require('../middleware/services/authguard');


computerRouter.get('/home',computerController.displayHome);
computerRouter.get('/computerList',computerController.displayComputerList);

computerRouter.get('/addComputer', computerController.displayAddComputer);
computerRouter.post('/addComputer', computerController.postComputer);

module.exports = computerRouter;