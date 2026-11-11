const User = require("../models/user");
const postModel = require("../models/post");

function getExplorePosts(userId) {
  return postModel
    .find({ user: { $ne: userId } })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(20);
}

function findById(id) {
  return postModel.findById(id);
}

function findByIdWithUser(id) {
  return postModel.findById(id).populate("user", "name email");
}

async function createApiPost(postData, userId) {
  const post = await postModel.create(postData);
  await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });
  await post.populate("user", "name email");
  return post;
}

async function createWebPost(user, postData) {
  const post = await postModel.create(postData);
  user.posts.push(post._id);
  await user.save();
  return post;
}

async function save(post) {
  await post.save();
  return post;
}

async function saveWithUser(post) {
  await post.save();
  await post.populate("user", "name email");
  return post;
}

async function deletePost(postId, userId) {
  await postModel.findByIdAndDelete(postId);
  await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
}

async function toggleLike(postId, userId, populateUser = false) {
  const post = await postModel.findById(postId).select("likes");
  if (!post) {
    return null;
  }

  const alreadyLiked = post.likes.some((id) => id.toString() === userId);
  const update = alreadyLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };

  const updatedPost = await postModel.findByIdAndUpdate(postId, update, {
    new: true,
  });
  if (populateUser) {
    await updatedPost.populate("user", "name email");
  }
  return updatedPost;
}

module.exports = {
  getExplorePosts,
  findById,
  findByIdWithUser,
  createApiPost,
  createWebPost,
  save,
  saveWithUser,
  deletePost,
  toggleLike,
};
