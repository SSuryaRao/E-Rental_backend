import {asyncHandler} from '../utils/asyncHandler.js';;
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/datamodels/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
// Add this to your imports in user.controller.js
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


  

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(404, "User not found in the database with the provided id in the generating access and refresh token function");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating the access and refresh token");   
    }
}


const registerUser = asyncHandler(async (req,res) => {
    //get user details from frontend
    //validation if it is not empty
    //check if the user already exists like mail and username
    //upload the t\image to cloudinary and get the url
    //cherck if the image is not empty
    //create user object and entry in db
    //sen a response which does not have refreshtoken adn pasword
    const {email,username,password, fullname}=req.body;
    
    if([username,email,password,fullname].includes('')){
        throw new ApiError(400,'All fields are required');
    }
    const existinguser = await User.findOne({
        $or:[{email},{username}]
    });
    if(existinguser){
        throw new ApiError(400,'User already exists');
    }
    // const avatarLocalPath = req.files.avatar[0].path;
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // if(!avatarLocalPath){
    //     throw new ApiError(400,'Avatar is required');
    // }
    // console.log(req.files);
    // const avatar = await uploadToCloudinary(avatarLocalPath);
    // console.log(avatar);
    const user = await User.create({
        email,
        username,
        password,
        fullname,
        // avatar: avatar.url
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500,'User not created');
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );


});

const loginUser = asyncHandler(async (req,res) => {
    //get data from the froentend
    //lets use username or email for identification
    //check if the user exists
    //pasword check
    //generate access and refresh token
    //send the response
    const {identifier,password} = req.body;
    // console.log("Request Headers:", req.headers);
    // console.log(req.body);
    if (!identifier || !password) {
        throw new ApiError(400, "Username or email and password are required");
    }
    
    const user = await User.findOne({
        $or: [{email:identifier},{username:identifier}]
    })
    if(!user){
        throw new ApiError(400,'User not found');
    }
    const passwordCheck = await user.isPasswordCorrect(password);
    if(!passwordCheck){
        throw new ApiError(400,'Password is incorrect');
    }
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

   const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
   );
//    const options = {
//         httpOnly: true,
//         secure: true,

//    }

const options = {
    httpOnly: true,          // Prevent JS access (for security)
    secure: false,           // Set to true only if using HTTPS
    sameSite: 'Lax',
    path: '/'         // or 'None' if cross-site; 'Lax' is usually fine for SPA
  };
   return res.status(200)
   .cookie('refreshToken', refreshToken, options)
   .cookie('accessToken', accessToken, options)    
   .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            }, 
            "User logged in successfully"
        )
   )

});
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { refreshToken: undefined } },
      { new: true }
    );
  
    const options = {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Lax",
      path: "/"
    };
  
    console.log("🍪 Cookies:", req.cookies);
    console.log("🧾 Authorization Header:", req.headers.authorization);
  
    return res
      .status(200)
      .clearCookie("refreshToken", options)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  });
  
const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(!decodedToken){
            throw new ApiError(401, "Invalid refresh token")
        }
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401, "User not found")
        }
    
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
        // const options = {
        //     httpOnly: true,
        //     secure: true,
        // }
        const options = {
            httpOnly: true,          // Prevent JS access (for security)
            secure: false,           // Set to true only if using HTTPS
            sameSite: 'Lax',
            path: '/'         // or 'None' if cross-site; 'Lax' is usually fine for SPA
        };

        return res
        .status(200)
        .cookie('refreshToken', newRefreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
        
    }

})

const changePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "All fields are required")
    }
    const user= await User.findById(req.user._id).select("+password");
    if(!user){
        throw new ApiError(404, "User not found ")
    }
    const passwordCheck = await user.isPasswordCorrect(oldPassword);
    if(!passwordCheck){
        throw new ApiError(400, "Old password is incorrect")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
    

})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200 , req.user, "User fetched successfully")
    )
})

const updateUserName = asyncHandler(async (req,res) => {
    const user= req.user;
    const {oldUsername, newUsername} = req.body;
    if(!oldUsername || !newUsername){
        throw new ApiError(400, "All fields are required")
    }
    if(user.username !== oldUsername){
        throw new ApiError(400, "Old username is incorrect")
    }
    user.username = newUsername;
    user.save({validateBeforeSave: false});
    return res.status(200)
    .json(
        new ApiResponse(200,{}, "Username updated successfully")
    )

})

const uploadAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,'Avatar is required');
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400,'Avatar upload failed');
    }
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Avatar uploaded successfully")
    )
})



export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateUserName, uploadAvatar};