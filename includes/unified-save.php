<?php
// Handle unified save from both Save button and Ctrl+S
add_action('wp_ajax_nopriv_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');


function ukpa_unified_save_calculator() {
  check_ajax_referer('ukpa_save_calc_nonce');

  $id = sanitize_text_field($_POST['calculator_id']);
  $title = sanitize_text_field($_POST['title']);
  $route = sanitize_text_field($_POST['backend_route']);
  $elements = json_decode(stripslashes($_POST['elements']), true);
  $custom_css = sanitize_textarea_field($_POST['custom_css'] ?? '');
  $custom_js = sanitize_textarea_field($_POST['custom_js'] ?? '');

  // ✅ Prevent failure when no elements are added yet
  if (!is_array($elements)) {
    $elements = []; // fallback to empty array instead of rejecting the save
  }

  if (!$id) {
    wp_send_json_error(['message' => 'Missing calculator ID']);
  }

  $data = get_option("ukpa_calc_$id", []);
  $data['title'] = $title;
  $data['route'] = $route;
  $data['elements'] = $elements;
  $data['ukpa_builder_css'] = $custom_css;
  $data['ukpa_builder_js'] = $custom_js;

  update_option("ukpa_calc_$id", $data);

  wp_send_json_success(['message' => 'Unified save successful']);
}
