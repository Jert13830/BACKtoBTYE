const userRouter = require("express").Router();
const userController = require("../controllers/userController");

const authGuard = require('../middleware/services/authguard');

const multer = require("multer");
const upload = multer(); 

//userRouter.get('/home',userController.displayHome);

userRouter.get('/about',userController.displayAbout);

userRouter.get('/connect',userController.displayconnect);
userRouter.post("/userLogout", userController.userLogout);

userRouter.post('/connect',userController.connect);

userRouter.get('/register',userController.registration);
userRouter.post('/register',userController.registerUser);

//userRouter.get('/listUserRoles', upload.none(),userController.listUserRoles);
userRouter.get('/listUserRoles', userController.listUserRoles);

userRouter.post('/roleList', userController.treatRoleList);

userRouter.get('/showUserRoles', userController.showUserRoles);

userRouter.post('/postRole',userController.postRole);

module.exports = userRouter;