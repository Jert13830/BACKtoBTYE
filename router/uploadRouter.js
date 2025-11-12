// routes/uploadRoutes.js
const uploadRouter = require("express").Router();
const multer = require("multer");
const { uploadImage } = require ("../controllers/uploadController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

//uploadRouter.post("/upload", upload.single("file"), uploadImage);

uploadRouter.post(
  "/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  uploadImage
);

module.exports = uploadRouter;