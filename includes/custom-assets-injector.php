<?php
// Injects custom CSS and JS only when calculators are present on the page

function ukpa_output_custom_calc_assets() {
    global $ukpa_calc_ids_to_inject;

    if (empty($ukpa_calc_ids_to_inject) || !is_array($ukpa_calc_ids_to_inject)) return;

    foreach ($ukpa_calc_ids_to_inject as $calc_id) {
        $data = get_option('ukpa_calc_' . $calc_id, []);

        if (!empty($data['ukpa_builder_css'])) {
            echo '<style id="ukpa-custom-css-' . esc_attr($calc_id) . '">' . $data['ukpa_builder_css'] . '</style>';
        }

        if (!empty($data['ukpa_builder_js'])) {
            echo '<script id="ukpa-custom-js-' . esc_attr($calc_id) . '">document.addEventListener("DOMContentLoaded", function() {' . $data['ukpa_builder_js'] . '});</script>';
        }
    }
}
