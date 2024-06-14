import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?._id;
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"Invalid channel ID");
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(404, "User does not exist");
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400,"Channel does not exist");
    }


    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(400, "User doest not exist");
    }

    try {
        const subscription = await Subscription.findOne({subscriber : userId, channel : channelId});
        if(subscription){
            await Subscription.deleteOne({_id : subscription._id});
            return res.status(200).json(new ApiResponse(200,null,"Unsubscribed successfully"))
        }
        else{
            await Subscription.create({subscriber : userId, channel : channelId});
            return res.status(200).json(new ApiResponse(200,null, "Subscribed successfully"))
        }
    } catch (error) {
        throw new ApiError(409,error?.message)
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    console.log(req.params)
    const {subscriberId} = req.params
    console.log(subscriberId)
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Ivalid channel ID")
    }

    const channel = await User.findById(subscriberId);
    console.log("subsController : ", channel)
    if(!channel){
        throw new ApiError(404,"Channel does not exist");
    }

    try {
        const subscriptions = await Subscription.find({channel : subscriberId});
        // console.log("subdcription : ",subscriptions)
        if(subscriptions.length === 0){
            return res.status(200).json(new ApiResponse(200, [], "no subscriber found"))
        }

        const subscibersIds = subscriptions.map(sub=>sub.subscriber)
        const subscribers = await  User.find({_id : {$in : subscibersIds}})

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetcjed successfully"
            )
        )

    } catch (error) {
        throw new ApiError(400, error?.message)
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}