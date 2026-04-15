const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const dashboardService = require("../services/patientDashboard.service");

const requirePatientId = (req, next) => {
    const patientId = req.user?.id;
    if (!patientId) return next(new AppError("Unauthorized: Patient ID not found in token", 401));
    const idNum = parseInt(patientId, 10);
    if (Number.isNaN(idNum)) return next(new AppError("Invalid patient id", 400));
    return idNum;
};

// GET /api/v1/patient/dashboard/status
const getDashboardStatus = catchAsync(async (req, res, next) => {
    const patientId = requirePatientId(req, next);
    if (!patientId) return;
    const data = await dashboardService.getDashboardStatus(patientId);
    res.status(200).json({ status: "success", data });
});

// GET /api/v1/patient/dashboard/stats
const getDashboardStats = catchAsync(async (req, res, next) => {
    const patientId = requirePatientId(req, next);
    if (!patientId) return;
    const data = await dashboardService.getDashboardStats(patientId);
    res.status(200).json({ status: "success", data });
});

// GET /api/v1/patient/dashboard/recommendations
const getDashboardRecommendations = catchAsync(async (req, res, next) => {
    const patientId = requirePatientId(req, next);
    if (!patientId) return;
    const data = await dashboardService.getDashboardRecommendations(patientId);
    res.status(200).json({ status: "success", data });
});

// GET /api/v1/patient/dashboard/activity
const getDashboardActivity = catchAsync(async (req, res, next) => {
    const patientId = requirePatientId(req, next);
    if (!patientId) return;
    const data = await dashboardService.getDashboardActivity(patientId);
    res.status(200).json({ status: "success", data });
});

// GET /api/v1/patient/dashboard/analytics
const getDashboardAnalytics = catchAsync(async (req, res, next) => {
    const patientId = requirePatientId(req, next);
    if (!patientId) return;
    const data = await dashboardService.getDashboardAnalytics(patientId);
    res.status(200).json({ status: "success", data });
});

// GET /api/v1/patient/dashboard/last-action
const getDashboardLastAction = catchAsync(async (req, res, next) => {
    const patientId = requirePatientId(req, next);
    if (!patientId) return;
    const data = await dashboardService.getLastAction(patientId);
    res.status(200).json({ status: "success", data });
});

module.exports = {
    getDashboardStatus,
    getDashboardStats,
    getDashboardRecommendations,
    getDashboardActivity,
    getDashboardAnalytics,
    getDashboardLastAction,
};

