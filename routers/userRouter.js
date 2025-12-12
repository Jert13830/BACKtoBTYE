const userRouter = require("express").Router();
const userController = require("../controllers/userController");

const authGuard = require('../middleware/services/authguard');


//userRouter.get('/home',userController.displayHome);
//userRouter.get('/about',userController.displayAbout);


module.exports = userRouter;