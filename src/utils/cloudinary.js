import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({
    path:"./.env"
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log("Provided local file path:", localFilePath);
  
  if (!localFilePath) {
    console.log("No local file path provided");
    return null;
  }

  try {
    console.log("Entering try block...");
    console.log("Uploading to Cloudinary...");
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // console.log("Upload successful. Response for images:", response);

    // Remove the file after successful upload
    await fs.unlink(localFilePath);
    console.log("Temporary file removed:", localFilePath);

    return response;
  } catch (error) {
    console.error("Error occurred in try block:", error);

    try {
      await fs.unlink(localFilePath);
      console.log("Temporary file removed after failed upload:", localFilePath);
    } catch (unlinkError) {
      console.error("Error removing temporary file:", unlinkError);
    }

    return null;
  }
}

export { uploadOnCloudinary };
