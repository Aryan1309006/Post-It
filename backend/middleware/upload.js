const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const parseImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

function upload(req, res, next) {
  parseImage(req, res, (error) => {
    if (error) return next(error);
    if (!req.file) return next();

    const stream = cloudinary.uploader.upload_stream(
      { folder: "post-it", resource_type: "image" },
      (uploadError, result) => {
        if (uploadError) return next(uploadError);
        if (!result || !result.secure_url) {
          return next(new Error("Cloudinary did not return an image URL"));
        }

        req.file.path = result.secure_url;
        next();
      },
    );

    stream.end(req.file.buffer);
  });
}

module.exports = upload;
