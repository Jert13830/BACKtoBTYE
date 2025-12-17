const computerRouter = require("express").Router();
const computerController = require("../controllers/computerController");
const multer = require("multer");
const upload = multer(); 
const authGuard = require('../middleware/services/authguard');

computerRouter.get('/home',computerController.displayHome);

computerRouter.get('/computerList',computerController.displayComputerList);
computerRouter.get('/listComputer', upload.none(),computerController.listComputer);

computerRouter.get('/addComputer', authGuard ,computerController.displayAddComputer);
computerRouter.post('/addComputer',authGuard ,computerController.postComputer);

computerRouter.post('/filterComputers',computerController.filterComputerList);

module.exports = computerRouter;