const express = require("express");
const apiPostController = require("../controllers/apiPostController");
const { requireApiLogin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/explore", requireApiLogin, apiPostController.explore);
router.get("/:id", requireApiLogin, apiPostController.getById);
router.post("/", requireApiLogin, upload.single("image"), apiPostController.create);
router.put("/:id", requireApiLogin, upload.single("image"), apiPostController.update);
router.delete("/:id", requireApiLogin, apiPostController.remove);
router.post("/:id/like", requireApiLogin, apiPostController.toggleLike);

module.exports = router;
