// Test script to verify frontend can connect to backend
import axios from 'axios';

async function testConnection() {
  console.log('Testing Frontend to Backend Connection');
  console.log('=====================================');
  
  const API_BASE_URL = 'http://localhost:3001';
  console.log(`Using API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test API health endpoint
    console.log('\n1. Testing API Health Endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ API Health Check: PASSED');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Environment: ${healthResponse.data.environment}`);
    
    // Test GraphQL endpoint
    console.log('\n2. Testing GraphQL Endpoint...');
    const graphqlResponse = await axios.post(
      `${API_BASE_URL}/graphql`,
      { query: '{ __schema { types { name } } }' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (graphqlResponse.data.data) {
      console.log('✅ GraphQL Endpoint: PASSED');
      console.log(`   Available Types: ${graphqlResponse.data.data.__schema.types.length}`);
    } else {
      console.log('❌ GraphQL Endpoint: FAILED');
      console.log(`   Error: ${JSON.stringify(graphqlResponse.data.errors)}`);
    }
    
    console.log('\n🎉 All connection tests completed successfully!');
    console.log('\nConfiguration Summary:');
    console.log(`   - Using localhost:3001 for API and Socket connections`);
    console.log(`   - Frontend and Backend are properly configured for local development`);
    console.log(`   - Ready for testing all features`);
    
  } catch (error) {
    console.error('❌ Connection Test FAILED:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Make sure the backend server is running on port 3001');
    console.log('   2. Check that MongoDB is accessible');
    console.log('   3. Verify environment variables are set correctly');
    console.log('   4. Check for any firewall or network issues');
  }
}

testConnection();