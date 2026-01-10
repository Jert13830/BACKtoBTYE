const softwareRouter = require("express").Router();
const softwareController = require("../controllers/softwareController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

softwareRouter.get('/addSoftware', softwareController.addSoftware);
softwareRouter.post('/addSoftware', authGuard,requireAdmin, softwareController.postSoftware);

softwareRouter.get('/displaySoftwareList', softwareController.displaySoftwareList);
softwareRouter.post('/filterSoftware', softwareController.filterSoftwareList);

softwareRouter.get('/filterByComputer/:id', softwareController.filterByComputer);
softwareRouter.post('/updateSoftwareList', authGuard, requireAdmin, softwareController.updateSoftwareList);

softwareRouter.get('/softwareDetailSelect/:id_logiciel', softwareController.softwareDetailSelect);

softwareRouter.get("/showUpdateSoftware/:id", authGuard, requireAdmin, softwareController.showUpdateSoftware);

softwareRouter.post('/updateSoftware/:id', authGuard, requireAdmin, softwareController.updateSoftware);


module.exports = softwareRouter;