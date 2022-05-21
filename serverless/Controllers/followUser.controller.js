const User = require("../Models/User");
const Follow = require("../Models/Follow")

// agenda
// following & un-following - validate
// count of user's followers and following - populate with id in the ref:user

// @desc        GET follow and un-follow
// @route       GET api/v1/:id
// @access      Private
exports.follow = async (req, res) => {
    try {

        const user = await User.findOne({"_id": req.params.id})
        if (!user){
            return res.status(200).json({
                success: true,
                message: "No user found with the provided ID"
            })
        }

        // Follow the User
        const follow = await Follow.create({
            userId: req.user._id,
            followId: req.params.id,
        })

        // user following
        let following = await Follow.find({userId: req.user._id})

        // user followers
        let followers = await Follow.find({followId: req.user._id})

        // count
        const followingCount = following.length;
        const followersCount = followers.length;


        return res.status(200).json({
            success: true,
            followings: followingCount,
            followers: followersCount,
            follow,
        })

    } catch (e) {

        // Check if user is already following another user
        if (e.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Already following"
            })
        }

        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

exports.unFollow = async (req,res) => {

    // Validating the user exists
    const user = await User.findOne({"_id": req.params.id})
    if (!user){
        return res.status(200).json({
            success: true,
            message: "No user found with the provided ID"
        })
    }

//    findByIdDelete
    const follow = await Follow.deleteOne({
        userId: req.user,
        followId: req.params.id,
    })

    if (!follow){
        return res.status(500).json({
            success:false,
            message: "Something went wrong!"
        })
    }

    // user following
    let following = await Follow.find({userId: req.user._id})

    // user followers
    let followers = await Follow.find({followId: req.user._id})

    // count
    const followingCount = following.length;
    const followersCount = followers.length;


    return res.status(200).json({
        success: true,
        followings: followingCount,
        followers: followersCount,
        message: 'User unfollowed'
    })

}


// @desc        GET get User's follower and following (email)
// @route       GET api/v1/register
// @body        JSON - name, email, password
// @access      Private
exports.getFollowInfo = async (req, res) => {
    try {
        // Count followers and following, also update when it is disturbed

        // user following
        let following = await Follow.find({userId: req.user._id}).populate({ path: 'userId', select: 'name email avatar' })

        // user followers
        let followers = await Follow.find({followId: req.user._id}).populate({ path: 'followId', select: 'name email avatar' })

        // count
        const followingCount = following.length;
        const followersCount = followers.length;

        return res.status(200).json({
            success: true,
            count: {
              followingCount,
              followersCount
            },
            followers,
            following

        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

