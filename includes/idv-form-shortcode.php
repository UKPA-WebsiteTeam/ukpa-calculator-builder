<?php
/**
 * Modular IDV Form Shortcode Handler
 * Renders the new modular IDV form and enqueues its assets
 */

add_shortcode('ukpa_idv_form', 'render_ukpa_modular_idv_form_shortcode');

function render_ukpa_modular_idv_form_shortcode($atts = []) {
    $atts = shortcode_atts([
        'id' => 'default'
    ], $atts);
    $form_id = sanitize_text_field($atts['id']);

    // Correct plugin URL
    $plugin_url = plugin_dir_url(__DIR__);

    wp_enqueue_style(
        'ukpa-idvformstyle',
        $plugin_url . 'public/css/idvformstyle.css',
        [],
        filemtime(plugin_dir_path(__DIR__) . 'public/css/idvformstyle.css')
    );

    // Enqueue modular JS (entry point)
    wp_enqueue_script(
        'ukpa-idvform-index',
        $plugin_url . 'public/idvform-modular-testing/index.js',
        [],
        filemtime(plugin_dir_path(__DIR__) . 'public/idvform-modular-testing/index.js'),
        true
    );

    // Set type="module" for ES6 imports
    add_filter('script_loader_tag', function($tag, $handle) {
        if ($handle === 'ukpa-idvform-index') {
            return str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }, 10, 2);

    // Localize AJAX URL and nonce for proxy
    wp_localize_script('ukpa-idvform-index', 'ukpa_idv_form_data', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('ukpa_idv_form_nonce'),
        'form_id' => $form_id,
    ]);

    ob_start();
    ?>
    <div id="ukpa-idv-form-container" class="custom_forms" data-form-id="<?php echo esc_attr($form_id); ?>"></div>
    <?php
    return ob_get_clean();
} 