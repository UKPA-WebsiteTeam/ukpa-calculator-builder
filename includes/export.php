<?php 

function export_calculators() {

    if (isset($_GET['export_calc_id']) && current_user_can('manage_options')) {
        global $wpdb;
        $export_id = sanitize_text_field($_GET['export_calc_id']);
        $export_data = [];
    
        if ($export_id === 'all') {
            $all = $wpdb->get_results("SELECT option_name, option_value FROM $wpdb->options WHERE option_name LIKE 'ukpa_calc_%'");
            foreach ($all as $item) {
                $export_data[] = maybe_unserialize($item->option_value);
            }
            $filename = 'ukpa-all-calculators-' . date('Ymd') . '.json';
        } else {
            $option_name = 'ukpa_calc_' . $export_id;
            $data = get_option($option_name);
            if ($data) {
                $export_data = [$data];
                $filename = 'ukpa-calculator-' . $export_id . '.json';
            } else {
                wp_die('❌ Calculator not found.');
            }
        }
    
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo json_encode($export_data, JSON_PRETTY_PRINT);
        exit;
    }

}

