# n8n RAG Agent Workflow

A complete Retrieval-Augmented Generation (RAG) agent implementation for n8n that combines vector database search with Large Language Model generation to provide intelligent, context-aware responses.

## 🚀 Features

- **📥 Webhook API**: RESTful endpoint for submitting queries
- **🔍 Vector Search**: Intelligent document retrieval from vector databases
- **🤖 LLM Integration**: Support for multiple LLM providers (OpenAI, Anthropic, Azure, etc.)
- **📊 Source Attribution**: Track and cite information sources
- **⚡ Performance Metrics**: Response time and confidence scoring
- **🛡️ Error Handling**: Graceful error management and meaningful error responses
- **🔧 Configurable**: Easily adjustable similarity thresholds and context sizes
- **🧪 Test Suite**: Comprehensive testing tools included

## 📁 Files Included

- `n8n-rag-agent-workflow.json` - Main n8n workflow configuration
- `n8n-rag-config.md` - Detailed setup and configuration guide
- `.env.template` - Environment variables template
- `test-rag-agent.js` - Comprehensive test script

## 🚦 Quick Start

### 1. Import the Workflow

1. Copy the contents of `n8n-rag-agent-workflow.json`
2. In your n8n instance, go to **Workflows** → **Import from JSON**
3. Paste the JSON content and import

### 2. Configure Environment Variables

Copy `.env.template` to `.env` and fill in your values:

```bash
# Vector Database
VECTOR_DB_URL=https://your-vector-db-api.com/api/v1
VECTOR_DB_API_KEY=your_vector_db_api_key

# LLM Provider (OpenAI example)
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-3.5-turbo
```

### 3. Test the Workflow

```bash
# Install Node.js if not already installed
# Then run the test script
node test-rag-agent.js

# Or test with custom query
node test-rag-agent.js --single "What is machine learning?"
```

## 🔧 Configuration

### Supported Vector Databases
- Pinecone
- Weaviate  
- Chroma
- Qdrant
- Milvus

### Supported LLM Providers
- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude-3)
- Azure OpenAI
- Cohere
- Local models (Ollama, LM Studio)

## 📖 API Usage

### Request
```bash
curl -X POST http://your-n8n-instance/webhook/rag-query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is artificial intelligence?"}'
```

### Response
```json
{
  "queryId": "query_1703001234567_abc123def",
  "query": "What is artificial intelligence?",
  "answer": "Artificial intelligence (AI) refers to...",
  "sources": [
    {
      "source": "AI_Textbook_Chapter1.pdf",
      "score": 0.92
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

## 🏗️ Architecture

The workflow consists of these main components:

1. **Query Webhook** - Receives and validates incoming queries
2. **Process Query** - Cleans input and generates tracking IDs
3. **Vector Search** - Retrieves relevant documents from vector database
4. **Prepare Context** - Filters and formats search results
5. **LLM Generation** - Generates response using retrieved context
6. **Format Response** - Structures final output with metadata
7. **Error Handler** - Manages errors and provides meaningful responses

## 🔒 Security Best Practices

- Store API keys as environment variables
- Implement rate limiting for production use
- Add authentication to webhook endpoints
- Validate and sanitize user inputs
- Monitor for potentially harmful queries

## 📊 Monitoring

Built-in tracking includes:
- Unique query IDs for request tracing
- Response time measurements
- Source attribution and confidence scoring
- Error logging and analytics

## 🛠️ Customization

### Adjust Search Parameters
- Modify `similarity_threshold` (default: 0.7)
- Change `top_k` results count (default: 5)

### Customize LLM Behavior
- Edit system prompts in the LLM Generation node
- Adjust temperature and max tokens
- Switch between different models

### Add Features
- Implement conversation memory
- Add document upload capabilities
- Create user authentication
- Build analytics dashboards

## 🧪 Testing

The included test script provides:
- Individual query testing
- Performance benchmarking
- Error handling validation
- Concurrent request testing

```bash
# Run all tests
node test-rag-agent.js

# Test single query
node test-rag-agent.js --single "Your custom question"

# Performance test only
node test-rag-agent.js --perf-only

# Show help
node test-rag-agent.js --help
```

## 📚 Documentation

For detailed setup instructions, troubleshooting, and advanced configuration options, see `n8n-rag-config.md`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is open source. Feel free to use, modify, and distribute as needed.

---

**Ready to build intelligent AI agents with n8n? Import the workflow and start querying your knowledge base today!** 🎉