#!/usr/bin/env node

const https = require('https');
const http = require('http');

/**
 * Test script for n8n RAG Customer Support Agent
 * 
 * Usage:
 * node test-rag-agent.js <webhook-url>
 * 
 * Example:
 * node test-rag-agent.js https://your-n8n-instance.com/webhook/customer-question
 */

// Test questions to validate different scenarios
const testQuestions = [
  {
    name: "Simple FAQ Question",
    question: "How do I reset my password?",
    expectedKeywords: ["password", "reset", "account"]
  },
  {
    name: "Billing Question",
    question: "How do I cancel my subscription?",
    expectedKeywords: ["subscription", "cancel", "billing"]
  },
  {
    name: "Technical Support",
    question: "Why is my application running slowly?",
    expectedKeywords: ["performance", "slow", "application"]
  },
  {
    name: "Account Management",
    question: "How do I update my profile information?",
    expectedKeywords: ["profile", "update", "account"]
  },
  {
    name: "Edge Case - Empty Question",
    question: "",
    expectError: true
  }
];

async function sendRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
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
          const jsonResponse = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonResponse
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData,
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

function validateResponse(response, testCase) {
  const results = {
    passed: true,
    issues: []
  };

  // Check status code
  if (response.statusCode !== 200) {
    results.passed = false;
    results.issues.push(`Expected status 200, got ${response.statusCode}`);
  }

  // Check if response is valid JSON
  if (response.parseError) {
    results.passed = false;
    results.issues.push(`Response is not valid JSON: ${response.parseError}`);
    return results;
  }

  const body = response.body;

  // Check response structure
  if (typeof body !== 'object') {
    results.passed = false;
    results.issues.push('Response body is not an object');
    return results;
  }

  // Check for required fields
  if (!body.hasOwnProperty('success')) {
    results.passed = false;
    results.issues.push('Response missing "success" field');
  }

  if (!body.hasOwnProperty('answer')) {
    results.passed = false;
    results.issues.push('Response missing "answer" field');
  }

  // Test case specific validation
  if (testCase.expectError) {
    if (body.success !== false) {
      results.passed = false;
      results.issues.push('Expected error response but got success');
    }
  } else {
    if (body.success !== true) {
      results.passed = false;
      results.issues.push('Expected success response but got error');
    }

    // Check for metadata in successful responses
    if (body.success && !body.metadata) {
      results.issues.push('Warning: Missing metadata in successful response');
    }

    // Check for expected keywords in answer
    if (body.answer && testCase.expectedKeywords) {
      const answerLower = body.answer.toLowerCase();
      const foundKeywords = testCase.expectedKeywords.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length === 0) {
        results.issues.push(`Warning: Answer doesn't contain expected keywords: ${testCase.expectedKeywords.join(', ')}`);
      }
    }
  }

  return results;
}

function printResults(testCase, response, validation, duration) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${testCase.name}`);
  console.log(`Question: "${testCase.question}"`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Status: ${response.statusCode}`);
  
  if (validation.passed) {
    console.log(`✅ PASSED`);
  } else {
    console.log(`❌ FAILED`);
  }

  if (validation.issues.length > 0) {
    console.log(`\nIssues:`);
    validation.issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }

  if (response.body) {
    console.log(`\nResponse:`);
    if (typeof response.body === 'object') {
      console.log(JSON.stringify(response.body, null, 2));
    } else {
      console.log(response.body);
    }
  }
}

async function runTests(webhookUrl) {
  console.log(`Testing n8n RAG Agent at: ${webhookUrl}`);
  console.log(`Running ${testQuestions.length} test cases...\n`);

  let passedTests = 0;
  let totalTests = testQuestions.length;

  for (const testCase of testQuestions) {
    const startTime = Date.now();
    
    try {
      const response = await sendRequest(webhookUrl, {
        question: testCase.question,
        test_mode: true
      });
      
      const duration = Date.now() - startTime;
      const validation = validateResponse(response, testCase);
      
      printResults(testCase, response, validation, duration);
      
      if (validation.passed) {
        passedTests++;
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Test: ${testCase.name}`);
      console.log(`Question: "${testCase.question}"`);
      console.log(`Duration: ${duration}ms`);
      console.log(`❌ FAILED - Network Error`);
      console.log(`Error: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log(`\n🎉 All tests passed! Your RAG agent is working correctly.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please check your configuration and vector database content.`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`Usage: node test-rag-agent.js <webhook-url>`);
    console.log(`Example: node test-rag-agent.js https://your-n8n-instance.com/webhook/customer-question`);
    process.exit(1);
  }

  const webhookUrl = args[0];
  
  // Validate URL format
  try {
    new URL(webhookUrl);
  } catch (error) {
    console.error(`Invalid URL: ${webhookUrl}`);
    process.exit(1);
  }

  runTests(webhookUrl).catch(error => {
    console.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

if (require.main === module) {
  main();
}