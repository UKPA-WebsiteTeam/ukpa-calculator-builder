<?php
// ✅ Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

// ✅ Unified Save Hook for Calculator (admin + frontend safety)
add_action('wp_ajax_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');
add_action('wp_ajax_nopriv_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');

function ukpa_unified_save_calculator() {
  // ✅ Verify Nonce
  if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'ukpa_save_calc_nonce')) {
    wp_send_json_error(['message' => 'Invalid nonce']);
  }

  // ✅ Basic validation
  $id = sanitize_text_field($_POST['calculator_id'] ?? '');
  if (!$id) {
    wp_send_json_error(['message' => 'Missing calculator ID']);
  }

  // ✅ Decode and validate core data
  $elements = json_decode(stripslashes($_POST['elements'] ?? ''), true);
  $custom_css = sanitize_textarea_field($_POST['custom_css'] ?? '');
  $custom_js = sanitize_textarea_field($_POST['custom_js'] ?? '');
  $title = sanitize_text_field($_POST['title'] ?? 'Untitled Calculator');
  $route = sanitize_text_field($_POST['backend_route'] ?? '');

  if (!is_array($elements)) {
    $elements = [];
  }

  // ✅ Load existing config
  $data = get_option("ukpa_calc_$id", []);
  $data['title'] = $title;
  $data['route'] = $route;
  $data['elements'] = $elements;
  $data['ukpa_builder_css'] = $custom_css;
  $data['ukpa_builder_js'] = $custom_js;

  // ✅ Save dynamic result keys (optional)
  if (!empty($_POST['dynamic_keys'])) {
    $keys = json_decode(stripslashes($_POST['dynamic_keys']), true);
    if (is_array($keys)) {
      $data['dynamicResultKeys'] = array_values($keys);
    }
  }

  // ✅ Save it
  $success = update_option("ukpa_calc_$id", $data);

  if ($success) {
    wp_send_json_success(['message' => 'Calculator updated successfully']);
  } else {
    wp_send_json_error(['message' => 'Failed to save calculator']);
  }
}
error_log('CUSTOM JS RECEIVED: ' . ($_POST['custom_js'] ?? '[not set]'));

