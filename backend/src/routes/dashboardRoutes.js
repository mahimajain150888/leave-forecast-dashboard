const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard/board
 * @desc    Get Monday.com board information
 * @access  Public
 */
/**
 * @route   GET /api/dashboard/dropdown-options
 * @desc    Get dropdown options for form fields (Manager, Tower, Project, Location)
 * @access  Public
 */
router.get('/dropdown-options', (req, res) => dashboardController.getDropdownOptions(req, res));

router.get('/board', (req, res) => dashboardController.getBoardInfo(req, res));

/**
 * @route   GET /api/dashboard/items
 * @desc    Get all vacation items from the board
 * @access  Public
 */
router.get('/items', (req, res) => dashboardController.getVacationItems(req, res));

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get vacation analytics and statistics
 * @access  Public
 */
router.get('/analytics', (req, res) => dashboardController.getAnalytics(req, res));

/**
 * @route   GET /api/dashboard/coverage
 * @desc    Get team coverage for a date range
 * @query   startDate, endDate (YYYY-MM-DD format)
 * @access  Public
 */
router.get('/coverage', (req, res) => dashboardController.getTeamCoverage(req, res));

/**
 * @route   POST /api/dashboard/cache/clear
 * @desc    Clear the cache
 * @access  Public
 */
router.post('/cache/clear', (req, res) => dashboardController.clearCache(req, res));

/**
 * @route   GET /api/dashboard/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => dashboardController.healthCheck(req, res));

/**
 * @route   GET /api/dashboard/employee/:employeeId
 * @desc    Get employee details by Employee ID
 * @access  Public
 */
router.get('/employee/:employeeId', (req, res) => dashboardController.getEmployeeById(req, res));

/**
 * @route   POST /api/dashboard/submit
 * @desc    Submit a new leave request
 * @access  Public
 * @body    { name, email, startDate, endDate, description }
 */
router.post('/submit', (req, res) => dashboardController.submitLeave(req, res));

/**
 * @route   GET /api/dashboard/my-leaves
 * @desc    Get user's leave requests (past and upcoming)
 * @query   email (required)
 * @access  Public
 */
router.get('/my-leaves', (req, res) => dashboardController.getUserLeaves(req, res));

/**
 * @route   PUT /api/dashboard/leave/:id
 * @desc    Update an existing leave request
 * @access  Public
 * @body    { startDate, endDate, description }
 */
router.put('/leave/:id', (req, res) => dashboardController.updateLeave(req, res));

/**
 * @route   DELETE /api/dashboard/leave/:id
 * @desc    Delete a leave request
 * @access  Public
 */
router.delete('/leave/:id', (req, res) => dashboardController.deleteLeave(req, res));

module.exports = router;

// Made with Bob
