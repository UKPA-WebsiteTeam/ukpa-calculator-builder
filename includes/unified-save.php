<?php
// ✅ Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

// ✅ Unified Save Hook for Calculator (admin + frontend safety)
add_action('wp_ajax_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');
add_action('wp_ajax_nopriv_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');

function ukpa_unified_save_calculator() {
  if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'ukpa_save_calc_nonce')) {
    wp_send_json_error(['message' => 'Invalid nonce']);
  }

  $id = sanitize_text_field($_POST['calculator_id'] ?? '');
  if (!$id) {
    wp_send_json_error(['message' => 'Missing calculator ID']);
  }

  $elements = json_decode(stripslashes($_POST['elements'] ?? ''), true);
  $custom_css = sanitize_textarea_field($_POST['custom_css'] ?? '');
  $custom_js = sanitize_textarea_field($_POST['custom_js'] ?? '');
  $title = sanitize_text_field($_POST['title'] ?? 'Untitled Calculator');
  $route = sanitize_text_field($_POST['backend_route'] ?? '');

  if (!is_array($elements)) {
    $elements = [];
  }

  $new_data = [
    'title' => $title,
    'route' => $route,
    'elements' => $elements,
    'ukpa_builder_css' => $custom_css,
    'ukpa_builder_js' => $custom_js,
  ];

  if (!empty($_POST['dynamic_keys'])) {
    $keys = json_decode(stripslashes($_POST['dynamic_keys']), true);
    if (is_array($keys)) {
      $new_data['dynamicResultKeys'] = array_values($keys);
    }
  }

  $option_key = "ukpa_calc_$id";
  $old_data = get_option($option_key, []);

  // ✅ Check if new data is different before saving
  if ($old_data !== $new_data) {
    $updated = update_option($option_key, $new_data);
    if ($updated) {
      wp_send_json_success(['message' => 'Calculator updated successfully']);
    } else {
      wp_send_json_error(['message' => 'Update failed']);
    }
  } else {
    // ✅ No changes, but still return success
    wp_send_json_success(['message' => 'No changes detected, but considered successful']);
  }
}

error_log('CUSTOM JS RECEIVED: ' . ($_POST['custom_js'] ?? '[not set]'));

