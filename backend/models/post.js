
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Post creator
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Post content
    caption: {
      type: String,
      maxlength: 2200,
      trim: true,
      default: "",
    },

    // Post image or video
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],

    // Users who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments on post
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        text: {
          type: String,
          required: true,
          maxlength: 500,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Hashtags
    hashtags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Visibility
    visibility: {
      type: String,
      enum: ["public", "private", "followers"],
      default: "public",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
