const emulatorRouter = require("express").Router();
const emulatorController = require("../controllers/emulatorController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

emulatorRouter.get('/addEmulator', emulatorController.addEmulator);
emulatorRouter.post('/addEmulator', authGuard,requireAdmin, emulatorController.postEmulator);

emulatorRouter.get('/displayEmulatorList', emulatorController.displayEmulatorList);
emulatorRouter.post('/filterEmulator', emulatorController.filterEmulatorList);

emulatorRouter.get('/filterEmulatorByComputer/:id', emulatorController.filterEmulatorByComputer);
emulatorRouter.post('/updateEmulatorList', authGuard, requireAdmin, emulatorController.updateEmulatorList);

emulatorRouter.get('/emulatorDetailSelect/:id', emulatorController.emulatorDetailSelect);

emulatorRouter.get("/showUpdateEmulator/:id", authGuard, requireAdmin, emulatorController.showUpdateEmulator);

emulatorRouter.post('/updateEmulator/:id', authGuard, emulatorController.updateEmulator);


module.exports = emulatorRouter;