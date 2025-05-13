<?php 
add_action('admin_menu', function () {
    add_options_page('UKPA Calculator Settings', 'UKPA Calculator', 'manage_options', 'ukpa_calc_settings', 'ukpa_calc_settings_page');
});

function ukpa_calc_settings_page() {
    if (isset($_POST['ukpa_save_token'])) {
        check_admin_referer('ukpa_save_token');
        update_option('ukpa_plugin_token', sanitize_text_field($_POST['ukpa_plugin_token']));
        echo '<div class="notice notice-success"><p>✅ Token saved.</p></div>';
    }

    $token = get_option('ukpa_plugin_token', '');
    ?>
    <div class="wrap">
        <h1>UKPA Calculator Plugin Settings</h1>
        <form method="post">
            <?php wp_nonce_field('ukpa_save_token'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="ukpa_plugin_token">Plugin Authentication Token</label></th>
                    <td>
                        <input type="text" name="ukpa_plugin_token" id="ukpa_plugin_token" value="<?php echo esc_attr($token); ?>" style="width: 400px;" />
                        <p class="description">Paste the token provided by your UKPA team. This token authenticates API access.</p>
                    </td>
                </tr>
            </table>
            <p><input type="submit" name="ukpa_save_token" class="button button-primary" value="Save Token" /></p>
        </form>
    </div>
    <?php
}
