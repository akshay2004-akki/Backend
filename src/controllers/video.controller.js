import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const match = {}
    if(!query){
        throw new ApiError(400, "Queries are not available ")
    }

    match.$or = [
        {title: { $regex: query, $options: 'i' }},
        {description: { $regex: query, $options: 'i' }}
    ]

    if(!userId){
        throw new ApiError(400, "User not present")
    }
    match.owner = userId;
    const sort = {}
    sort[sortBy] = sortType==="desc"? -1:1;

    //aggregate paginate code : 
    const pipeline = [
        {
            $match : match
        },
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "ownerdetails"
            }
        },
        {$unwind : "$ownerdetails"},
        {$sort : sort},
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                owner: {
                    _id: '$ownerDetails._id',
                    fullName: '$ownerDetails.fullname',
                    email: '$ownerDetails.email'
                }
            }
        }
    ];
    //pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    try {
        const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "video fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(404,error?.message||"error occured while aggregation")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}