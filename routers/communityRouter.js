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

//communityRouter.post('/commentPost', authGuard, communityController.commentPost);

//communityRouter.post('/likePost', authGuard, communityController.likePost);

communityRouter.get('/filterPostByCategory/:category', communityController.filterPostByCategory);
communityRouter.get('/sortPostByDetails/:detail', communityController.sortPostByDetails);


communityRouter.post('/updatePost/:id', authGuard, communityController.updatePost);
communityRouter.post('/updatePostList', authGuard, communityController.updatePostList);

communityRouter.get("/showUpdatePost/:id", authGuard, communityController.showUpdatePost);

communityRouter.get("/readPost/:id", authGuard, communityController.readPost);

communityRouter.post("/postReact", authGuard, communityController.postReact);

communityRouter.get("/commentPost/:id", authGuard, communityController.commentPost);

communityRouter.post("/addComment", authGuard, communityController.addComment);

communityRouter.post('/updateComment', authGuard, communityController.updateComment);
communityRouter.get("/showUpdateComment/:id", authGuard, communityController.showUpdateComment);
communityRouter.post('/editComment/:id', authGuard, communityController.editComment);

module.exports = communityRouter;