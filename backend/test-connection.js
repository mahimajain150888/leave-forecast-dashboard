require('dotenv').config();
const MondayService = require('./src/services/mondayService');

async function testConnection() {
  console.log('\n🔍 Testing Monday.com Connection...\n');
  
  // Check environment variables
  console.log('📋 Checking Configuration:');
  console.log(`   API Token: ${process.env.MONDAY_API_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log(`   Board ID: ${process.env.MONDAY_BOARD_ID ? '✓ Set' : '✗ Missing'}`);
  
  if (!process.env.MONDAY_API_TOKEN || !process.env.MONDAY_BOARD_ID) {
    console.log('\n❌ Error: Missing required environment variables');
    console.log('   Please check your .env file\n');
    process.exit(1);
  }
  
  const mondayService = new MondayService(
    process.env.MONDAY_API_TOKEN,
    process.env.MONDAY_BOARD_ID
  );
  
  try {
    // Test 1: Get Board Info
    console.log('\n📊 Test 1: Fetching Board Information...');
    const boardInfo = await mondayService.getBoardInfo();
    console.log(`   ✓ Board Name: ${boardInfo.name}`);
    console.log(`   ✓ Board ID: ${boardInfo.id}`);
    console.log(`   ✓ Columns: ${boardInfo.columns.length} found`);
    
    // Display columns
    console.log('\n   Columns in your board:');
    boardInfo.columns.forEach(col => {
      console.log(`      - ${col.title} (${col.type})`);
    });
    
    // Test 2: Get Items
    console.log('\n📝 Test 2: Fetching Board Items...');
    const items = await mondayService.getVacationItems();
    console.log(`   ✓ Found ${items.length} items`);
    
    if (items.length > 0) {
      console.log(`   ✓ Sample item: "${items[0].name}"`);
    }
    
    // Test 3: Get Analytics
    console.log('\n📈 Test 3: Generating Analytics...');
    const analytics = await mondayService.getVacationAnalytics();
    console.log(`   ✓ Total Requests: ${analytics.stats.totalRequests}`);
    console.log(`   ✓ Current Vacations: ${analytics.stats.currentVacations.length}`);
    console.log(`   ✓ Upcoming Vacations: ${analytics.stats.upcomingVacations.length}`);
    
    // Display status breakdown
    if (Object.keys(analytics.stats.byStatus).length > 0) {
      console.log('\n   Status Breakdown:');
      Object.entries(analytics.stats.byStatus).forEach(([status, count]) => {
        console.log(`      - ${status}: ${count}`);
      });
    }
    
    // Display monthly breakdown
    if (Object.keys(analytics.stats.byMonth).length > 0) {
      console.log('\n   Monthly Breakdown:');
      Object.entries(analytics.stats.byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 5)
        .forEach(([month, count]) => {
          console.log(`      - ${month}: ${count} requests`);
        });
    }
    
    console.log('\n✅ All tests passed! Your Monday.com integration is working correctly.\n');
    console.log('🚀 You can now start the application:');
    console.log('   Backend:  npm run dev');
    console.log('   Frontend: cd ../frontend && npm run dev\n');
    
  } catch (error) {
    console.log('\n❌ Test Failed!');
    console.log(`   Error: ${error.message}\n`);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('💡 Troubleshooting:');
      console.log('   - Check that your MONDAY_API_TOKEN is correct');
      console.log('   - Verify the token has not expired');
      console.log('   - Ensure the token has read permissions\n');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('💡 Troubleshooting:');
      console.log('   - Verify your MONDAY_BOARD_ID is correct');
      console.log('   - Check that the board exists and is accessible');
      console.log('   - Ensure you have permissions to view the board\n');
    } else {
      console.log('💡 Troubleshooting:');
      console.log('   - Check your internet connection');
      console.log('   - Verify Monday.com is accessible');
      console.log('   - Review the error message above\n');
    }
    
    process.exit(1);
  }
}

testConnection();

// Made with Bob
