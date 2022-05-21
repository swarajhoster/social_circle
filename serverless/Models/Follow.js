const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "User"
    },
    followId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
})

userSchema.index({ 'userId': 1, 'followId': 1 },
    { unique: true, background: true })

module.exports = mongoose.model("Follow", userSchema, "Follow")