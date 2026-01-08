const softwareRouter = require("express").Router();
const softwareController = require("../controllers/softwareController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

softwareRouter.get('/addSoftware', softwareController.addSoftware);
softwareRouter.post('/addSoftware', requireAdmin, softwareController.postSoftware);

softwareRouter.get('/displaySoftwareList', softwareController.displaySoftwareList);
softwareRouter.get('/listSoftwareManufacturer', upload.none(), softwareController.listSoftwareManufacturer);
softwareRouter.get('/showSoftwareManufacturers', authGuard,requireAdmin,softwareController.showSoftwareManufacturers);
softwareRouter.post("/addSoftwareManufacturer", upload.single("logoPath"), softwareController.addSoftwareManufacturer);

softwareRouter.post('/updateSoftwareManufacturerList',authGuard,softwareController.updateSoftwareManufacturerList);
softwareRouter.post('/updateSoftwareManufacturer/:id', authGuard, softwareController.updateSoftwareManufacturer);

module.exports = softwareRouter;