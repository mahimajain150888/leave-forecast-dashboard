const NodeCache = require('node-cache');
const MondayService = require('../services/mondayService');

// Initialize cache with TTL from environment
const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL) || 300,
  checkperiod: 60 
});

class DashboardController {
  constructor() {
    this.mondayService = new MondayService(
      process.env.MONDAY_API_TOKEN,
      process.env.MONDAY_BOARD_ID
    );
  }

  /**
   * Get board information
   */
  async getBoardInfo(req, res) {
    try {
      const cacheKey = 'board_info';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      const boardInfo = await this.mondayService.getBoardInfo();
      cache.set(cacheKey, boardInfo);

      res.json({
        success: true,
        data: boardInfo,
        cached: false
      });
    } catch (error) {
      console.error('Error fetching board info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch board information',
        message: error.message
      });
    }
  }

  /**
   * Get all vacation items
   */
  async getVacationItems(req, res) {
    try {
      const cacheKey = 'vacation_items';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      const items = await this.mondayService.getVacationItems();
      const parsedItems = await this.mondayService.parseVacationData(items);
      
      cache.set(cacheKey, parsedItems);

      res.json({
        success: true,
        data: parsedItems,
        cached: false,
        count: parsedItems.length
      });
    } catch (error) {
      console.error('Error fetching vacation items:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vacation items',
        message: error.message
      });
    }
  }

  /**
   * Get vacation analytics and statistics
   */
  async getAnalytics(req, res) {
    try {
      const cacheKey = 'vacation_analytics';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      const analytics = await this.mondayService.getVacationAnalytics();
      cache.set(cacheKey, analytics);

      res.json({
        success: true,
        data: analytics,
        cached: false
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics',
        message: error.message
      });
    }
  }

  /**
   * Get team coverage for a date range
   */
  async getTeamCoverage(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate query parameters are required'
        });
      }

      const cacheKey = `coverage_${startDate}_${endDate}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      const coverage = await this.mondayService.getTeamCoverage(startDate, endDate);
      cache.set(cacheKey, coverage);

      res.json({
        success: true,
        data: coverage,
        cached: false,
        dateRange: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error fetching team coverage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team coverage',
        message: error.message
      });
    }
  }

  /**
   * Clear cache
   */
  async clearCache(req, res) {
    try {
      const keys = cache.keys();
      cache.flushAll();

      res.json({
        success: true,
        message: 'Cache cleared successfully',
        clearedKeys: keys.length
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error.message
      });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req, res) {
    try {
      // Test Monday.com connection
      await this.mondayService.getBoardInfo();

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: {
          keys: cache.keys().length,
          stats: cache.getStats()
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get dropdown options for form fields
   */
  async getDropdownOptions(req, res) {
    try {
      const cacheKey = 'dropdown_options';
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      const dropdowns = await this.mondayService.getDropdownOptions();
      cache.set(cacheKey, dropdowns);

      res.json({
        success: true,
        data: dropdowns,
        cached: false
      });
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dropdown options',
        message: error.message
      });
    }
  }

  /**
   * Get employee details by Employee ID from Employee Directory board
   */
  async getEmployeeById(req, res) {
    try {
      const { employeeId } = req.params;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          error: 'Employee ID is required'
        });
      }

      // Use cache for employee lookup
      const cacheKey = `employee_${employeeId}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      // Query the Employee Directory board
      const masterBoardId = process.env.MONDAY_MASTER_BOARD_ID;
      
      if (!masterBoardId) {
        return res.status(500).json({
          success: false,
          error: 'Employee Directory board not configured'
        });
      }

      const employeeData = await this.mondayService.getEmployeeById(employeeId, masterBoardId);

      if (!employeeData) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
          message: `No employee found with ID: ${employeeId}`
        });
      }

      // Return data with team mapped to project
      const responseData = {
        employeeId: employeeData.employeeId,
        employeeName: employeeData.employeeName,
        manager: employeeData.manager,
        team: employeeData.team,
        project: employeeData.team, // Map team to project for form compatibility
        managerEmail: employeeData.managerEmail
      };

      // Cache the result for 1 hour (3600 seconds)
      cache.set(cacheKey, responseData, 3600);

      res.json({
        success: true,
        data: responseData,
        cached: false
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch employee details',
        message: error.message
      });
    }
  }

  /**
   * Submit a new leave request
   */
  async submitLeave(req, res) {
    try {
      const { employeeId, employeeName, startDate, endDate, description, manager, tower, project } = req.body;

      // Validate required fields
      if (!employeeId || !employeeName || !startDate || !endDate || !manager || !tower || !project) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: employeeId, employeeName, startDate, endDate, manager, tower, project'
        });
      }

      // Validate date logic
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({
          success: false,
          error: 'End date must be after or equal to start date'
        });
      }

      // Create the vacation item
      const item = await this.mondayService.createVacationItem({
        employeeId,
        employeeName,
        startDate,
        endDate,
        description: description || '',
        manager,
        tower,
        project
      });

      // Clear cache to reflect new data
      cache.flushAll();

      res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
        data: item
      });
    } catch (error) {
      console.error('Error submitting leave:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit leave request',
        message: error.message
      });
    }
  }

  /**
   * Update an existing leave request
   */
  async updateLeave(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, description } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Leave ID is required'
        });
      }

      // Validate date logic if both dates provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
          return res.status(400).json({
            success: false,
            error: 'End date must be after or equal to start date'
          });
        }
      }

      // Update the vacation item
      const item = await this.mondayService.updateVacationItem(id, {
        startDate,
        endDate,
        description
      });

      // Clear cache to reflect updated data
      cache.flushAll();

      res.json({
        success: true,
        message: 'Leave request updated successfully',
        data: item
      });
    } catch (error) {
      console.error('Error updating leave:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update leave request',
        message: error.message
      });
    }
  }

  /**
   * Delete a leave request
   */
  async deleteLeave(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Leave ID is required'
        });
      }

      // Delete the vacation item
      await this.mondayService.deleteVacationItem(id);

      // Clear cache to reflect deleted data
      cache.flushAll();

      res.json({
        success: true,
        message: 'Leave request deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting leave:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete leave request',
        message: error.message
      });
    }
  }

  /**
   * Get user's leave requests by employee ID
   */
  async getUserLeaves(req, res) {
    try {
      const { employeeId } = req.query;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          error: 'employeeId query parameter is required'
        });
      }

      const cacheKey = `user_leaves_${employeeId}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }

      // Get user's leaves
      const leaves = await this.mondayService.getUserLeaves(employeeId);
      cache.set(cacheKey, leaves);

      res.json({
        success: true,
        data: leaves,
        cached: false,
        counts: {
          past: leaves.past.length,
          upcoming: leaves.upcoming.length
        }
      });
    } catch (error) {
      console.error('Error fetching user leaves:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user leaves',
        message: error.message
      });
    }
  }
}

module.exports = new DashboardController();

// Made with Bob
