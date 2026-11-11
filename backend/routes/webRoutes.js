const express = require("express");
const webController = require("../controllers/webController");
const { isLoggedin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", webController.home);
router.get("/profile", isLoggedin, webController.profile);
router.post("/post", isLoggedin, upload.single("image"), webController.createPost);
router.get("/post/:id/edit", isLoggedin, webController.editPostPage);
router.post("/post/:id/edit", isLoggedin, upload.single("image"), webController.editPost);
router.post("/post/:id/delete", isLoggedin, webController.deletePost);
router.get("/register", webController.registerPage);
router.post("/register", webController.register);
router.get("/like/:id", isLoggedin, webController.toggleLike);
router.get("/login", webController.loginPage);
router.post("/login", webController.login);
router.get("/logout", webController.logout);
router.get("/explore", isLoggedin, webController.explore);

module.exports = router;
