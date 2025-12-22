<?php
/**
 * Plugin Name: UKPA Calculator Builder
 * Plugin URI: http://localhost/calculator-builder
 * Description: Create advanced HTMX-powered calculators for property and accounting scenarios using a flexible drag-and-drop builder. Supports custom inputs, conditional logic, result displays, and easy shortcode integration for any page.
 * Version: 1.1.5
 * Author: Abishek Patel
 * Author URI: http://localhost
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ukpa-calculator-builder
 * Domain Path: /languages
 * Tags: calculator, builder, drag-and-drop, shortcode, property tax, accounting, conditional logic
 */


if (!defined('ABSPATH')) exit;

define('UKPA_CALC_PATH', plugin_dir_path(__FILE__));
define('UKPA_CALC_URL', plugin_dir_url(__FILE__));
define('UKPA_CALC_VERSION', '1.1.5');

// Optional: Load .env (if using vlucas/phpdotenv)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->safeLoad();
}

// ✅ Core includes
require_once UKPA_CALC_PATH . 'includes/menu.php';
require_once UKPA_CALC_PATH . 'includes/ajax.php';
require_once UKPA_CALC_PATH . 'admin/init/init.php';
require_once UKPA_CALC_PATH . 'includes/shortcodes.php';
require_once UKPA_CALC_PATH . 'includes/dashboard-frontend.php';
require_once UKPA_CALC_PATH . 'includes/unified-save.php';
require_once UKPA_CALC_PATH . 'includes/custom-assets-injector.php';
require_once UKPA_CALC_PATH . 'includes/auto-updater.php';
require_once UKPA_CALC_PATH . 'includes/idv-form-shortcode.php';
require_once UKPA_CALC_PATH . 'includes/income-tax-shortcode.php';

// ✅ Chatbot system - DISABLED
// require_once UKPA_CALC_PATH . 'includes/chatbot-nlp.php';
// require_once UKPA_CALC_PATH . 'includes/chatbot-gpt.php';
// require_once UKPA_CALC_PATH . 'includes/chatbot.php';
// require_once UKPA_CALC_PATH . 'admin/chatbot-menu.php';
// require_once UKPA_CALC_PATH . 'admin/chatbot-manager.php';
// require_once UKPA_CALC_PATH . 'admin/chatbot-settings.php';
// require_once UKPA_CALC_PATH . 'admin/chatbot-nlp-settings.php';
// require_once UKPA_CALC_PATH . 'admin/chatbot-gpt-settings.php';

// Chat Box System
require_once UKPA_CALC_PATH . 'includes/chatbox.php';
require_once UKPA_CALC_PATH . 'admin/chatbox-settings.php';

// Initialize the auto updater with the correct plugin file path
new UKPA_Auto_Updater(__FILE__);

// ✅ Inject custom CSS/JS from builder (if enabled)
add_action('wp_head', 'ukpa_output_custom_calc_assets');

// ✅ Admin assets (builder interface)
add_action('admin_enqueue_scripts', function ($hook) {
    $page = $_GET['page'] ?? '';
    if (!in_array($page, ['ukpa-calculator-builder', 'ukpa-calculator-add-new'])) return;

    // ✅ Enqueue CodeMirror
    wp_enqueue_script('codemirror-core', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js', [], null, true);
    wp_enqueue_script('codemirror-js', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js', ['codemirror-core'], null, true);
    wp_enqueue_script('codemirror-css', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/css/css.min.js', ['codemirror-core'], null, true);
    wp_enqueue_style('codemirror-style', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css', [], null);

    // ✅ Load Flatpickr for date/time fields in builder
    wp_enqueue_script('flatpickr', 'https://cdn.jsdelivr.net/npm/flatpickr', [], null, true);
    wp_enqueue_style('flatpickr-style', 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css', [], null);

    // ✅ Chart.js for visualisation support
    wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], null, true);

    wp_enqueue_style(
        'ukpa-calc-admin-css',
        UKPA_CALC_URL . 'assets/css/admin.css',
        [],
        filemtime(UKPA_CALC_PATH . 'assets/css/admin.css')
    );

    // ✅ Local config for JS
    $plugin_token = get_option('ukpa_plugin_token', '');
    $selected_website = get_option('ukpa_selected_website', 'UKPA');
    $external_api_base_url = get_option('ukpa_external_api_base_url', 'https://ukpacalculator.com/ana/api/external');
    $local_api_base_url = 'http://192.168.18.54:3002/ana/v1';
    $live_api_base_url = 'https://ukpacalculators.com/api/v1';

    $calc_id = isset($_GET['calc_id']) ? sanitize_text_field($_GET['calc_id']) : '';
    $calc_data = get_option('ukpa_calc_' . $calc_id, []);
    $route = $calc_data['route'] ?? '';

    $recaptcha_site_key = get_option('ukpa_recaptcha_site_key', '6Lfy0gcsAAAAAOJAbtam6WBI8nj09N2ebYIIKdKW');
    
    wp_add_inline_script('chart-js', sprintf(
        'window.ukpa_api_data = %s;',
        json_encode([
            'ajaxurl'         => admin_url('admin-ajax.php'),
            'plugin_token'    => $plugin_token,
            'local_base_url'  => $local_api_base_url,
            'live_base_url'   => $live_api_base_url,
            'base_url'        => $local_api_base_url, // for backward compatibility
            'backend_route'   => $route,
            'nonce'           => wp_create_nonce('ukpa_api_nonce'),
            'website'         => $selected_website,
            'external_api_base_url' => $external_api_base_url,
            'recaptcha_site_key' => $recaptcha_site_key,
        ])
    ), 'after');

    wp_add_inline_script('chart-js', sprintf(
        'window.ukpa_calc_data = %s;',
        json_encode([
            'ajaxurl'     => admin_url('admin-ajax.php'),
            'nonce'       => wp_create_nonce('ukpa_save_calc_nonce'),
            'calc_id'     => $calc_id,
            'custom_js'   => $calc_data['ukpa_builder_js'] ?? '',
            'custom_css'  => $calc_data['ukpa_builder_css'] ?? '',
        ])
    ), 'after');
});

// ✅ Frontend assets (calculator preview/public)
add_action('wp_enqueue_scripts', function () {
    if (!is_admin()) {
        // Decide whether the builder frontend runtime should load on this page.
        // Loading it globally causes console errors on non-calculator pages (and can break embedded HTML calculators).
        global $post;
        $should_load_builder_runtime =
            is_singular() &&
            $post instanceof WP_Post &&
            has_shortcode($post->post_content ?? '', 'ukpa_calculator_ana');

        // ✅ Minimal config always available for pages that need WP AJAX proxying (e.g., embedded calculators)
        $plugin_token = get_option('ukpa_plugin_token', '');
        $selected_website = get_option('ukpa_selected_website', 'UKPA');
        $external_api_base_url = get_option('ukpa_external_api_base_url', 'https://ukpacalculator.com/ana/api/external');
        $recaptcha_site_key = get_option('ukpa_recaptcha_site_key', '6Lfy0gcsAAAAAOJAbtam6WBI8nj09N2ebYIIKdKW');

        // Bootstrap script (no external file) to define window.ukpa_api_data everywhere.
        wp_register_script('ukpa-calc-bootstrap', '', [], UKPA_CALC_VERSION, false);
        wp_enqueue_script('ukpa-calc-bootstrap');
        wp_add_inline_script(
            'ukpa-calc-bootstrap',
            'window.ukpa_api_data = Object.assign({}, window.ukpa_api_data || {}, ' .
                wp_json_encode([
                    'ajaxurl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('ukpa_api_nonce'),
                    'website' => $selected_website,
                    'external_api_base_url' => $external_api_base_url,
                    'recaptcha_site_key' => $recaptcha_site_key,
                    // plugin_token is legacy; keeping for backward compatibility with existing builder flows
                    'plugin_token' => $plugin_token,
                ]) .
            ');',
            'before'
        );

        if ($should_load_builder_runtime) {
            wp_enqueue_style(
                'ukpa-calc-frontend-css',
                UKPA_CALC_URL . 'public/css/frontend.css',
                [],
                '1.0'
            );

            // ✅ Chart.js
            wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], '4.4.0', true);

            // ✅ Flatpickr for frontend date fields
            wp_enqueue_script('flatpickr', 'https://cdn.jsdelivr.net/npm/flatpickr', [], null, true);
            wp_enqueue_style('flatpickr-style', 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css', [], null);

            // Load builder runtime only on builder shortcode pages
            wp_enqueue_script(
                'ukpa-calc-frontend-js',
                UKPA_CALC_URL . 'public/js/frontend.js',
                ['chart-js', 'flatpickr'],
                filemtime(UKPA_CALC_PATH . 'public/js/frontend.js'),
                false // load in <head> instead of footer
            );

            add_filter('script_loader_tag', function ($tag, $handle) {
                if ($handle === 'ukpa-calc-frontend-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);

            // Attach backend_route only when builder is active on this page
            global $ukpa_calc_ids_to_inject;
            $calc_id = is_array($ukpa_calc_ids_to_inject) && count($ukpa_calc_ids_to_inject) > 0
                ? sanitize_text_field($ukpa_calc_ids_to_inject[0])
                : '';
            $calc_data = get_option('ukpa_calc_' . $calc_id, []);
            $backend_route = $calc_data['route'] ?? '';

            wp_add_inline_script(
                'ukpa-calc-frontend-js',
                'window.ukpa_api_data = Object.assign({}, window.ukpa_api_data || {}, ' .
                    wp_json_encode([ 'backend_route' => $backend_route ]) .
                ');',
                'before'
            );
        }

        // 🚀 Calculator backend route: nic/calculate   // ← or whatever route is saved
    }
});

// --- AJAX proxy for frontend API calls ---
add_action('wp_ajax_ukpa_proxy_api', 'ukpa_proxy_api_handler');
add_action('wp_ajax_nopriv_ukpa_proxy_api', 'ukpa_proxy_api_handler');

function ukpa_proxy_api_handler() {
    $input = json_decode(file_get_contents('php://input'), true);
    $nonce = $input['nonce'] ?? '';
    if (!empty($nonce) && !wp_verify_nonce($nonce, 'ukpa_api_nonce')) {
        wp_send_json_error(['error' => 'Invalid nonce'], 403);
    }

    $route = sanitize_text_field($input['route'] ?? '');
    $payload = $input['payload'] ?? [];
    $base_url = get_option('ukpa_api_base_url', 'https://ukpacalculator.com/ana/v1');
    $url = trailingslashit($base_url) . 'routes/mainRouter/' . ltrim($route, '/');

    $args = [
        'headers' => [
            'Authorization' => 'Bearer ' . get_option('ukpa_plugin_token', ''),
            'Content-Type'  => 'application/json',
        ],
        'body' => is_array($payload) ? wp_json_encode($payload) : $payload,
        'method' => 'POST',
        'data_format' => 'body',
    ];

    $response = wp_remote_post($url, $args);
    $body = wp_remote_retrieve_body($response);
    $code = wp_remote_retrieve_response_code($response);
    if (is_wp_error($response)) {
        wp_send_json_error(['error' => $response->get_error_message()], 500);
    }
    wp_send_json_success([
        'code' => $code,
        'body' => json_decode($body, true),
    ]);
}

// Global API URL constants
if ( ! defined( 'UKPA_CALC_LOCAL_API_URL' ) ) {
    define( 'UKPA_CALC_LOCAL_API_URL', 'https://ukpacalculator.com/ana' );
}
if ( ! defined( 'UKPA_CALC_LIVE_API_URL' ) ) {
    define( 'UKPA_CALC_LIVE_API_URL', 'https://ukpacalculator.com/ana' );
}

// Helper function to get the correct API URL
if ( ! function_exists( 'ukpa_get_api_url' ) ) {
    function ukpa_get_api_url() {
        // Use local if WP_DEBUG is true, otherwise use live
        if ( defined('WP_DEBUG') && WP_DEBUG ) {
            return UKPA_CALC_LOCAL_API_URL;
        }
        return UKPA_CALC_LIVE_API_URL;
    }
}
