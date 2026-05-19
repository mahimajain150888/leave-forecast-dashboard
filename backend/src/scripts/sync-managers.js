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

async function main() {
  try {
    console.log('=== Syncing Managers from Employee Directory ===\n');
    
    const employeeDirManagers = await getUniqueManagers();
    console.log(`Found ${employeeDirManagers.length} unique managers in Employee Directory`);
    console.log('Managers:', employeeDirManagers.join(', '), '\n');
    
    const currentOptions = await getCurrentManagerOptions();
    console.log(`Current manager options in Leave Forecast board: ${currentOptions.length}`);
    console.log('Current:', currentOptions.map(o => o.name).join(', '), '\n');
    
    const currentManagerNames = currentOptions.map(o => o.name);
    const missingManagers = employeeDirManagers.filter(m => !currentManagerNames.includes(m));
    
    if (missingManagers.length === 0) {
      console.log('✅ All managers from Employee Directory are already in the dropdown!');
      return;
    }
    
    console.log(`\n⚠️  Found ${missingManagers.length} missing managers:`);
    missingManagers.forEach(m => console.log(`   - ${m}`));
    
    console.log('\n📝 To add these managers to the Leave Forecast board:');
    console.log('1. Go to Monday.com Leave Forecast board');
    console.log('2. Click on the Manager column header');
    console.log('3. Click "Edit labels"');
    console.log('4. Add the following managers:');
    missingManagers.forEach(m => console.log(`   - ${m}`));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();