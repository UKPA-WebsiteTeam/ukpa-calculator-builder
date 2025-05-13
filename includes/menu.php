<?php
// 🚫 Make sure this is the first line — NO whitespace before this!
ob_start();

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// ✅ All Calculators List
function ukpa_calculator_list_page() {
    include UKPA_CALC_PATH . 'admin/list-calculators.php';
}

// ✅ Short Calculator ID Generator
function generate_short_calc_id($length = 3) {
    $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    $id = '';
    for ($i = 0; $i < $length; $i++) {
        $id .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $id;
}

// ✅ Add New Calculator
function ukpa_calculator_add_new_page() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ukpa_create_calculator'])) {
        check_admin_referer('ukpa_create_calc_nonce');

        $title = sanitize_text_field($_POST['calculator_title']);
        if (!empty($title)) {
            // Generate unique short ID
            do {
                $calc_id = generate_short_calc_id();
            } while (get_option('ukpa_calc_' . $calc_id));

            $default_data = ['title' => $title, 'elements' => []];
            update_option('ukpa_calc_' . $calc_id, $default_data);

            wp_safe_redirect(admin_url('admin.php?page=ukpa-calculator-add-new&calc_id=' . urlencode($calc_id)));
            exit;
        } else {
            add_action('admin_notices', function () {
                echo '<div class="notice notice-error"><p>⚠️ Please enter a calculator name.</p></div>';
            });
        }
    }

    if (isset($_GET['calc_id'])) {
        include UKPA_CALC_PATH . 'admin/new-calculator.php';
    } else {
        include UKPA_CALC_PATH . 'admin/create-calculator.php';
    }
}

// ✅ Settings Page
function ukpa_calculator_settings_page() {
    include UKPA_CALC_PATH . 'admin/settings.php';
}

// ✅ Bulk Delete from All Calculators page
add_action('admin_init', function () {
    if (!current_user_can('manage_options')) return;

    if (
        isset($_POST['ukpa_bulk_delete']) &&
        check_admin_referer('ukpa_bulk_delete_action', 'ukpa_bulk_nonce') &&
        !empty($_POST['selected_calcs']) &&
        is_array($_POST['selected_calcs'])
    ) {
        foreach ($_POST['selected_calcs'] as $calc_id) {
            delete_option('ukpa_calc_' . sanitize_text_field($calc_id));
        }

        wp_safe_redirect(admin_url('admin.php?page=ukpa-calculator-builder&deleted=1'));
        exit;
    }
});

// ✅ JSON Import (with short ID)
add_action('admin_init', function () {
    if (
        isset($_POST['ukpa_import_calc']) &&
        current_user_can('manage_options') &&
        check_admin_referer('ukpa_import_calculator')
    ) {
        if (!empty($_FILES['import_file']['tmp_name'])) {
            $json = file_get_contents($_FILES['import_file']['tmp_name']);
            $data = json_decode($json, true);

            if (is_array($data)) {
                foreach ($data as $calculator) {
                    if (isset($calculator['title']) && isset($calculator['elements'])) {
                        do {
                            $new_id = generate_short_calc_id();
                        } while (get_option('ukpa_calc_' . $new_id));

                        update_option('ukpa_calc_' . $new_id, $calculator);
                    }
                }

                wp_safe_redirect(admin_url('admin.php?page=ukpa-calculator-builder&imported=1'));
                exit;
            } else {
                wp_die('❌ Invalid JSON format.');
            }
        } else {
            wp_die('❌ No file uploaded.');
        }
    }
});

add_action('admin_menu', function () {
    add_menu_page(
        'UKPA Settings',
        'UKPA Settings',
        'manage_options',
        'ukpa-settings',
        function () {
            include UKPA_CALC_PATH . '../admin/settings.php';
        },
        'dashicons-admin-generic',
        80
    );
});
