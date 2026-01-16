const categoryRouter = require("express").Router();
const categoryController = require("../controllers/categoryController");
const multer = require("multer");
const upload = multer();

//Check if a user is connected
const authGuard = require('../middleware/services/authguard');
//Check if an administrator is connected
const requireAdmin = require('../middleware/services/requireAdmin');

categoryRouter.get('/listCategory', upload.none(), categoryController.listCategory);
categoryRouter.get('/showCategory', authGuard,requireAdmin,categoryController.showCategory);
categoryRouter.post("/addCategory", upload.single("logoPath"), categoryController.addCategory);

categoryRouter.post('/updateCategoryList',authGuard,categoryController.updateCategoryList);
categoryRouter.post('/updateCategory/:id', authGuard, categoryController.updateCategory);

categoryRouter.get('/filterPostByCategory/:id', categoryController.filterPostByCategory);

module.exports = categoryRouter;