const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const postModel = require("../models/post");

function findUserByEmail(email) {
  return User.findOne({ email });
}

async function createUser({ name, email, password }) {
  return User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
  });
}

function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function createToken(user, expiresIn) {
  const payload = { email: user.email, userid: user._id.toString() };
  return expiresIn
    ? jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
    : jwt.sign(payload, process.env.JWT_SECRET);
}

function setAuthCookie(res, user) {
  res.cookie("token", createToken(user, "7d"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function getApiProfile(userId) {
  const user = await User.findById(userId).select("name email");
  if (!user) {
    return { user: null };
  }

  const posts = await postModel
    .find({ user: user._id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return { user, posts };
}

function getWebProfile(email) {
  return User.findOne({ email }).populate("posts");
}

module.exports = {
  findUserByEmail,
  createUser,
  verifyPassword,
  createToken,
  setAuthCookie,
  getApiProfile,
  getWebProfile,
};
