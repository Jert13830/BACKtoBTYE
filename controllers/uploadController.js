const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

exports.uploadImage = async (req, res) => {
  try {
    // Multer stores "file" and "files" separately
    const singleFile = req.files?.file ? req.files.file[0] : null;
    const multiFiles = req.files?.files || [];

    if (!singleFile && multiFiles.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const outputDir = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      req.body.phototype
    );
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const allFiles = singleFile ? [singleFile] : multiFiles;
    const uploadedUrls = [];

    // Process each file
    for (const file of allFiles) {

      /*const outputFilename = `${req.body.filename || Date.now()}-${Math.random()
       .toString(36)
       .substring(2, 8)}.webp`;*/

      const outputFilename = `${req.body.filename || Date.now()}.webp`;
      const outputPath = path.join(outputDir, outputFilename);

      //Sharp is used to resize and reformat the image to .webp
      await sharp(file.buffer)
        .resize({
          width: parseInt(req.body.photoWidth),
          height: parseInt(req.body.photoHeight),
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFormat("webp", { quality: 90 })
        .toFile(outputPath);

      uploadedUrls.push(`/assets/images/${req.body.phototype}/${outputFilename}`);
    }

    // Send back response
    res.json({
      success: true,
      message: `${uploadedUrls.length} image(s) uploaded successfully!`,
      files: uploadedUrls,
      path: uploadedUrls.length === 1 ? uploadedUrls[0] : null,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Error processing image(s)." });
  }
};
