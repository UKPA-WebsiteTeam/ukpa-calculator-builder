<?php
/**
 * Settings page for UKPA Calculator Builder
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

    // Handle form submission
    if (isset($_POST['submit']) && wp_verify_nonce($_POST['ukpa_settings_nonce'], 'ukpa_settings')) {
        $license_key = sanitize_text_field($_POST['ukpa_license_key']);
        $plugin_token = sanitize_text_field($_POST['ukpa_plugin_token']);
        $selected_website = sanitize_text_field($_POST['ukpa_selected_website']);
        
        update_option('ukpa_license_key', $license_key);
        update_option('ukpa_plugin_token', $plugin_token);
        update_option('ukpa_selected_website', $selected_website);
        
        // Log the save action
        error_log('UKPA Settings Saved - License Key: ' . substr($license_key, 0, 8) . '...');
        
        echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
    }
    
    $license_key = get_option('ukpa_license_key', '');
    $plugin_token = get_option('ukpa_plugin_token', '');
    $selected_website = get_option('ukpa_selected_website', 'UKPA');
    
    // Check for updates
    $update_info = get_transient('ukpa_plugin_update_info');
    $current_version = '1.1.4';
    $has_update = false;
    $latest_version = '';
    
    if ($update_info && isset($update_info['version'])) {
        $latest_version = $update_info['version'];
        $has_update = version_compare($current_version, $latest_version, '<');
    }
    
    ?>
    <div class="wrap">
        <h1>UKPA Calculator Builder Settings</h1>
        
        <div class="ukpa-settings-container">
            <div class="ukpa-settings-main">
                <form method="post" action="">
                    <?php wp_nonce_field('ukpa_settings', 'ukpa_settings_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="ukpa_license_key">License Key</label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="ukpa_license_key" 
                                       name="ukpa_license_key" 
                                       value="<?php echo esc_attr($license_key); ?>" 
                                       class="regular-text" />
                                <p class="description">
                                    Enter your license key to enable automatic updates. 
                                    Your license key can be found in your account dashboard.
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="ukpa_plugin_token">Plugin Token</label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="ukpa_plugin_token" 
                                       name="ukpa_plugin_token" 
                                       value="<?php echo esc_attr($plugin_token); ?>" 
                                       class="regular-text" />
                                <p class="description">
                                    Your plugin authentication token for API access.
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="ukpa_selected_website">Website</label>
                            </th>
                            <td>
                                <select id="ukpa_selected_website" name="ukpa_selected_website">
                                    <option value="UKPA" <?php selected($selected_website, 'UKPA'); ?>>UKPA</option>
                                    <option value="Other" <?php selected($selected_website, 'Other'); ?>>Other</option>
                                </select>
                                <p class="description">
                                    Select your website type for API routing.
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button('Save Settings'); ?>
                </form>
            </div>
            
            <div class="ukpa-settings-sidebar">
                <div class="ukpa-update-status">
                    <h3>Update Status</h3>
                    
                    <div class="ukpa-version-info">
                        <p><strong>Current Version:</strong> <?php echo esc_html($current_version); ?></p>
                        
                        <?php if ($has_update): ?>
                            <div class="ukpa-update-available">
                                <p><strong>Latest Version:</strong> <?php echo esc_html($latest_version); ?></p>
                                <p class="ukpa-update-notice">
                                    A new version is available! 
                                    <a href="<?php echo admin_url('plugins.php'); ?>">Go to Plugins</a> to update.
                                </p>
                            </div>
                        <?php else: ?>
                            <p class="ukpa-up-to-date">✓ Your plugin is up to date!</p>
                        <?php endif; ?>
                    </div>
                    
                    <button type="button" class="button" onclick="checkForUpdates()">
                        Check for Updates
                    </button>
                </div>
                
                <div class="ukpa-license-status">
                    <h3>License Status</h3>
                    <?php if (!empty($license_key)): ?>
                        <p class="ukpa-license-valid">✓ License key is configured</p>
                        <p class="ukpa-license-key">
                            <strong>Key:</strong> <?php echo esc_html(substr($license_key, 0, 8) . '...'); ?>
                        </p>
                    <?php else: ?>
                        <p class="ukpa-license-invalid">⚠ No license key configured</p>
                        <p class="ukpa-license-notice">
                            Enter your license key above to enable automatic updates.
                        </p>
                    <?php endif; ?>
                </div>
                
                <div class="ukpa-support-info">
                    <h3>Support</h3>
                    <p>Need help? Contact us:</p>
                    <ul>
                        <li><a href="https://ukpacalculator.com/support" target="_blank">Support Portal</a></li>
                        <li><a href="mailto:support@ukpacalculator.com">Email Support</a></li>
                        <li><a href="https://ukpacalculator.com/docs" target="_blank">Documentation</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        .ukpa-settings-container {
            display: flex;
            gap: 30px;
            margin-top: 20px;
        }
        
        .ukpa-settings-main {
            flex: 2;
        }
        
        .ukpa-settings-sidebar {
            flex: 1;
            max-width: 300px;
        }
        
        .ukpa-update-status,
        .ukpa-license-status,
        .ukpa-support-info {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .ukpa-update-status h3,
        .ukpa-license-status h3,
        .ukpa-support-info h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #23282d;
        }
        
        .ukpa-up-to-date {
            color: #46b450;
            font-weight: 600;
        }
        
        .ukpa-update-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
        }
        
        .ukpa-license-valid {
            color: #46b450;
            font-weight: 600;
        }
        
        .ukpa-license-invalid {
            color: #dc3232;
            font-weight: 600;
        }
        
        .ukpa-license-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
        }
        
        .ukpa-support-info ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .ukpa-support-info li {
            margin-bottom: 5px;
        }
    </style>
    
    <script>
        function checkForUpdates() {
            const button = event.target;
            const originalText = button.textContent;
            
            button.textContent = 'Checking...';
            button.disabled = true;
            
            // Clear the cached update info to force a fresh check
            fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=ukpa_clear_update_cache&nonce=<?php echo wp_create_nonce('ukpa_clear_cache'); ?>'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload the page to show updated status
                    location.reload();
                } else {
                    alert('Failed to check for updates. Please try again.');
                    button.textContent = originalText;
                    button.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to check for updates. Please try again.');
                button.textContent = originalText;
                button.disabled = false;
            });
        }

        // Log license key submission
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const licenseKeyInput = document.getElementById('ukpa_license_key');
            
            // Check if there was a previous license submission
            const lastSubmission = localStorage.getItem('ukpa_last_license_submission');
            if (lastSubmission) {
                const submission = JSON.parse(lastSubmission);
                console.log('🔄 Previous License Submission Detected:', submission);
                localStorage.removeItem('ukpa_last_license_submission'); // Clean up
            }
            
            if (form && licenseKeyInput) {
                // Use a named handler so we can remove it
                function licenseFormHandler(e) {
                    const licenseKey = licenseKeyInput.value.trim();
                    if (licenseKey) {
                        console.log('🔑 License Key Submission:', {
                            action: 'license_key_saved',
                            license_key: licenseKey,
                            license_key_length: licenseKey.length,
                            license_key_prefix: licenseKey.substring(0, 8) + '...',
                            timestamp: new Date().toISOString(),
                            user_agent: navigator.userAgent,
                            page_url: window.location.href
                        });
                        console.log('📤 Sending license key to server for validation...');
                        localStorage.setItem('ukpa_last_license_submission', JSON.stringify({
                            license_key: licenseKey,
                            timestamp: new Date().toISOString(),
                            action: 'license_key_saved'
                        }));
                        e.preventDefault();
                        setTimeout(() => {
                            console.log('⏰ Proceeding with form submission...');
                            form.removeEventListener('submit', licenseFormHandler);
                            form.submit();
                        }, 2000);
                    } else {
                        console.log('⚠️ License key field is empty');
                    }
                }
                form.addEventListener('submit', licenseFormHandler);
                
                // Also log when user types in the license key field
                licenseKeyInput.addEventListener('input', function(e) {
                    const currentValue = e.target.value;
                    console.log('✏️ License Key Input:', {
                        action: 'license_key_typing',
                        current_length: currentValue.length,
                        has_value: currentValue.length > 0,
                        timestamp: new Date().toISOString()
                    });
                });
                
                // Log when user focuses/blurs the license key field
                licenseKeyInput.addEventListener('focus', function() {
                    console.log('🎯 License Key Field Focused');
                });
                
                licenseKeyInput.addEventListener('blur', function() {
                    const value = this.value.trim();
                    console.log('👁️ License Key Field Blur:', {
                        has_value: value.length > 0,
                        value_length: value.length
                    });
                });
            }
        });
    </script>
    <?php
