const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename(req, file, callback) {
    const ext = path.extname(file.originalname);
    callback(null, Date.now() + ext);
  },
});

module.exports = multer({ storage });
