<?php
add_action('wp_ajax_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');
add_action('wp_ajax_nopriv_ukpa_unified_save_calculator', 'ukpa_unified_save_calculator');

function ukpa_unified_save_calculator() {
  check_ajax_referer('ukpa_save_calc_nonce');

  $id = sanitize_text_field($_POST['calculator_id']);
  if (!$id) wp_send_json_error(['message' => 'Missing calculator ID']);

  $elements = json_decode(stripslashes($_POST['elements']), true);
  if (!is_array($elements)) $elements = [];

  $title = sanitize_text_field($_POST['title'] ?? 'Untitled Calculator');
  $route = sanitize_text_field($_POST['backend_route'] ?? '');
  $custom_css = sanitize_textarea_field($_POST['custom_css'] ?? '');
  $custom_js = sanitize_textarea_field($_POST['custom_js'] ?? '');

  $data = get_option("ukpa_calc_$id", []);
  $data['title'] = $title;
  $data['route'] = $route;
  $data['elements'] = $elements;
  $data['ukpa_builder_css'] = $custom_css;
  $data['ukpa_builder_js'] = $custom_js;

  // ✅ Save dynamic result keys if present
  if (!empty($_POST['dynamic_keys'])) {
    $keys = json_decode(stripslashes($_POST['dynamic_keys']), true);
    if (is_array($keys)) {
      $data['dynamicResultKeys'] = array_values($keys);
    }
  }

  update_option("ukpa_calc_$id", $data);
  wp_send_json_success(['message' => 'Calculator updated']);
}

