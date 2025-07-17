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

function ukpa_proxy_api_handler() {
    // Accept both JSON and multipart/form-data
    $route = isset($_POST['route']) ? sanitize_text_field($_POST['route']) : '';
    $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
    if (!empty($nonce) && !wp_verify_nonce($nonce, 'ukpa_api_nonce')) {
        wp_send_json_error(['error' => 'Invalid nonce'], 403);
    }

    $base_url = get_option('ukpa_api_base_url', 'https://ukpacalculator.com/ana/v1');
    $url = trailingslashit($base_url) . 'routes/mainRouter/' . ltrim($route, '/');

    // Prepare cURL for file upload
    $post_fields = [];
    foreach ($_POST as $key => $value) {
        if (!in_array($key, ['action', 'route', 'nonce'])) {
            $post_fields[$key] = $value;
        }
    }
    // Attach file if present
    if (!empty($_FILES['doc']) && is_uploaded_file($_FILES['doc']['tmp_name'])) {
        $post_fields['doc'] = new CURLFile($_FILES['doc']['tmp_name'], $_FILES['doc']['type'], $_FILES['doc']['name']);
    }

    $headers = [];
    if (!empty($_POST['x-plugin-auth'])) {
        $headers[] = 'x-plugin-auth: ' . sanitize_text_field($_POST['x-plugin-auth']);
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) {
        wp_send_json_error(['error' => $err], 500);
    }

    $body = json_decode($response, true);

    wp_send_json_success([
        'code' => $code,
        'body' => $body,
    ]);
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

// --- AJAX handler for ID verification form submission ---
add_action('wp_ajax_ukpa_idv_form_submit', 'ukpa_idv_form_submit_handler');
add_action('wp_ajax_nopriv_ukpa_idv_form_submit', 'ukpa_idv_form_submit_handler');

function ukpa_idv_form_submit_handler() {
    // Verify nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'ukpa_idv_form_nonce')) {
        wp_send_json_error(['message' => 'Security check failed']);
    }
    
    // Get form data
    $form_data = json_decode(stripslashes($_POST['form_data']), true);
    
    if (!$form_data || !is_array($form_data)) {
        wp_send_json_error(['message' => 'Invalid form data']);
    }
    
    // Sanitize and validate the data
    $sanitized_data = [];
    
    // Filer information
    $sanitized_data['filer'] = [
        'full_name' => sanitize_text_field($form_data['filer']['fullName'] ?? ''),
        'email' => sanitize_email($form_data['filer']['email'] ?? ''),
    ];
    
    // User information
    $sanitized_data['users'] = [];
    if (isset($form_data['users']) && is_array($form_data['users'])) {
        foreach ($form_data['users'] as $user) {
            $sanitized_user = [
                'personal_details' => [
                    'first_name' => sanitize_text_field($user['personalDetails']['firstName'] ?? ''),
                    'last_name' => sanitize_text_field($user['personalDetails']['lastName'] ?? ''),
                    'date_of_birth' => sanitize_text_field($user['personalDetails']['dateOfBirth'] ?? ''),
                    'nationality' => sanitize_text_field($user['personalDetails']['nationality'] ?? ''),
                    'passport_number' => sanitize_text_field($user['personalDetails']['passportNumber'] ?? ''),
                ],
                'address' => [
                    'street_address' => sanitize_text_field($user['address']['streetAddress'] ?? ''),
                    'city' => sanitize_text_field($user['address']['city'] ?? ''),
                    'postal_code' => sanitize_text_field($user['address']['postalCode'] ?? ''),
                    'country' => sanitize_text_field($user['address']['country'] ?? ''),
                ],
                'documents' => [
                    'document_type_1' => sanitize_text_field($user['documents']['documentType1'] ?? ''),
                    'document_type_2' => sanitize_text_field($user['documents']['documentType2'] ?? ''),
                    'document_1_uploaded' => !empty($user['documents']['document1Uploaded']),
                    'document_2_uploaded' => !empty($user['documents']['document2Uploaded']),
                ]
            ];
            $sanitized_data['users'][] = $sanitized_user;
        }
    }
    
    // Store the form submission (you can modify this to send to your backend API)
    $submission_id = 'idv_' . time() . '_' . wp_generate_password(8, false);
    $success = update_option('ukpa_idv_submission_' . $submission_id, $sanitized_data);
    
    if ($success) {
        // You can add email notification here
        $admin_email = get_option('admin_email');
        $subject = 'New ID Verification Form Submission';
        $message = "A new ID verification form has been submitted.\n\n";
        $message .= "Submission ID: " . $submission_id . "\n";
        $message .= "Filer: " . $sanitized_data['filer']['full_name'] . " (" . $sanitized_data['filer']['email'] . ")\n";
        $message .= "Number of users: " . count($sanitized_data['users']) . "\n\n";
        $message .= "View submission details in WordPress admin.";
        
        wp_mail($admin_email, $subject, $message);
        
        wp_send_json_success([
            'message' => 'Form submitted successfully',
            'submission_id' => $submission_id
        ]);
    } else {
        wp_send_json_error(['message' => 'Failed to save form submission']);
    }
}
