# n8n RAG Customer Support Agent Setup Guide

This guide explains how to set up and use the n8n RAG (Retrieval-Augmented Generation) workflows for automated customer support.

## Overview

The RAG agent workflows enable intelligent customer support by:
1. Receiving customer questions via webhook
2. Converting questions to embeddings using OpenAI
3. Searching relevant information in vector databases (Pinecone or Qdrant)
4. Generating contextual responses using GPT-4
5. Returning structured JSON responses with metadata

## Available Workflows

### 1. Pinecone Version (`n8n-rag-agent-workflow.json`)
- Uses Pinecone as the vector store
- Native Pinecone integration in n8n
- Best for production environments with high volume

### 2. Qdrant Version (`n8n-rag-agent-qdrant-workflow.json`)
- Uses Qdrant as the vector store
- HTTP Request nodes for API calls
- Better for self-hosted or cost-conscious setups

## Prerequisites

### Required Services
1. **n8n instance** (self-hosted or cloud)
2. **OpenAI API** account and key
3. **Vector Database** (Pinecone or Qdrant)
4. **Customer support data** already embedded and stored in vector DB

### Required n8n Credentials
1. OpenAI API credentials
2. Pinecone API credentials (for Pinecone version)
3. HTTP Header Auth credentials (for Qdrant version)

## Setup Instructions

### Step 1: Prepare Your Vector Database

#### For Pinecone:
1. Create a Pinecone account and get your API key
2. Create an index named `customer-support` with 1536 dimensions (for OpenAI embeddings)
3. Upload your customer support documents as embeddings with metadata:
   ```json
   {
     "id": "doc_1",
     "values": [0.1, 0.2, ...], // 1536-dimensional embedding
     "metadata": {
       "content": "Your support document content here",
       "source": "FAQ Section 1",
       "category": "billing"
     }
   }
   ```

#### For Qdrant:
1. Set up Qdrant (cloud or self-hosted)
2. Create a collection named `customer-support`:
   ```bash
   curl -X PUT "http://localhost:6333/collections/customer-support" \
   -H "Content-Type: application/json" \
   -d '{
     "vectors": {
       "size": 1536,
       "distance": "Cosine"
     }
   }'
   ```
3. Upload your documents:
   ```bash
   curl -X PUT "http://localhost:6333/collections/customer-support/points" \
   -H "Content-Type: application/json" \
   -d '{
     "points": [
       {
         "id": 1,
         "vector": [0.1, 0.2, ...],
         "payload": {
           "content": "Your support content",
           "source": "FAQ Section 1"
         }
       }
     ]
   }'
   ```

### Step 2: Configure n8n Credentials

#### OpenAI API Credentials:
1. Go to n8n Settings > Credentials
2. Add new credential: "OpenAI API"
3. Enter your OpenAI API key
4. Name it: `openai-credentials`

#### Pinecone Credentials (for Pinecone version):
1. Add new credential: "Pinecone API"
2. Enter your Pinecone API key and environment
3. Name it: `pinecone-credentials`

#### Qdrant Credentials (for Qdrant version):
1. Add new credential: "HTTP Header Auth"
2. Set header name: `api-key`
3. Set header value: your Qdrant API key
4. Name it: `qdrant-credentials`

### Step 3: Set Environment Variables

For Qdrant version, set the environment variable:
```bash
QDRANT_URL=https://your-qdrant-instance.com
# or for local: http://localhost:6333
```

### Step 4: Import the Workflow

1. Copy the contents of your chosen workflow file
2. In n8n, go to Workflows > Import from JSON
3. Paste the JSON content and import
4. Activate the workflow

### Step 5: Test the Webhook

The workflow creates a webhook endpoint at:
```
POST https://your-n8n-instance.com/webhook/customer-question
```

Test with curl:
```bash
curl -X POST "https://your-n8n-instance.com/webhook/customer-question" \
-H "Content-Type: application/json" \
-d '{
  "question": "How do I reset my password?"
}'
```

## API Usage

### Request Format
```json
{
  "question": "How do I cancel my subscription?",
  "user_id": "optional_user_id",
  "session_id": "optional_session_id"
}
```

### Response Format
```json
{
  "success": true,
  "answer": "To cancel your subscription, you can...",
  "metadata": {
    "requestId": "abc123",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "sourcesUsed": 2,
    "sources": [
      {
        "source": "FAQ Section 1",
        "relevanceScore": 0.89
      }
    ],
    "model": "gpt-4",
    "contextRelevance": "high"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "type": "WorkflowError",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "abc123"
  },
  "answer": "I apologize, but I encountered an error..."
}
```

## Customization Options

### Adjusting Relevance Threshold
In the "Process Search Results" node, modify the score threshold:
```javascript
if (match.score > 0.7) { // Change 0.7 to your preferred threshold
```

### Changing Context Limit
Modify the number of contexts used:
```javascript
.slice(0, 3) // Change 3 to your preferred number
```

### Customizing the AI Prompt
In the "Generate Response" node, modify the system message to match your brand voice and requirements.

### Adding Rate Limiting
Consider adding rate limiting nodes before the webhook to prevent abuse.

## Monitoring and Analytics

### Key Metrics to Track
1. Response accuracy (manual review)
2. Context relevance scores
3. Number of sources used per response
4. Response times
5. Error rates

### Logging Enhancement
Add logging nodes to track:
- User questions and responses
- Embedding generation time
- Vector search performance
- LLM response time

## Troubleshooting

### Common Issues

#### "No question provided" Error
- Ensure request body includes `question`, `query`, or `message` field
- Check content-type header is `application/json`

#### Vector Search Returns No Results
- Verify your vector database contains data
- Check API credentials and connection
- Ensure collection/index name matches workflow configuration
- Lower the relevance threshold for testing

#### OpenAI API Errors
- Verify API key is valid and has sufficient credits
- Check model availability (gpt-4 requires special access)
- Monitor rate limits

#### Empty or Poor Responses
- Review the quality of your source documents
- Ensure embeddings were generated with the same model
- Check if context relevance threshold is too high

### Debug Mode
Enable debug mode in n8n to see detailed execution logs for each node.

## Security Considerations

1. **API Key Security**: Store all API keys securely in n8n credentials
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Add validation nodes to sanitize user input
4. **Access Control**: Restrict webhook access if needed
5. **Data Privacy**: Ensure compliance with data protection regulations

## Performance Optimization

1. **Caching**: Consider implementing response caching for frequently asked questions
2. **Async Processing**: For high-volume scenarios, consider async processing
3. **Load Balancing**: Distribute load across multiple n8n instances
4. **Vector DB Optimization**: Optimize your vector database configuration for your query patterns

## Support and Maintenance

### Regular Tasks
1. Monitor response quality and update source documents
2. Review and update the AI prompt based on feedback
3. Check API usage and costs
4. Update embeddings when source content changes

### Updating Source Content
When adding new content:
1. Generate embeddings using the same OpenAI model
2. Upload to your vector database with proper metadata
3. Test with relevant questions

This setup provides a robust foundation for automated customer support using RAG technology with n8n workflows.