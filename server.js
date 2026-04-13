const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const User = require("./models/user"); 
const postModel = require("./models/post");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(cookieParser()); 
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// home
app.get("/", (req, res) => {
  res.render("hero");
});

// profile
app.get("/profile", isLoggedin, async (req, res) => {
  let user = await User.findOne({ email: req.user.email }).populate("posts");
  res.render("profile", { user });
});

app.post("/post", isLoggedin, async (req, res) => {
  let user = await User.findOne({ email: req.user.email });
  let post = await postModel.create({
    user: user._id,
    content: req.body.content,
  });
  user.posts.push(post._id);
  await user.save();

  res.redirect("/profile");
});

// register page
app.get("/register", (req, res) => {
  res.render("register");
});

// register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let isUser = await User.findOne({ email });
  if (isUser) return res.status(400).send("User already exists");

  const hash = await bcrypt.hash(password, 10);

  let user = await User.create({
    name,
    email,
    password: hash,
  });

  let token = jwt.sign(
    {
      email: user.email,
      userid: user._id,
    },
    "timepasssecrate",
  );

  res.cookie("token", token);
  res.redirect("/profile");
});
//likes
app.get("/like/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  // console.log(user.posts);
  res.redirect("/profile");
});

// login page
app.get("/login", (req, res) => {
  res.render("login");
});

// login
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let isUser = await User.findOne({ email });
  if (!isUser) return res.status(400).send("User not found");

  let result = await bcrypt.compare(password, isUser.password);

  if (result) {
    let token = jwt.sign(
      {
        email: isUser.email,
        userid: isUser._id,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token);
    res.redirect("profile");
  } else {
    res.send("Invalid credentials");
  }
});

// logout
app.get("/logout", (req, res) => {
  res.cookie("token", ""); // ✅ fixed spelling
  res.redirect("/login");
});

// middleware
function isLoggedin(req, res, next) {
  if (!req.cookies.token || req.cookies.token === "") {
    return res.redirect("/login");
  }

  try {
    let data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

app.listen(process.env.PORT||3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
