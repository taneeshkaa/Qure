// ─── Upload Middleware (Multer) ──────────────────────────────
// Intercepts multipart/form-data. Stores files in memory (RAM)
// so we can stream them to Cloudinary without writing to disk.
// Enforces max size (5MB) and allowed file types.

const multer = require("multer");
const AppError = require("../utils/AppError");

// Store file in memory (RAM) instead of saving to disk
const storage = multer.memoryStorage();

// Validate file type (Only allow JPG, PNG, and PDF)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                "Invalid file type. Only JPEG, PNG, and PDF are allowed.",
                400
            ),
            false
        );
    }
};

// Configure Multer
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB Limit per file
    },
    fileFilter,
});

module.exports = upload;
