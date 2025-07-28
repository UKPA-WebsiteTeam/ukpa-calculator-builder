<?php
/**
 * UKPA Calculator Builder - ChatGPT API Settings
 * 
 * Configuration page for ChatGPT API integration
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_GPT_Settings {
    
    public function __construct() {
        add_action('admin_init', array($this, 'init_gpt_settings'));
        add_action('wp_ajax_ukpa_test_gpt_api', array($this, 'test_gpt_api'));
        // Menu is now handled by UKPA_Chatbot_Menu class
    }
    
    /**
     * Initialize GPT settings
     */
    public function init_gpt_settings() {
        register_setting('ukpa_gpt_settings', 'ukpa_gpt_api_endpoint');
        register_setting('ukpa_gpt_settings', 'ukpa_gpt_api_key');
        register_setting('ukpa_gpt_settings', 'ukpa_gpt_timeout');
        register_setting('ukpa_gpt_settings', 'ukpa_gpt_enable_logging');
        
        add_settings_section(
            'ukpa_gpt_api_section',
            'ChatGPT API Configuration',
            array($this, 'render_api_section_description'),
            'ukpa_gpt_settings'
        );
        
        add_settings_field(
            'ukpa_gpt_api_endpoint',
            'API Endpoint',
            array($this, 'render_endpoint_field'),
            'ukpa_gpt_settings',
            'ukpa_gpt_api_section'
        );
        
        add_settings_field(
            'ukpa_gpt_api_key',
            'API Key',
            array($this, 'render_api_key_field'),
            'ukpa_gpt_settings',
            'ukpa_gpt_api_section'
        );
        
        add_settings_field(
            'ukpa_gpt_timeout',
            'Request Timeout',
            array($this, 'render_timeout_field'),
            'ukpa_gpt_settings',
            'ukpa_gpt_api_section'
        );
        
        add_settings_field(
            'ukpa_gpt_enable_logging',
            'Enable Logging',
            array($this, 'render_logging_field'),
            'ukpa_gpt_settings',
            'ukpa_gpt_api_section'
        );
    }
    
    /**
     * Render GPT settings page
     */
    public function render_gpt_settings_page() {
        ?>
        <div class="wrap">
            <h1>ChatGPT API Settings</h1>
            <p>Configure your trained ChatGPT API backend for intelligent chatbot responses.</p>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('ukpa_gpt_settings');
                do_settings_sections('ukpa_gpt_settings');
                submit_button('Save ChatGPT Settings');
                ?>
            </form>
            
            <div class="ukpa-gpt-test-section">
                <h3>Test API Connection</h3>
                <p>Test your ChatGPT API connection to ensure it's working properly.</p>
                <button type="button" id="ukpa-test-gpt-api" class="button button-primary">Test Connection</button>
                <div id="ukpa-test-result" style="margin-top: 10px;"></div>
            </div>
            
            <div class="ukpa-gpt-settings-help">
                <h3>ChatGPT Integration Guide</h3>
                
                <h4>🔧 API Configuration</h4>
                <p>Your ChatGPT API should accept POST requests with the following JSON structure:</p>
                <pre><code>{
  "message": "User message",
  "session_id": "unique_session_id",
  "context": [
    {
      "message": "Previous message",
      "timestamp": 1234567890
    }
  ],
  "config": {
    "personality": "helpful",
    "domain": "calculator",
    "max_tokens": 150,
    "temperature": 0.7
  },
  "user_info": {
    "ip": "user_ip",
    "user_agent": "browser_info"
  },
  "timestamp": 1234567890
}</code></pre>
                
                <h4>📤 Expected Response</h4>
                <p>Your API should return a JSON response in this format:</p>
                <pre><code>{
  "response": "AI generated response",
  "confidence": 0.95,
  "tokens_used": 45,
  "processing_time": 1.2
}</code></pre>
                
                <h4>🎯 Creating GPT Chatbots</h4>
                <ol>
                    <li>Go to <strong>Chatbots</strong> → <strong>Add New</strong></li>
                    <li>Set <strong>Chatbot Type</strong> to "GPT"</li>
                    <li>Configure personality and other settings</li>
                    <li>Save the chatbot</li>
                    <li>Use the shortcode to display it</li>
                </ol>
                
                <h4>🔒 Security Considerations</h4>
                <ul>
                    <li>Use HTTPS for your API endpoint</li>
                    <li>Implement proper API key validation</li>
                    <li>Rate limit requests to prevent abuse</li>
                    <li>Log API interactions for monitoring</li>
                </ul>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#ukpa-test-gpt-api').on('click', function() {
                const button = $(this);
                const resultDiv = $('#ukpa-test-result');
                
                button.prop('disabled', true).text('Testing...');
                resultDiv.html('<p>Testing API connection...</p>');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ukpa_test_gpt_api',
                        nonce: '<?php echo wp_create_nonce('ukpa_gpt_test_nonce'); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            resultDiv.html('<div class="notice notice-success"><p>' + response.data.message + '</p><p><strong>Test Response:</strong> ' + response.data.test_response + '</p></div>');
                        } else {
                            resultDiv.html('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                        }
                    },
                    error: function() {
                        resultDiv.html('<div class="notice notice-error"><p>Failed to test API connection. Please check your settings.</p></div>');
                    },
                    complete: function() {
                        button.prop('disabled', false).text('Test Connection');
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    /**
     * Test GPT API connection
     */
    public function test_gpt_api() {
        check_ajax_referer('ukpa_gpt_test_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $gpt = UKPA_Chatbot_GPT::get_instance();
        $result = $gpt->test_api_connection();
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * Render API section description
     */
    public function render_api_section_description() {
        echo '<p>Configure your trained ChatGPT API backend. The API should accept POST requests and return JSON responses.</p>';
    }
    
    /**
     * Render endpoint field
     */
    public function render_endpoint_field() {
        $endpoint = get_option('ukpa_gpt_api_endpoint', '');
        ?>
        <input type="url" name="ukpa_gpt_api_endpoint" value="<?php echo esc_attr($endpoint); ?>" class="regular-text" placeholder="https://your-api.com/chat">
        <p class="description">The full URL to your ChatGPT API endpoint (e.g., https://api.yourdomain.com/chat)</p>
        <?php
    }
    
    /**
     * Render API key field
     */
    public function render_api_key_field() {
        $api_key = get_option('ukpa_gpt_api_key', '');
        ?>
        <input type="password" name="ukpa_gpt_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" placeholder="your-api-key">
        <p class="description">Your ChatGPT API authentication key</p>
        <?php
    }
    
    /**
     * Render timeout field
     */
    public function render_timeout_field() {
        $timeout = get_option('ukpa_gpt_timeout', 30);
        ?>
        <input type="number" name="ukpa_gpt_timeout" value="<?php echo esc_attr($timeout); ?>" min="5" max="120" step="5">
        <p class="description">Request timeout in seconds (5-120 seconds)</p>
        <?php
    }
    
    /**
     * Render logging field
     */
    public function render_logging_field() {
        $logging = get_option('ukpa_gpt_enable_logging', '0');
        ?>
        <label>
            <input type="checkbox" name="ukpa_gpt_enable_logging" value="1" <?php checked($logging, '1'); ?>>
            Enable detailed logging of API requests and responses
        </label>
        <p class="description">Logs will be written to WordPress debug log when WP_DEBUG is enabled</p>
        <?php
    }
}

// Initialize the GPT settings
// new UKPA_Chatbot_GPT_Settings(); // DISABLED 