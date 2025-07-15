<?php
/**
 * Production Update Server for UKPA Calculator Builder
 * 
 * This is a production-ready update server with proper license management.
 * Host this on your server and configure the database connection.
 */

// Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// Security settings
define('RATE_LIMIT_PER_HOUR', 100); // Max requests per hour per license
define('LOG_REQUESTS', true); // Enable request logging

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

// Initialize database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log('UKPA Update Server DB Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed'
    ]);
    exit;
}

// Handle different actions
switch ($action) {
    case 'get_update_info':
        handle_get_update_info($pdo, $plugin_slug, $current_version, $license_key, $site_url);
        break;
    
    case 'validate_license':
        handle_validate_license($pdo, $license_key, $site_url);
        break;
    
    case 'activate_license':
        handle_activate_license($pdo, $license_key, $site_url);
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
function handle_get_update_info($pdo, $plugin_slug, $current_version, $license_key, $site_url) {
    // Check rate limiting
    if (!check_rate_limit($pdo, $license_key)) {
        echo json_encode([
            'success' => false,
            'error' => 'Rate limit exceeded. Please try again later.'
        ]);
        return;
    }
    
    // Validate license
    $license_info = validate_license_key($pdo, $license_key, $site_url);
    if (!$license_info) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid or expired license'
        ]);
        return;
    }
    
    // Log the request
    log_request($pdo, $license_key, $site_url, 'update_check');
    
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
function handle_validate_license($pdo, $license_key, $site_url) {
    $license_info = validate_license_key($pdo, $license_key, $site_url);
    
    if ($license_info) {
        echo json_encode([
            'success' => true,
            'data' => [
                'valid' => true,
                'expires' => $license_info['expires_date'],
                'type' => $license_info['license_type'],
                'max_domains' => $license_info['max_domains'],
                'authorized_domains' => json_decode($license_info['authorized_domains'], true)
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => [
                'valid' => false,
                'expires' => null,
                'type' => null
            ]
        ]);
    }
}

/**
 * Handle license activation
 */
function handle_activate_license($pdo, $license_key, $site_url) {
    $license_info = validate_license_key($pdo, $license_key, $site_url);
    
    if (!$license_info) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid license key'
        ]);
        return;
    }
    
    // Check if domain is already authorized
    $authorized_domains = json_decode($license_info['authorized_domains'], true) ?: [];
    
    if (in_array($site_url, $authorized_domains)) {
        echo json_encode([
            'success' => true,
            'message' => 'License already activated for this domain'
        ]);
        return;
    }
    
    // Check if we can add more domains
    if (count($authorized_domains) >= $license_info['max_domains']) {
        echo json_encode([
            'success' => false,
            'error' => 'Maximum number of domains reached for this license'
        ]);
        return;
    }
    
    // Add the domain
    $authorized_domains[] = $site_url;
    
    $stmt = $pdo->prepare('UPDATE ukpa_licenses SET authorized_domains = ? WHERE license_key = ?');
    $stmt->execute([json_encode($authorized_domains), $license_key]);
    
    log_request($pdo, $license_key, $site_url, 'license_activation');
    
    echo json_encode([
        'success' => true,
        'message' => 'License activated successfully for this domain'
    ]);
}

/**
 * Validate license key against database
 */
function validate_license_key($pdo, $license_key, $site_url) {
    if (empty($license_key)) {
        return false;
    }
    
    $stmt = $pdo->prepare('
        SELECT * FROM ukpa_licenses 
        WHERE license_key = ? 
        AND status = "active" 
        AND (expires_date IS NULL OR expires_date > NOW())
    ');
    $stmt->execute([$license_key]);
    $license = $stmt->fetch();
    
    if (!$license) {
        return false;
    }
    
    // Check if domain is authorized
    $authorized_domains = json_decode($license['authorized_domains'], true) ?: [];
    
    // For unlimited licenses, allow any domain
    if ($license['license_type'] === 'unlimited') {
        return $license;
    }
    
    // For single/multi licenses, check domain authorization
    if (in_array($site_url, $authorized_domains)) {
        return $license;
    }
    
    // If no domains are authorized yet, allow the first one
    if (empty($authorized_domains) && $license['license_type'] === 'single') {
        return $license;
    }
    
    return false;
}

/**
 * Check rate limiting
 */
function check_rate_limit($pdo, $license_key) {
    $stmt = $pdo->prepare('
        SELECT COUNT(*) as count 
        FROM ukpa_request_logs 
        WHERE license_key = ? 
        AND request_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ');
    $stmt->execute([$license_key]);
    $result = $stmt->fetch();
    
    return $result['count'] < RATE_LIMIT_PER_HOUR;
}

/**
 * Log request for analytics and rate limiting
 */
function log_request($pdo, $license_key, $site_url, $action) {
    if (!LOG_REQUESTS) {
        return;
    }
    
    try {
        $stmt = $pdo->prepare('
            INSERT INTO ukpa_request_logs (license_key, site_url, action, request_time, ip_address)
            VALUES (?, ?, ?, NOW(), ?)
        ');
        $stmt->execute([
            $license_key,
            $site_url,
            $action,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        error_log('UKPA Update Server Log Error: ' . $e->getMessage());
    }
}

/**
 * Create database tables (run this once to set up the database)
 */
function create_database_tables($pdo) {
    $sql = "
    CREATE TABLE IF NOT EXISTS ukpa_licenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        license_key VARCHAR(255) UNIQUE NOT NULL,
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        license_type ENUM('single', 'multi', 'unlimited') DEFAULT 'single',
        status ENUM('active', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_date DATETIME NULL,
        max_domains INT DEFAULT 1,
        authorized_domains JSON,
        last_check DATETIME,
        check_count INT DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS ukpa_request_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        license_key VARCHAR(255),
        site_url VARCHAR(255),
        action VARCHAR(50),
        request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        INDEX idx_license_time (license_key, request_time),
        INDEX idx_action_time (action, request_time)
    );
    ";
    
    try {
        $pdo->exec($sql);
        return true;
    } catch (Exception $e) {
        error_log('UKPA Update Server Table Creation Error: ' . $e->getMessage());
        return false;
    }
}

// Uncomment the line below to create tables (run once)
// create_database_tables($pdo); 