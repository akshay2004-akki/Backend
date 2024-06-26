import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const userId = req.user?._id;
    console.log(userId, content)

    if(!content){
        throw new ApiError(400, "The tweet cannot be empty ")
    }

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(401,"Invalid userId");
    }

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    try {
        const newTweet = await Tweet.create({
            owner : userId,
            content
        })

        return res.status(201).json(new ApiResponse(201, newTweet, "Tweet generated successfully"))
    } catch (error) {
        throw new ApiError(400, error?.message)
    }

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "User Id is not valid")
    }

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(401,"user does not exist")
    }

    try {
        const tweets = await Tweet.find({owner : userId}).sort({createdAt : -1})
        return res.status(200).json(new ApiResponse(200,tweets,"tweet fetched successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message)
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet Id is not valid")
    }

    try {
        const tweet = await Tweet.findByIdAndUpdate(tweetId, {$set : {content} }, {new : true})
        if(!tweet){
            throw new ApiError(401, "Tweet not found")
        }
        return res.status(200).json(new ApiResponse(200, tweet, "Tweet Update successfully"))
    } catch (error) {
        throw new ApiError(404, error?.message)
    }

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    console.log(tweetId);
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(405, "Tweet Id is not valid")
    }

    try {
        await Tweet.findByIdAndDelete(tweetId);

        return res.status(200).json(new ApiResponse(200,null, "Tweet deleted successfully"))
        
    } catch (error) {
        throw new ApiError(404, error?.message)
    }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}