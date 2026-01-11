const emulatorManufacturerRouter = require("express").Router();
const emulatorManufacturerController = require("../controllers/emulatorManufacturerController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

emulatorManufacturerRouter.get('/listEmulatorManufacturer', upload.none(), emulatorManufacturerController.listEmulatorManufacturer);
emulatorManufacturerRouter.get('/showEmulatorManufacturers', authGuard,requireAdmin,emulatorManufacturerController.showEmulatorManufacturers);
emulatorManufacturerRouter.post("/addEmulatorManufacturer", upload.single("logoPath"), emulatorManufacturerController.addEmulatorManufacturer);

emulatorManufacturerRouter.post('/updateEmulatorManufacturerList',authGuard,emulatorManufacturerController.updateEmulatorManufacturerList);
emulatorManufacturerRouter.post('/updateEmulatorManufacturer/:id', authGuard, emulatorManufacturerController.updateEmulatorManufacturer);


module.exports = emulatorManufacturerRouter;