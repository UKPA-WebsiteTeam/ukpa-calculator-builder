<?php
// ✅ Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ✅ Handle AJAX save for calculators
add_action('wp_ajax_ukpa_save_calculator', 'handle_ukpa_save_calculator');
add_action('wp_ajax_nopriv_ukpa_save_calculator', 'handle_ukpa_save_calculator');
add_action('wp_ajax_ukpa_unified_save_calculator', 'handle_ukpa_unified_save_calculator');
function handle_ukpa_unified_save_calculator() {
    if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'ukpa_save_calc_nonce')) {
        wp_send_json_error(['message' => 'Invalid nonce']);
    }

    $calc_id = sanitize_text_field($_POST['calculator_id'] ?? '');
    $elements = json_decode(stripslashes($_POST['elements'] ?? ''), true);
    $dynamic_keys = json_decode(stripslashes($_POST['dynamic_keys'] ?? ''), true);
    $title = sanitize_text_field($_POST['title'] ?? 'Untitled Calculator');
    $route = sanitize_text_field($_POST['backend_route'] ?? '');

    // ✅ Add these
    $custom_css = sanitize_textarea_field($_POST['custom_css'] ?? '');
    $custom_js = sanitize_textarea_field($_POST['custom_js'] ?? '');

    if (!$calc_id || !is_array($elements)) {
        wp_send_json_error(['message' => 'Missing or invalid data']);
    }

    $old = get_option('ukpa_calc_' . $calc_id, []);
    $old['title'] = $title;
    $old['route'] = $route;
    $old['elements'] = $elements;

    // ✅ Add these to store custom code
    $old['ukpa_builder_css'] = $custom_css;
    $old['ukpa_builder_js'] = $custom_js;

    // ✅ Store dynamic result keys if present
    if (is_array($dynamic_keys)) {
        $old['dynamicResultKeys'] = $dynamic_keys;
    }

    $success = update_option('ukpa_calc_' . $calc_id, $old);

    if ($success || get_option("ukpa_calc_$calc_id") === $old) {
        wp_send_json_success(['message' => $success ? 'Saved successfully' : 'No changes detected, but considered successful']);
    } else {
        wp_send_json_error(['message' => 'Failed to save calculator']);
    }

}


add_action('wp_ajax_ukpa_save_result_keys', function () {
  check_ajax_referer('ukpa_save_calc_nonce');

  $calc_id = sanitize_text_field($_POST['calc_id']);
  $keys = json_decode(stripslashes($_POST['keys']), true);
  $sample = isset($_POST['sample']) ? json_decode(stripslashes($_POST['sample']), true) : null;

  if (!$calc_id || !is_array($keys)) {
    wp_send_json_error(['message' => 'Invalid data']);
  }

  $data = get_option('ukpa_calc_' . $calc_id, []);
  $data['dynamicResultKeys'] = array_values($keys);
  if ($sample && is_array($sample)) {
    $data['dynamicResultSample'] = $sample;
  }
  update_option('ukpa_calc_' . $calc_id, $data);

  wp_send_json_success(['saved' => $keys, 'sample' => $sample]);
});

// --- AJAX proxy for frontend API calls ---
add_action('wp_ajax_ukpa_proxy_api', 'ukpa_proxy_api_handler');
add_action('wp_ajax_nopriv_ukpa_proxy_api', 'ukpa_proxy_api_handler');

// --- AJAX handlers for admin functions ---
add_action('wp_ajax_ukpa_clear_update_cache', 'ukpa_clear_update_cache_handler');

function ukpa_clear_update_cache_handler() {
    if (!wp_verify_nonce($_POST['nonce'], 'ukpa_clear_cache')) {
        wp_send_json_error(['message' => 'Invalid nonce']);
    }
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Insufficient permissions']);
    }
    
    // Clear the update cache
    delete_transient('ukpa_plugin_update_info');
    
    wp_send_json_success(['message' => 'Update cache cleared successfully']);
}

// --- Universal AJAX proxy for modular IDV form ---
add_action('wp_ajax_ukpa_idv_proxy', 'ukpa_idv_proxy_handler');
add_action('wp_ajax_nopriv_ukpa_idv_proxy', 'ukpa_idv_proxy_handler');

function ukpa_idv_proxy_handler() {
    // Security: check nonce if provided
    $nonce = $_POST['nonce'] ?? '';
    if ($nonce && !wp_verify_nonce($nonce, 'ukpa_idv_form_nonce')) {
        wp_send_json_error(['message' => 'Security check failed']);
    }
    // Only allow specific endpoints for security
    $allowed_endpoints = [
        'ocrExtract',
        'dataSubmit',
        'create-checkout-session',
        'face-verify-info',
        'face-verify-upload',
        // add more as needed
    ];
    $endpoint = sanitize_text_field($_POST['endpoint'] ?? '');
    if (!in_array($endpoint, $allowed_endpoints, true)) {
        wp_send_json_error(['message' => 'Invalid or disallowed endpoint']);
    }
    // the server url which is used to proxy the api calls
    $base_url = 'http://localhost:3002/ana/v1/routes/mainRouter/ocrUpload/';
    $target_url = $base_url . $endpoint;

    // Special handling for file upload endpoints
    if ($endpoint === 'ocrExtract') {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $target_url);
        curl_setopt($ch, CURLOPT_POST, true);
        // Build multipart data from $_FILES and $_POST
        $postFields = [];
        foreach ($_POST as $key => $value) {
            if (!in_array($key, ['action', 'endpoint', 'nonce', 'method'])) {
                $postFields[$key] = $value;
            }
        }
        if (isset($_FILES['doc'])) {
            $postFields['doc'] = new CURLFile($_FILES['doc']['tmp_name'], $_FILES['doc']['type'], $_FILES['doc']['name']);
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (curl_errno($ch)) {
            error_log('OCR Proxy cURL error: ' . curl_error($ch));
            wp_send_json_error(['message' => curl_error($ch)]);
        }
        error_log('OCR Proxy cURL response: ' . print_r($response, true));
        if (!$response) {
            error_log('OCR Proxy: Empty response from Node backend');
        }
        curl_close($ch);
        wp_send_json_success([
            'status' => $http_code,
            'body' => $response,
        ]);
        return;
    }

    // Default: JSON endpoints (e.g., dataSubmit, create-checkout-session, etc.)
    $payload = isset($_POST['payload']) ? wp_unslash($_POST['payload']) : '';
    $method = isset($_POST['method']) ? strtoupper(sanitize_text_field($_POST['method'])) : 'POST';
    $args = [
        'method' => $method,
        'headers' => [
            'Content-Type' => 'application/json',
        ],
        'body' => $payload, // This is already a JSON string from the frontend
        'timeout' => 30,
    ];
    $response = wp_remote_request($target_url, $args);
    if (is_wp_error($response)) {
        error_log('Proxy error for endpoint ' . $endpoint . ': ' . $response->get_error_message());
        wp_send_json_error(['message' => $response->get_error_message()]);
    }
    $body = wp_remote_retrieve_body($response);
    $code = wp_remote_retrieve_response_code($response);
    error_log('Proxy response for endpoint ' . $endpoint . ': ' . print_r($body, true));
    // Try to decode as JSON and return cleanly
    $decoded = json_decode($body, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        wp_send_json($decoded);
    } else {
        // Fallback: send raw
        wp_send_json_success([
            'status' => $code,
            'body' => $body,
        ]);
    }
}
