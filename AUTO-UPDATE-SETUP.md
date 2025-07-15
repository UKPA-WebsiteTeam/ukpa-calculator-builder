# UKPA Calculator Builder - Auto Update Setup Guide

This guide explains how to set up automatic updates for your UKPA Calculator Builder plugin.

## Overview

The plugin now includes a custom auto-update system that allows you to:
- Check for updates automatically
- Download and install updates through WordPress admin
- Manage license keys for premium features
- Control update distribution

## Setup Instructions

### 1. Update Server Setup

You need to host the update server on your domain. The example file `update-server-example.php` shows what your server should look like.

**Steps:**
1. Upload `update-server-example.php` to your server (e.g., `https://ukpacalculator.com/api/plugin-updates/`)
2. Customize the server code to match your needs
3. Update the `$update_url` in `includes/auto-updater.php` to point to your server

### 2. License Key Management

The plugin now supports license key validation. You can implement your own license system by:

1. **Simple Pattern Matching** (already implemented):
   ```php
   // License keys must match: UKPA-XXXXXXXXXXXXXXX (16 characters)
   if (preg_match('/^UKPA-[A-Z0-9]{16}$/', $license_key)) {
       return true;
   }
   ```

2. **Database Validation** (recommended for production):
   ```php
   // Check against your database
   $db = new PDO('mysql:host=localhost;dbname=your_db', 'username', 'password');
   $stmt = $db->prepare('SELECT * FROM licenses WHERE license_key = ? AND status = "active"');
   $stmt->execute([$license_key]);
   $license = $stmt->fetch();
   
   if ($license) {
       // Check if site URL is authorized
       $authorized_sites = json_decode($license['authorized_sites'], true);
       if (in_array($site_url, $authorized_sites)) {
           return true;
       }
   }
   ```

### 3. Version Management

When you release a new version:

1. **Update the version number** in your main plugin file:
   ```php
   /**
    * Version: 1.1.5
    */
   ```

2. **Update the version in the auto-updater**:
   ```php
   $this->version = '1.1.5';
   ```

3. **Update the server** to return the new version:
   ```php
   $latest_version = '1.1.5';
   ```

4. **Create a ZIP file** of your plugin and upload it to your server

### 4. Update Server Configuration

Your update server should return JSON in this format:

```json
{
    "success": true,
    "data": {
        "version": "1.1.5",
        "homepage": "https://ukpacalculator.com/calculator-builder",
        "download_url": "https://ukpacalculator.com/downloads/ukpa-calculator-builder-1.1.5.zip",
        "requires": "5.0",
        "requires_php": "7.4",
        "tested": "6.4",
        "last_updated": "2024-01-15",
        "author": "Abishek Patel",
        "author_profile": "https://ukpacalculator.com",
        "description": "Plugin description...",
        "changelog": "## Version 1.1.5\n\n### New Features\n- Feature 1\n- Feature 2\n\n### Bug Fixes\n- Fix 1\n- Fix 2",
        "installation": "Installation instructions...",
        "screenshots": [
            "https://ukpacalculator.com/screenshots/screenshot1.png"
        ]
    }
}
```

## How It Works

### 1. Update Check Process
1. WordPress checks for updates every 12 hours
2. Plugin sends request to your update server with:
   - Current plugin version
   - License key
   - Site URL
   - WordPress version
3. Server validates license and returns update info
4. If update is available, WordPress shows update notification

### 2. Update Installation
1. User clicks "Update Now" in WordPress admin
2. WordPress downloads the ZIP file from your server
3. Plugin is automatically updated
4. Post-update hooks run (clear cache, run migrations, etc.)

### 3. License Validation
1. Plugin sends license key to server on each update check
2. Server validates the key against your database/system
3. Only valid licenses receive updates

## Security Considerations

### 1. License Key Security
- Use strong, unique license keys
- Implement rate limiting on your server
- Log all license validation attempts
- Consider using HTTPS for all communications

### 2. Update Server Security
- Validate all incoming requests
- Implement proper authentication
- Use HTTPS for download URLs
- Monitor for abuse

### 3. File Security
- Host update files on a secure server
- Validate ZIP files before serving
- Use proper file permissions

## Testing the System

### 1. Test Update Check
1. Set up your update server
2. Configure a test license key
3. Trigger an update check from WordPress admin
4. Verify the response in browser dev tools

### 2. Test Update Installation
1. Create a test version with a higher version number
2. Upload the ZIP file to your server
3. Update the server to return the new version
4. Test the update process in WordPress

### 3. Test License Validation
1. Test with valid license keys
2. Test with invalid license keys
3. Test with expired licenses
4. Verify proper error handling

## Troubleshooting

### Common Issues

1. **Updates not showing**: Check if license key is valid and server is responding
2. **Download fails**: Verify ZIP file URL is accessible and file exists
3. **License validation fails**: Check server logs and license database
4. **Update installation fails**: Check file permissions and WordPress update directory

### Debug Information

Enable WordPress debug logging to see detailed information:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Check the debug log for update-related messages.

## Advanced Features

### 1. Staged Rollouts
You can implement staged rollouts by checking user/site criteria in your update server:

```php
// Only release to 10% of users initially
$user_hash = crc32($site_url);
if ($user_hash % 10 !== 0) {
    // Don't show update to this user yet
    return null;
}
```

### 2. Beta Testing
Create separate update channels for beta testing:

```php
if ($license_key === 'BETA-TESTER-KEY') {
    $latest_version = '1.1.5-beta';
} else {
    $latest_version = '1.1.4';
}
```

### 3. Analytics
Track update adoption by logging update requests:

```php
function log_update_request($data) {
    $log_file = __DIR__ . '/update-analytics.log';
    $log_entry = date('Y-m-d H:i:s') . ' - ' . json_encode($data) . "\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}
```

## Support

If you need help setting up the auto-update system:

1. Check the WordPress debug log for errors
2. Verify your server is responding correctly
3. Test with a simple license key first
4. Contact support with specific error messages

## Files Modified

- `includes/auto-updater.php` - New auto-update system
- `admin/settings.php` - Updated settings page with license management
- `includes/ajax.php` - Added cache clearing functionality
- `ukpa-calculator-builder.php` - Added auto-updater include

## Next Steps

1. Set up your update server
2. Configure license validation
3. Test the system thoroughly
4. Deploy to production
5. Monitor update adoption and any issues 