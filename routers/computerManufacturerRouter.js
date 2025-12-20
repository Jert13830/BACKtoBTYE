const computerManufacturerRouter = require("express").Router();

const computerManufacturerController = require("../controllers/computerManufacturerController");
const authGuard = require('../middleware/services/authguard');

const multer = require("multer");
const upload = multer(); 

computerManufacturerRouter.get('/listComputerManufacturer', upload.none(),computerManufacturerController.listComputerManufacturer);
//computerManufacturerRouter.post('/addComputerManufacturer', computerManufacturerController.addComputerManufacturer);
computerManufacturerRouter.post("/addComputerManufacturer", upload.single("logoPath"), computerManufacturerController.addComputerManufacturer);
computerManufacturerRouter.get('/removeComputerManufacturer', authGuard, computerManufacturerController.removeComputerManufacturer);

computerManufacturerRouter.get('/updateComputerManufacturer', authGuard, computerManufacturerController.displayUpdateComputerManufacturer);
computerManufacturerRouter.post('/updateComputerManufacturer', authGuard, computerManufacturerController.updateComputerManufacturer);

module.exports = computerManufacturerRouter;