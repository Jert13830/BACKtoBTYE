const communityRouter = require("express").Router();
const communityController = require("../controllers/communityController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

communityRouter.get('/displayCommunity', communityController.displayCommunity);

communityRouter.get('/addPost', authGuard, communityController.showAddPost);
communityRouter.post('/addPost', authGuard, communityController.addPost);
communityRouter.get('/readPost',authGuard, communityController.readPost);

communityRouter.get('/deletePost', authGuard, communityController.deletePost);
communityRouter.post('/updatePost', authGuard, communityController.updatePost);

communityRouter.post('/commentPost', authGuard, communityController.commentPost);
communityRouter.post('/likePost', authGuard, communityController.likePost);

communityRouter.get('/filterPostByCategory/:category', communityController.filterPostByCategory);
communityRouter.get('/sortPostByDetails/:detail', communityController.sortPostByDetails);

module.exports = communityRouter;