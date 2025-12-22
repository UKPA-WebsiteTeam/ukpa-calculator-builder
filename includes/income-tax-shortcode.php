<?php
/**
 * Income Tax Calculator Embed Shortcode
 *
 * Purpose: avoid pasting huge HTML into WP editor (which often corrupts <script> tags),
 * by embedding the calculator via an iframe pointing to a raw HTML URL you host.
 *
 * Shortcode:
 *   [ukpa_income_tax src="https://forms.example.com/wp-content/uploads/income.html" height="2400"]
 *
 * Notes:
 * - For the secure External API flow to work, the iframe URL should be SAME-ORIGIN as the WP site
 *   so the calculator can access window.parent.ukpa_api_data (ajaxurl + nonce).
 */

if (!defined('ABSPATH')) {
    exit;
}

add_shortcode('calculator_income_tax', 'ukpa_render_income_tax_shortcode');

function ukpa_render_income_tax_shortcode($atts = []) {
    // Try to detect plugin path/URL (multiple methods for compatibility)
    $plugin_dir = '';
    $plugin_url = '';
    
    if (defined('UKPA_CALC_PATH') && defined('UKPA_CALC_URL')) {
        $plugin_dir = UKPA_CALC_PATH;
        $plugin_url = UKPA_CALC_URL;
    } else {
        // Fallback: detect from current file location (go up from includes/ to plugin root)
        $plugin_dir = plugin_dir_path(dirname(dirname(__FILE__)));
        $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    }
    
    // Always set default to plugin's public/html/income.html URL (don't rely on file_exists which can fail due to permissions)
    $plugin_default_src = $plugin_url . 'public/html/income.html';
    $plugin_file_path = $plugin_dir . 'public/html/income.html';
    
    // Log for debugging
    error_log('UKPA Income Tax: Checking file at ' . $plugin_file_path);
    error_log('UKPA Income Tax: Plugin URL would be ' . $plugin_default_src);
    
    // Check if file exists (for logging only - we'll use the URL anyway)
    if (file_exists($plugin_file_path)) {
        error_log('UKPA Income Tax: File exists at ' . $plugin_file_path);
    } else {
        error_log('UKPA Income Tax: File not found at ' . $plugin_file_path . ' (but will try URL anyway)');
    }
    
    // Get option, but if it's empty, use the plugin default
    $option_url = get_option('ukpa_income_tax_html_url', '');
    $default_src = !empty($option_url) ? $option_url : $plugin_default_src;
    
    $defaults = [
        // Priority: 1) shortcode src param, 2) plugin option (if set), 3) plugin's public/html/income.html
        'src' => $default_src,
        'height' => '2400',
        'title' => 'Income Tax Calculator',
    ];

    $atts = shortcode_atts($defaults, $atts);
    $src = trim($atts['src']);
    $src = !empty($src) ? esc_url_raw($src) : '';
    $height = preg_replace('/[^0-9]/', '', (string) $atts['height']);
    $height = $height !== '' ? $height : '2400';
    $title = sanitize_text_field($atts['title']);

    // Only show error if no URL is available at all
    if (empty($src)) {
        $error_msg = '⚠️ Income tax HTML URL is not configured. ';
        $error_msg .= 'Set it in plugin settings or pass <code>src</code> to the shortcode. ';
        $error_msg .= 'Expected file location: <code>' . esc_html($plugin_file_path) . '</code>';
        $error_msg .= '<br>Plugin URL would be: <code>' . esc_html($plugin_default_src) . '</code>';
        return '<div class="ukpa-calculator-error">' . $error_msg . '</div>';
    }
    
    error_log('UKPA Income Tax: Using src URL: ' . $src);

    // Basic sandbox: allow scripts + same-origin so it can read parent.ukpa_api_data when same-origin.
    // If you host the HTML on a different origin, remove allow-same-origin but then secure proxy won't work.
    $sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';

    return sprintf(
        '<iframe class="ukpa-income-tax-iframe" title="%s" src="%s" style="width:100%;height:%spx;border:0;" loading="lazy" sandbox="%s"></iframe>',
        esc_attr($title),
        esc_url($src),
        esc_attr($height),
        esc_attr($sandbox)
    );
}


