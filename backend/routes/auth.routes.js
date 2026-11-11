const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireApiLogin } = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/me", requireApiLogin, authController.me);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
