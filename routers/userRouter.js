const userRouter = require("express").Router();
const userController = require("../controllers/userController");

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

const multer = require("multer");
const upload = multer(); 

userRouter.get('/about',userController.displayAbout);



userRouter.get('/connect',userController.displayconnect);
userRouter.post("/userLogout", authGuard,userController.userLogout);

userRouter.post('/connect',userController.connect);

userRouter.get('/register',userController.registration);
userRouter.post('/register',userController.registerUser);

//userRouter.get('/listUserRoles', upload.none(),userController.listUserRoles);
userRouter.get('/listUserRoles', authGuard,userController.listUserRoles);

userRouter.post('/roleList', authGuard,userController.treatRoleList);

userRouter.get('/userList',authGuard,userController.displayUserList);
userRouter.get('/showUserRoles', authGuard,userController.showUserRoles);

userRouter.post('/postRole',authGuard,userController.postRole);

userRouter.post('/updateRoleText',authGuard,userController.updateRoleText);
userRouter.post('/updateUserList',authGuard,userController.updateUserList);
userRouter.get('/updateUser/:id', authGuard,userController.updateUser);

userRouter.post('/updateUserInfo/:id', authGuard,userController.updateUserInfo);
userRouter.post('/updatePassword', authGuard,userController.updatePassword);

userRouter.post('/resetPassword/:id', authGuard,requireAdmin,userController.resetPassword);

userRouter.get('/resetForgottenPassword', userController.resetForgottenPassword);
userRouter.post('/updateForgottenPassword', userController.updateForgottenPassword);

module.exports = userRouter;