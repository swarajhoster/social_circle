const User = require("../Models/User.js")
const Post = require("../Models/Post.js")
const Follow = require("../Models/Follow.js")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto")


// @desc        POST Create User (email)
// @route       POST api/v1/register
// @body        JSON - name, email, password
// @access      Public
exports.registerUser = async (req, res) => {
    try {

        // Check is user already exists
        let user = await User.findOne({email: req.body.email})
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User Already exists"
            })
        } else {
            // If not then Create new User
            user = await User.create(req.body);

            // Send response
            const token = await user.getJWTToken()
            const validNumOfDayForCookie = 90;
            const options = {
                httpOnly: true,
                expires: new Date(Date.now() + validNumOfDayForCookie * 24 * 60 * 60 * 1000),
            }

            return res.status(200)
                .cookie("token", token, options)
                .json({
                    success: true,
                    user,
                    token
                })
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}


// @desc        POST Login user(send token cookie)
// @route       POST api/v1/login
// @body        JSON - email & password
// @access      Public

exports.login = async (req, res) => {
    try {

        const {email, password} = req.body;

        let user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials email"
            })
        }

        const isPasswordMatch = user.comparePassword(password)

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials password"
            })
        }

        const token = await user.getJWTToken()
        const validNumOfDayForCookie = 90;
        const options = {
            httpOnly: true,
            expires: new Date(Date.now() + validNumOfDayForCookie * 24 * 60 * 60 * 1000),
        }

        return res.status(200)
            .cookie("token", token, options)
            .json({
                success: true,
                user,
                token
            })


    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

// @desc        GET logout(clear token)
// @route       GET api/v1/logout
// @access      Private
exports.logout = async (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
            .json({
                success: true,
                message: "logged out",
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getAllUsers = async (req,res) => {

    try {
        const users = await User.find({})
        return res.status(200).json({
            count: users.length,
            success: true,
            users,
        })

    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }

}

//Update User Password
exports.updatePassword = async (req, res) => {
    try {

        const {oldPassword, newPassword ,confirmPassword} = req.body;
        const user = await User.findById(req.user._id).select("+password");

        const isPasswordMatched = await user.comparePassword(oldPassword);

        if (!isPasswordMatched) {
            return res.status(500).json({
                success: false,
                message: "Wrong Credentials Entered"
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(500).json({
                success: false,
                message: "new password and confirm password does not match"
            })
        }

        if (newPassword || confirmPassword) {
            return res.status(500).json({
                success: false,
                message: "Wrong Credentials Entered"
            })
        }

        user.password = newPassword
        await user.save();

        const token = await user.getJWTToken()
        const validNumOfDayForCookie = 90;
        const options = {
            httpOnly: true,
            expires: new Date(Date.now() + validNumOfDayForCookie * 24 * 60 * 60 * 1000),
        }

        return res.status(200)
            .cookie("token", token, options)
            .json({
                success: true,
                user,
                token
            })

    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
};

//Update Profile(other than password)
exports.updateProfile = async (req, res, next) => {
   try {
       const newUserData = {
           name: req.body.name,
           email: req.body.email,
       };
       //TODO: We will add cloudinary later

       const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
           new: true,
           runValidators: true,
           useFindAndModify: false,
       });

       if (!user){
           return res.status(500).json({
               success: false,
               message: "Something went wrong!"
           })
       }

       res.status(200).json({
           success: true,
           message: "Profile updated Successfully!"
       });
   }catch (e){
       return res.status(500).json({
           success: false,
           error: e.message
       })
   }
};

// my-profile
exports.myProfile = async (req,res) => {
    try {

        const user = await User.findById(req.user._id).select("-isAdmin -avatar -post -resetPasswordToken -resetPasswordExpire")
        if (!user){
            return res.status(500).json({
                success: false,
                message: "Something went wrong"
            })
        }
        res.status(200).json({
            success: true,
            user
        });

    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

// user-profile with their posts
exports.myProfileAndPost = async (req,res) => {
    try {

        const user = await User.findById(req.user._id).select("-isAdmin -avatar -resetPasswordToken -resetPasswordExpire").populate({
            path: 'posts',
            select: ''
        });
        if (!user){
            return res.status(500).json({
                success: false,
                message: "Something went wrong"
            })
        }
        console.log(user)
        res.status(200).json({
            success: true,
            user
        });

    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}



// Forgot Password
exports.forgotPassword = async (req, res, next) => {
    try{

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(200).json({
                success:false,
                message: "No user exists with this email, maybe try to create one"
            })
        }

        // Get ResetPassword Token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        const resetPasswordUrl = `${req.protocol}://${req.get(
            "host"
        )}/password/reset/${resetToken}`;

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

        try {
            await sendEmail({
                email: user.email,
                subject: `Social Circle Password Recovery`,
                message,
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email} successfully`,
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });


            return res.status(500).json({
                success: false,
                message: "something went wrong, Please try again later."
            })
        }

    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
};


// Reset Password
exports.resetPassword = async (req, res, next) => {
    try {

        // creating token hash
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");


        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "Invalid token or token has been expried"
            })
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password does not match"
            })
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        const token = await user.getJWTToken()
        const validNumOfDayForCookie = 90;
        const options = {
            httpOnly: true,
            expires: new Date(Date.now() + validNumOfDayForCookie * 24 * 60 * 60 * 1000),
        }

        return res.status(200)
            .cookie("token", token, options)
            .json({
                success: true,
                user,
                token
            })


    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
};

exports.getUserBysearch = async (req,res) => {
    try {

        let userPattern = new RegExp("^"+req.body.query)
        const user = await User.aggregate([
            {
                $match: {
                    $text: {
                        $search: req.body.query
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    avatar: 1
                }
            }
        ])

        if (user.length === 0){
            return res.status(400).json({
                success: true,
                message: "No user found with this email"
            })
        }

        return res.status(200).json({
            success: true,
            count: user.length,
            user
        })
        
    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

exports.suggestedUser = async (req,res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: {
                        $ne: req.user._id
                    }
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])

        if (user.length === 0){
            return res.status(400).json({
                success: true,
                message: "No user found with this email"
            })
        }

        return res.status(200).json({
            success: true,
            count: user.length,
            user
        })
    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

exports.deleteUser = async (req,res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No user found with this email"
            })
        }

        // delete all posts of this user
        await Post.deleteMany({ owner: req.user._id });

        // delete from followers
        await Follow.deleteMany({ followId: req.user._id });

        // delete from following
        await Follow.deleteMany({ userId: req.user._id });

        // TODO: delete from likes
        await Like.deleteMany({ userId: req.user._id });

        // TODO: delete from comments
        await Comment.deleteMany({ userId: req.user._id });

        await user.remove();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    }catch (e) {
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}


