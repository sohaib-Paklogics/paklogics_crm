import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import process from "process";
import streamifier from "streamifier";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Stream upload to Cloudinary with safe defaults:
 * - resource_type: "auto" so images, PDFs, DOCX, etc. all work
 * - uses original filename where possible
 */
export const streamUpload = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // <-- key change: supports docx/pdf/etc
        use_filename: true,
        unique_filename: false,
        ...options, // allow overrides if ever needed
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
