import { ApiError } from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import dotenv from 'dotenv'

dotenv.config()

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        //console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
        //console.log("authorization",req.header("Authorization"));  //output : undefined
        //console.log("cookies : ",req.cookies);  //output : [Object: null prototype] {}
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log("token : ",token);
        // console.log(".env token : ", process.env.ACCESS_TOKEN_SECRET);
        // console.log(".env r token", process.env.REFRESH_TOKEN_SECRET);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        
        //console.log(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET));
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})