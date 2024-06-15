import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {subscriberid} = req.params
    const userId = req.user?._id;
    // TODO: toggle subscription
    if(!isValidObjectId(subscriberid)){
        throw new ApiError(404,"Invalid channel ID");
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(404, "User does not exist");
    }

    const channel = await User.findById(subscriberid);
    if(!channel){
        throw new ApiError(400,"Channel does not exist");
    }


    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(400, "User doest not exist");
    }

    try {
        const subscription = await Subscription.findOne({subscriber : userId, channel : subscriberid});
        if(subscription){
            await Subscription.deleteOne({_id : subscription._id});
            return res.status(200).json(new ApiResponse(200,null,"Unsubscribed successfully"))
        }
        else{
            await Subscription.create({subscriber : userId, channel : subscriberid});
            return res.status(200).json(new ApiResponse(200,null, "Subscribed successfully"))
        }
    } catch (error) {
        throw new ApiError(409,error?.message)
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    console.log(req.params)
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel Id");
    }

    const channel = await User.findById(channelId)

    if(!channel){
        throw new ApiError(404, "Channel does not exist")
    }

    try {

        const subscribers = await Subscription.aggregate([
            {
                $match : {channel : new mongoose.Types.ObjectId(channelId)}
            },
            {
                $lookup : {
                    from : "users",
                    localField : "subscriber",
                    foreignField : "_id",
                    as : "subscriberDetails"
                }
            },
            {
                $unwind : "$subscriberDetails"
            },
            {
                $project : {
                    _id: '$subscriberDetails._id',
                    fullname: '$subscriberDetails.fullname',
                    email: '$subscriberDetails.email'
                }
            }
        ])

        return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))

        
    } catch (error) {
        throw new ApiError(400, error?.message)
    }
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    console.log(req.params)
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        return new ApiError(404,"Channel Id is not valid");
    }

    
    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}