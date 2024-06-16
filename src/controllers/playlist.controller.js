import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


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
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

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