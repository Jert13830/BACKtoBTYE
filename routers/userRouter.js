const userRouter = require("express").Router();
const userController = require("../controllers/userController");

const authGuard = require('../middleware/services/authguard');


//userRouter.get('/home',userController.displayHome);

userRouter.get('/about',userController.displayAbout);

userRouter.get('/connect',userController.displayconnect);
userRouter.get("/userLogout", userController.userLogout);

userRouter.post('/connect',userController.connect);

userRouter.get('/register',userController.registration);
userRouter.post('/register',userController.registerUser);

module.exports = userRouter;