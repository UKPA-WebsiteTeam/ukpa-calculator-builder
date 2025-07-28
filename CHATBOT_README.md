# UKPA Calculator Builder - Chatbot System

A comprehensive chatbot system integrated into the UKPA Calculator Builder WordPress plugin. This system allows you to create, configure, and deploy intelligent chatbots on your website.

## Features

### 🎯 Core Features
- **Visual Chatbot Builder**: Easy-to-use admin interface for creating chatbots
- **Keyword-based Responses**: Simple keyword matching for quick responses
- **Regex Pattern Matching**: Advanced pattern matching for complex interactions
- **Multiple Personalities**: Choose from helpful, professional, friendly, or casual tones
- **Conversation History**: Track and store all chatbot conversations
- **Shortcode Integration**: Easy embedding with WordPress shortcodes
- **Responsive Design**: Works perfectly on desktop and mobile devices

### 🎨 Customization Options
- **Multiple Positions**: bottom-right, bottom-left, top-right, top-left
- **Theme Support**: Light and dark themes
- **Custom Styling**: Fully customizable CSS
- **Accessibility**: WCAG compliant with ARIA labels and keyboard navigation

### 📊 Analytics & Tracking
- **Conversation Analytics**: Track chatbot usage and interactions
- **Google Analytics Integration**: Automatic event tracking
- **Facebook Pixel Support**: Track chatbot events for marketing
- **Session Management**: Unique session tracking for each user

## Installation & Setup

### 1. Database Setup
The chatbot system automatically creates the required database tables when the plugin is activated:

- `wp_ukpa_chatbots`: Stores chatbot configurations
- `wp_ukpa_chatbot_conversations`: Stores conversation history

### 2. Admin Interface
Access the chatbot management interface at:
- **WordPress Admin** → **UKPA Calculator Builder** → **Chatbots**

## Creating Your First Chatbot

### Step 1: Basic Configuration
1. Go to **UKPA Calculator Builder** → **Chatbots** → **Add New**
2. Fill in the basic information:
   - **Name**: Your chatbot's name (e.g., "Customer Support Bot")
   - **Description**: Brief description of the chatbot's purpose
   - **Welcome Message**: The first message users see
   - **Personality**: Choose the tone (helpful, professional, friendly, casual)
   - **Fallback Response**: What to say when no match is found

### Step 2: Add Responses
Add keyword-based responses:

1. Click **"Add Response"**
2. Enter **Keywords**: Comma-separated keywords (e.g., "hello, hi, hey")
3. Enter **Response**: The bot's reply
4. **Exact Match**: Check if you want exact keyword matching

**Example Response:**
- Keywords: `hello, hi, hey, good morning`
- Response: `Hello! How can I help you today? I can assist with calculator questions, pricing, or general support.`

### Step 3: Add Intent Patterns (Advanced)
For more complex matching, use regex patterns:

1. Click **"Add Intent"**
2. Enter **Patterns**: One regex pattern per line
3. Enter **Response**: The bot's reply

**Example Patterns:**
```
/calculator/i
/tax.*calculator/i
/how.*calculate/i
```

### Step 4: Preview & Test
- Use the preview panel to see how your chatbot will look
- Test different responses and configurations
- Save your chatbot when ready

## Using Your Chatbot

### Shortcode Method
Embed your chatbot anywhere using the shortcode:

```php
[ukpa_chatbot id="1"]
```

**Available Parameters:**
- `id`: Chatbot ID (required)
- `theme`: "light" or "dark" (default: "light")
- `position`: "bottom-right", "bottom-left", "top-right", "top-left" (default: "bottom-right")

**Examples:**
```php
[ukpa_chatbot id="1" theme="dark" position="bottom-left"]
[ukpa_chatbot id="2" theme="light" position="top-right"]
```

### PHP Method
You can also embed chatbots directly in your theme:

```php
<?php echo do_shortcode('[ukpa_chatbot id="1"]'); ?>
```

### Multiple Chatbots
You can have multiple chatbots on the same page:

```php
[ukpa_chatbot id="1" position="bottom-right"]
[ukpa_chatbot id="2" position="bottom-left"]
```

## Advanced Configuration

### Personality Types

#### Helpful (Default)
- Neutral, informative responses
- No additional formatting

#### Professional
- Responses prefixed with "Thank you for your inquiry."
- Formal tone

#### Friendly
- Responses prefixed with "Hi there!"
- Warm, approachable tone

#### Casual
- Responses prefixed with "Hey!"
- Relaxed, informal tone

### Response Matching Priority

1. **Exact Keyword Matches**: Highest priority
2. **Keyword Matches**: Case-insensitive partial matching
3. **Regex Pattern Matches**: Advanced pattern matching
4. **Fallback Response**: When no matches are found

### Example Chatbot Configuration

```json
{
  "welcome_message": "Hello! I'm your UKPA calculator assistant. How can I help you today?",
  "personality": "helpful",
  "fallback": "I'm sorry, I don't understand. Can you please rephrase your question?",
  "responses": [
    {
      "keywords": ["calculator", "calc", "calculate"],
      "response": "I can help you with various calculators including income tax, capital gains tax, and property tax calculators. Which one interests you?",
      "exact_match": false
    },
    {
      "keywords": ["income tax", "income"],
      "response": "Our income tax calculator can help you calculate your tax liability. Would you like me to guide you through the process?",
      "exact_match": false
    },
    {
      "keywords": ["hello", "hi", "hey"],
      "response": "Hello! Welcome to UKPA Calculators. I'm here to help you with any questions about our tax calculators.",
      "exact_match": false
    }
  ],
  "intents": [
    {
      "patterns": ["/help/i", "/support/i"],
      "response": "I'm here to help! You can ask me about our calculators, how to use them, or get general support. What do you need help with?"
    },
    {
      "patterns": ["/contact/i", "/email/i", "/phone/i"],
      "response": "You can contact our support team at support@ukpacalculator.com or call us at +44 123 456 7890. We're available Monday to Friday, 9 AM to 5 PM."
    }
  ]
}
```

## Analytics & Tracking

### Google Analytics Events
The chatbot automatically tracks these events:
- `chatbot_opened`: When a user opens the chatbot
- `chatbot_message_sent`: When a user sends a message
- `chatbot_closed`: When a user closes the chatbot

### Facebook Pixel Events
If Facebook Pixel is installed, these events are tracked:
- `chatbot_opened`
- `chatbot_message_sent`

### Custom Analytics
You can add custom tracking by modifying the `trackChatbotEvent` function in `assets/js/chatbot-frontend.js`.

## Styling & Customization

### CSS Customization
The chatbot uses these CSS classes for styling:

```css
/* Main widget container */
.ukpa-chatbot-widget

/* Toggle button */
.ukpa-chatbot-toggle

/* Chat container */
.ukpa-chatbot-container

/* Messages */
.ukpa-chatbot-message
.ukpa-chatbot-message.bot
.ukpa-chatbot-message.user

/* Input area */
.ukpa-chatbot-input
.ukpa-chatbot-text-input
.ukpa-chatbot-send
```

### Theme Customization
You can create custom themes by adding CSS:

```css
/* Custom theme example */
.ukpa-chatbot-widget[data-theme="custom"] .ukpa-chatbot-toggle {
    background: #your-color;
}

.ukpa-chatbot-widget[data-theme="custom"] .ukpa-chatbot-container {
    background: #your-background;
}
```

## Troubleshooting

### Common Issues

#### Chatbot Not Appearing
1. Check if the chatbot ID exists in the database
2. Verify the shortcode syntax
3. Check browser console for JavaScript errors

#### Responses Not Working
1. Verify keyword spelling and case sensitivity
2. Check if exact match is enabled when needed
3. Test regex patterns separately

#### Styling Issues
1. Check for CSS conflicts with your theme
2. Verify CSS files are loading properly
3. Clear browser cache

### Debug Mode
Enable debug mode by adding this to your `wp-config.php`:

```php
define('UKPA_CHATBOT_DEBUG', true);
```

This will log chatbot interactions to the WordPress debug log.

## API Reference

### AJAX Endpoints

#### Save Chatbot
```
POST /wp-admin/admin-ajax.php
Action: ukpa_save_chatbot
```

#### Get Chatbots
```
POST /wp-admin/admin-ajax.php
Action: ukpa_get_chatbots
```

#### Delete Chatbot
```
POST /wp-admin/admin-ajax.php
Action: ukpa_delete_chatbot
```

#### Send Message
```
POST /wp-admin/admin-ajax.php
Action: ukpa_chatbot_message
```

### Database Schema

#### Chatbots Table
```sql
CREATE TABLE wp_ukpa_chatbots (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    description text,
    config longtext NOT NULL,
    status varchar(20) DEFAULT 'active',
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

#### Conversations Table
```sql
CREATE TABLE wp_ukpa_chatbot_conversations (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    chatbot_id mediumint(9) NOT NULL,
    session_id varchar(255) NOT NULL,
    user_message text NOT NULL,
    bot_response text NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY chatbot_id (chatbot_id),
    KEY session_id (session_id)
);
```

## Security Considerations

### Data Protection
- All user inputs are sanitized before processing
- SQL queries use prepared statements
- Nonces are used for all AJAX requests
- XSS protection through output escaping

### Privacy Compliance
- Conversation data is stored locally
- No external API calls (unless configured)
- GDPR compliant data handling
- User consent can be implemented

## Performance Optimization

### Caching
- Chatbot configurations are cached
- Database queries are optimized
- Static assets are minified

### Load Optimization
- CSS and JS files are loaded only when needed
- Images are optimized and compressed
- Lazy loading for better performance

## Support & Maintenance

### Regular Maintenance
1. **Database Cleanup**: Remove old conversations periodically
2. **Configuration Backup**: Export chatbot configurations
3. **Performance Monitoring**: Monitor response times
4. **Security Updates**: Keep the plugin updated

### Best Practices
1. **Test Thoroughly**: Test all responses before going live
2. **Monitor Usage**: Track chatbot performance and user satisfaction
3. **Update Regularly**: Keep responses current and relevant
4. **Backup Data**: Regular backups of chatbot configurations

## Changelog

### Version 1.0.0
- Initial release
- Basic chatbot functionality
- Admin interface
- Shortcode support
- Responsive design
- Analytics integration

## License

This chatbot system is part of the UKPA Calculator Builder plugin and follows the same license terms.

---

For support and questions, please contact the plugin developer or check the main plugin documentation. 