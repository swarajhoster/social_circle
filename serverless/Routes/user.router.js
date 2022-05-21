const { isAdmin, isAuthenticatedUser } = require("../middlewares/auth");
const {
  registerUser,
  login,
  logout,
  getAllUsers,
  myProfile,
  myProfileAndPost,
  forgotPassword,
  resetPassword,
  getUserBysearch,
  suggestedUser,
  deleteUser
} = require("../Controllers/user.controller.js");

const express = require("express");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/users").get(isAuthenticatedUser, isAdmin, getAllUsers);
router.route("/me").get(isAuthenticatedUser, myProfile);
router.route("/me-post").get(isAuthenticatedUser, myProfileAndPost);
router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/search").post(getUserBysearch);
router.route("/su").get(isAuthenticatedUser, suggestedUser);
router.route("/del/user").delete(isAuthenticatedUser, deleteUser);

module.exports = router;
