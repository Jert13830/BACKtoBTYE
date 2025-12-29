const computerRouter = require("express").Router();
const computerController = require("../controllers/computerController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

computerRouter.get('/home', computerController.displayHome);

computerRouter.get('/computerList', computerController.displayComputerList);
computerRouter.get('/listComputer', upload.none(), computerController.listComputer);

computerRouter.get('/addComputer', requireAdmin, computerController.displayAddComputer);
computerRouter.post('/addComputer', requireAdmin, computerController.postComputer);

computerRouter.post('/filterComputers', computerController.filterComputerList);

computerRouter.get('/computerDetailSelect/:id_ordinateur', computerController.computerDetailSelect);

computerRouter.post('/updateComputerList', authGuard, requireAdmin, computerController.updateComputerList);

computerRouter.get("/showUpdateComputer/:id", authGuard, requireAdmin, computerController.showUpdateComputer);

computerRouter.post('/updateComputer/:id', authGuard, requireAdmin, computerController.updateComputer);



module.exports = computerRouter;