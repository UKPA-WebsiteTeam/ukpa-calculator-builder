# UKPA Chat Box System

A streamlined chat box system that communicates directly with your trained Node.js backend model.

## 🎯 **Overview**

The Chat Box system provides a clean, focused interface for communicating with your trained AI model. Unlike the full chatbot system, this focuses specifically on:

- **Direct backend communication** with your trained model
- **Simple configuration** for backend URL and API settings
- **Global display** across your website
- **Secure proxy** through WordPress to protect your backend

## 📁 **File Structure**

```
ukpa-calculator-builder/
├── includes/
│   └── chatbox.php              # Core chat box system
├── admin/
│   └── chatbox-settings.php     # Settings management
├── assets/
│   ├── css/
│   │   ├── chatbox-frontend.css # Frontend styling
│   │   └── chatbox-admin.css    # Admin styling
│   └── js/
│       ├── chatbox-frontend.js  # Frontend functionality
│       └── chatbox-admin.js     # Admin functionality
└── chatbot/                     # Old chatbot files (moved)
    ├── includes/
    ├── admin/
    └── assets/
```

## ⚙️ **Configuration**

### **Backend Settings**

1. **Backend URL**: Your Node.js API endpoint (e.g., `https://your-backend.com/api/chat`)
2. **API Key** (Optional): For authentication with your backend
3. **Timeout**: Maximum time to wait for response (5-120 seconds)

### **Appearance Settings**

1. **Theme**: Light or Dark theme
2. **Position**: Bottom-right, Bottom-left, Top-right, Top-left
3. **Welcome Message**: Initial message shown to users
4. **Input Placeholder**: Placeholder text in input field

### **Behavior Settings**

1. **Enable/Disable**: Toggle chat box globally
2. **Exclude Pages**: Comma-separated list of pages to exclude
3. **Shortcode**: `[ukpa_chatbox id="custom"]` for specific pages

## 🔧 **Backend API Requirements**

Your Node.js backend should accept POST requests with this structure:

### **Request Format**
```json
{
  "message": "User's message",
  "session_id": "unique_session_id",
  "timestamp": 1234567890,
  "user_agent": "Browser user agent",
  "ip_address": "user_ip_address",
  "api_key": "optional_api_key"
}
```

### **Expected Response**
```json
{
  "response": "AI model response",
  "model_info": {
    "model_name": "your_model_name",
    "confidence": 0.95,
    "processing_time": 1500
  }
}
```

## 🚀 **Features**

### **Core Features**
- ✅ **Direct backend communication** with your trained model
- ✅ **Global display** across all pages
- ✅ **Secure proxy** through WordPress
- ✅ **Session management** for conversation continuity
- ✅ **Error handling** with user-friendly messages
- ✅ **Timeout protection** to prevent hanging requests

### **UI Features**
- ✅ **Modern design** with light/dark themes
- ✅ **Responsive layout** for mobile devices
- ✅ **Typing indicators** for better UX
- ✅ **Auto-resize textarea** for long messages
- ✅ **Keyboard shortcuts** (Enter to send, Escape to close)
- ✅ **Accessibility support** for screen readers

### **Admin Features**
- ✅ **Connection testing** to verify backend setup
- ✅ **Real-time validation** of settings
- ✅ **Auto-save** functionality
- ✅ **Shortcode copying** for easy implementation
- ✅ **Page exclusion** management

## 🔒 **Security Features**

### **Request Security**
- **Nonce verification** for all AJAX requests
- **Input sanitization** for all user inputs
- **XSS protection** through HTML escaping
- **CSRF protection** via WordPress nonces

### **Backend Security**
- **API key authentication** (optional)
- **IP address logging** for security monitoring
- **User agent tracking** for request validation
- **Timeout limits** to prevent abuse

## 📱 **Usage**

### **Global Display**
1. Go to **UKPA Calculator Builder > Chat Box**
2. Enable the chat box
3. Configure your backend URL
4. Save settings
5. Chat box appears on all pages

### **Shortcode Usage**
```php
// Display on specific page
[ukpa_chatbox id="custom"]

// Multiple chat boxes on same page
[ukpa_chatbox id="support"]
[ukpa_chatbox id="sales"]
```

### **Customization**
```css
/* Custom styling */
.ukpa-chatbox {
    /* Your custom styles */
}

.ukpa-chatbox-message-user .ukpa-chatbox-message-content {
    background: #your-brand-color;
}
```

## 🔧 **Backend Integration**

### **Node.js Example**
```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { message, session_id, api_key } = req.body;
        
        // Validate API key if required
        if (process.env.API_KEY && api_key !== process.env.API_KEY) {
            return res.status(403).json({ error: 'Invalid API key' });
        }
        
        // Process with your trained model
        const response = await yourModel.process(message, session_id);
        
        res.json({
            response: response.text,
            model_info: {
                model_name: 'your-model-name',
                confidence: response.confidence,
                processing_time: response.time
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Chat backend running on port 3000');
});
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Connection Failed**
   - Check backend URL is correct
   - Verify backend is running
   - Check firewall/network settings
   - Test with curl: `curl -X POST your-backend-url`

2. **Timeout Errors**
   - Increase timeout in settings
   - Check backend processing time
   - Optimize your model response time

3. **Chat Box Not Appearing**
   - Check if enabled in settings
   - Verify page is not in exclude list
   - Check browser console for JavaScript errors

4. **Messages Not Sending**
   - Check browser network tab
   - Verify AJAX endpoint is working
   - Check WordPress debug log

### **Debug Mode**
Enable WordPress debug mode to see detailed error messages:
```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## 📊 **Analytics**

The system includes optional analytics tracking:
- Message sent/received events
- Session duration tracking
- Error rate monitoring
- User engagement metrics

## 🔄 **Migration from Chatbot System**

The old chatbot files have been moved to the `chatbot/` folder. To completely remove them:

1. Delete the `chatbot/` folder
2. Remove chatbot includes from `ukpa-calculator-builder.php`
3. Update any existing chatbot shortcodes to use chat box

## 📝 **API Reference**

### **Frontend JavaScript**
```javascript
// Access chat box instance
window.UKPAChatbox

// Send message programmatically
UKPAChatbox.sendMessage('Hello', $chatbox);

// Track events
UKPAChatbox.trackEvent('message_sent', { length: 50 });
```

### **Backend API Endpoints**
- `POST /api/chat` - Main chat endpoint
- `GET /api/health` - Health check (optional)
- `POST /api/validate` - API key validation (optional)

## 🎨 **Customization**

### **Themes**
The system supports light and dark themes. Custom themes can be added by extending the CSS classes.

### **Positions**
Four standard positions are supported. Custom positions can be added via CSS.

### **Styling**
All styling is done through CSS classes for easy customization without modifying core files.

## 📞 **Support**

For issues or questions:
1. Check the troubleshooting section
2. Review WordPress debug logs
3. Test backend connectivity manually
4. Verify all settings are correct

---

**Note**: This chat box system is designed to be lightweight and focused on direct communication with your trained model. For more complex chatbot features, consider using the full chatbot system in the `chatbot/` folder. 