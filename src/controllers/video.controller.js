import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { logOutUser } from "./user.controller.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc" } = req.query;
    const userId = req.user?._id; // Assuming you have middleware to attach user to the request
    console.log("UserId:", userId);

    const match = {};
    if (!query) {
        throw new ApiError(400, "Query parameter is required");
    }

    match.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
    ];

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User ID");
        }
        match.owner = new mongoose.Types.ObjectId(userId);
    }

    const sort = {};
    sort[sortBy] = sortType === "desc" ? -1 : 1;

    // Aggregation pipeline
    const pipeline = [
        { $match: match },
        {
            $lookup: {
                from: "users", // Make sure this matches the users collection name
                localField: "owner",
                foreignField: "_id",
                as: "ownerdetails"
            }
        },
        { $unwind: "$ownerdetails" },
        { $sort: sort },
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
                    _id: "$ownerdetails._id",
                    fullName: "$ownerdetails.fullname",
                    email: "$ownerdetails.email"
                }
            }
        }
    ];

    // Pagination options
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    try {
        const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);
        console.log(videos);
        return res
            .status(200)
            .json(new ApiResponse(200, videos, "Videos fetched successfully"));
    } catch (error) {
        console.error("Error during aggregation:", error);
        throw new ApiError(404, error?.message || "Error occurred while fetching videos");
    }
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration} = req.body
    // TODO: get video, upload to cloudinary, create video

    console.log(title, description, duration);

    if(!title || !description || !duration){
        throw new ApiError(400, "Title and Description and duration is required")
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    console.log(videoLocalPath, thumbnailLocalPath)
    
    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(409,"video or thumbnail local path not available")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile || !thumbnail){
        throw new ApiError(400,"Failed to upload on cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        owner : req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Uploaded successfully"
        )
    )
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