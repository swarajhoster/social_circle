const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    image: {
        public_id: String,
        url: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    caption: {
        type: String,
        required: [true, "Please enter a caption for the post"],
    },

    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            comment: {
                type: String,
                required: [true]
            }
        }
    ],

}, {
    timeStamp: true
})

module.exports = mongoose.model("Post", userSchema)