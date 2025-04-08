import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/datamodels/user.model.js';

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // Enhanced token extraction with more detailed logging
        const cookieToken = req.cookies?.accessToken;
        const headerToken = req.header("Authorization")?.replace("Bearer ", "");
        const token = cookieToken || headerToken;
        
        console.log("Cookie token:", cookieToken ? "Present" : "Not found");
        console.log("Header token:", headerToken ? "Present" : "Not found");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token found");
        }
    
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Token verified successfully");
            
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
            if (!user) {
                console.log("User not found for token");
                throw new ApiError(401, "Invalid Access Token: User not found");
            }
        
            req.user = user;
            next();
        } catch (jwtError) {
            console.log("JWT verification failed:", jwtError.message);
            throw new ApiError(401, `Token verification failed: ${jwtError.message}`);
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});