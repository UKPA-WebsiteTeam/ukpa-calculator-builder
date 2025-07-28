<?php
/**
 * UKPA Calculator Builder - Chatbot System
 * 
 * Handles chatbot creation, management, and interactions
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_System {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        // Database setup
        add_action('init', array($this, 'create_chatbot_tables'));
        
        // AJAX handlers
        add_action('wp_ajax_ukpa_save_chatbot', array($this, 'save_chatbot'));
        add_action('wp_ajax_ukpa_get_chatbots', array($this, 'get_chatbots'));
        add_action('wp_ajax_ukpa_delete_chatbot', array($this, 'delete_chatbot'));
        add_action('wp_ajax_ukpa_chatbot_message', array($this, 'handle_chatbot_message'));
        add_action('wp_ajax_nopriv_ukpa_chatbot_message', array($this, 'handle_chatbot_message'));
        
        // Shortcode
        add_shortcode('ukpa_chatbot', array($this, 'render_chatbot_shortcode'));
        
        // Admin assets
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // Frontend assets
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        
        // Global chatbot display
        add_action('wp_footer', array($this, 'render_global_chatbots'));
        
        // Add settings to admin
        add_action('admin_init', array($this, 'register_chatbot_settings'));
    }
    
    /**
     * Register chatbot settings
     */
    public function register_chatbot_settings() {
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_id');
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_theme', array('default' => 'light'));
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_position', array('default' => 'bottom-right'));
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_enabled', array('default' => '0'));
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_exclude_pages', array('default' => ''));
    }
    
    /**
     * Render global chatbots in footer
     */
    public function render_global_chatbots() {
        // Check if global chatbot is enabled
        $enabled = get_option('ukpa_global_chatbot_enabled', '0');
        if ($enabled !== '1') {
            return;
        }
        
        // Get global chatbot settings
        $chatbot_id = get_option('ukpa_global_chatbot_id', '');
        $theme = get_option('ukpa_global_chatbot_theme', 'light');
        $position = get_option('ukpa_global_chatbot_position', 'bottom-right');
        $exclude_pages = get_option('ukpa_global_chatbot_exclude_pages', '');
        
        // Check if current page should be excluded
        if ($this->should_exclude_current_page($exclude_pages)) {
            return;
        }
        
        // Check if chatbot ID is valid
        if (empty($chatbot_id)) {
            return;
        }
        
        // Get chatbot data
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d AND status = 'active'",
            $chatbot_id
        ));
        
        if (!$chatbot) {
            return;
        }
        
        // Render the chatbot
        echo $this->render_chatbot_html($chatbot, $theme, $position);
    }
    
    /**
     * Check if current page should be excluded
     */
    private function should_exclude_current_page($exclude_pages) {
        if (empty($exclude_pages)) {
            return false;
        }
        
        $exclude_list = array_map('trim', explode(',', $exclude_pages));
        $current_url = $_SERVER['REQUEST_URI'];
        $current_page_id = get_queried_object_id();
        
        foreach ($exclude_list as $exclude) {
            // Check by URL path
            if (strpos($current_url, $exclude) !== false) {
                return true;
            }
            
            // Check by page ID
            if (is_numeric($exclude) && $current_page_id == intval($exclude)) {
                return true;
            }
            
            // Check by page slug
            if (get_page_by_path($exclude) && get_page_by_path($exclude)->ID == $current_page_id) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Render chatbot HTML
     */
    private function render_chatbot_html($chatbot, $theme = 'light', $position = 'bottom-right') {
        $config = json_decode($chatbot->config, true);
        $session_id = uniqid('chat_', true);
        
        ob_start();
        ?>
        <div id="ukpa-chatbot-<?php echo $chatbot->id; ?>" 
             class="ukpa-chatbot-widget" 
             data-chatbot-id="<?php echo $chatbot->id; ?>"
             data-session-id="<?php echo $session_id; ?>"
             data-theme="<?php echo esc_attr($theme); ?>"
             data-position="<?php echo esc_attr($position); ?>">
            
            <div class="ukpa-chatbot-toggle">
                <div class="ukpa-chatbot-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            
            <div class="ukpa-chatbot-container">
                <div class="ukpa-chatbot-header">
                    <h3><?php echo esc_html($chatbot->name); ?></h3>
                    <button class="ukpa-chatbot-close">&times;</button>
                </div>
                
                <div class="ukpa-chatbot-messages">
                    <div class="ukpa-chatbot-message bot">
                        <div class="ukpa-chatbot-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-chatbot-text">
                            <?php echo esc_html($config['welcome_message'] ?? 'Hello! How can I help you today?'); ?>
                        </div>
                    </div>
                </div>
                
                <div class="ukpa-chatbot-input">
                    <input type="text" placeholder="Type your message..." class="ukpa-chatbot-text-input">
                    <button class="ukpa-chatbot-send">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Create chatbot database tables
     */
    public function create_chatbot_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Chatbots table
        $table_chatbots = $wpdb->prefix . 'ukpa_chatbots';
        $sql_chatbots = "CREATE TABLE $table_chatbots (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text,
            config longtext NOT NULL,
            status varchar(20) DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Chatbot conversations table
        $table_conversations = $wpdb->prefix . 'ukpa_chatbot_conversations';
        $sql_conversations = "CREATE TABLE $table_conversations (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            chatbot_id mediumint(9) NOT NULL,
            session_id varchar(255) NOT NULL,
            user_message text NOT NULL,
            bot_response text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY chatbot_id (chatbot_id),
            KEY session_id (session_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_chatbots);
        dbDelta($sql_conversations);
    }
    
    /**
     * Save chatbot configuration
     */
    public function save_chatbot() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $chatbot_id = isset($_POST['chatbot_id']) ? intval($_POST['chatbot_id']) : 0;
        $name = sanitize_text_field($_POST['name']);
        $description = sanitize_textarea_field($_POST['description']);
        $config = json_decode(stripslashes($_POST['config']), true);
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        
        $data = array(
            'name' => $name,
            'description' => $description,
            'config' => json_encode($config),
            'status' => 'active'
        );
        
        if ($chatbot_id > 0) {
            // Update existing chatbot
            $result = $wpdb->update($table, $data, array('id' => $chatbot_id));
        } else {
            // Create new chatbot
            $result = $wpdb->insert($table, $data);
            $chatbot_id = $wpdb->insert_id;
        }
        
        if ($result !== false) {
            wp_send_json_success(array(
                'message' => 'Chatbot saved successfully',
                'chatbot_id' => $chatbot_id
            ));
        } else {
            wp_send_json_error('Failed to save chatbot');
        }
    }
    
    /**
     * Get all chatbots
     */
    public function get_chatbots() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        
        $chatbots = $wpdb->get_results("
            SELECT id, name, description, config, status, created_at, updated_at 
            FROM $table 
            ORDER BY created_at DESC
        ");
        
        wp_send_json_success($chatbots);
    }
    
    /**
     * Delete chatbot
     */
    public function delete_chatbot() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $chatbot_id = intval($_POST['chatbot_id']);
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        
        $result = $wpdb->delete($table, array('id' => $chatbot_id));
        
        if ($result !== false) {
            wp_send_json_success('Chatbot deleted successfully');
        } else {
            wp_send_json_error('Failed to delete chatbot');
        }
    }
    
    /**
     * Handle chatbot message
     */
    public function handle_chatbot_message() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        $chatbot_id = intval($_POST['chatbot_id']);
        $message = sanitize_textarea_field($_POST['message']);
        $session_id = sanitize_text_field($_POST['session_id']);
        
        // Get chatbot configuration
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d AND status = 'active'",
            $chatbot_id
        ));
        
        if (!$chatbot) {
            wp_send_json_error('Chatbot not found');
        }
        
        $config = json_decode($chatbot->config, true);
        $response = $this->process_chatbot_message($message, $config, $session_id);
        
        // Save conversation
        $conversations_table = $wpdb->prefix . 'ukpa_chatbot_conversations';
        $wpdb->insert($conversations_table, array(
            'chatbot_id' => $chatbot_id,
            'session_id' => $session_id,
            'user_message' => $message,
            'bot_response' => $response
        ));
        
        wp_send_json_success(array(
            'response' => $response,
            'session_id' => $session_id
        ));
    }
    
    /**
     * Process chatbot message and generate response
     */
    private function process_chatbot_message($message, $config, $session_id) {
        // Check if this is a GPT chatbot
        $chatbot_type = $config['chatbot_type'] ?? 'nlp';
        
        if ($chatbot_type === 'gpt') {
            // Use ChatGPT API
            $gpt = UKPA_Chatbot_GPT::get_instance();
            return $gpt->process_gpt_message($message, $config, $session_id);
        } else {
            // Use the advanced NLP engine
            $nlp = UKPA_Chatbot_NLP::get_instance();
            return $nlp->process_message($message, $config, $session_id);
        }
    }
    
    /**
     * Format response based on personality
     */
    private function format_response($response, $personality) {
        switch ($personality) {
            case 'professional':
                return "Thank you for your inquiry. " . $response;
            case 'friendly':
                return "Hi there! " . $response;
            case 'casual':
                return "Hey! " . $response;
            default:
                return $response;
        }
    }
    
    /**
     * Render chatbot shortcode
     */
    public function render_chatbot_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
            'theme' => 'light',
            'position' => 'bottom-right'
        ), $atts);
        
        $chatbot_id = intval($atts['id']);
        
        if ($chatbot_id <= 0) {
            return '<p>Error: Invalid chatbot ID</p>';
        }
        
        // Get chatbot data
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d AND status = 'active'",
            $chatbot_id
        ));
        
        if (!$chatbot) {
            return '<p>Error: Chatbot not found</p>';
        }
        
        return $this->render_chatbot_html($chatbot, $atts['theme'], $atts['position']);
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'ukpa-chatbot') === false) {
            return;
        }
        
        wp_enqueue_style(
            'ukpa-chatbot-admin',
            UKPA_CALC_URL . 'assets/css/chatbot-admin.css',
            array(),
            filemtime(UKPA_CALC_PATH . 'assets/css/chatbot-admin.css')
        );
        
        wp_enqueue_script(
            'ukpa-chatbot-admin',
            UKPA_CALC_URL . 'assets/js/chatbot-admin.js',
            array('jquery'),
            filemtime(UKPA_CALC_PATH . 'assets/js/chatbot-admin.js'),
            true
        );
        
        wp_localize_script('ukpa-chatbot-admin', 'ukpa_chatbot_admin', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ukpa_chatbot_nonce')
        ));
    }
    
    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'ukpa-chatbot-frontend',
            UKPA_CALC_URL . 'assets/css/chatbot-frontend.css',
            array(),
            filemtime(UKPA_CALC_PATH . 'assets/css/chatbot-frontend.css')
        );
        
        wp_enqueue_script(
            'ukpa-chatbot-frontend',
            UKPA_CALC_URL . 'assets/js/chatbot-frontend.js',
            array('jquery'),
            filemtime(UKPA_CALC_PATH . 'assets/js/chatbot-frontend.js'),
            true
        );
        
        wp_localize_script('ukpa-chatbot-frontend', 'ukpa_chatbot_frontend', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ukpa_chatbot_nonce')
        ));
    }
}

// Initialize the chatbot system - DISABLED
// UKPA_Chatbot_System::get_instance(); 