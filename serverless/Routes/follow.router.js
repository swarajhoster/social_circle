const {isAuthenticatedUser} = require("../middlewares/auth");
const {follow, unFollow ,getFollowInfo} = require("../Controllers/followUser.controller.js")

const express = require("express")
const router = express.Router();

router.route("/:id").post(isAuthenticatedUser, follow);
router.route("/:id").delete(isAuthenticatedUser, unFollow);
router.route("/follow/me").get(isAuthenticatedUser, getFollowInfo);


module.exports = router