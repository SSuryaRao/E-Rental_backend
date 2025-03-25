import {asyncHandler} from '../utils/asyncHandler.js';;
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/datamodels/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
// Add this to your imports in user.controller.js
import { ApiResponse } from '../utils/ApiResponse.js';

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
    const {username,email,password} = req.body;
    if((!username || !email) && !password){
        throw new ApiError(400,'(Username or email) and password is required');
    }
    const user = await User.findOne({
        $or: [{email},{username}]
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
   const options = {
        httpOnly: true,
        secure: true,

   }
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

export { registerUser }