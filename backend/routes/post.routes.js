const express = require("express");
const apiPostController = require("../controllers/posts.controller");
const { requireApiLogin } = require("../middleware/auth-middleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/explore", requireApiLogin, apiPostController.explore);
router.get("/:id", requireApiLogin, apiPostController.getById);
router.post("/", requireApiLogin, upload, apiPostController.create);
router.put("/:id", requireApiLogin, upload, apiPostController.update);
router.delete("/:id", requireApiLogin, apiPostController.remove);
router.post("/:id/like", requireApiLogin, apiPostController.toggleLike);

module.exports = router;
