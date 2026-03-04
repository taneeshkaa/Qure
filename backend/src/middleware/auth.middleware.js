// ─── Authentication Middleware ─────────────────────────────────
// Protects routes by verifying JWT in the Authorization header.
// Extracts user details and checks role authorization.

const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Verify Admin JWT Token
const verifyAdmin = catchAsync(async (req, res, next) => {
    let token;

    // 1) Checking if token is there and start with Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    // 2) Verification of token
    jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_for_dev_only",
        (err, decoded) => {
            if (err) {
                return next(new AppError("Invalid or expired token. Please log in again.", 401));
            }

            // 3) Check if user role is ADMIN
            if (decoded.role !== "SUPER_ADMIN" && decoded.role !== "ADMIN") {
                return next(
                    new AppError("You do not have permission to perform this action", 403)
                );
            }

            // Attach admin info to request
            req.admin = decoded;
            next();
        }
    );
});

// Verify Hospital JWT Token
const verifyHospital = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_for_dev_only",
        (err, decoded) => {
            if (err) {
                return next(new AppError("Invalid or expired token. Please log in again.", 401));
            }

            if (decoded.role !== "HOSPITAL") {
                return next(
                    new AppError("You do not have permission to perform this action", 403)
                );
            }

            req.hospital = decoded;
            next();
        }
    );
});

module.exports = {
    verifyAdmin,
    verifyHospital,
};
