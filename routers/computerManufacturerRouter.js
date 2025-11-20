const computerManufacturerRouter = require("express").Router();
const computerManufacturerController = require("../controllers/computerManufacturerController");
const authGuard = require('../middleware/services/authguard');

computerManufacturerRouter.get('/addComputerManufacturer', authGuard, computerManufacturerController.listComputerManufacturer);
computerManufacturerRouter.post('/addComputerManufacturer', authGuard, computerManufacturerController.addComputerManufacturer);

computerManufacturerRouter.get('/removeComputerManufacturer', authGuard, computerManufacturerController.removeComputerManufacturer);

computerManufacturerRouter.get('/updateComputerManufacturer', authGuard, computerManufacturerController.displayUpdateComputerManufacturer);
computerManufacturerRouter.post('/updateComputerManufacturer', authGuard, computerManufacturerController.updateComputerManufacturer);


module.exports = computerManufacturerRouter;