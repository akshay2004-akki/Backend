import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user?._id

    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(401, "Name and Description are required")
    }

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(404,"Invalid User Id")
    }
    
    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner : userId
        })

        return res.status(200).json(new ApiResponse(200, playlist ,"Playlist created successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message)
    }

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(404, "User Id is not valid");
    }

    try {
        const userPlaylist = await Playlist.find({owner : userId}).sort({createdAt : -1});

        return res.status(200).json(new ApiResponse(200, userPlaylist, "User Playlist fetched successfully"))
    } catch (error) {
        throw new ApiError(400, error?.message)
    }


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(404, "Invalid Playlist Id")
    }

    try {
        const playList = await Playlist.findById(playlistId);
        if(!playList){
            throw new ApiError(400, "Playlist does not exist");
        }

        return res.status(201).json(new ApiResponse(201, playList, "Playlist fetched successfully"))
    } catch (error) {
        throw new ApiError(400, error?.message)
    }
    

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(404,"Video or Playlist Id is not valid")
    }

    try {
        const playlist = await Playlist.findById(playlistId);
    
        if(!playlist){
            throw new ApiError(404,"Playlist does not exist")
        }
    
        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(404,"Video does not exist")
        }
    
        if(playlist.videos.includes(videoId)){
            return res.status(400).json(new ApiResponse(400,null,"video already exist"))
        }
    
        playlist.videos.push(videoId);
        await playlist.save({validateBeforeSave : false})

        return res.status(200).json(new ApiResponse(200, playlist, "video Added to playlist"))
    } catch (error) {
        throw new ApiError(400, error?.message)
    }

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(404,"Video or Playlist Id is not valid")
    }

    try {
        const playlist = await Playlist.findById(playlistId);
    
        if(!playlist){
            throw new ApiError(404,"Playlist does not exist")
        }
    
        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(404,"Video does not exist")
        }
    
        if(!playlist.videos.includes(videoId)){
            return res.status(400).json(new ApiResponse(400,null,"video does not exist int the playlist"))
        }

        playlist.videos = playlist.videos.filter(id=>id.toString()!==videoId)
        await playlist.save({validateBeforeSave : false})

        return res.status(200).json(new ApiResponse(200, playlist, "Video Removed successfully"))

    
    } catch (error) {
        throw new ApiError(400, error?.message)
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}