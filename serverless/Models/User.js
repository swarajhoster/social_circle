const mongoose = require("mongoose")
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"],
    },
    email: {
        type: String,
        required: [true, "Please enter a email"],
        unique: [true, "Email already exists, try another one"],
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        maxLength: [255, "Bio length should not exceed 255 characters"]
    },
    avatar: {
        public_id: String,
        url: String,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],

    // TODO: Feature will be added, after the product get over
    // reels: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Reel"
    //     }
    // ],

    resetPasswordToken: String,
    resetPasswordExpire: String

}, {
    timeStamp: true
})

userSchema.pre("save", async function (next) {

    console.log(this)
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})


userSchema.methods.getJWTToken = async function () {
    let b = jwt.sign({id: this._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
    return b;
}

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model("User", userSchema, "User")