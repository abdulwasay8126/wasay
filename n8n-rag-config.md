# n8n RAG Agent Configuration Guide

## Overview
This n8n workflow implements a complete Retrieval-Augmented Generation (RAG) agent that can answer questions by retrieving relevant information from a vector database and generating contextual responses using a Large Language Model.

## Required Environment Variables

Set these variables in your n8n environment:

```bash
# Vector Database Configuration
VECTOR_DB_URL=https://your-vector-db-api.com/api/v1
VECTOR_DB_API_KEY=your_vector_db_api_key

# LLM Configuration
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-3.5-turbo  # or gpt-4, claude-3-sonnet, etc.
```

## Workflow Components

### 1. Query Webhook
- **Endpoint**: `POST /webhook/rag-query`
- **Purpose**: Receives user queries
- **Input**: JSON with `query`, `question`, or `body.query` field

### 2. Process Query
- Validates and cleans the input query
- Generates unique query ID for tracking
- Prepares query for vector search

### 3. Vector Search
- Searches your vector database for relevant documents
- Configurable parameters:
  - `top_k`: Number of results to retrieve (default: 5)
  - `similarity_threshold`: Minimum similarity score (default: 0.7)

### 4. Prepare Context
- Processes search results
- Filters by relevance threshold
- Formats context for LLM consumption
- Tracks source attribution

### 5. LLM Generation
- Sends context and query to LLM
- Uses system prompt optimized for RAG
- Configurable temperature and max tokens

### 6. Format Response
- Structures the final response
- Includes answer, sources, and metadata
- Calculates response time and confidence

### 7. Error Handling
- Catches and formats errors gracefully
- Returns meaningful error messages
- Maintains query tracking

## API Usage

### Request Format
```bash
curl -X POST http://your-n8n-instance/webhook/rag-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?"
  }'
```

### Response Format
```json
{
  "queryId": "query_1703001234567_abc123def",
  "query": "What is machine learning?",
  "answer": "Machine learning is a subset of artificial intelligence...",
  "sources": [
    {
      "source": "ML_Textbook_Chapter1.pdf",
      "score": 0.92
    },
    {
      "source": "AI_Overview_2023.md",
      "score": 0.87
    }
  ],
  "metadata": {
    "contextCount": 3,
    "responseTimeMs": 1250,
    "timestamp": "2024-12-19T10:30:00.000Z",
    "model": "gpt-3.5-turbo"
  },
  "confidence": "high"
}
```

### Error Response Format
```json
{
  "error": true,
  "message": "An error occurred while processing your query",
  "details": "Vector database connection timeout",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "queryId": "query_1703001234567_abc123def"
}
```

## Setup Instructions

### 1. Import Workflow
1. Copy the contents of `n8n-rag-agent-workflow.json`
2. In n8n, go to Workflows → Import from JSON
3. Paste the JSON content and import

### 2. Configure Environment Variables
1. Go to Settings → Environment Variables
2. Add all required variables listed above
3. Save the configuration

### 3. Configure Vector Database
Ensure your vector database API supports:
- POST requests to `/search` endpoint
- JSON payload with `query`, `top_k`, `similarity_threshold`
- Response format with `results` or `documents` array
- Each result should have: `content`/`text`, `score`/`similarity`, `metadata`

### 4. Test the Workflow
1. Activate the workflow
2. Send a test request to the webhook endpoint
3. Monitor execution logs for any issues

## Vector Database Compatibility

This workflow is designed to work with popular vector databases:

- **Pinecone**: Adjust field mappings in "Prepare Context" node
- **Weaviate**: May need slight API endpoint modifications
- **Chroma**: Compatible with default configuration
- **Qdrant**: Compatible with minor field mapping changes
- **Milvus**: May require API endpoint adjustments

## LLM Provider Compatibility

Supports various LLM providers:

- **OpenAI**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Anthropic**: Claude-3-sonnet, Claude-3-opus
- **Cohere**: Command models
- **Azure OpenAI**: GPT models via Azure endpoints
- **Local/Self-hosted**: Ollama, LM Studio, etc.

## Customization Options

### Adjust Similarity Threshold
Modify the `similarity_threshold` in the Vector Search node (default: 0.7)

### Change Context Size
Modify the `top_k` parameter in the Vector Search node (default: 5)

### Customize System Prompt
Edit the system message in the LLM Generation node for different behavior

### Add Memory/Chat History
Extend the workflow to include conversation context and memory

### Add Document Upload
Create additional endpoints for uploading and indexing new documents

## Monitoring and Analytics

The workflow includes built-in tracking:
- Query IDs for request tracing
- Response time measurements
- Source attribution
- Confidence scoring
- Error logging

## Security Considerations

- Store API keys as environment variables, never in the workflow
- Implement rate limiting if needed
- Consider adding authentication to the webhook
- Validate and sanitize user inputs
- Monitor for potentially harmful queries

## Troubleshooting

### Common Issues
1. **Vector Search Fails**: Check VECTOR_DB_URL and API key
2. **LLM Generation Fails**: Verify LLM_API_URL and API key
3. **No Context Found**: Lower similarity_threshold or check document indexing
4. **Slow Responses**: Optimize vector search parameters or LLM settings

### Debug Mode
Enable debug mode in n8n to see detailed execution logs and data flow between nodes.