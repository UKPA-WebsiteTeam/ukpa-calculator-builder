<?php
/**
 * UKPA Calculator Builder - Chat Box System - Fixed Toggle Issue
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
    
    private function __clone() {}
    
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
    
    private function __construct() {
        add_action('init', array($this, 'init_chatbox'));
        add_action('wp_ajax_ukpa_chatbox_message', array($this, 'handle_chatbox_message'));
        add_action('wp_ajax_nopriv_ukpa_chatbox_message', array($this, 'handle_chatbox_message'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('wp_footer', array($this, 'render_global_chatbox'));
        add_shortcode('ukpa_chatbox', array($this, 'render_chatbox_shortcode'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    public function init_chatbox() {
        $this->set_default_options();
    }
    
    private function set_default_options() {
        $defaults = array(
            'ukpa_chatbox_enabled' => true,
            'ukpa_chatbox_backend_url' => 'http://localhost:3002/ana/api/v1/chatbot/ask',
            'ukpa_chatbox_timeout' => 30,
            'ukpa_chatbox_welcome_message' => 'Hello! I\'m your calculator assistant. How can I help you with calculations today?',
            'ukpa_chatbox_placeholder' => 'Type your calculation or question...',
            'ukpa_chatbox_bot_name' => 'Calculator Assistant',
        );
        
        foreach ($defaults as $option => $value) {
            if (get_option($option) === false) {
                update_option($option, $value);
            }
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            'UKPA Chatbox Settings',
            'UKPA Chatbox',
            'manage_options',
            'ukpa-chatbox-settings',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('ukpa_chatbox_enabled', isset($_POST['ukpa_chatbox_enabled']));
            update_option('ukpa_chatbox_backend_url', sanitize_url($_POST['ukpa_chatbox_backend_url']));
            update_option('ukpa_chatbox_bot_name', sanitize_text_field($_POST['ukpa_chatbox_bot_name']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $enabled = get_option('ukpa_chatbox_enabled', true);
        $backend_url = get_option('ukpa_chatbox_backend_url', 'http://localhost:3002/ana/api/v1/chatbot/ask');
        $bot_name = get_option('ukpa_chatbox_bot_name', 'Calculator Assistant');
        
        ?>
        <div class="wrap">
            <h1>UKPA Chatbox Settings</h1>
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">Enable Chatbox</th>
                        <td>
                            <input type="checkbox" name="ukpa_chatbox_enabled" value="1" <?php checked($enabled, true); ?>>
                            <label>Enable the chatbox on your website</label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Bot Name</th>
                        <td>
                            <input type="text" name="ukpa_chatbox_bot_name" value="<?php echo esc_attr($bot_name); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Backend URL</th>
                        <td>
                            <input type="url" name="ukpa_chatbox_backend_url" value="<?php echo esc_attr($backend_url); ?>" class="regular-text">
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'ukpa-chatbox-frontend',
            UKPA_CALC_URL . 'assets/css/chatbox-frontend.css',
            array(),
            '2.1.0'
        );
        
        wp_enqueue_script(
            'ukpa-chatbox-frontend',
            UKPA_CALC_URL . 'assets/js/chatbox-frontend.js?v=' . time(),
            array('jquery'),
            '2.1.1',
            true
        );
        
        wp_localize_script('ukpa-chatbox-frontend', 'ukpa_chatbox_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ukpa_chatbox_nonce'),
            'enabled' => get_option('ukpa_chatbox_enabled', true),
            'backend_url' => get_option('ukpa_chatbox_backend_url', 'http://localhost:3002/ana/api/v1/chatbot/ask'),
            'welcome_message' => get_option('ukpa_chatbox_welcome_message', 'Hello! I\'m your calculator assistant.'),
            'placeholder' => get_option('ukpa_chatbox_placeholder', 'Type your calculation or question...'),
            'bot_name' => get_option('ukpa_chatbox_bot_name', 'Calculator Assistant'),
            'timeout' => get_option('ukpa_chatbox_timeout', 30)
        ));
    }
    
    public function handle_chatbox_message() {
        error_log('[WP CHATBOX] AJAX request received');
        
        if (!wp_verify_nonce($_POST['nonce'] ?? '', 'ukpa_chatbox_nonce')) {
            error_log('[WP CHATBOX] Security check failed');
            wp_send_json_error(array('message' => 'Security check failed'));
        }
        
        $message = sanitize_textarea_field($_POST['message'] ?? '');
        $session_id = sanitize_text_field($_POST['session_id'] ?? '');
        
        error_log('[WP CHATBOX] Message: ' . $message);
        error_log('[WP CHATBOX] Session ID: ' . $session_id);
        
        if (empty($message)) {
            error_log('[WP CHATBOX] Empty message');
            wp_send_json_error(array('message' => 'Question is required'));
        }
        
        error_log('[WP CHATBOX] Calling send_to_backend...');
        $response = $this->send_to_backend($message, $session_id);
        error_log('[WP CHATBOX] Backend response: ' . json_encode($response));
        
        if ($response['success']) {
            error_log('[WP CHATBOX] Sending success response');
            wp_send_json_success($response);
        } else {
            error_log('[WP CHATBOX] Sending error response');
            wp_send_json_error($response);
        }
    }
    
    private function send_to_backend($message, $session_id) {
        $backend_url = get_option('ukpa_chatbox_backend_url', 'http://localhost:3002/ana/api/v1/chatbot/ask');
        $timeout = get_option('ukpa_chatbox_timeout', 30);
        
        error_log('[WP CHATBOX] Backend URL: ' . $backend_url);
        error_log('[WP CHATBOX] Timeout: ' . $timeout);
        
        if (empty($backend_url)) {
            error_log('[WP CHATBOX] Backend URL not configured');
            return array(
                'success' => false,
                'message' => 'Backend URL not configured'
            );
        }
        
        $request_data = array('question' => $message);
        if (!empty($session_id)) {
            $request_data['session_id'] = $session_id;
        }
        
        error_log('[WP CHATBOX] Request data: ' . json_encode($request_data));
        
        $response = wp_remote_post($backend_url, array(
            'timeout' => $timeout,
            'headers' => array(
                'Content-Type' => 'application/json',
                'User-Agent' => 'UKPA-Chatbox/2.1'
            ),
            'body' => json_encode($request_data),
            'data_format' => 'body'
        ));
        
        if (is_wp_error($response)) {
            error_log('[WP CHATBOX] WP Error: ' . $response->get_error_message());
            return array(
                'success' => false,
                'message' => 'Connection error: ' . $response->get_error_message()
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        error_log('[WP CHATBOX] Response code: ' . $response_code);
        error_log('[WP CHATBOX] Response body: ' . $response_body);
        
        if ($response_code !== 200) {
            error_log('[WP CHATBOX] Non-200 response code');
            return array(
                'success' => false,
                'message' => 'Backend error: HTTP ' . $response_code
            );
        }
        
        $response_data = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('[WP CHATBOX] JSON decode error: ' . json_last_error_msg());
            return array(
                'success' => false,
                'message' => 'Invalid response from backend'
            );
        }
        
        error_log('[WP CHATBOX] Decoded response data: ' . json_encode($response_data));
        
        $final_response = array(
            'success' => true,
            'response' => $response_data['answer'] ?? $response_data['response'] ?? 'No response from model',
            'timestamp' => current_time('mysql')
        );
        
        error_log('[WP CHATBOX] Final response: ' . json_encode($final_response));
        
        return $final_response;
    }
    
    public function render_global_chatbox() {
        $enabled = get_option('ukpa_chatbox_enabled', true);
        if (!$enabled) return;
        
        static $rendered = false;
        if ($rendered) return;
        $rendered = true;
        
        $this->render_chatbox_html();
    }
    
    public function render_chatbox_shortcode($atts) {
        ob_start();
        $this->render_chatbox_html();
        return ob_get_clean();
    }
    
    private function render_chatbox_html() {
        $welcome_message = get_option('ukpa_chatbox_welcome_message', 'Hello! I\'m your calculator assistant.');
        $placeholder = get_option('ukpa_chatbox_placeholder', 'Type your calculation or question...');
        $bot_name = get_option('ukpa_chatbox_bot_name', 'Calculator Assistant');
        
        ?>
        <!-- Chat Toggle Button -->
        <button id="ukpa-chatbox-toggle" class="ukpa-chatbox-toggle">
            💬
        </button>
        
        <!-- Chat Box Container -->
        <div id="ukpa-chatbox" class="ukpa-chatbox">
            <!-- Header -->
            <div class="ukpa-chatbox-header">
                <div class="ukpa-chatbox-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span><?php echo esc_html($bot_name); ?></span>
                </div>
                <div class="ukpa-user-avatars">
                    <div class="ukpa-avatar ukpa-avatar-1"></div>
                    <div class="ukpa-avatar ukpa-avatar-2"></div>
                    <div class="ukpa-avatar ukpa-avatar-3"></div>
                </div>
                <button class="ukpa-close-btn" id="ukpa-close-btn">&times;</button>
            </div>
            
            <!-- Content -->
            <div class="ukpa-chatbox-content">
                <div class="ukpa-view-container">
                    <!-- Home View -->
                    <div id="ukpa-home-view" class="ukpa-view ukpa-active">
                        <div class="ukpa-welcome-section">
                            <h2>Hello! How can we help?</h2>
                        </div>
                        
                        <div class="ukpa-status-card">
                            <div class="ukpa-status-indicator">
                                <span class="ukpa-status-dot"></span>
                                <span>Status: All Systems Operational</span>
                            </div>
                            <div class="ukpa-status-time">Updated <?php echo date('M j, H:i T'); ?></div>
                        </div>
                        
                        <div class="ukpa-search-section">
                            <input type="text" placeholder="Search for help" class="ukpa-search-input">
                            <button class="ukpa-search-btn">🔍</button>
                        </div>
                        
                        <div class="ukpa-help-topics">
                            <div class="ukpa-help-item" data-action="calculate">
                                <span>Start Calculating</span>
                                <span class="ukpa-arrow">›</span>
                            </div>
                            <div class="ukpa-help-item" data-action="help">
                                <span>Calculator Help & FAQ</span>
                                <span class="ukpa-arrow">›</span>
                            </div>
                            <div class="ukpa-help-item" data-action="tasks">
                                <span>Learning Tasks</span>
                                <span class="ukpa-arrow">›</span>
                            </div>
                            <div class="ukpa-help-item" data-action="troubleshoot">
                                <span>Troubleshooting Calculator Issues</span>
                                <span class="ukpa-arrow">›</span>
                            </div>
                        </div>
                        
                        <button class="ukpa-ask-question-btn" id="ukpa-ask-question-home">
                            <span>Ask a question</span>
                            <span class="ukpa-question-icon">💬</span>
                        </button>
                    </div>
                    
                    <!-- Messages View -->
                    <div id="ukpa-messages-view" class="ukpa-view">
                        <h3>Messages</h3>
                        <div class="ukpa-messages-list" id="ukpa-chat-messages">
                            <!-- Welcome message will be added by JavaScript -->
                        </div>
                        
                        <div class="ukpa-chat-input-container">
                            <button class="ukpa-ask-question-btn" id="ukpa-ask-question-messages">
                                <span>Ask a question</span>
                                <span class="ukpa-question-icon">💬</span>
                            </button>
                            <div class="ukpa-input-group" id="ukpa-input-group" style="display: none;">
                                <input type="text" id="ukpa-message-input" placeholder="<?php echo esc_attr($placeholder); ?>">
                                <button id="ukpa-send-btn">📤</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Help View -->
                    <div id="ukpa-help-view" class="ukpa-view">
                        <h3>Help</h3>
                        <div class="ukpa-search-section">
                            <input type="text" placeholder="Search for help" class="ukpa-search-input">
                            <button class="ukpa-search-btn">🔍</button>
                        </div>
                        
                        <div class="ukpa-collections-header">7 collections</div>
                        
                        <div class="ukpa-help-categories">
                            <div class="ukpa-help-category">
                                <div class="ukpa-category-title">Calculator Frequently Asked Questions</div>
                                <div class="ukpa-category-count">40 articles</div>
                                <span class="ukpa-arrow">›</span>
                            </div>
                            <div class="ukpa-help-category">
                                <div class="ukpa-category-title">Basic Operations</div>
                                <div class="ukpa-category-subtitle">Addition, Subtraction, Multiplication, Division</div>
                                <div class="ukpa-category-count">6 articles</div>
                                <span class="ukpa-arrow">›</span>
                            </div>
                            <div class="ukpa-help-category">
                                <div class="ukpa-category-title">Advanced Functions</div>
                                <div class="ukpa-category-count">5 articles</div>
                                <span class="ukpa-arrow">›</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tasks View -->
                    <div id="ukpa-tasks-view" class="ukpa-view">
                        <h3>Tasks</h3>
                        <div class="ukpa-task-card">
                            <h4>Master Calculator Functions</h4>
                            <p>Take these quick steps to learn essential calculator operations.</p>
                            
                            <div class="ukpa-task-progress">
                                <span>1 of 7 done</span>
                                <span class="ukpa-time-left">About 6 minutes left</span>
                            </div>
                            <div class="ukpa-progress-bar">
                                <div class="ukpa-progress-fill" style="width: 14%"></div>
                            </div>
                            
                            <div class="ukpa-task-steps">
                                <div class="ukpa-task-step ukpa-completed">
                                    <span class="ukpa-step-number">✓</span>
                                    <span class="ukpa-step-text">Learn basic operations</span>
                                </div>
                                <div class="ukpa-task-step">
                                    <span class="ukpa-step-number">2</span>
                                    <span class="ukpa-step-text">Practice percentage calculations</span>
                                </div>
                                <div class="ukpa-task-step">
                                    <span class="ukpa-step-number">3</span>
                                    <span class="ukpa-step-text">Explore unit conversions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Navigation -->
            <div class="ukpa-chatbox-navigation">
                <div class="ukpa-nav-item ukpa-active" data-tab="home">
                    <div class="ukpa-nav-icon">🏠</div>
                    <div class="ukpa-nav-label">Home</div>
                </div>
                <div class="ukpa-nav-item" data-tab="messages">
                    <div class="ukpa-nav-icon">💬</div>
                    <div class="ukpa-nav-label">Messages</div>
                </div>
                <div class="ukpa-nav-item" data-tab="help">
                    <div class="ukpa-nav-icon">❓</div>
                    <div class="ukpa-nav-label">Help</div>
                </div>
                <div class="ukpa-nav-item" data-tab="tasks">
                    <div class="ukpa-nav-icon">✓</div>
                    <div class="ukpa-nav-label">Tasks</div>
                </div>
            </div>
        </div>
        <?php
    }
}

// Initialize the chat box system
UKPA_Chatbox_System::get_instance();
?>
