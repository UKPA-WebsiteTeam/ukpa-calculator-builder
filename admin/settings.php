<?php
if (!defined('ABSPATH')) exit;

// ✅ Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ukpa_save_token'])) {
    check_admin_referer('ukpa_save_token');

    $new_token = sanitize_text_field($_POST['ukpa_plugin_token'] ?? '');
    update_option('ukpa_plugin_token', $new_token);

    $selected_website = sanitize_text_field($_POST['ukpa_selected_website'] ?? 'UKPA');
    update_option('ukpa_selected_website', $selected_website);

    echo '<div class="notice notice-success is-dismissible"><p>✅ Settings saved successfully.</p></div>';
}

// ✅ Retrieve current values from database
$current_token = get_option('ukpa_plugin_token', '');
$current_website = get_option('ukpa_selected_website', 'UKPA');
?>

<div class="wrap">
    <h1>UKPA Calculator Settings</h1>
    <form method="post" action="">
        <?php wp_nonce_field('ukpa_save_token'); ?>
        <input type="hidden" name="ukpa_save_token" value="1">

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="ukpa_plugin_token">Plugin Authentication Token</label>
                </th>
                <td>
                    <input type="text" name="ukpa_plugin_token" id="ukpa_plugin_token" class="regular-text" value="<?php echo esc_attr($current_token); ?>">
                    <p class="description">Enter your backend API token for secure communication.</p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="ukpa_selected_website">Select Website Source</label>
                </th>
                <td>
                    <select name="ukpa_selected_website" id="ukpa_selected_website">
                        <?php foreach (['UKPA', 'FIGS_FLOW', 'STERLING_WELLS'] as $option): ?>
                            <option value="<?php echo $option; ?>" <?php selected($current_website, $option); ?>>
                                <?php echo $option; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description">Choose the website this plugin instance is running on.</p>
                </td>
            </tr>
        </table>

        <?php submit_button('Save Settings'); ?>
    </form>
</div>
