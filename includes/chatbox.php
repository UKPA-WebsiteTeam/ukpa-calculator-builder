<?php
/**
 * UKPA Calculator Builder - Chat Box System
 *
 * Handles communication with trained Node.js backend model
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbox_System {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Prevent cloning
     */
    private function __clone() {}
    
    /**
     * Prevent unserializing
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
    
    private function __construct() {
        add_action('init', array($this, 'init_chatbox'));
        add_action('wp_ajax_ukpa_chatbox_message', array($this, 'handle_chatbox_message'));
        add_action('wp_ajax_nopriv_ukpa_chatbox_message', array($this, 'handle_chatbox_message'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('wp_footer', array($this, 'render_global_chatbox'));
        add_action('admin_init', array($this, 'register_chatbox_settings'));
        add_shortcode('ukpa_chatbox', array($this, 'render_chatbox_shortcode'));
    }
    
    /**
     * Initialize chat box system
     */
    public function init_chatbox() {
        // Initialize settings
        $this->register_chatbox_settings();
    }
    
    /**
     * Register chat box settings
     */
    public function register_chatbox_settings() {
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_enabled');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_backend_url');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_api_key');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_timeout');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_theme');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_position');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_exclude_pages');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_welcome_message');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_placeholder');
    }
    
    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'ukpa-chatbox-frontend',
            UKPA_CALC_URL . 'assets/css/chatbox-frontend.css',
            array(),
            defined('UKPA_CALC_VERSION') ? UKPA_CALC_VERSION : '1.0.0'
        );
        
        // Add custom CSS based on settings
        $this->add_custom_css();
        
        wp_enqueue_script(
            'ukpa-chatbox-frontend',
            UKPA_CALC_URL . 'assets/js/chatbox-frontend.js',
            array('jquery'),
            '1.1.6', // Force cache refresh
            true
        );
        
        wp_localize_script('ukpa-chatbox-frontend', 'ukpa_chatbox_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ukpa_chatbox_nonce'),
            'enabled' => get_option('ukpa_chatbox_enabled', false),
            'backend_url' => get_option('ukpa_chatbox_backend_url', 'http://192.168.18.54:3002/ana/api/v1/chatbot/ask'),
            'welcome_message' => get_option('ukpa_chatbox_welcome_message', 'Hello! How can I help you today?'),
            'placeholder' => get_option('ukpa_chatbox_placeholder', 'Type your message...')
        ));
    }
    
    /**
     * Add custom CSS based on settings
     */
    private function add_custom_css() {
        $font_family = get_option('ukpa_chatbox_font_family', 'Arial, sans-serif');
        $font_size = get_option('ukpa_chatbox_font_size', '14px');
        $text_color = get_option('ukpa_chatbox_text_color', '#333333');
        $bg_color = get_option('ukpa_chatbox_background_color', '#ffffff');
        $border_radius = get_option('ukpa_chatbox_border_radius', '8px');
        $border_color = get_option('ukpa_chatbox_border_color', '#e0e0e0');
        $border_width = get_option('ukpa_chatbox_border_width', '1px');
        $box_shadow = get_option('ukpa_chatbox_box_shadow', '0 2px 10px rgba(0,0,0,0.1)');
        $header_bg_color = get_option('ukpa_chatbox_header_bg_color', '#007cba');
        $header_text_color = get_option('ukpa_chatbox_header_text_color', '#ffffff');
        $user_message_bg_color = get_option('ukpa_chatbox_user_message_bg_color', '#007cba');
        $user_message_text_color = get_option('ukpa_chatbox_user_message_text_color', '#ffffff');
        $bot_message_bg_color = get_option('ukpa_chatbox_bot_message_bg_color', '#f1f1f1');
        $bot_message_text_color = get_option('ukpa_chatbox_bot_message_text_color', '#333333');
        $input_bg_color = get_option('ukpa_chatbox_input_bg_color', '#ffffff');
        $input_text_color = get_option('ukpa_chatbox_input_text_color', '#333333');
        $input_border_color = get_option('ukpa_chatbox_input_border_color', '#e0e0e0');
        $button_bg_color = get_option('ukpa_chatbox_button_bg_color', '#007cba');
        $button_text_color = get_option('ukpa_chatbox_button_text_color', '#ffffff');
        $button_hover_bg_color = get_option('ukpa_chatbox_button_hover_bg_color', '#005a87');
        $button_hover_text_color = get_option('ukpa_chatbox_button_hover_text_color', '#ffffff');
        $toggle_bg_color = get_option('ukpa_chatbox_toggle_bg_color', '#007cba');
        $toggle_text_color = get_option('ukpa_chatbox_toggle_text_color', '#ffffff');
        $toggle_hover_bg_color = get_option('ukpa_chatbox_toggle_hover_bg_color', '#005a87');
        $toggle_hover_text_color = get_option('ukpa_chatbox_toggle_hover_text_color', '#ffffff');
        $width = get_option('ukpa_chatbox_width', '350px');
        $height = get_option('ukpa_chatbox_height', '500px');
        $max_width = get_option('ukpa_chatbox_max_width', '400px');
        $max_height = get_option('ukpa_chatbox_max_height', '600px');
        $z_index = get_option('ukpa_chatbox_z_index', '9999');
        
        $custom_css = "
        .ukpa-chatbox {
            font-family: {$font_family} !important;
            font-size: {$font_size} !important;
            color: {$text_color} !important;
            background-color: {$bg_color} !important;
            border-radius: {$border_radius} !important;
            border: {$border_width} solid {$border_color} !important;
            box-shadow: {$box_shadow} !important;
            width: {$width} !important;
            height: {$height} !important;
            max-width: {$max_width} !important;
            max-height: {$max_height} !important;
            z-index: {$z_index} !important;
        }
        
        .ukpa-chatbox-header {
            background-color: {$header_bg_color} !important;
            color: {$header_text_color} !important;
        }
        
        .ukpa-chatbox-message-user .ukpa-chatbox-message-content {
            background-color: {$user_message_bg_color} !important;
            color: {$user_message_text_color} !important;
        }
        
        .ukpa-chatbox-message-bot .ukpa-chatbox-message-content {
            background-color: {$bot_message_bg_color} !important;
            color: {$bot_message_text_color} !important;
        }
        
        .ukpa-chatbox-input {
            background-color: {$input_bg_color} !important;
            color: {$input_text_color} !important;
            border-color: {$input_border_color} !important;
            outline: none !important;
        }
        
        .ukpa-chatbox-input:focus {
            outline: none !important;
            border-color: {$input_border_color} !important;
        }
        
        .ukpa-chatbox-send,
        .ukpa-chatbox-toggle-btn {
            background-color: {$button_bg_color} !important;
            color: {$button_text_color} !important;
        }
        
        .ukpa-chatbox-send:hover,
        .ukpa-chatbox-toggle-btn:hover {
            background-color: {$button_hover_bg_color} !important;
            color: {$button_hover_text_color} !important;
        }
        
        .ukpa-chatbox-toggle-btn {
            background-color: {$toggle_bg_color} !important;
            color: {$toggle_text_color} !important;
        }
        
        .ukpa-chatbox-toggle-btn:hover {
            background-color: {$toggle_hover_bg_color} !important;
            color: {$toggle_hover_text_color} !important;
        }
        ";
        
        wp_add_inline_style('ukpa-chatbox-frontend', $custom_css);
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'ukpa-chatbox') === false) {
            return;
        }
        
        wp_enqueue_style(
            'ukpa-chatbox-admin',
            UKPA_CALC_URL . 'assets/css/chatbox-admin.css',
            array(),
            defined('UKPA_CALC_VERSION') ? UKPA_CALC_VERSION : '1.0.0'
        );
        
        wp_enqueue_script(
            'ukpa-chatbox-admin',
            UKPA_CALC_URL . 'assets/js/chatbox-admin.js',
            array('jquery'),
            defined('UKPA_CALC_VERSION') ? UKPA_CALC_VERSION : '1.0.0',
            true
        );
    }
    
    /**
     * Handle chat box message AJAX
     */
    public function handle_chatbox_message() {
        check_ajax_referer('ukpa_chatbox_nonce', 'nonce');
        
        $message = sanitize_textarea_field($_POST['message']);
        $session_id = sanitize_text_field($_POST['session_id']);
        
        if (empty($message)) {
            wp_die(json_encode(array(
                'success' => false,
                'message' => (string) 'Question is required'
            )));
        }
        
        // Validate that message is a non-empty string (backend requirement)
        if (!is_string($message) || trim($message) === '') {
            wp_die(json_encode(array(
                'success' => false,
                'message' => (string) 'Question must be a non-empty string'
            )));
        }
        
        // Send to Node.js backend
        $response = $this->send_to_backend($message, $session_id);
        
        wp_die(json_encode($response));
    }
    
    /**
     * Send message to Node.js backend
     */
    private function send_to_backend($message, $session_id) {
        $backend_url = get_option('ukpa_chatbox_backend_url', 'http://192.168.18.54:3002/ana/api/v1/chatbot/ask');
        $api_key = get_option('ukpa_chatbox_api_key');
        $timeout = get_option('ukpa_chatbox_timeout', 30);
        
        // Validate that the backend URL is the correct endpoint
        $expected_url = 'http://192.168.18.54:3002/ana/api/v1/chatbot/ask';
        if ($backend_url !== $expected_url) {
            // Force the correct URL
            $backend_url = $expected_url;
            // Update the option to ensure consistency
            update_option('ukpa_chatbox_backend_url', $expected_url);
        }
        
        if (empty($backend_url)) {
            return array(
                'success' => false,
                'message' => (string) 'Backend URL not configured'
            );
        }
        
        // Prepare request data - match backend expected format
        $request_data = array(
            'question' => (string) $message
        );
        
        // Add system prompt if configured
        $system_prompt = get_option('ukpa_chatbox_system_prompt', 'You are a helpful assistant for UKPA.');
        if (!empty($system_prompt)) {
            $request_data['systemPrompt'] = (string) $system_prompt;
        }
        
        // Note: API key is not included in the request as the backend doesn't expect it
        // in the current format. If authentication is needed, it should be handled
        // via headers or a different mechanism.
        
        // Make request to backend
        $response = wp_remote_post($backend_url, array(
            'timeout' => $timeout,
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($request_data),
            'data_format' => 'body'
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => (string) ('Connection error: ' . $response->get_error_message())
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            return array(
                'success' => false,
                'message' => (string) ('Backend error: HTTP ' . $response_code)
            );
        }
        
        $response_data = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return array(
                'success' => false,
                'message' => (string) 'Invalid response from backend'
            );
        }
        
        return array(
            'success' => true,
            'response' => (string) ($response_data['answer'] ?? 'No response from model'),
            'model_info' => $response_data['model_info'] ?? array()
        );
    }
    
    /**
     * Get client IP address
     */
    private function get_client_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return (string) $ip;
                    }
                }
            }
        }
        return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    }
    
    /**
     * Render global chat box
     */
    public function render_global_chatbox() {
        $enabled = get_option('ukpa_chatbox_enabled', false);
        
        if (!$enabled) {
            return;
        }
        
        $exclude_pages = get_option('ukpa_chatbox_exclude_pages', '');
        if ($this->should_exclude_current_page($exclude_pages)) {
            return;
        }
        
        // Prevent duplicate chat boxes
        static $rendered = false;
        if ($rendered) {
            return;
        }
        $rendered = true;
        
        $this->render_chatbox_html();
    }
    
    /**
     * Render chat box shortcode
     */
    public function render_chatbox_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 'default'
        ), $atts);
        
        return $this->render_chatbox_html($atts['id']);
    }
    
    /**
     * Render chat box HTML
     */
    private function render_chatbox_html($chatbox_id = 'global') {
        $theme = get_option('ukpa_chatbox_theme', 'light');
        $position = get_option('ukpa_chatbox_position', 'bottom-right');
        $welcome_message = get_option('ukpa_chatbox_welcome_message', 'Hello! How can I help you today?');
        $placeholder = get_option('ukpa_chatbox_placeholder', 'Type your message...');
        
        $chatbox_id = sanitize_html_class($chatbox_id);
        
        ?>
        <div id="ukpa-chatbox-<?php echo esc_attr($chatbox_id); ?>" 
             class="ukpa-chatbox ukpa-chatbox-<?php echo esc_attr($theme); ?> ukpa-chatbox-<?php echo esc_attr($position); ?>"
             data-chatbox-id="<?php echo esc_attr($chatbox_id); ?>">
            
            <!-- Chat Box Header -->
            <div class="ukpa-chatbox-header">
                <div class="ukpa-chatbox-title">
                    <span class="ukpa-chatbox-icon">💬</span>
                    <span class="ukpa-chatbox-title-text">AI Assistant</span>
                </div>
                <div class="ukpa-chatbox-controls">
                    <button class="ukpa-chatbox-minimize" aria-label="Minimize chat">−</button>
                    <button class="ukpa-chatbox-close" aria-label="Close chat">×</button>
                </div>
            </div>
            
            <!-- Chat Box Body -->
            <div class="ukpa-chatbox-body">
                <div class="ukpa-chatbox-messages">
                    <div class="ukpa-chatbox-message ukpa-chatbox-message-bot">
                        <div class="ukpa-chatbox-message-content">
                            <?php echo esc_html($welcome_message); ?>
                        </div>
                        <div class="ukpa-chatbox-message-time">
                            <?php echo esc_html(current_time('H:i')); ?>
                        </div>
                    </div>
                </div>
                
                <!-- Typing Indicator -->
                <div class="ukpa-chatbox-typing" style="display: none;">
                    <div class="ukpa-chatbox-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
            
            <!-- Chat Box Footer -->
            <div class="ukpa-chatbox-footer">
                <form class="ukpa-chatbox-form">
                    <div class="ukpa-chatbox-input-wrapper">
                        <textarea 
                            class="ukpa-chatbox-input" 
                            placeholder="<?php echo esc_attr($placeholder); ?>"
                            rows="1"
                            maxlength="1000"></textarea>
                        <button type="submit" class="ukpa-chatbox-send" aria-label="Send message">
                            <span>➤</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Chat Box Toggle Button -->
        <div class="ukpa-chatbox-toggle ukpa-chatbox-<?php echo esc_attr($position); ?>">
            <button class="ukpa-chatbox-toggle-btn" aria-label="Open chat">
                <span class="ukpa-chatbox-toggle-icon">💬</span>
            </button>
        </div>
        <?php
    }
    
    /**
     * Check if current page should be excluded
     */
    private function should_exclude_current_page($exclude_pages) {
        if (empty($exclude_pages)) {
            return false;
        }
        
        $current_page_id = get_the_ID();
        $current_page_slug = get_post_field('post_name', get_post());
        $current_url = $_SERVER['REQUEST_URI'] ?? '';
        
        $exclude_list = array_map('trim', explode(',', $exclude_pages));
        
        foreach ($exclude_list as $exclude) {
            // Check by page ID
            if (is_numeric($exclude) && $current_page_id == intval($exclude)) {
                return true;
            }
            
            // Check by page slug
            if ($current_page_slug === $exclude) {
                return true;
            }
            
            // Check by URL path
            if (strpos($current_url, $exclude) !== false) {
                return true;
            }
        }
        
        return false;
    }
}

// Initialize the chat box system
UKPA_Chatbox_System::get_instance(); 