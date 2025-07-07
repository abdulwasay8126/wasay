#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Data Preparation Script for n8n RAG Agent
 * 
 * This script helps you:
 * 1. Process text documents
 * 2. Generate embeddings using OpenAI
 * 3. Upload to Pinecone or Qdrant vector databases
 * 
 * Usage:
 * node prepare-vector-data.js --config config.json --docs ./documents/
 */

// Configuration schema
const defaultConfig = {
  "openai": {
    "apiKey": "your-openai-api-key",
    "model": "text-embedding-ada-002"
  },
  "vectorDatabase": {
    "type": "pinecone", // or "qdrant"
    "pinecone": {
      "apiKey": "your-pinecone-api-key",
      "environment": "your-pinecone-environment",
      "indexName": "customer-support"
    },
    "qdrant": {
      "url": "http://localhost:6333",
      "apiKey": "your-qdrant-api-key", // optional for local
      "collectionName": "customer-support"
    }
  },
  "processing": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "batchSize": 10
  }
};

// Sample documents for testing
const sampleDocuments = [
  {
    filename: "password-reset.txt",
    content: `How to Reset Your Password

If you've forgotten your password, you can reset it by following these steps:

1. Go to the login page
2. Click on "Forgot Password" link
3. Enter your email address
4. Check your email for reset instructions
5. Click the reset link in the email
6. Create a new strong password
7. Log in with your new password

Password Requirements:
- At least 8 characters long
- Include uppercase and lowercase letters
- Include at least one number
- Include at least one special character (!@#$%^&*)

If you continue to have trouble, contact our support team at support@company.com`,
    source: "Password Reset FAQ",
    category: "account-management"
  },
  {
    filename: "subscription-cancellation.txt",
    content: `How to Cancel Your Subscription

You can cancel your subscription at any time by following these steps:

1. Log into your account
2. Go to Account Settings
3. Click on "Subscription" tab
4. Click "Cancel Subscription"
5. Confirm your cancellation
6. You'll receive a confirmation email

Important Notes:
- Your subscription will remain active until the end of your current billing period
- You can reactivate your subscription at any time before it expires
- Refunds are available within 30 days of purchase
- Contact billing@company.com for refund requests

After cancellation, you'll still have access to:
- Downloaded content
- Account history
- Ability to reactivate`,
    source: "Billing FAQ",
    category: "billing"
  },
  {
    filename: "performance-troubleshooting.txt",
    content: `Application Performance Troubleshooting

If your application is running slowly, try these troubleshooting steps:

Common Causes:
- Poor internet connection
- Browser cache issues
- Too many browser tabs open
- Outdated browser version
- System resources running low

Quick Fixes:
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Clear your browser cache and cookies
3. Close unnecessary browser tabs
4. Update your browser to the latest version
5. Restart your browser
6. Check your internet connection speed

Advanced Solutions:
- Disable browser extensions temporarily
- Try using an incognito/private browsing window
- Check for system updates
- Free up disk space
- Restart your computer

If problems persist after trying these steps, please contact technical support with:
- Your browser version
- Operating system
- Description of the performance issue
- Screenshot if applicable`,
    source: "Technical Support FAQ",
    category: "technical"
  }
];

function createSampleConfig() {
  const configPath = './config.json';
  if (!fs.existsSync(configPath)) {
    console.log('Creating sample config.json file...');
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Sample config.json created. Please update with your API keys.');
  }
}

function createSampleDocuments() {
  const docsDir = './documents';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }

  console.log('Creating sample documents...');
  sampleDocuments.forEach(doc => {
    const filePath = path.join(docsDir, doc.filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, doc.content);
      console.log(`✅ Created ${doc.filename}`);
    }
  });
}

function chunkText(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start = end - overlap;
    
    // Prevent infinite loop
    if (start >= end) break;
  }
  
  return chunks;
}

async function generateEmbedding(text, apiKey, model = 'text-embedding-ada-002') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      input: text,
      model: model
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.data[0].embedding);
          }
        } catch (error) {
          reject(error);
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

async function uploadToPinecone(vectors, config) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      vectors: vectors
    });

    const options = {
      hostname: `${config.indexName}-${config.environment}.svc.${config.environment}.pinecone.io`,
      port: 443,
      path: '/vectors/upsert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': config.apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(error);
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

async function uploadToQdrant(points, config) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${config.url}/collections/${config.collectionName}/points`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify({
      points: points
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    if (config.apiKey) {
      options.headers['api-key'] = config.apiKey;
    }

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(error);
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

async function processDocuments(docsPath, config) {
  console.log(`Processing documents from: ${docsPath}`);
  
  const files = fs.readdirSync(docsPath).filter(file => 
    file.endsWith('.txt') || file.endsWith('.md')
  );

  if (files.length === 0) {
    throw new Error(`No .txt or .md files found in ${docsPath}`);
  }

  console.log(`Found ${files.length} documents to process`);

  const allChunks = [];
  let chunkId = 1;

  // Process each document
  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(docsPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find corresponding sample document for metadata
    const sampleDoc = sampleDocuments.find(doc => doc.filename === file);
    
    const chunks = chunkText(content, config.processing.chunkSize, config.processing.chunkOverlap);
    
    for (let i = 0; i < chunks.length; i++) {
      allChunks.push({
        id: `chunk_${chunkId}`,
        text: chunks[i].trim(),
        source: sampleDoc?.source || file,
        category: sampleDoc?.category || 'general',
        filename: file,
        chunkIndex: i
      });
      chunkId++;
    }
  }

  console.log(`Created ${allChunks.length} text chunks`);

  // Generate embeddings in batches
  console.log('Generating embeddings...');
  const embeddedChunks = [];
  const batchSize = config.processing.batchSize;

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allChunks.length / batchSize)}`);

    for (const chunk of batch) {
      try {
        const embedding = await generateEmbedding(chunk.text, config.openai.apiKey, config.openai.model);
        embeddedChunks.push({
          ...chunk,
          embedding: embedding
        });
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error generating embedding for chunk ${chunk.id}: ${error.message}`);
        throw error;
      }
    }
  }

  console.log(`Generated ${embeddedChunks.length} embeddings`);

  // Upload to vector database
  console.log(`Uploading to ${config.vectorDatabase.type}...`);

  if (config.vectorDatabase.type === 'pinecone') {
    const vectors = embeddedChunks.map(chunk => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: {
        content: chunk.text,
        source: chunk.source,
        category: chunk.category,
        filename: chunk.filename,
        chunkIndex: chunk.chunkIndex
      }
    }));

    await uploadToPinecone(vectors, config.vectorDatabase.pinecone);
  } else if (config.vectorDatabase.type === 'qdrant') {
    const points = embeddedChunks.map((chunk, index) => ({
      id: index + 1,
      vector: chunk.embedding,
      payload: {
        content: chunk.text,
        source: chunk.source,
        category: chunk.category,
        filename: chunk.filename,
        chunkIndex: chunk.chunkIndex,
        originalId: chunk.id
      }
    }));

    await uploadToQdrant(points, config.vectorDatabase.qdrant);
  }

  console.log('✅ Upload completed successfully!');
  return embeddedChunks.length;
}

function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let configPath = './config.json';
  let docsPath = './documents';
  let createSamples = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--config':
        configPath = args[++i];
        break;
      case '--docs':
        docsPath = args[++i];
        break;
      case '--create-samples':
        createSamples = true;
        break;
      case '--help':
        console.log(`
Usage: node prepare-vector-data.js [options]

Options:
  --config <path>     Path to config file (default: ./config.json)
  --docs <path>       Path to documents directory (default: ./documents)
  --create-samples    Create sample config and documents
  --help              Show this help message

Examples:
  node prepare-vector-data.js --create-samples
  node prepare-vector-data.js --config ./my-config.json --docs ./my-docs/
        `);
        return;
    }
  }

  if (createSamples) {
    createSampleConfig();
    createSampleDocuments();
    console.log('\n✅ Sample files created successfully!');
    console.log('Next steps:');
    console.log('1. Update config.json with your API keys');
    console.log('2. Add your documents to the ./documents directory');
    console.log('3. Run: node prepare-vector-data.js');
    return;
  }

  // Load configuration
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    console.log('Run with --create-samples to create a sample config file');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Validate configuration
  if (!config.openai?.apiKey || config.openai.apiKey === 'your-openai-api-key') {
    console.error('Please update the OpenAI API key in config.json');
    process.exit(1);
  }

  if (!fs.existsSync(docsPath)) {
    console.error(`Documents directory not found: ${docsPath}`);
    process.exit(1);
  }

  // Process documents
  processDocuments(docsPath, config)
    .then(count => {
      console.log(`\n🎉 Successfully processed and uploaded ${count} document chunks!`);
      console.log('Your vector database is now ready for the n8n RAG agent.');
    })
    .catch(error => {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    });
}

if (require.main === module) {
  main();
}