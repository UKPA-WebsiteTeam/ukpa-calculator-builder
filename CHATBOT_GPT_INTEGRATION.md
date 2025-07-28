# ChatGPT API Integration Guide

## 🧠 Overview

Your chatbot system now supports integration with your trained ChatGPT API backend. This allows you to create AI-powered chatbots that can provide intelligent, contextual responses based on your custom training data.

## 🚀 Features

### **AI-Powered Responses**
- Connect to your trained ChatGPT API
- Intelligent conversation handling
- Context-aware responses
- Personality customization
- Domain-specific knowledge

### **Seamless Integration**
- Easy configuration through WordPress admin
- Test connection functionality
- Fallback to NLP responses if API is unavailable
- Session management and context preservation

### **Flexible Configuration**
- Customizable response parameters
- Temperature and token control
- Domain-specific settings
- Personality options

## ⚙️ Setup Instructions

### **1. Configure ChatGPT API Settings**

1. Go to **WordPress Admin** → **UKPA Calculator Builder** → **ChatGPT Settings**
2. Enter your API endpoint URL (e.g., `https://your-api.com/chat`)
3. Enter your API authentication key
4. Set request timeout (default: 30 seconds)
5. Enable logging if needed
6. Click **Save ChatGPT Settings**

### **2. Test Your API Connection**

1. In the ChatGPT Settings page, click **Test Connection**
2. The system will send a test message to your API
3. Verify the response is received correctly
4. Check for any error messages

### **3. Create a GPT Chatbot**

1. Go to **WordPress Admin** → **UKPA Calculator Builder** → **Chatbots** → **Add New**
2. Set **Chatbot Type** to "GPT (AI-powered)"
3. Configure the chatbot settings:
   - **Domain**: Your trained model's domain (e.g., "calculator", "tax", "finance")
   - **Max Tokens**: Response length limit (50-500 tokens)
   - **Temperature**: Creativity level (0.1 = focused, 1.0 = creative)
4. Save the chatbot
5. Use the shortcode to display it: `[ukpa_chatbot id="X"]`

## 🔧 API Requirements

### **Request Format**
Your ChatGPT API should accept POST requests with this JSON structure:

```json
{
  "message": "User message",
  "session_id": "unique_session_id",
  "context": [
    {
      "message": "Previous message",
      "timestamp": 1234567890
    }
  ],
  "config": {
    "personality": "helpful",
    "domain": "calculator",
    "max_tokens": 150,
    "temperature": 0.7
  },
  "user_info": {
    "ip": "user_ip",
    "user_agent": "browser_info",
    "current_url": "/page-url"
  },
  "timestamp": 1234567890
}
```

### **Response Format**
Your API should return a JSON response in this format:

```json
{
  "response": "AI generated response",
  "confidence": 0.95,
  "tokens_used": 45,
  "processing_time": 1.2
}
```

### **Required Fields**
- `response`: The AI-generated response text
- `confidence`: Confidence score (0.0-1.0)
- `tokens_used`: Number of tokens used in response
- `processing_time`: Response time in seconds

## 🎯 Configuration Options

### **Chatbot Type Settings**

#### **GPT Settings**
- **Domain**: Specify your model's domain/context
- **Max Tokens**: Control response length (50-500)
- **Temperature**: Control creativity (0.1-1.0)

#### **NLP Settings** (for fallback)
- **Keywords**: Exact match keywords
- **Responses**: Pre-defined responses
- **Intents**: Regex pattern matching

### **Personality Options**
- **Helpful**: Friendly and supportive
- **Professional**: Formal and business-like
- **Friendly**: Warm and approachable
- **Casual**: Relaxed and informal

## 🔄 How It Works

### **Processing Flow**
1. **User sends message** to chatbot
2. **System checks** if GPT is enabled
3. **Prepares request** with context and configuration
4. **Sends to your API** with authentication
5. **Processes response** and formats it
6. **Returns to user** with personality formatting
7. **Stores context** for future conversations

### **Context Management**
- Maintains conversation history
- Sends relevant context to API
- Preserves session information
- Handles conversation flow

### **Fallback System**
- If API is unavailable, falls back to NLP
- If API returns error, uses fallback response
- Maintains user experience even during issues

## 🛠️ API Implementation Example

### **Node.js/Express Example**
```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const { message, session_id, context, config, user_info } = req.body;
        
        // Your ChatGPT processing logic here
        const response = await processWithChatGPT(message, context, config);
        
        res.json({
            response: response.text,
            confidence: response.confidence,
            tokens_used: response.tokens,
            processing_time: response.time
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message
        });
    }
});

async function processWithChatGPT(message, context, config) {
    // Your ChatGPT API call logic
    // Return processed response
}
```

### **Python/Flask Example**
```python
from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data['message']
        context = data['context']
        config = data['config']
        
        # Your ChatGPT processing logic
        response = process_with_chatgpt(message, context, config)
        
        return jsonify({
            'response': response['text'],
            'confidence': response['confidence'],
            'tokens_used': response['tokens'],
            'processing_time': response['time']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_with_chatgpt(message, context, config):
    # Your ChatGPT API call logic
    # Return processed response
    pass
```

## 🔒 Security Considerations

### **API Security**
- Use HTTPS for all API communications
- Implement proper API key validation
- Rate limit requests to prevent abuse
- Log API interactions for monitoring
- Validate input data on your API

### **WordPress Security**
- API keys are stored securely in WordPress options
- All requests are sanitized and validated
- Nonce verification for admin actions
- User capability checks for admin functions

## 📊 Monitoring and Debugging

### **Enable Logging**
1. Go to **ChatGPT Settings**
2. Enable **Detailed Logging**
3. Check WordPress debug log for API interactions

### **Test Connection**
- Use the built-in test function
- Check response times and errors
- Verify API endpoint accessibility

### **Common Issues**
1. **API Not Responding**: Check endpoint URL and server status
2. **Authentication Failed**: Verify API key is correct
3. **Timeout Errors**: Increase timeout setting or optimize API
4. **Invalid Response**: Check response format matches requirements

## 🎨 Customization

### **Custom Response Formatting**
You can customize how responses are formatted based on personality:

```php
// In your API response processing
switch ($personality) {
    case 'professional':
        return "Thank you for your inquiry. " . $response;
    case 'friendly':
        return "Hi there! " . $response;
    case 'casual':
        return "Hey! " . $response;
    default:
        return $response;
}
```

### **Domain-Specific Processing**
Handle different domains with specific logic:

```php
// In your API
switch ($config['domain']) {
    case 'calculator':
        // Calculator-specific processing
        break;
    case 'tax':
        // Tax-specific processing
        break;
    case 'finance':
        // Finance-specific processing
        break;
}
```

## 🔄 Integration with Existing Chatbots

### **Migration from NLP to GPT**
1. Edit existing chatbot
2. Change **Chatbot Type** to "GPT"
3. Configure GPT-specific settings
4. Save changes
5. Test the new AI-powered responses

### **Hybrid Approach**
- Use GPT for complex queries
- Fall back to NLP for simple responses
- Combine both approaches for optimal performance

## 📈 Performance Optimization

### **Response Time Optimization**
- Implement caching for common queries
- Use async processing for long responses
- Optimize your API endpoint performance
- Consider CDN for global access

### **Token Usage Optimization**
- Set appropriate max_tokens limits
- Monitor token usage patterns
- Optimize prompts for efficiency
- Use streaming for long responses

## 🚀 Advanced Features

### **Multi-Domain Support**
- Train different models for different domains
- Route requests based on context
- Maintain domain-specific knowledge
- Provide specialized responses

### **Context-Aware Responses**
- Use conversation history for better responses
- Maintain user preferences across sessions
- Provide personalized recommendations
- Handle follow-up questions intelligently

### **Analytics Integration**
- Track conversation patterns
- Monitor response quality
- Analyze user satisfaction
- Optimize based on usage data

## 🔧 Troubleshooting

### **API Connection Issues**
1. **Check endpoint URL**: Ensure it's accessible
2. **Verify API key**: Confirm authentication works
3. **Test manually**: Use tools like Postman to test API
4. **Check server logs**: Look for error messages
5. **Increase timeout**: If API is slow to respond

### **Response Quality Issues**
1. **Adjust temperature**: Lower for more focused responses
2. **Review training data**: Ensure model is well-trained
3. **Check context**: Verify relevant context is being sent
4. **Monitor tokens**: Ensure responses aren't too long/short

### **Performance Issues**
1. **Optimize API**: Improve response times
2. **Implement caching**: Cache common responses
3. **Use CDN**: Improve global access
4. **Monitor resources**: Check server capacity

---

The ChatGPT integration transforms your chatbot from a simple keyword matcher into an intelligent AI assistant that can understand context, provide detailed responses, and learn from conversations. With proper configuration and monitoring, it can significantly enhance user experience and engagement. 