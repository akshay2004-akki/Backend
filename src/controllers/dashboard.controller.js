import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const totalLikes = await Like.aggregate([
        {$match : {video : {$in : (await Video.find({owner : userId}, "_id")).map(video=>video._id)}}},
        {$group : {_id : null, likes : {$sum : 1}}}
    ])

    const likesCount = totalLikes.length>0 ? totalLikes[0].likes : 0;

    const totalVideos = await Video.countDocuments({owner : userId})

    const totalViews = await Video.aggregate([
        {$match : {owner : userId}},
        {$group : {_id:null, views :{$sum:"$views"}}}
    ])

    const viewsCount = totalViews[0]?.views

    const totalSubscribers = await Subscription.countDocuments({channel : userId})
    
    return res.status(200).json(new ApiResponse(200,{
        likesCount,
        totalVideos,
        viewsCount,
        totalSubscribers
        
    },
    "Channel stats Fetched Successfully"
))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const videos = await Video.find({owner : userId})

    return res.status(200).json(new ApiResponse(
        200,
        videos,
        "Videos fetched succesfully"
    ))

})

export {
    getChannelStats, 
    getChannelVideos
    }