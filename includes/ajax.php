<?php
// ✅ Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ✅ Handle AJAX save for calculators
add_action('wp_ajax_ukpa_save_calculator', 'handle_ukpa_save_calculator');
add_action('wp_ajax_nopriv_ukpa_save_calculator', 'handle_ukpa_save_calculator');

function handle_ukpa_save_calculator() {
    if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'ukpa_save_calc_nonce')) {
        wp_send_json_error(['message' => 'Invalid nonce']);
    }

    if (empty($_POST['calculator_id']) || empty($_POST['elements'])) {
        wp_send_json_error(['message' => 'Missing required data']);
    }

    $calc_id = sanitize_text_field($_POST['calculator_id']);
    $elements = json_decode(stripslashes($_POST['elements']), true);
    $title = isset($_POST['title']) ? sanitize_text_field($_POST['title']) : 'Untitled Calculator';

    if (!is_array($elements)) {
        wp_send_json_error(['message' => 'Invalid elements format']);
    }

    $final_data = [
        'title' => $title,
        'elements' => $elements
    ];

    update_option('ukpa_calc_' . $calc_id, $final_data);
    error_log("Saving calc: " . print_r($_POST, true));
    wp_send_json_success(['message' => 'Calculator saved successfully']);
    wp_send_json_success([
        'message' => 'Saved successfully!',
        'redirect_url' => admin_url("admin.php?page=ukpa-calculator-add-new&calc_id=" . urlencode($calc_id))
    ]);
}

add_action('wp_ajax_ukpa_save_result_keys', function () {
  check_ajax_referer('ukpa_save_calc_nonce');

  $calc_id = sanitize_text_field($_POST['calc_id']);
  $keys = json_decode(stripslashes($_POST['keys']), true);

  if (!$calc_id || !is_array($keys)) {
    wp_send_json_error(['message' => 'Invalid data']);
  }

  $data = get_option('ukpa_calc_' . $calc_id, []);
  $data['dynamicResultKeys'] = array_values($keys);
  update_option('ukpa_calc_' . $calc_id, $data);

  wp_send_json_success(['saved' => $keys]);
});
