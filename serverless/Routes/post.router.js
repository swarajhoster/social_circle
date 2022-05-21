const {isAuthenticatedUser} = require("../middlewares/auth");
const {createPost} = require("../Controllers/post.controller.js")

const express = require("express")
const router = express.Router();

router.route("/post/new").post(isAuthenticatedUser, createPost);



module.exports = router