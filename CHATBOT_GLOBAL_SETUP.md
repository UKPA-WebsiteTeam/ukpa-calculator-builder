# Global Chatbot Setup Guide

## 🎯 Overview

The chatbot system now supports **global display** - meaning you can configure a chatbot to appear on **all pages** of your website automatically. This is perfect for customer support, lead generation, or general assistance.

## 🚀 Quick Setup

### Step 1: Create a Chatbot
1. Go to **WordPress Admin** → **UKPA Calculator Builder** → **Chatbots**
2. Click **"Add New"**
3. Create your chatbot with responses and configurations
4. Save the chatbot

### Step 2: Enable Global Display
1. Go to **WordPress Admin** → **UKPA Calculator Builder** → **Chatbot Settings**
2. Check **"Enable global chatbot on all pages"**
3. Select your chatbot from the dropdown
4. Choose theme and position
5. Save settings

### Step 3: Test
Visit any page on your website - the chatbot should now appear automatically!

## ⚙️ Configuration Options

### Global Settings
- **Enable/Disable**: Turn the global chatbot on or off
- **Select Chatbot**: Choose which chatbot to display globally
- **Theme**: Light or dark theme
- **Position**: Bottom-right, bottom-left, top-right, or top-left
- **Exclude Pages**: Specify pages where the chatbot should NOT appear

### Exclude Pages Format
You can exclude specific pages using:
- **Page IDs**: `1, 2, 3`
- **Page Slugs**: `about, contact, privacy-policy`
- **URL Paths**: `/admin/, /checkout/, /login/`

Separate multiple entries with commas.

## 📱 How It Works

### Automatic Display
- The chatbot is injected into the `wp_footer` hook
- Appears on every page unless excluded
- Uses the same styling and functionality as shortcode chatbots
- Maintains session state across page navigation

### Smart Exclusion
The system checks multiple ways to exclude pages:
1. **URL Path Matching**: Checks if current URL contains excluded paths
2. **Page ID Matching**: Checks if current page ID is in excluded list
3. **Page Slug Matching**: Checks if current page slug is in excluded list

### Performance Optimized
- Only loads when enabled
- CSS and JS loaded only when needed
- Database queries optimized
- No impact on page load speed

## 🎨 Customization

### Theme Options
- **Light Theme**: Clean, professional look
- **Dark Theme**: Modern, sleek appearance

### Position Options
- **Bottom Right**: Most common, doesn't interfere with content
- **Bottom Left**: Good for left-to-right reading languages
- **Top Right**: Visible immediately when page loads
- **Top Left**: Alternative for immediate visibility

### CSS Customization
You can customize the global chatbot appearance:

```css
/* Custom global chatbot styles */
.ukpa-chatbot-widget[data-position="bottom-right"] {
    /* Your custom styles */
}

.ukpa-chatbot-widget[data-theme="light"] {
    /* Light theme customizations */
}
```

## 🔧 Advanced Features

### Multiple Chatbots
You can have both:
- **Global chatbot** (appears on all pages)
- **Individual chatbots** (using shortcodes on specific pages)

They work independently and won't conflict with each other.

### Conditional Display
The global chatbot respects:
- **Page exclusions**: Won't show on excluded pages
- **User roles**: Can be extended to show/hide based on user type
- **Device type**: Responsive design works on all devices

### Analytics Integration
Global chatbot events are tracked:
- `chatbot_opened`: When user opens the chatbot
- `chatbot_message_sent`: When user sends a message
- `chatbot_closed`: When user closes the chatbot

## 🛠️ Troubleshooting

### Chatbot Not Appearing
1. **Check if enabled**: Go to Chatbot Settings and verify it's enabled
2. **Check chatbot selection**: Make sure a chatbot is selected
3. **Check exclusions**: Verify the current page isn't excluded
4. **Check browser console**: Look for JavaScript errors

### Chatbot Appearing on Excluded Pages
1. **Check exclusion format**: Make sure exclusions are properly formatted
2. **Clear cache**: Clear any caching plugins
3. **Check page ID/slug**: Verify the correct page identifier is used

### Performance Issues
1. **Check chatbot complexity**: Too many responses can slow down matching
2. **Optimize database**: Consider cleaning old conversations
3. **Check server resources**: Ensure adequate server capacity

## 📊 Monitoring

### Usage Analytics
Track global chatbot performance:
- **Page views**: Which pages get most chatbot interactions
- **Response rates**: How often users engage with the chatbot
- **Popular questions**: What users ask most frequently
- **Conversion rates**: How many chatbot interactions lead to conversions

### Maintenance
Regular maintenance tasks:
1. **Update responses**: Keep chatbot responses current
2. **Review exclusions**: Update page exclusions as needed
3. **Monitor performance**: Check for any performance issues
4. **Backup configurations**: Export chatbot settings regularly

## 🎯 Best Practices

### Content Strategy
- **Keep responses concise**: Users prefer quick, helpful answers
- **Update regularly**: Keep information current and relevant
- **Test responses**: Regularly test chatbot responses
- **Monitor feedback**: Pay attention to user interactions

### Technical Setup
- **Test thoroughly**: Test on different devices and browsers
- **Monitor performance**: Keep an eye on page load times
- **Backup regularly**: Export chatbot configurations
- **Update security**: Keep the plugin updated

### User Experience
- **Clear welcome message**: Make it obvious how to use the chatbot
- **Helpful responses**: Provide value in every interaction
- **Easy to close**: Users should be able to close easily
- **Mobile friendly**: Ensure it works well on mobile devices

## 🔄 Migration from Shortcode

If you're currently using shortcodes and want to switch to global display:

1. **Create global chatbot**: Use the same chatbot or create a new one
2. **Enable global display**: Turn on global chatbot in settings
3. **Test thoroughly**: Make sure it works as expected
4. **Remove shortcodes**: Gradually remove shortcodes from pages
5. **Monitor performance**: Track any changes in user engagement

## 📞 Support

For issues or questions:
1. Check the main plugin documentation
2. Review the troubleshooting section above
3. Contact plugin support
4. Check WordPress error logs for any issues

---

The global chatbot feature provides a powerful way to engage visitors across your entire website while maintaining flexibility and control over where and how it appears. 