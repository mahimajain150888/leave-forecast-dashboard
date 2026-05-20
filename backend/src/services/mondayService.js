const axios = require('axios');

class MondayService {
  constructor(apiToken, boardId) {
    this.apiToken = apiToken;
    this.boardId = boardId;
    this.apiUrl = 'https://api.monday.com/v2';
  }

  /**
   * Execute a GraphQL query against Monday.com API
   */
  async executeQuery(query, variables = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          query,
          variables
        },
        {
          headers: {
            'Authorization': this.apiToken,
            'Content-Type': 'application/json',
            'API-Version': '2024-01'
          }
        }
      );

      if (response.data.errors) {
        throw new Error(`Monday.com API Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('Monday.com API request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get board information including columns
   */
  async getBoardInfo() {
    const query = `
      query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          id
          name
          description
          columns {
            id
            title
            type
            settings_str
          }
        }
      }
    `;

    const data = await this.executeQuery(query, { boardId: [this.boardId] });
    return data.boards[0];
  }

  /**
   * Get all items (vacation requests) from the board
   */
  async getVacationItems() {
    const query = `
      query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          items_page {
            items {
              id
              name
              created_at
              updated_at
              column_values {
                id
                text
                value
                type
              }
              group {
                id
                title
              }
            }
          }
        }
      }
    `;

    const data = await this.executeQuery(query, { boardId: [this.boardId] });
    return data.boards[0].items_page.items;
  }

  /**
   * Parse and transform vacation items into dashboard-friendly format
   */
  async parseVacationData(items) {
    // Get board info to map column IDs to titles
    const boardInfo = await this.getBoardInfo();
    const columnTitles = {};
    boardInfo.columns.forEach(col => {
      columnTitles[col.id] = col.title;
    });

    return items.map(item => {
      const columnData = {};
      
      item.column_values.forEach(col => {
        // Parse different column types
        let parsedValue = col.text;
        
        try {
          if (col.value) {
            const valueObj = JSON.parse(col.value);
            
            // Handle date columns
            if (col.type === 'date' && valueObj.date) {
              parsedValue = valueObj.date;
            }
            // Handle status columns
            else if (col.type === 'status' && valueObj.label) {
              parsedValue = valueObj.label;
            }
            // Handle people columns
            else if (col.type === 'people' && valueObj.personsAndTeams) {
              parsedValue = valueObj.personsAndTeams.map(p => p.name || p.id).join(', ');
            }
            // Handle timeline columns
            else if (col.type === 'timerange' && valueObj.from && valueObj.to) {
              parsedValue = {
                from: valueObj.from,
                to: valueObj.to
              };
            }
          }
        } catch (e) {
          // Keep text value if parsing fails
        }
        
        columnData[col.id] = {
          title: columnTitles[col.id] || col.id,
          value: parsedValue,
          type: col.type
        };
      });

      return {
        id: item.id,
        name: item.name,
        group: item.group?.title || 'Ungrouped',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        columns: columnData
      };
    });
  }

  /**
   * Get vacation statistics and analytics
   */
  async getVacationAnalytics() {
    const items = await this.getVacationItems();
    const parsedItems = await this.parseVacationData(items);

    // Calculate statistics
    const stats = {
      totalRequests: parsedItems.length,
      byStatus: {},
      byMonth: {},
      byEmployee: {},
      byManager: {},
      byForecastWindow: {},
      upcomingVacations: [],
      currentVacations: [],
      forecastWindowVacations: [] // Next 3 months from forecast window
    };

    const now = new Date();
    const threeMonthsFromNow = new Date(now);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    parsedItems.forEach(item => {
      // Count by status
      const statusColumn = Object.values(item.columns).find(col => col.type === 'status');
      if (statusColumn) {
        const status = statusColumn.value || 'Unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      }

      // Get employee name from dropdown column (not people column)
      const employeeNameColumn = Object.values(item.columns).find(col =>
        col.title === 'Employee name' || col.id === 'dropdown_mm2641v5'
      );
      const employeeName = employeeNameColumn?.value || item.name || 'Unknown';

      // Get manager from dropdown column
      const managerColumn = Object.values(item.columns).find(col =>
        col.title === 'Manager' || col.id === 'dropdown_mm1zvc1j'
      );
      const manager = managerColumn?.value || 'Unassigned';

      // Get forecast window
      const forecastWindowColumn = Object.values(item.columns).find(col =>
        col.title === 'Forecast Window' || col.title.toLowerCase().includes('forecast')
      );
      const forecastWindow = forecastWindowColumn?.value || 'Not Set';

      // Count by manager
      if (manager) {
        stats.byManager[manager] = (stats.byManager[manager] || 0) + 1;
      }

      // Count by forecast window
      if (forecastWindow) {
        stats.byForecastWindow[forecastWindow] = (stats.byForecastWindow[forecastWindow] || 0) + 1;
      }

      // Get specific Start Date and End Date columns
      const startDateColumn = Object.values(item.columns).find(col =>
        col.id === 'date4' || col.title === 'Start Date'
      );
      const endDateColumn = Object.values(item.columns).find(col =>
        col.id === 'date_mm1zqm6a' || col.title === 'End Date'
      );

      let startDate = null;
      let endDate = null;

      // Parse start date
      if (startDateColumn && startDateColumn.value) {
        startDate = new Date(startDateColumn.value);
      }

      // Parse end date
      if (endDateColumn && endDateColumn.value) {
        endDate = new Date(endDateColumn.value);
      }

      // If we have valid dates, process them
      if (startDate && !isNaN(startDate.getTime())) {
        // Use end date if available, otherwise use start date
        const effectiveEndDate = (endDate && !isNaN(endDate.getTime())) ? endDate : startDate;

        // Count by month
        const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;

        // Check if upcoming (within next 90 days)
        const daysUntil = Math.floor((startDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 90) {
          stats.upcomingVacations.push({
            ...item,
            employeeName,
            manager,
            forecastWindow,
            startDate: startDate.toISOString(),
            endDate: effectiveEndDate.toISOString(),
            daysUntil
          });
        }

        // Check if in forecast window (next 3 months)
        if (startDate >= now && startDate <= threeMonthsFromNow) {
          stats.forecastWindowVacations.push({
            ...item,
            employeeName,
            manager,
            forecastWindow,
            startDate: startDate.toISOString(),
            endDate: effectiveEndDate.toISOString(),
            daysUntil
          });
        }

        // Check if current
        if (startDate <= now && effectiveEndDate >= now) {
          stats.currentVacations.push({
            ...item,
            employeeName,
            manager,
            forecastWindow,
            startDate: startDate.toISOString(),
            endDate: effectiveEndDate.toISOString()
          });
        }
      }

      // Count by employee name (not ID)
      if (employeeName) {
        stats.byEmployee[employeeName] = (stats.byEmployee[employeeName] || 0) + 1;
      }
    });

    // Sort upcoming vacations by date
    stats.upcomingVacations.sort((a, b) => a.daysUntil - b.daysUntil);
    stats.forecastWindowVacations.sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      stats,
      items: parsedItems
    };
  }

  /**
   * Get team coverage analysis
   */
  async getTeamCoverage(startDate, endDate) {
    const items = await this.getVacationItems();
    const parsedItems = await this.parseVacationData(items);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const coverage = {};

    // Initialize date range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      coverage[dateKey] = {
        date: dateKey,
        onLeave: [],
        available: 0
      };
    }

    parsedItems.forEach(item => {
      const dateColumns = Object.values(item.columns).filter(
        col => col.type === 'date' || col.type === 'timerange'
      );

      const personColumn = Object.values(item.columns).find(col => col.type === 'people');
      const statusColumn = Object.values(item.columns).find(col => col.type === 'status');
      
      // Only count approved vacations
      if (statusColumn && statusColumn.value !== 'Approved') {
        return;
      }

      dateColumns.forEach(dateCol => {
        let vacationStart, vacationEnd;

        if (dateCol.type === 'timerange' && typeof dateCol.value === 'object') {
          vacationStart = new Date(dateCol.value.from);
          vacationEnd = new Date(dateCol.value.to);
        } else if (dateCol.type === 'date' && dateCol.value) {
          vacationStart = new Date(dateCol.value);
          vacationEnd = vacationStart;
        }

        if (vacationStart && !isNaN(vacationStart.getTime())) {
          // Mark all days in the vacation range
          for (let d = new Date(Math.max(vacationStart, start)); 
               d <= Math.min(vacationEnd || vacationStart, end); 
               d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            if (coverage[dateKey]) {
              coverage[dateKey].onLeave.push({
                name: item.name,
                employee: personColumn?.value || 'Unknown'
              });
            }
          }
        }
      });
    });

    return Object.values(coverage);
  }

  /**
   * Create a new vacation item on the board
   */
  async createVacationItem(itemData) {
    const { employeeId, employeeName, startDate, endDate, description, manager, tower, project, status } = itemData;

    // First, get board info to find the correct column IDs
    const boardInfo = await this.getBoardInfo();
    
    // Find column IDs for various column types
    const startDateColumn = boardInfo.columns.find(col =>
      col.type === 'date' && col.title.toLowerCase().includes('start')
    );
    const endDateColumn = boardInfo.columns.find(col => col.id === 'date_mm1zqm6a'); // End Date column
    const statusColumn = boardInfo.columns.find(col => col.id === 'status');
    const locationColumn = boardInfo.columns.find(col => col.id === 'color_mm20mhfa'); // Location status column
    const textColumn = boardInfo.columns.find(col =>
      col.type === 'text' && (col.title.toLowerCase().includes('description') || col.title.toLowerCase().includes('reason'))
    );

    // Find dropdown columns by exact column IDs we know from the board
    const employeeNameColumn = boardInfo.columns.find(col => col.id === 'dropdown_mm2641v5');
    const managerColumn = boardInfo.columns.find(col => col.id === 'dropdown_mm3g96wg'); // Fixed: was dropdown_mm1zvc1j
    const towerColumn = boardInfo.columns.find(col => col.id === 'dropdown_mm1zge2q');
    const projectColumn = boardInfo.columns.find(col => col.id === 'dropdown_mm26tzy4');

    // Build column values object
    const columnValues = {};
    
    // Add start date
    if (startDateColumn) {
      columnValues[startDateColumn.id] = { date: startDate };
    }
    
    // Add end date (required field)
    if (endDateColumn) {
      columnValues[endDateColumn.id] = { date: endDate };
    }

    // Add description if text column exists
    if (textColumn && description) {
      columnValues[textColumn.id] = description;
    }

    // Add dropdown values - these are REQUIRED fields
    // Try using ids instead of labels for dropdown columns
    if (employeeNameColumn && employeeName) {
      const empId = parseInt(employeeName);
      if (empId > 0) {
        columnValues[employeeNameColumn.id] = { ids: [empId] };
      }
    }
    
    if (towerColumn && tower) {
      const towerId = parseInt(tower);
      if (towerId > 0) {
        columnValues[towerColumn.id] = { ids: [towerId] };
      }
    }
    
    // Optional dropdown fields
    if (managerColumn && manager) {
      const mgrId = parseInt(manager);
      if (mgrId > 0) {
        columnValues[managerColumn.id] = { ids: [mgrId] };
      }
    }
    
    if (projectColumn && project) {
      const projId = parseInt(project);
      if (projId > 0) {
        columnValues[projectColumn.id] = { ids: [projId] };
      }
    }

    // Set status (required field) - use provided status or default to "Planned"
    if (statusColumn) {
      const statusIndex = status !== undefined ? parseInt(status) : 0;
      columnValues[statusColumn.id] = { index: statusIndex };
    }
    
    // Set location to "Offshore" by default (required field) - use index as string
    if (locationColumn) {
      columnValues[locationColumn.id] = { index: 0 }; // 0 is "Offshore"
    }

    // Use employee ID as the item name
    const itemName = employeeId;

    const mutation = `
      mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    `;

    const variables = {
      boardId: this.boardId,
      itemName: itemName,
      columnValues: JSON.stringify(columnValues)
    };

    const data = await this.executeQuery(mutation, variables);
    return data.create_item;
  }

  /**
   * Get dropdown options for form fields
   */
  async getDropdownOptions() {
    const boardInfo = await this.getBoardInfo();
    const dropdownColumns = {};

    boardInfo.columns.forEach(col => {
      if (col.type === 'dropdown') {
        try {
          const settings = JSON.parse(col.settings_str || '{}');
          if (settings.labels && Array.isArray(settings.labels)) {
            dropdownColumns[col.id] = {
              title: col.title,
              options: settings.labels.map(label => ({
                id: label.id,
                label: label.name || label.id
              }))
            };
          }
        } catch (e) {
          console.error(`Error parsing dropdown settings for ${col.title}:`, e);
        }
      }
    });

    return dropdownColumns;
  }

  /**
   * Update an existing vacation item
   */
  async updateVacationItem(itemId, updates) {
    const { startDate, endDate, description } = updates;

    // Get board info to find column IDs
    const boardInfo = await this.getBoardInfo();
    
    // Find both start and end date columns
    const startDateColumn = boardInfo.columns.find(col =>
      col.type === 'date' && col.title.toLowerCase().includes('start')
    );
    const endDateColumn = boardInfo.columns.find(col => col.id === 'date_mm1zqm6a'); // End Date column
    const textColumn = boardInfo.columns.find(col =>
      col.type === 'text' && col.title.toLowerCase().includes('description')
    );

    const columnValues = {};

    // Update start date
    if (startDateColumn && startDate) {
      columnValues[startDateColumn.id] = { date: startDate };
    }

    // Update end date
    if (endDateColumn && endDate) {
      columnValues[endDateColumn.id] = { date: endDate };
    }

    // Update description
    if (textColumn && description !== undefined) {
      columnValues[textColumn.id] = description;
    }

    const mutation = `
      mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values (
          board_id: $boardId,
          item_id: $itemId,
          column_values: $columnValues
        ) {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    `;

    const variables = {
      boardId: this.boardId,
      itemId: itemId,
      columnValues: JSON.stringify(columnValues)
    };

    const data = await this.executeQuery(mutation, variables);
    return data.change_multiple_column_values;
  }

  /**
   * Delete a vacation item
   */
  async deleteVacationItem(itemId) {
    const mutation = `
      mutation ($itemId: ID!) {
        delete_item (item_id: $itemId) {
          id
        }
      }
    `;

    const variables = { itemId };
    const data = await this.executeQuery(mutation, variables);
    return data.delete_item;
  }

  /**
   * Get vacation items for a specific user by employee ID
   */
  async getUserLeaves(employeeId) {
    const items = await this.getVacationItems();
    const parsedItems = await this.parseVacationData(items);

    // Filter items that match the employee ID in the item name (case-insensitive)
    const userItems = parsedItems.filter(item => {
      // Check if employee ID matches the item name (case-insensitive)
      const itemNameLower = (item.name || '').toLowerCase();
      const employeeIdLower = (employeeId || '').toLowerCase();
      return itemNameLower === employeeIdLower || itemNameLower.includes(employeeIdLower);
    });

    // Separate into past and upcoming
    const now = new Date();
    const past = [];
    const upcoming = [];

    userItems.forEach(item => {
      // Get employee name from dropdown column
      const employeeNameColumn = Object.values(item.columns).find(col =>
        col.id === 'dropdown_mm2641v5' || col.title === 'Employee name'
      );
      const employeeName = employeeNameColumn?.value || item.name || 'Unknown';

      // Get end date to determine if past or upcoming
      const endDateColumn = Object.values(item.columns).find(col =>
        col.id === 'date_mm1zqm6a' || col.title === 'End Date'
      );
      const startDateColumn = Object.values(item.columns).find(col =>
        col.id === 'date4' || col.title === 'Start Date'
      );

      let endDate = null;
      if (endDateColumn && endDateColumn.value) {
        endDate = new Date(endDateColumn.value);
      } else if (startDateColumn && startDateColumn.value) {
        // If no end date, use start date
        endDate = new Date(startDateColumn.value);
      }

      // Add employee name to item for display
      const itemWithName = {
        ...item,
        employeeName
      };

      if (endDate && endDate < now) {
        past.push(itemWithName);
      } else {
        upcoming.push(itemWithName);
      }
    });

    return {
      past: past.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      upcoming: upcoming.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    };
  }

  /**
   * Get employee details from Employee Directory board by Employee ID
   */
  async getEmployeeById(employeeId, masterBoardId) {
    const query = `
      query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                value
                text
                type
              }
            }
          }
        }
      }
    `;

    const variables = {
      boardId: [masterBoardId]
    };

    const data = await this.executeQuery(query, variables);
    
    if (!data.boards || !data.boards[0] || !data.boards[0].items_page.items.length) {
      return null;
    }

    // Find the item with matching employee ID (item name)
    const items = data.boards[0].items_page.items;
    const item = items.find(i => i.name && i.name.toLowerCase() === employeeId.toLowerCase());
    
    if (!item) {
      return null;
    }
    
    // Extract employee details from columns
    const employeeData = {
      employeeId: item.name,
      employeeName: '',
      manager: '',
      team: '',
      managerEmail: ''
    };

    item.column_values.forEach(col => {
      if (col.id === 'text_mm26dfsn') { // Employee Name
        employeeData.employeeName = col.text || '';
      } else if (col.id === 'text_mm3gtft7') { // Manager
        employeeData.manager = col.text || '';
      } else if (col.id === 'text_mm268nnz') { // Team
        employeeData.team = col.text || '';
      } else if (col.id === 'text_mm26vp92') { // Manager Email
        employeeData.managerEmail = col.text || '';
      }
    });

    return employeeData;
  }
}

module.exports = MondayService;
