const authService = require("../services/authService");
const postService = require("../services/postService");

function home(req, res) {
  res.render("hero");
}

async function profile(req, res) {
  const user = await authService.getWebProfile(req.user.email);
  res.render("profile", { user });
}

async function createPost(req, res) {
  const content = req.body.content ? req.body.content.trim() : "";
  if (!content && !req.file) {
    return res.redirect("/profile");
  }

  const user = await authService.findUserByEmail(req.user.email);
  if (!user) {
    return res.redirect("/login");
  }

  const postData = { user: user._id, content };
  if (req.file) {
    postData.imageUrl = `/uploads/${req.file.filename}`;
  }

  await postService.createWebPost(user, postData);
  res.redirect("/profile");
}

async function editPostPage(req, res) {
  const post = await postService.findById(req.params.id);
  if (!post || post.user.toString() !== req.user.userid) {
    return res.redirect("/profile");
  }

  res.render("edit", { post });
}

async function editPost(req, res) {
  const content = req.body.content ? req.body.content.trim() : "";
  if (!content && !req.file) {
    return res.redirect(`/post/${req.params.id}/edit`);
  }

  const post = await postService.findById(req.params.id);
  if (!post || post.user.toString() !== req.user.userid) {
    return res.redirect("/profile");
  }

  if (content) post.content = content;
  if (req.file) post.imageUrl = `/uploads/${req.file.filename}`;
  await postService.save(post);
  res.redirect("/profile");
}

async function deletePost(req, res) {
  const post = await postService.findById(req.params.id);
  if (!post || post.user.toString() !== req.user.userid) {
    return res.redirect("/profile");
  }

  await postService.deletePost(req.params.id, req.user.userid);
  res.redirect("/profile");
}

function registerPage(req, res) {
  res.render("register");
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (await authService.findUserByEmail(email)) {
    return res.status(400).send("User already exists");
  }

  const user = await authService.createUser({ name, email, password });
  res.cookie("token", authService.createToken(user));
  res.redirect("/profile");
}

async function toggleLike(req, res) {
  const post = await postService.toggleLike(req.params.id, req.user.userid);
  if (!post) {
    return res.redirect("/profile");
  }

  res.redirect(req.get("Referer") || "/profile");
}

function loginPage(req, res) {
  res.render("login");
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await authService.findUserByEmail(email);
  if (!user) return res.status(400).send("User not found");

  if (await authService.verifyPassword(password, user.password)) {
    res.cookie("token", authService.createToken(user));
    res.redirect("/profile");
  } else {
    res.send("Invalid credentials");
  }
}

function logout(req, res) {
  res.cookie("token", "");
  res.redirect("/login");
}

async function explore(req, res) {
  const posts = await postService.getExplorePosts(req.user.userid);
  res.render("explore", { posts });
}

module.exports = {
  home,
  profile,
  createPost,
  editPostPage,
  editPost,
  deletePost,
  registerPage,
  register,
  toggleLike,
  loginPage,
  login,
  logout,
  explore,
};
