const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_TOKEN = process.env.MONDAY_API_TOKEN;
const LEAVE_BOARD_ID = process.env.MONDAY_BOARD_ID;
const EMPLOYEE_DIR_BOARD_ID = process.env.MONDAY_MASTER_BOARD_ID;

async function executeQuery(query, variables = {}) {
  try {
    const response = await axios.post(
      MONDAY_API_URL,
      { query, variables },
      {
        headers: {
          'Authorization': API_TOKEN,
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
    console.error('API request failed:', error.message);
    throw error;
  }
}

async function getUniqueManagers() {
  console.log('Fetching managers from Employee Directory...');
  
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 500) {
          items {
            column_values {
              id
              text
            }
          }
        }
      }
    }
  `;

  const data = await executeQuery(query, { boardId: [EMPLOYEE_DIR_BOARD_ID] });
  const items = data.boards[0].items_page.items;
  
  const managers = new Set();
  items.forEach(item => {
    const managerCol = item.column_values.find(col => col.id === 'text_mm3gtft7');
    if (managerCol && managerCol.text) {
      managers.add(managerCol.text);
    }
  });

  return Array.from(managers).sort();
}

async function getCurrentManagerOptions() {
  console.log('Fetching current manager dropdown options...');
  
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        columns {
          id
          title
          type
          settings_str
        }
      }
    }
  `;

  const data = await executeQuery(query, { boardId: [LEAVE_BOARD_ID] });
  const managerColumn = data.boards[0].columns.find(col => col.id === 'dropdown_mm1zvc1j');
  
  if (!managerColumn) {
    throw new Error('Manager column not found');
  }

  const settings = JSON.parse(managerColumn.settings_str);
  return settings.labels || [];
}

async function updateManagerDropdown(allManagers) {
  console.log('Updating manager dropdown with all managers...');
  
  // Create labels array with IDs
  const labels = allManagers.map((name, index) => ({
    id: index + 1,
    name: name
  }));
  
  const settingsStr = JSON.stringify({
    labels: labels,
    hide_footer: false
  });
  
  const query = `
    mutation ($boardId: ID!, $columnId: String!, $value: JSON!) {
      change_column_metadata(
        board_id: $boardId
        column_id: $columnId
        column_property: settings        value: $value
      ) {
        id
      }
    }
  `;

  try {
    await executeQuery(query, {
      boardId: LEAVE_BOARD_ID,
      columnId: 'dropdown_mm1zvc1j',
      value: settingsStr
    });
    console.log('✅ Successfully updated manager dropdown!');
    return true;
  } catch (error) {
    console.error('Failed to update dropdown:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('=== Syncing Managers from Employee Directory to Leave Forecast Board ===\n');
    
    const employeeDirManagers = await getUniqueManagers();
    console.log(`Found ${employeeDirManagers.length} unique managers in Employee Directory\n`);
    
    const currentOptions = await getCurrentManagerOptions();
    console.log(`Current manager options: ${currentOptions.length}\n`);
    
    const currentManagerNames = currentOptions.map(o => o.name);
    const missingManagers = employeeDirManagers.filter(m => !currentManagerNames.includes(m));
    
    if (missingManagers.length === 0) {
      console.log('✅ All managers are already synced!');
      return;
    }
    
    console.log(`Found ${missingManagers.length} missing managers\n`);
    
    // Combine existing and new managers
    const allManagers = [...new Set([...currentManagerNames, ...employeeDirManagers])].sort();
    console.log(`Total managers after sync: ${allManagers.length}\n`);
    
    const success = await updateManagerDropdown(allManagers);
    
    if (success) {
      console.log('\n✅ Manager dropdown updated successfully!');
      console.log('Added managers:', missingManagers.join(', '));
    } else {
      console.log('\n⚠️  Update failed. You may need board admin permissions.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();