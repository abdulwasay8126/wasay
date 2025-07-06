#!/usr/bin/env node

/**
 * Test script for n8n RAG Agent Workflow
 * 
 * Usage: node test-rag-agent.js
 * Make sure to set N8N_WEBHOOK_URL environment variable
 */

const https = require('https');
const http = require('http');

// Configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/rag-query';
const TEST_QUERIES = [
  "What is machine learning?",
  "How does artificial intelligence work?",
  "What are the benefits of cloud computing?",
  "Explain the concept of blockchain technology",
  "What is the difference between frontend and backend development?"
];

/**
 * Make HTTP request to n8n webhook
 */
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test a single query
 */
async function testQuery(query, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: "${query}"`);
  console.log(`${'='.repeat(60)}`);
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(N8N_WEBHOOK_URL, { query });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Status Code: ${response.statusCode}`);
    console.log(`⏱️  Response Time: ${duration}ms`);
    
    if (response.statusCode === 200) {
      const data = response.data;
      
      console.log(`📝 Query ID: ${data.queryId || 'N/A'}`);
      console.log(`🔍 Original Query: ${data.query || 'N/A'}`);
      console.log(`💬 Answer: ${data.answer ? data.answer.substring(0, 200) + '...' : 'No answer'}`);
      console.log(`📚 Sources Found: ${data.sources ? data.sources.length : 0}`);
      
      if (data.sources && data.sources.length > 0) {
        console.log(`📖 Top Sources:`);
        data.sources.slice(0, 3).forEach((source, i) => {
          console.log(`   ${i + 1}. ${source.source} (Score: ${source.score})`);
        });
      }
      
      if (data.metadata) {
        console.log(`📊 Metadata:`);
        console.log(`   - Context Count: ${data.metadata.contextCount || 'N/A'}`);
        console.log(`   - Model: ${data.metadata.model || 'N/A'}`);
        console.log(`   - Confidence: ${data.confidence || 'N/A'}`);
      }
      
    } else {
      console.log(`❌ Error Response:`);
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log(`💥 Request Failed: ${error.message}`);
  }
}

/**
 * Test invalid query format
 */
async function testInvalidQuery() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: Invalid Query Format`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const response = await makeRequest(N8N_WEBHOOK_URL, { invalidField: "test" });
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode >= 400) {
      console.log(`✅ Correctly handled invalid request`);
      console.log(`Error Response:`, JSON.stringify(response.data, null, 2));
    } else {
      console.log(`⚠️  Expected error response but got success`);
    }
    
  } catch (error) {
    console.log(`Request Failed: ${error.message}`);
  }
}

/**
 * Performance test with concurrent requests
 */
async function performanceTest() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Performance Test: 5 Concurrent Requests`);
  console.log(`${'='.repeat(60)}`);
  
  const testQuery = "What is artificial intelligence?";
  const startTime = Date.now();
  
  try {
    const promises = Array(5).fill().map((_, i) => 
      makeRequest(N8N_WEBHOOK_URL, { 
        query: `${testQuery} (Request ${i + 1})` 
      })
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log(`⏱️  Total Time for 5 requests: ${totalDuration}ms`);
    console.log(`📊 Average Time per Request: ${Math.round(totalDuration / 5)}ms`);
    
    const successCount = responses.filter(r => r.statusCode === 200).length;
    console.log(`✅ Successful Requests: ${successCount}/5`);
    
    if (successCount < 5) {
      console.log(`❌ Failed Requests:`);
      responses.forEach((response, i) => {
        if (response.statusCode !== 200) {
          console.log(`   Request ${i + 1}: ${response.statusCode} - ${JSON.stringify(response.data)}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`💥 Performance Test Failed: ${error.message}`);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`🚀 Starting n8n RAG Agent Tests`);
  console.log(`🌐 Webhook URL: ${N8N_WEBHOOK_URL}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  
  // Test each sample query
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    await testQuery(TEST_QUERIES[i], i);
    
    // Add delay between tests to avoid overwhelming the system
    if (i < TEST_QUERIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Test invalid query
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testInvalidQuery();
  
  // Performance test
  await new Promise(resolve => setTimeout(resolve, 2000));
  await performanceTest();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏁 All Tests Completed`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n💡 Tips:`);
  console.log(`   - Check n8n execution logs for detailed workflow information`);
  console.log(`   - Monitor vector database and LLM API usage`);
  console.log(`   - Adjust similarity thresholds based on your use case`);
  console.log(`   - Consider implementing rate limiting for production use`);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
n8n RAG Agent Test Script

Usage: node test-rag-agent.js [options]

Environment Variables:
  N8N_WEBHOOK_URL    The n8n webhook URL (default: http://localhost:5678/webhook/rag-query)

Options:
  --help, -h         Show this help message
  --single "query"   Test a single custom query
  --perf-only        Run only the performance test

Examples:
  node test-rag-agent.js
  N8N_WEBHOOK_URL=https://your-n8n.com/webhook/rag-query node test-rag-agent.js
  node test-rag-agent.js --single "What is quantum computing?"
  node test-rag-agent.js --perf-only
  `);
  process.exit(0);
}

// Handle single query test
if (process.argv.includes('--single')) {
  const queryIndex = process.argv.indexOf('--single');
  const customQuery = process.argv[queryIndex + 1];
  
  if (!customQuery) {
    console.error('❌ Please provide a query after --single flag');
    process.exit(1);
  }
  
  console.log(`🚀 Testing Single Query`);
  console.log(`🌐 Webhook URL: ${N8N_WEBHOOK_URL}`);
  testQuery(customQuery, 0).then(() => {
    console.log(`\n🏁 Single Query Test Completed`);
  });
  return;
}

// Handle performance-only test
if (process.argv.includes('--perf-only')) {
  console.log(`🚀 Running Performance Test Only`);
  console.log(`🌐 Webhook URL: ${N8N_WEBHOOK_URL}`);
  performanceTest().then(() => {
    console.log(`\n🏁 Performance Test Completed`);
  });
  return;
}

// Run all tests
runTests().catch(error => {
  console.error(`💥 Test execution failed:`, error);
  process.exit(1);
});