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
// NOTE: ukpa_proxy_api_handler is registered in ukpa-calculator-builder.php (single source of truth).

// --- AJAX proxy for External API (/ana/api/external/*) ---
add_action('wp_ajax_ukpa_external_proxy', 'ukpa_external_proxy_handler');
add_action('wp_ajax_nopriv_ukpa_external_proxy', 'ukpa_external_proxy_handler');

/**
 * Proxies a strict allowlist of External API calls through WordPress so no API token is exposed in the browser.
 *
 * Expected JSON body:
 * {
 *   "nonce": "....",
 *   "method": "GET" | "POST",
 *   "path": "/calculators/it/calculate",
 *   "query": "?a=1&b=2", // optional
 *   "payload": {...}      // for POST
 * }
 */
function ukpa_external_proxy_handler() {
    // Wrap entire handler in try-catch to prevent 502 on fatal errors
    try {
        $raw_input = file_get_contents('php://input');
        if ($raw_input === false) {
            error_log('UKPA External Proxy: Failed to read php://input');
            wp_send_json_error(['error' => 'Failed to read request body'], 400);
            return;
        }
        
        $input = json_decode($raw_input, true);
        if (!is_array($input)) {
            error_log('UKPA External Proxy: Invalid JSON body: ' . substr($raw_input, 0, 200));
            wp_send_json_error(['error' => 'Invalid JSON body'], 400);
            return;
        }

        $nonce = $input['nonce'] ?? '';
        if (!empty($nonce) && !wp_verify_nonce($nonce, 'ukpa_api_nonce')) {
            error_log('UKPA External Proxy: Invalid nonce');
            wp_send_json_error(['error' => 'Invalid nonce'], 403);
            return;
        }

        $method = strtoupper(sanitize_text_field($input['method'] ?? 'GET'));
        if (!in_array($method, ['GET', 'POST'], true)) {
            wp_send_json_error(['error' => 'Method not allowed'], 405);
            return;
        }

        $path = sanitize_text_field($input['path'] ?? '');
        if ($path === '' || strpos($path, '..') !== false) {
            wp_send_json_error(['error' => 'Invalid path'], 400);
            return;
        }
        if ($path[0] !== '/') {
            $path = '/' . $path;
        }

        // Strict allowlist (extend as needed)
        $allowed = [
            'GET' => [
                '/health',
                '/loading-messages',
                '/calculators/sdlt/years',
                '/calculators/sdlt/rate-bands',
                '/csrf-token',
                '/csrf-token-authenticated',
            ],
            'POST' => [
                '/calculators/it/calculate',
                '/calculators/it/ai-insights',
                '/calculators/rt/comparison-insights',
                '/calculators/sdlt/calculate',
                '/calculators/sdlt/chart',
                '/calculators/sdlt/chart-types',
                '/calculators/sdlt/ai-insights',
                '/submissions/submit',
            ],
        ];

        if (!isset($allowed[$method]) || !in_array($path, $allowed[$method], true)) {
            error_log('UKPA External Proxy: Disallowed endpoint - ' . $method . ' ' . $path);
            wp_send_json_error(['error' => 'Disallowed endpoint'], 403);
            return;
        }

        // Basic rate limit (per IP, 60 req/min)
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $rate_key = 'ukpa_ext_rl_' . md5($ip);
        $count = (int) get_transient($rate_key);
        if ($count > 60) {
            wp_send_json_error(['error' => 'Rate limit exceeded'], 429);
            return;
        }
        set_transient($rate_key, $count + 1, 60);

        // Get preferred domain and set default external API URL accordingly
        $preferred_domain = get_option('ukpa_api_preferred_domain', 'ukpacalculator.com');
        $default_external_url = ( $preferred_domain === 'apps.ukpa.co.uk' )
            ? 'https://apps.ukpa.co.uk/ana/api/external'
            : 'https://ukpacalculator.com/ana/api/external';
        $base_url = get_option('ukpa_external_api_base_url', $default_external_url);
        $client_token = get_option('ukpa_external_api_client_token', '');
        if (empty($client_token)) {
            error_log('UKPA External Proxy: External API token is not configured');
            wp_send_json_error(['error' => 'External API token is not configured in plugin settings'], 500);
            return;
        }

        // Use the site origin as the bound origin for external token validation/decryption
        $origin = home_url();
        $origin_parts = wp_parse_url($origin);
        $origin_header = '';
        if (is_array($origin_parts) && !empty($origin_parts['scheme']) && !empty($origin_parts['host'])) {
            $origin_header = $origin_parts['scheme'] . '://' . $origin_parts['host'];
            if (!empty($origin_parts['port'])) {
                $origin_header .= ':' . $origin_parts['port'];
            }
        }

        $query = $input['query'] ?? '';
        $query = is_string($query) ? $query : '';
        if ($query !== '' && $query[0] !== '?') {
            $query = '?' . $query;
        }

        $target_url = rtrim($base_url, '/') . $path . $query;
        error_log('UKPA External Proxy: Requesting ' . $method . ' ' . $target_url);

        // Server-side CSRF token handling (required by external API for POST)
        $csrf_token = null;
        if ($method === 'POST') {
            $csrf_cache_key = 'ukpa_ext_csrf_' . md5($origin_header . '|' . $client_token);
            $cached = get_transient($csrf_cache_key);
            if (is_array($cached) && !empty($cached['token'])) {
                $csrf_token = $cached['token'];
                error_log('UKPA External Proxy: Using cached CSRF token');
            } else {
                $csrf_url = rtrim($base_url, '/') . '/csrf-token-authenticated';
                error_log('UKPA External Proxy: Fetching CSRF token from ' . $csrf_url);
                $csrf_resp = wp_remote_get($csrf_url, [
                    'timeout' => 20,
                    'headers' => [
                        'X-API-Key' => $client_token,
                        'Origin' => $origin_header,
                        'Referer' => home_url('/'),
                        'Accept' => 'application/json',
                    ],
                ]);

                if (is_wp_error($csrf_resp)) {
                    error_log('UKPA External Proxy: CSRF fetch error - ' . $csrf_resp->get_error_message());
                    wp_send_json_error(['error' => 'Failed to fetch CSRF token: ' . $csrf_resp->get_error_message()], 502);
                    return;
                }

                $csrf_code = wp_remote_retrieve_response_code($csrf_resp);
                $csrf_body = wp_remote_retrieve_body($csrf_resp);
                $csrf_json = json_decode($csrf_body, true);

                if ($csrf_code < 200 || $csrf_code >= 300 || !is_array($csrf_json) || empty($csrf_json['csrfToken'])) {
                    error_log('UKPA External Proxy: CSRF fetch failed - HTTP ' . $csrf_code . ', body: ' . substr($csrf_body, 0, 200));
                    wp_send_json_error([
                        'error' => 'Failed to fetch CSRF token from external API',
                        'status' => $csrf_code,
                        'body' => $csrf_json ?: $csrf_body,
                    ], 502);
                    return;
                }

                $csrf_token = $csrf_json['csrfToken'];
                $expires_in = !empty($csrf_json['expiresIn']) ? (int) $csrf_json['expiresIn'] : 900;
                set_transient($csrf_cache_key, ['token' => $csrf_token], max(60, $expires_in - 60));
                error_log('UKPA External Proxy: CSRF token fetched and cached');
            }
        }

        $payload = $input['payload'] ?? null;
        
        // Add HubSpot API key to payload for submission endpoints (server-side only, never exposed to frontend)
        if ($method === 'POST' && is_array($payload) && (
            strpos($path, '/submissions/submit') !== false || 
            strpos($path, '/submit') !== false
        )) {
            $hubspot_api_key = get_option('ukpa_hubspot_api_key', '');
            if (!empty($hubspot_api_key)) {
                $payload['hubspotApiKey'] = $hubspot_api_key;
                error_log('UKPA External Proxy: Added HubSpot API key to submission payload (key length: ' . strlen($hubspot_api_key) . ')');
            }
        }
        
        $body = null;
        if ($method === 'POST') {
            $body = is_array($payload) ? wp_json_encode($payload) : (is_string($payload) ? $payload : wp_json_encode([]));
        }

        // IMPORTANT: We do NOT forward any browser-supplied auth headers; we always use the server-stored token.
        $headers = [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'X-API-Key' => $client_token,
            'Origin' => $origin_header,
            'Referer' => home_url('/'),
        ];
        if ($csrf_token) {
            $headers['X-CSRF-Token'] = $csrf_token;
        }

        $args = [
            'method' => $method,
            'timeout' => 30,
            'headers' => $headers,
        ];
        if ($body !== null) {
            $args['body'] = $body;
        }

        $resp = wp_remote_request($target_url, $args);
        if (is_wp_error($resp)) {
            error_log('UKPA External Proxy: Request error - ' . $resp->get_error_message());
            wp_send_json_error(['error' => $resp->get_error_message()], 502);
            return;
        }

        $resp_code = wp_remote_retrieve_response_code($resp);
        $resp_body = wp_remote_retrieve_body($resp);
        $decoded = json_decode($resp_body, true);
        error_log('UKPA External Proxy: Response - HTTP ' . $resp_code);

        // If we get a CSRF error (403), clear the cached token and retry once with a fresh token
        if ($resp_code === 403 && $csrf_token && is_array($decoded) && 
            (isset($decoded['error']) && ($decoded['error'] === 'csrf_token_invalid' || $decoded['error'] === 'csrf_token_missing'))) {
            error_log('UKPA External Proxy: CSRF token invalid, clearing cache and retrying with fresh token');
            
            // Clear the cached CSRF token
            delete_transient($csrf_cache_key);
            
            // Fetch a fresh CSRF token
            $csrf_url = rtrim($base_url, '/') . '/csrf-token-authenticated';
            $csrf_resp = wp_remote_get($csrf_url, [
                'timeout' => 20,
                'headers' => [
                    'X-API-Key' => $client_token,
                    'Origin' => $origin_header,
                    'Referer' => home_url('/'),
                    'Accept' => 'application/json',
                ],
            ]);

            if (!is_wp_error($csrf_resp)) {
                $csrf_code = wp_remote_retrieve_response_code($csrf_resp);
                $csrf_body = wp_remote_retrieve_body($csrf_resp);
                $csrf_json = json_decode($csrf_body, true);

                if ($csrf_code >= 200 && $csrf_code < 300 && is_array($csrf_json) && !empty($csrf_json['csrfToken'])) {
                    $fresh_csrf_token = $csrf_json['csrfToken'];
                    $expires_in = !empty($csrf_json['expiresIn']) ? (int) $csrf_json['expiresIn'] : 900;
                    set_transient($csrf_cache_key, ['token' => $fresh_csrf_token], max(60, $expires_in - 60));
                    
                    // Update headers with fresh token
                    $headers['X-CSRF-Token'] = $fresh_csrf_token;
                    $args['headers'] = $headers;
                    
                    // Retry the request
                    error_log('UKPA External Proxy: Retrying request with fresh CSRF token');
                    $resp = wp_remote_request($target_url, $args);
                    
                    if (!is_wp_error($resp)) {
                        $resp_code = wp_remote_retrieve_response_code($resp);
                        $resp_body = wp_remote_retrieve_body($resp);
                        $decoded = json_decode($resp_body, true);
                        error_log('UKPA External Proxy: Retry response - HTTP ' . $resp_code);
                    }
                }
            }
        }

        wp_send_json_success([
            'code' => $resp_code,
            'isJson' => is_array($decoded),
            'body' => is_array($decoded) ? $decoded : $resp_body,
        ]);
    } catch (Exception $e) {
        error_log('UKPA External Proxy Fatal Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        error_log('UKPA External Proxy Stack Trace: ' . $e->getTraceAsString());
        wp_send_json_error([
            'error' => 'Internal server error in proxy handler',
            'message' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : 'An error occurred processing the request'
        ], 500);
    } catch (Error $e) {
        error_log('UKPA External Proxy Fatal Error (PHP Error): ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        error_log('UKPA External Proxy Stack Trace: ' . $e->getTraceAsString());
        wp_send_json_error([
            'error' => 'Internal server error in proxy handler',
            'message' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : 'An error occurred processing the request'
        ], 500);
    }
}

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
    if ( function_exists('ukpa_get_api_url') ) {
        $base_url = rtrim(ukpa_get_api_url(), '/') . '/v1/routes/mainRouter/ocrUpload/';
    } else {
        wp_send_json_error(['message' => 'API base URL function not found. Please ensure ukpa_get_api_url() is defined.']);
    }
    $target_url = $base_url . $endpoint;
    // Debug: Log the target URL and payload
    error_log('UKPA Proxy: Target URL: ' . $target_url);
    if (isset($_POST['payload'])) {
        error_log('UKPA Proxy: Payload: ' . print_r($_POST['payload'], true));
    }

    // Special handling: For create-checkout-session, forward as JSON
    if ($endpoint === 'create-checkout-session') {
        $payload = isset($_POST['payload']) ? wp_unslash($_POST['payload']) : '';
        $args = [
            'method' => 'POST',
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => $payload,
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
        $decoded = json_decode($body, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            wp_send_json($decoded);
        } else {
            wp_send_json_success([
                'status' => $code,
                'body' => $body,
            ]);
        }
        return;
    }
    // For all other endpoints, use multipart/form-data via cURL
    $postFields = [];
    foreach ($_POST as $key => $value) {
        if (!in_array($key, ['action', 'endpoint', 'nonce', 'method'])) {
            $postFields[$key] = $value;
        }
    }
    foreach ($_FILES as $key => $file) {
        error_log('UKPA Proxy: Processing file: ' . $key . ' - ' . print_r($file, true));
        $postFields[$key] = new CURLFile($file['tmp_name'], $file['type'], $file['name']);
    }
    error_log('UKPA Proxy: Final postFields: ' . print_r($postFields, true));
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $target_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if (curl_errno($ch)) {
        error_log('Proxy cURL error: ' . curl_error($ch));
        wp_send_json_error(['message' => curl_error($ch)]);
    }
    curl_close($ch);
    wp_send_json_success([
        'status' => $http_code,
        'body' => $response,
    ]);
    return;
}