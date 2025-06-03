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

// ✅ Optional: Load .env (if using vlucas/phpdotenv)
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

// ✅ Inject custom CSS/JS from builder (if enabled)
add_action('wp_head', 'ukpa_output_custom_calc_assets');

// ✅ Admin assets (builder interface)
add_action('admin_enqueue_scripts', function ($hook) {
    $page = $_GET['page'] ?? '';
    if (!in_array($page, ['ukpa-calculator-builder', 'ukpa-calculator-add-new'])) return;

    // ✅ Enqueue CodeMirror for editor support
    wp_enqueue_script('codemirror-core', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js', [], null, true);
    wp_enqueue_script('codemirror-js', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js', ['codemirror-core'], null, true);
    wp_enqueue_script('codemirror-css', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/css/css.min.js', ['codemirror-core'], null, true);
    wp_enqueue_style('codemirror-style', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css', [], null);

    // ✅ Load Chart.js for visualisation support
    wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], null, true);

    // ✅ Only enqueue CSS (JS loaded via <script type="module">)
    wp_enqueue_style(
        'ukpa-calc-admin-css',
        UKPA_CALC_URL . 'assets/css/admin.css',
        [],
        filemtime(UKPA_CALC_PATH . 'assets/css/admin.css')
    );

    // ✅ Localise config for JS modules
    $plugin_token = get_option('ukpa_plugin_token', '');
    $api_base_url = 'http://localhost:3002/ana/v1';

    $calc_id = isset($_GET['calc_id']) ? sanitize_text_field($_GET['calc_id']) : '';
    $calc_data = get_option('ukpa_calc_' . $calc_id, []);
    $route = $calc_data['route'] ?? '';

    // ✅ Inject general API config
    wp_add_inline_script('chart-js', sprintf(
        'window.ukpa_api_data = %s;',
        json_encode([
            'ajaxurl'       => admin_url('admin-ajax.php'),
            'plugin_token'  => $plugin_token,
            'base_url'      => $api_base_url,
            'backend_route' => $route,
            'nonce'         => wp_create_nonce('ukpa_api_nonce'),
        ])
    ), 'after');

    // ✅ Inject calculator-specific config (used in builder.js)
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

// ✅ Frontend assets (calculator preview or public use)
add_action('wp_enqueue_scripts', function () {
    if (!is_admin()) {
        wp_enqueue_style(
            'ukpa-calc-frontend-css',
            UKPA_CALC_URL . 'public/css/frontend.css',
            [],
            '1.0'
        );

        wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', [], '4.4.0', true);

        wp_enqueue_script(
            'ukpa-calc-frontend-js',
            UKPA_CALC_URL . 'public/js/frontend.js',
            ['chart-js'],
            filemtime(UKPA_CALC_PATH . 'public/js/frontend.js'),
            true
        );

        add_filter('script_loader_tag', function ($tag, $handle) {
            if ($handle === 'ukpa-calc-frontend-js') {
                return str_replace('<script ', '<script type="module" ', $tag);
            }
            return $tag;
        }, 10, 2);

        // ✅ Localize frontend API config
        $plugin_token = get_option('ukpa_plugin_token', '');
        global $ukpa_calc_ids_to_inject;

        $calc_id = is_array($ukpa_calc_ids_to_inject) && count($ukpa_calc_ids_to_inject) > 0
            ? sanitize_text_field($ukpa_calc_ids_to_inject[0])
            : '';

        $calc_data = get_option('ukpa_calc_' . $calc_id, []);
        $backend_route = $calc_data['route'] ?? '';

        wp_localize_script('ukpa-calc-frontend-js', 'ukpa_api_data', [
            'base_url'      => 'http://localhost:3002/ana/v1',
            'plugin_token'  => $plugin_token,
            'backend_route' => $backend_route,
            'ajaxurl'       => admin_url('admin-ajax.php'),
            'nonce'         => wp_create_nonce('ukpa_api_nonce'),
        ]);
    }
});
