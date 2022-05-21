const User = require("../Models/User.js")
const Post = require("../Models/Post.js")

exports.createPost = async (req,res) =>{

    try {

        let newPostData = {
            caption: req.body.caption,
            image:{
                public_id: "req.body.publicid",
                url: "req.body.url",
            },
            owner: req.user._id
        }

        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id);
        if (!user){
            return res.status(500).json({
                success: true,
                message: "something went wrong, try again or login again"
            })
        }

        user.posts.push(post._id);
        await user.save();

        return res.status(200).json({
            success: false,
            post,
            message: "Post created successfully!",
        });


    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        });
    };

}