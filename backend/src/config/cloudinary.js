// ─── Cloudinary Configuration ──────────────────────────────────
// Configures Cloudinary v2 SDK with credentials from .env.
// This is used for streaming Multer buffers directly to the cloud.

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
