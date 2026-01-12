const communityRouter = require("express").Router();
const communityController = require("../controllers/communityController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

communityRouter.get('/displayCommunity', communityController.displayCommunity);

module.exports = communityRouter;