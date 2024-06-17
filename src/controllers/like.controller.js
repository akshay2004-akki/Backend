import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js" 
import { Tweet } from "../models/tweet.model.js"

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
    const userId = req.user?._id
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id");
    }
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(404,"Invalid userId")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment doea not exist")
    }

    try {
        
        const existingLike = await Like.findOne({likedBy : userId, comment : commentId}) 
        if(existingLike){
            await Like.deleteOne({_id : existingLike._id})
            return res.status(200).json(new ApiResponse(200,null,"Like removed successfully"))
        }else{
            const newLike = await Like.create({
                likedBy : userId,
                comment : commentId
            })
            return res.status(201).json(new ApiResponse(201,newLike ,"Like added successfully"))
        }

    } catch (error) {
        throw new ApiError(500, error?.message)
    }
    

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId) || !tweetId){
        throw new ApiError(400,"Invalid Tweet Id")
    }
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(404,"Invalid userId")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet does not exist")
    }

    try {
        const existingLike = await Like.findOne({tweet : tweetId, likedBy : userId})
        if(existingLike){
            await Like.findByIdAndDelete({_id:existingLike._id})
            return res.status(200).json(new ApiResponse(200, null,"Like removed successfully"))
        }

        const newLike = await Like.create({tweet : tweetId, likedBy : userId});
        return res.status(200).json(new ApiResponse(200, newLike,"Like added successfully"))
    } catch (error) {
        throw new ApiError(500,error?.message)
    }


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id

    if(!isValidObjectId(userId) || !userId){
        throw new ApiError(400,"Invalid User Id");
    }

    try {
        const likedVideos = await Like.find({likedBy : userId, video : {$exists : true}})
        
        return res.status(200).json(new ApiResponse(200, likedVideos,"Liked Videos Fetched successfully"))

    } catch (error) {
        throw new ApiError(500,error?.message)
    }

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} 