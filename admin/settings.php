<?php
if (!defined('ABSPATH')) exit;

// ✅ Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ukpa_save_token'])) {
    check_admin_referer('ukpa_save_token');

    $new_token = sanitize_text_field($_POST['ukpa_plugin_token'] ?? '');
    update_option('ukpa_plugin_token', $new_token);

    echo '<div class="notice notice-success is-dismissible"><p>✅ Plugin token saved successfully.</p></div>';
}

// ✅ Retrieve current token from database
$current_token = get_option('ukpa_plugin_token', '');
?>

<div class="wrap">
    <h1>UKPA Calculator Settings</h1>

    <form method="post" action="">
        <?php wp_nonce_field('ukpa_save_token'); ?>

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
        </table>

        <?php submit_button('Save Token'); ?>
    </form>
</div>
