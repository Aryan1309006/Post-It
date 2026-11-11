
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    bio: {
      type: String,
      maxlength: 250,
      default: "",
    },

    avatar: {
      type: String,
      default: null,
    },

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    refreshToken: {
      type: String,
      default: null,
    },

    sessionToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save",async function(next){
  if(!this.isModified("password"))
    return next();
  if(this.password){
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
})

userSchema.methods.comparePassword = async function(password){
  const bcrypt = require("bcrypt");
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.getProfile = function () {
  return {
    name: this.name,
    username: this.username,
    avatar: this.avatar,
  };
};
userSchema.virtual("followersCount").get(function () {
  return this.followers.length;
});

module.exports = mongoose.model("User", userSchema);
