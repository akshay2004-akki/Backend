import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video does not exist")
    }
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Ivalid User Id")
    }

    try {
        const existingLike = await Like.findOne({likedBy : userId, video : videoId})
        if(existingLike){
            await Like.deleteOne({_id:existingLike._id})
            return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
        }else{
            const newLike = await Like.create({likedBy : userId, video : videoId})
            return res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
        }
    } catch (error) {
        throw new ApiError(404,error?.message)
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} 