import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_FOLDER } from "../utils/constants.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...options,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const uploadManyToCloudinary = (buffers, options = {}) => {
  return Promise.all(buffers.map((buf) => uploadToCloudinary(buf, options)));
};

const deleteFromCloudinary = (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

export { uploadToCloudinary, uploadManyToCloudinary, deleteFromCloudinary };
export default cloudinary;
