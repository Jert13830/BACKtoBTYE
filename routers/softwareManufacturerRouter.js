const softwareManufacturerRouter = require("express").Router();
const softwareManufacturerController = require("../controllers/softwareManufacturerController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

softwareManufacturerRouter.get('/listSoftwareManufacturer', upload.none(), softwareManufacturerController.listSoftwareManufacturer);
softwareManufacturerRouter.get('/showSoftwareManufacturers', authGuard,requireAdmin,softwareManufacturerController.showSoftwareManufacturers);
softwareManufacturerRouter.post("/addSoftwareManufacturer", upload.single("logoPath"), softwareManufacturerController.addSoftwareManufacturer);

softwareManufacturerRouter.post('/updateSoftwareManufacturerList',authGuard,softwareManufacturerController.updateSoftwareManufacturerList);
softwareManufacturerRouter.post('/updateSoftwareManufacturer/:id', authGuard, softwareManufacturerController.updateSoftwareManufacturer);

module.exports = softwareManufacturerRouter;