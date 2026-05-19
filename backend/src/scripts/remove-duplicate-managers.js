const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_TOKEN = process.env.MONDAY_API_TOKEN;
const LEAVE_BOARD_ID = process.env.MONDAY_BOARD_ID;

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

async function updateManagerDropdown(uniqueManagers) {
  console.log('Updating manager dropdown with deduplicated managers...');
  
  const labels = uniqueManagers.map((name, index) => ({
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
    console.log('=== Removing Duplicate Managers from Dropdown ===\n');
    
    const currentOptions = await getCurrentManagerOptions();
    console.log(`Current manager options: ${currentOptions.length}`);
    
    // Get unique manager names
    const managerNames = currentOptions.map(o => o.name);
    const uniqueNames = [...new Set(managerNames)].sort();
    
    console.log(`Unique manager names: ${uniqueNames.length}`);
    console.log(`Duplicates found: ${managerNames.length - uniqueNames.length}\n`);
    
    if (managerNames.length === uniqueNames.length) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    // Find duplicates
    const duplicates = managerNames.filter((name, index) => 
      managerNames.indexOf(name) !== index
    );
    const uniqueDuplicates = [...new Set(duplicates)];
    
    console.log('Duplicate managers:');
    uniqueDuplicates.forEach(name => {
      const count = managerNames.filter(n => n === name).length;
      console.log(`  - ${name} (appears ${count} times)`);
    });
    
    console.log('\nRemoving duplicates...');
    const success = await updateManagerDropdown(uniqueNames);
    
    if (success) {
      console.log(`\n✅ Successfully removed ${managerNames.length - uniqueNames.length} duplicate entries!`);
      console.log(`Manager dropdown now has ${uniqueNames.length} unique options.`);
    } else {
      console.log('\n⚠️  Update failed. You may need board admin permissions.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();