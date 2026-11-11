const postService = require("../services/post.service");

async function explore(req, res) {
  const posts = await postService.getExplorePosts(req.user.userid);
  res.json({ posts });
}

async function getById(req, res) {
  const post = await postService.findByIdWithUser(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (post.user._id.toString() !== req.user.userid) {
    return res.status(403).json({ error: "You cannot edit this post" });
  }

  res.json({ post });
}

async function create(req, res) {
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
  if (!content) {
    return res.status(400).json({ error: "Post content is required" });
  }

  const postData = { user: req.user.userid, content };
  if (req.file) {
    postData.imageUrl = req.file.path;
  }

  const post = await postService.createApiPost(postData, req.user.userid);
  res.status(201).json({ post });
}

async function update(req, res) {
  const post = await postService.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (post.user.toString() !== req.user.userid) {
    return res.status(403).json({ error: "You cannot edit this post" });
  }

  if (typeof req.body.content === "string") {
    const content = req.body.content.trim();
    if (!content) {
      return res.status(400).json({ error: "Post content is required" });
    }
    post.content = content;
  }
  if (req.file) {
    post.imageUrl = req.file.path;
  }

  await postService.saveWithUser(post);
  res.json({ post });
}

async function remove(req, res) {
  const post = await postService.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (post.user.toString() !== req.user.userid) {
    return res.status(403).json({ error: "You cannot delete this post" });
  }

  await postService.deletePost(req.params.id, req.user.userid);
  res.sendStatus(204);
}

async function toggleLike(req, res) {
  const post = await postService.toggleLike(req.params.id, req.user.userid, true);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json({ post });
}

module.exports = { explore, getById, create, update, remove, toggleLike };
