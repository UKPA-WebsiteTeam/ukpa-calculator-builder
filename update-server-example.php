<?php
/**
 * Example Update Server for UKPA Calculator Builder
 * 
 * This is an example of what your update server should look like.
 * Host this on your server (e.g., https://ukpacalculator.com/api/plugin-updates/)
 * 
 * The plugin will send POST requests to this endpoint to check for updates.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the request data
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST; // Fallback to POST data
}

$action = $input['action'] ?? '';
$plugin_slug = $input['plugin_slug'] ?? '';
$current_version = $input['current_version'] ?? '';
$license_key = $input['license_key'] ?? '';
$site_url = $input['site_url'] ?? '';

// Validate required fields
if (empty($action) || empty($plugin_slug)) {
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

// Handle different actions
switch ($action) {
    case 'get_update_info':
        handle_get_update_info($plugin_slug, $current_version, $license_key, $site_url);
        break;
    
    case 'validate_license':
        handle_validate_license($license_key, $site_url);
        break;
    
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action'
        ]);
        exit;
}

/**
 * Handle update info request
 */
function handle_get_update_info($plugin_slug, $current_version, $license_key, $site_url) {
    // Validate license (you should implement your own license validation)
    if (!validate_license($license_key, $site_url)) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid or expired license'
        ]);
        return;
    }
    
    // Define your latest version info
    $latest_version = '1.1.5'; // Update this when you release a new version
    
    // Check if update is needed
    if (version_compare($current_version, $latest_version, '>=')) {
        echo json_encode([
            'success' => true,
            'data' => null // No update available
        ]);
        return;
    }
    
    // Return update information
    $update_info = [
        'version' => $latest_version,
        'homepage' => 'https://ukpacalculator.com/calculator-builder',
        'download_url' => 'https://ukpacalculator.com/downloads/ukpa-calculator-builder-' . $latest_version . '.zip',
        'requires' => '5.0',
        'requires_php' => '7.4',
        'tested' => '6.4',
        'last_updated' => '2024-01-15',
        'author' => 'Abishek Patel',
        'author_profile' => 'https://ukpacalculator.com',
        'description' => 'Create advanced HTMX-powered calculators for property and accounting scenarios using a flexible drag-and-drop builder.',
        'changelog' => "
## Version {$latest_version} - January 15, 2024

### New Features
- Added auto-update functionality
- Improved result rendering performance
- Enhanced conditional logic editor

### Bug Fixes
- Fixed issue with other result elements not rendering
- Resolved currency formatting problems
- Fixed dropdown population in builder

### Improvements
- Better error handling and user feedback
- Optimized frontend JavaScript loading
- Enhanced security with improved nonce validation
        ",
        'installation' => 'Upload the plugin files to the /wp-content/plugins/ukpa-calculator-builder directory, or install through WordPress plugin screen.',
        'screenshots' => [
            'https://ukpacalculator.com/screenshots/builder-interface.png',
            'https://ukpacalculator.com/screenshots/frontend-calculator.png'
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $update_info
    ]);
}

/**
 * Handle license validation
 */
function handle_validate_license($license_key, $site_url) {
    $is_valid = validate_license($license_key, $site_url);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'valid' => $is_valid,
            'expires' => $is_valid ? '2025-12-31' : null,
            'type' => $is_valid ? 'premium' : null
        ]
    ]);
}

/**
 * Validate license key (implement your own logic)
 */
function validate_license($license_key, $site_url) {
    // This is where you would implement your license validation logic
    // You might want to:
    // 1. Check against a database of valid licenses
    // 2. Verify the license hasn't expired
    // 3. Check if the site URL is authorized for this license
    // 4. Validate against an external licensing service
    
    // For now, we'll use a simple example
    if (empty($license_key)) {
        return false;
    }
    
    // Example: Check if license key matches a pattern
    if (preg_match('/^UKPA-[A-Z0-9]{16}$/', $license_key)) {
        return true;
    }
    
    // You could also check against a database:
    /*
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
    */
    
    return false;
}

/**
 * Log update requests (optional)
 */
function log_update_request($data) {
    $log_file = __DIR__ . '/update-requests.log';
    $log_entry = date('Y-m-d H:i:s') . ' - ' . json_encode($data) . "\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
} 