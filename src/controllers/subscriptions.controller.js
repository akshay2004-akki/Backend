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
    console.log(req.params);
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "The provided channel ID is not valid.");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "The channel does not exist.");
    }

    try {
        const subscribers = await Subscription.aggregate([
            {
                $match: { channel: new mongoose.Types.ObjectId(channelId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberDetails"
                }
            },
            {
                $unwind: "$subscriberDetails"
            },
            {
                $project: {
                    _id: '$subscriberDetails._id',
                    fullname: '$subscriberDetails.fullname',
                    email: '$subscriberDetails.email'
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "An error occurred while fetching subscribers: " + (error?.message || "Unknown error"));
    }
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    console.log(req.params)
    const { subscriberid } = req.params

    if(!isValidObjectId(subscriberid)){
        return new ApiError(404,"Subscriber Id is not valid");
    }

    const subscriber = await User.findById(subscriberid);

    if(!subscriber){
        throw new ApiError(400,"subscriber does not exist");
    }

    try {
        const subscribedChannel = await Subscription.aggregate([
            {$match : {subscriber : new mongoose.Types.ObjectId(subscriberid)}},
            {
                $lookup : {
                    from : "users",
                    localField : "channel",
                    foreignField : "_id",
                    as : "channelDetails"
                }
            },
            {$unwind : "$channelDetails"},
            {
                $project : {
                    _id: '$channelDetails._id',
                    fullname: '$channelDetails.fullname',
                    username: '$channelDetails.username'
                }
            }
        ])

        return res.status(200).json(new ApiResponse(200,subscribedChannel, "Subscribed channel fetched successfully"))
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
    
    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}