<?php
/**
 * Plugin Name: UKPA Calculator Builder
 * Description: Build HTMX-based calculators with predefined input/result/content sections.
 * Version: 1.0
 * Author: Abishek Patel
 */

if (!defined('ABSPATH')) exit;

define('UKPA_CALC_PATH', plugin_dir_path(__FILE__));
define('UKPA_CALC_URL', plugin_dir_url(__FILE__));

// Load menu and admin UI
require_once UKPA_CALC_PATH . 'includes/menu.php';
require_once UKPA_CALC_PATH . 'includes/ajax.php';
require_once UKPA_CALC_PATH . 'admin/init/init.php';
require_once UKPA_CALC_PATH . 'includes/shortcodes.php';
require_once UKPA_CALC_PATH . 'includes/dashboard-frontend.php';
require_once plugin_dir_path(__FILE__) . 'includes/unified-save.php';


// ✅ Enqueue admin styles & scripts
add_action('admin_enqueue_scripts', function () {
    wp_enqueue_style('ukpa-calc-admin-css', UKPA_CALC_URL . 'assets/css/admin.css');
    
    wp_enqueue_script('ukpa-calc-builder-js', UKPA_CALC_URL . 'assets/js/builder.js', [], '1.0', true);
    wp_localize_script('ukpa-calc-builder-js', 'ukpa_calc_data', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('ukpa_save_calc_nonce'),
    ]);
});
// ✅ Enqueue frontend styles
add_action('wp_enqueue_scripts', function () {
    if (!is_admin()) {
        wp_enqueue_style('ukpa-calc-frontend-css', UKPA_CALC_URL . 'public/css/frontend.css', [], '1.0');
        wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], '4.4.0', true);
    }
});


add_action('wp_enqueue_scripts', function () {
    if (!is_admin()) {
        wp_enqueue_style('ukpa-calc-frontend-css', UKPA_CALC_URL . 'public/css/frontend.css', [], '1.0');
        wp_enqueue_script('ukpa-calc-frontend-js', UKPA_CALC_URL . 'public/js/frontend.js', [], '1.0', true);
        wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], '4.4.0', true);
    }
});
