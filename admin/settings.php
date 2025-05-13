<?php
if (!defined('ABSPATH')) exit;

// ✅ Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ukpa_save_token'])) {
    check_admin_referer('ukpa_save_token');
    $new_token = sanitize_text_field($_POST['ukpa_plugin_token'] ?? '');
    update_option('ukpa_plugin_token', $new_token);

    echo '<div class="notice notice-success is-dismissible"><p>✅ Plugin token has been saved successfully.</p></div>';
}

// ✅ Retrieve current token value
$current_token = get_option('ukpa_plugin_token', '');

?>

<div class="wrap">
    <h1>UKPA Calculator Plugin Settings</h1>
    <form method="post" action="">
        <?php wp_nonce_field('ukpa_save_token'); ?>

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="ukpa_plugin_token">Plugin Authentication Token</label>
                </th>
                <td>
                    <input type="text" id="ukpa_plugin_token" name="ukpa_plugin_token"
                           value="<?php echo esc_attr($current_token); ?>"
                           style="width: 400px;" class="regular-text" />
                    <p class="description">Paste the token provided by the backend team to authenticate requests.</p>
                </td>
            </tr>
        </table>

        <p class="submit">
            <input type="submit" name="ukpa_save_token" class="button button-primary" value="Save Token" />
        </p>
    </form>
</div>
