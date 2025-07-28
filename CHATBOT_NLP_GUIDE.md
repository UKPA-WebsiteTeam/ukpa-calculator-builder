# Advanced Chatbot NLP Guide

## 🧠 Overview

Your chatbot now features advanced **Natural Language Processing (NLP)** capabilities that make it significantly smarter and more human-like. This guide explains all the new features and how to configure them for optimal performance.

## 🚀 New NLP Features

### 1. 🔍 **Fuzzy Matching**
- **What it does**: Understands misspelled words and similar phrases
- **Example**: "calclator" → matches "calculator"
- **Benefit**: Users don't need to type perfectly

### 2. 🧠 **Context Awareness**
- **What it does**: Remembers conversation history for better follow-up responses
- **Example**: 
  - User: "Tell me about calculators"
  - Bot: "We have income tax, capital gains, and property calculators"
  - User: "What about the income one?"
  - Bot: "The income tax calculator helps you calculate your tax liability..."
- **Benefit**: More natural conversations

### 3. 📚 **Synonym Recognition**
- **What it does**: Recognizes different ways to say the same thing
- **Example**: "help" matches "assist", "support", "aid"
- **Benefit**: Understands user intent regardless of word choice

### 4. 🎭 **Sentiment Analysis**
- **What it does**: Detects emotional tone of messages
- **Example**: "I love this calculator!" → positive sentiment
- **Benefit**: Can adjust response tone accordingly

### 5. 🏷️ **Entity Extraction**
- **What it does**: Identifies important information like numbers, dates, currency
- **Example**: "Calculate tax for £50,000 income" → extracts £50,000
- **Benefit**: Can use specific data in responses

## ⚙️ Configuration

### Access NLP Settings
1. Go to **WordPress Admin** → **UKPA Calculator Builder** → **NLP Settings**
2. Configure the features you want to enable
3. Save settings

### Similarity Threshold
- **Range**: 0.5 to 0.95
- **Default**: 0.7 (70% similarity)
- **Higher values** (0.8-0.9): More strict matching
- **Lower values** (0.6-0.7): More flexible matching

### Context Memory Size
- **Options**: 5, 10, 15, or 20 messages
- **Default**: 10 messages
- **Higher values**: Better context but more memory usage
- **Lower values**: Less memory but shorter context

## 🎯 How It Works

### Processing Pipeline
1. **Input**: User sends message
2. **Preprocessing**: Remove stop words, normalize text
3. **Exact Match**: Check for exact keyword matches
4. **Fuzzy Match**: Check for similar words (if enabled)
5. **Intent Match**: Check regex patterns
6. **Semantic Match**: Check synonyms and related words
7. **Context Match**: Check conversation history
8. **Fallback**: Return default response if no matches

### Example Processing
```
User: "I need help with the calc"
Processing:
1. Remove stop words: "need help calc"
2. Check synonyms: "calc" → "calculator"
3. Find match: "help" + "calculator" keywords
4. Return: "I can help you with our calculators..."
```

## 📊 Advanced Features

### Custom Synonyms
Add domain-specific terms to improve understanding:

```
calculator: calc, computation, figure out
tax: taxation, taxes, taxable
income: earnings, salary, wages
property: real estate, house, home
contact: reach, get in touch, call
```

### Custom Stop Words
Remove common words that don't add meaning:

```
please, kindly, thank you, thanks, um, uh, well
```

### Sentiment-Based Responses
Configure different responses based on sentiment:

```json
{
  "positive_sentiment": "I'm glad I could help!",
  "negative_sentiment": "I'm sorry to hear that. Let me try to help better.",
  "neutral_sentiment": "Here's the information you requested."
}
```

## 🔧 Technical Details

### Fuzzy Matching Algorithm
- Uses **Levenshtein distance** to calculate similarity
- Removes stop words before comparison
- Configurable similarity threshold
- Supports partial word matching

### Context Memory
- Stores last N messages per session
- Includes timestamps for temporal context
- Automatically cleans old conversations
- Session-based isolation

### Synonym Expansion
- Pre-built synonym dictionary
- Custom synonyms support
- Bidirectional matching
- Domain-specific terms

### Entity Recognition
- **Numbers**: Extracts amounts, percentages
- **Currency**: £, $, € amounts
- **Dates**: Various date formats
- **Custom**: Domain-specific entities

## 🎨 Best Practices

### 1. **Keyword Strategy**
- Use specific, meaningful keywords
- Include common misspellings
- Add synonyms for important terms
- Test with real user queries

### 2. **Response Quality**
- Keep responses concise but helpful
- Include relevant links when possible
- Use personality-appropriate tone
- Provide next steps when relevant

### 3. **Context Management**
- Don't rely too heavily on context
- Provide clear responses even without context
- Use context to enhance, not replace, responses
- Clear context when starting new topics

### 4. **Performance Optimization**
- Start with lower similarity thresholds
- Monitor response times
- Use appropriate context memory size
- Regular testing and refinement

## 🧪 Testing Your NLP

### Test Cases to Try
1. **Misspellings**: "calclator", "taxx", "incom"
2. **Synonyms**: "assist" instead of "help"
3. **Context**: Follow-up questions
4. **Sentiment**: Positive/negative messages
5. **Entities**: Messages with numbers/dates

### Example Test Conversation
```
User: "Hi there"
Bot: "Hello! How can I help you today?"

User: "I need help with calc"
Bot: "I can help you with our calculators! We have income tax, capital gains tax, and property tax calculators. Which one interests you?"

User: "The income one"
Bot: "Great! Our income tax calculator helps you calculate your tax liability. You'll need to enter your income, deductions, and other relevant information. Would you like me to guide you through the process?"

User: "How much for £50k?"
Bot: "For an income of £50,000, I can help you estimate your tax liability. The exact amount depends on your specific circumstances, but our calculator can give you a detailed breakdown. Would you like to try the calculator?"
```

## 🔍 Troubleshooting

### Common Issues

#### Chatbot Not Understanding
1. **Check similarity threshold**: Lower it for more flexible matching
2. **Add synonyms**: Include alternative terms users might use
3. **Review keywords**: Make sure they're specific and relevant
4. **Test with real queries**: Use actual user questions

#### Slow Response Times
1. **Reduce context memory**: Lower the number of remembered messages
2. **Optimize keywords**: Remove unnecessary keywords
3. **Check server resources**: Ensure adequate processing power
4. **Cache responses**: Consider implementing response caching

#### Inaccurate Responses
1. **Adjust similarity threshold**: Higher values for more precise matching
2. **Review synonym lists**: Ensure synonyms are accurate
3. **Test context logic**: Make sure context is being used correctly
4. **Monitor conversations**: Check actual user interactions

### Debug Mode
Enable debug logging to see how NLP is processing messages:

```php
// Add to wp-config.php for debugging
define('UKPA_CHATBOT_DEBUG', true);
```

## 📈 Performance Monitoring

### Key Metrics to Track
- **Response accuracy**: How often correct responses are given
- **Response time**: How quickly responses are generated
- **User satisfaction**: Feedback on chatbot interactions
- **Context effectiveness**: How well context improves responses

### Optimization Tips
1. **Regular testing**: Test with real user queries
2. **Monitor logs**: Check for processing errors
3. **Update synonyms**: Add new terms as needed
4. **Refine thresholds**: Adjust based on performance

## 🎯 Advanced Configuration

### Custom NLP Rules
You can add custom processing rules:

```php
// Example: Custom entity extraction
function custom_entity_extractor($message) {
    // Extract custom entities
    $entities = array();
    
    // Extract tax years
    preg_match_all('/tax year (\d{4})/', $message, $matches);
    if (!empty($matches[1])) {
        $entities['tax_years'] = $matches[1];
    }
    
    return $entities;
}
```

### Integration with External APIs
For even more advanced NLP, you can integrate with external services:

```php
// Example: OpenAI GPT integration
function call_openai_api($message, $context) {
    // Call OpenAI API for advanced understanding
    // Return processed response
}
```

## 🚀 Future Enhancements

### Planned Features
- **Machine Learning**: Learn from user interactions
- **Multi-language Support**: Handle multiple languages
- **Voice Integration**: Speech-to-text and text-to-speech
- **Advanced Sentiment**: More nuanced emotional understanding
- **Predictive Responses**: Suggest responses based on context

### Custom Development
The NLP system is designed to be extensible. You can:
- Add custom processing functions
- Integrate external NLP services
- Create domain-specific features
- Build custom entity extractors

---

The enhanced NLP system transforms your chatbot from a simple keyword matcher into an intelligent conversational agent that understands context, handles variations in language, and provides more natural interactions. With proper configuration and testing, it can significantly improve user experience and engagement. 