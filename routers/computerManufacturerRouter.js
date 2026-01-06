const computerManufacturerRouter = require("express").Router();

const computerManufacturerController = require("../controllers/computerManufacturerController");

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

const multer = require("multer");
const upload = multer(); 

computerManufacturerRouter.get('/listComputerManufacturer', upload.none(),computerManufacturerController.listComputerManufacturer);
computerManufacturerRouter.post("/addComputerManufacturer", upload.single("logoPath"), computerManufacturerController.addComputerManufacturer);

computerManufacturerRouter.get('/showComputerManufacturers', authGuard,requireAdmin,computerManufacturerController.showComputerManufacturers);
computerManufacturerRouter.post('/updateComputerManufacturerList',authGuard,computerManufacturerController.updateComputerManufacturerList);
computerManufacturerRouter.post('/updateComputerManufacturer/:id', authGuard, computerManufacturerController.updateComputerManufacturer);

module.exports = computerManufacturerRouter;