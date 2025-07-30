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
        
        // Admin assets - REMOVED (handled by main plugin file)
        // add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // Frontend assets
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        
        // Global chatbot display - ENABLED
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
     * Render chatbot HTML with dynamic tabs
     */
    private function render_chatbot_html($chatbot, $theme = 'light', $position = 'bottom-right') {
        $config = json_decode($chatbot->config, true);
        $session_id = uniqid('chat_', true);
        
        // Set current chatbot ID for use in other functions
        $this->current_chatbot_id = $chatbot->id;
        
        // Get tabs configuration
        $tabs = $config['tabs'] ?? array();
        
        // Only use enabled tabs
        $enabled_tabs = array_filter($tabs, function($tab) { return !empty($tab['enabled']); });
        // Debug tabs configuration
        error_log("Tabs configuration - Count: " . count($tabs) . ", Enabled: " . count($enabled_tabs) . ", Empty: " . (empty($enabled_tabs) ? 'yes' : 'no'));
        if (!empty($enabled_tabs)) {
            foreach ($enabled_tabs as $tab) {
                error_log("Tab: " . ($tab['id'] ?? 'no-id') . " - Enabled: " . ($tab['enabled'] ?? 'no-enable-setting'));
            }
        }
        
        ob_start();
        ?>
        <div id="ukpa-chatbot-<?php echo $chatbot->id; ?>" 
             class="ukpa-chatbot-widget" 
             data-chatbot-id="<?php echo $chatbot->id; ?>"
             data-chatbot-name="<?php echo esc_attr($chatbot->name); ?>"
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
                    <div class="ukpa-chatbot-header-left">
                        <button class="ukpa-chatbot-back-btn" id="ukpa-chatbot-back-btn" style="display: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <div class="ukpa-chatbot-logo">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                            </svg>
                        </div>
                        <h3><?php echo esc_html($chatbot->name); ?></h3>
                    </div>
                    <div class="ukpa-chatbot-header-right">
                        <div class="ukpa-chatbot-status-indicators">
                            <div class="ukpa-chatbot-status-dot blue"></div>
                            <div class="ukpa-chatbot-status-dot green"></div>
                            <div class="ukpa-chatbot-status-dot orange"></div>
                        </div>
                        <button class="ukpa-chatbot-close">&times;</button>
                    </div>
                </div>
                
                <?php 
                error_log("Rendering chatbot - Tabs empty: " . (empty($tabs) ? 'yes' : 'no'));
                if (!empty($tabs)): 
                ?>
                <!-- Content Area -->
                <div class="ukpa-chatbot-content">
                    <!-- Tab Panes - Directly inside content -->
                    <?php 
                    $first_tab = true;
                    foreach ($tabs as $tab): 
                        if (!$tab['enabled']) continue;
                        $content = $tab['content'] ?? array();
                    ?>
                        <div class="ukpa-chatbot-tab-pane <?php echo $first_tab ? 'active' : ''; ?>" 
                             data-tab="<?php echo esc_attr($tab['id']); ?>">
                            <?php echo $this->render_tab_content($tab, $content); ?>
                        </div>
                    <?php 
                        $first_tab = false;
                    endforeach; 
                    ?>
                    
                    <!-- Bottom Navigation Tabs -->
                    <div class="ukpa-chatbot-tabs">
                        <?php 
                        $first_tab = true;
                        foreach ($tabs as $tab): 
                            if (!$tab['enabled']) continue;
                            $notification_count = isset($tab['notification_count']) ? $tab['notification_count'] : 0;
                        ?>
                            <button class="ukpa-chatbot-tab <?php echo $first_tab ? 'active' : ''; ?>" 
                                    data-tab="<?php echo esc_attr($tab['id']); ?>" 
                                    aria-label="<?php echo esc_attr($tab['name']); ?>">
                                <div class="ukpa-chatbot-tab-icon">
                                    <img class="ukpa-chatbot-icon-outline" src="<?php echo plugin_dir_url(__FILE__) . '../public/icons/' . str_replace('.svg', '-outline.svg', esc_attr($tab['icon'])); ?>" 
                                         alt="<?php echo esc_attr($tab['name']); ?>" width="20" height="20">
                                    <img class="ukpa-chatbot-icon-filled" src="<?php echo plugin_dir_url(__FILE__) . '../public/icons/' . esc_attr($tab['icon']); ?>" 
                                         alt="<?php echo esc_attr($tab['name']); ?>" width="20" height="20">
                                </div>
                                <span><?php echo esc_html($tab['icon_text']); ?></span>
                                <?php if ($notification_count > 0): ?>
                                    <div class="notification-badge"><?php echo $notification_count; ?></div>
                                <?php endif; ?>
                            </button>
                        <?php 
                            $first_tab = false;
                        endforeach; 
                        ?>
                    </div>
                </div>
                <?php 
                else: 
                error_log("Rendering fallback content - no tabs configured");
                ?>
                    <!-- Fallback content if no tabs configured -->
                    <div class="ukpa-chatbot-content">
                        <div class="ukpa-chatbot-tab-pane active" data-tab="messages">
                            <div class="ukpa-chatbot-messages">
                                <div class="ukpa-chatbot-messages-list">
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
                        
                        <!-- Bottom Navigation Tabs -->
                        <div class="ukpa-chatbot-tabs">
                            <button class="ukpa-chatbot-tab active" data-tab="messages" aria-label="Messages">
                                <div class="ukpa-chatbot-tab-icon">
                                    <img class="ukpa-chatbot-icon-outline" src="<?php echo plugin_dir_url(__FILE__) . '../public/icons/chat-outline.svg'; ?>" alt="Messages" width="20" height="20">
                                    <img class="ukpa-chatbot-icon-filled" src="<?php echo plugin_dir_url(__FILE__) . '../public/icons/chat.svg'; ?>" alt="Messages" width="20" height="20">
                                </div>
                                <span>MESSAGES</span>
                            </button>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render tab content based on content type
     */
    private function render_tab_content($tab, $content) {
        $content_type = $tab['content_type'] ?? 'messages';
        
        switch ($content_type) {
            case 'home':
                return $this->render_home_tab_content($content);
                
            case 'messages':
                return $this->render_messages_tab_content($content);
                
            case 'help':
                return $this->render_help_tab_content($content);
                
            case 'tasks':
                return $this->render_tasks_tab_content($content);
                
            case 'calculators':
                return $this->render_calculators_tab_content($content);
                
            case 'custom':
                return $this->render_custom_tab_content($content);
                
            default:
                return $this->render_messages_tab_content($content);
        }
    }
    
    /**
     * Render home tab content
     */
    private function render_home_tab_content($content) {
        $greeting = $content['greeting'] ?? 'Hello there.';
        $subtitle = $content['subtitle'] ?? 'Our Advance AI is here to help you.';
        $status_title = $content['status_title'] ?? 'Status: All Systems Operational';
        $status_time = $content['status_time'] ?? 'Updated ' . date('M j, H:i') . ' UTC';
        $search_placeholder = $content['search_placeholder'] ?? 'Search for help';
        $search_enabled = $content['search_enabled'] ?? true;
        $categories = $content['categories'] ?? array();
        $menu_items = $content['menu_items'] ?? array();
        
        // Get the most recent chat from user's history
        $recent_chat = $this->get_most_recent_chat($this->current_chatbot_id ?? 1);
        
        ob_start();
        ?>
        <div class="ukpa-chatbot-home-content">
            <div class="ukpa-chatbot-greeting">
                <h2><?php echo esc_html($greeting); ?></h2>
                <p><?php echo esc_html($subtitle); ?></p>
            </div>
            
            <!-- Recent Chat Card -->
            <?php if ($recent_chat): ?>
                <div class="ukpa-chatbot-menu-item ukpa-chatbot-recent-chat" data-session-id="<?php echo esc_attr($recent_chat['session_id']); ?>">
                    <div class="ukpa-chatbot-menu-item-content">
                        <div class="ukpa-chatbot-menu-item-title">Recent conversation</div>
                        <div class="ukpa-chatbot-menu-item-text">Here is the Income tax Calculator:</div>
                        <div class="ukpa-chatbot-menu-item-meta"><?php echo esc_html($recent_chat['time_ago']); ?></div>
                    </div>
                    <div class="ukpa-chatbot-menu-item-indicator">
                        <div class="ukpa-chatbot-status-dot" style="background: #007cba;"></div>
                    </div>
                    <div class="ukpa-chatbot-menu-item-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            <?php else: ?>
                <!-- Show recent conversation card even if no history exists -->
                <div class="ukpa-chatbot-menu-item ukpa-chatbot-recent-chat" data-session-id="default_session">
                    <div class="ukpa-chatbot-menu-item-content">
                        <div class="ukpa-chatbot-menu-item-title">Recent conversation</div>
                        <div class="ukpa-chatbot-menu-item-text">Here is the Income tax Calculator:</div>
                        <div class="ukpa-chatbot-menu-item-meta">Jan 1</div>
                    </div>
                    <div class="ukpa-chatbot-menu-item-indicator">
                        <div class="ukpa-chatbot-status-dot" style="background: #007cba;"></div>
                    </div>
                    <div class="ukpa-chatbot-menu-item-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Ask Question Card -->
            <div class="ukpa-chatbot-menu-item ukpa-chatbot-ask-question">
                <div class="ukpa-chatbot-menu-item-content">
                    <div class="ukpa-chatbot-menu-item-title">Ask a question</div>
                    <div class="ukpa-chatbot-menu-item-text">AI Agent and team can help</div>
                </div>
                <div class="ukpa-chatbot-menu-item-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            
            <!-- Promotional Video Section -->
            <div class="ukpa-chatbot-promo-section">
                <div class="ukpa-chatbot-promo-image">
                    <div class="ukpa-chatbot-promo-overlay">
                        <div class="ukpa-chatbot-promo-text">
                            <div class="ukpa-chatbot-promo-title">Built For You</div>
                            <!-- <div class="ukpa-chatbot-promo-title">For</div>
                            <div class="ukpa-chatbot-promo-title">You</div> -->
                        </div>
                        <div class="ukpa-chatbot-promo-subtitle">Calculate your taxes using our AI powered calculators.</div>
                    </div>
                </div>
            </div>
            
            <?php if ($search_enabled): ?>
                <div class="ukpa-chatbot-search">
                    <input type="text" placeholder="<?php echo esc_attr($search_placeholder); ?>" class="ukpa-chatbot-search-input" id="ukpa-chatbot-search-input">
                    <div class="ukpa-chatbot-search-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            <?php endif; ?>
            
            <?php if (!empty($categories)): ?>
                <div class="ukpa-chatbot-categories">
                    <h4><?php echo count($categories); ?> collections</h4>
                    <?php foreach ($categories as $category): ?>
                        <div class="ukpa-chatbot-category" data-category-id="<?php echo esc_attr($category['id'] ?? ''); ?>">
                            <div class="ukpa-chatbot-category-header">
                                <div class="ukpa-chatbot-category-info">
                                    <div class="ukpa-chatbot-category-title"><?php echo esc_html($category['title'] ?? ''); ?></div>
                                    <div class="ukpa-chatbot-category-description"><?php echo esc_html($category['description'] ?? ''); ?></div>
                                    <div class="ukpa-chatbot-category-count"><?php echo esc_html($category['article_count'] ?? 0); ?> articles</div>
                                </div>
                                <div class="ukpa-chatbot-category-arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                                    </svg>
                                </div>
                            </div>
                            <?php if (!empty($category['subcategories'])): ?>
                                <div class="ukpa-chatbot-subcategories" style="display: none;">
                                    <?php foreach ($category['subcategories'] as $subcategory): ?>
                                        <div class="ukpa-chatbot-subcategory">
                                            <a href="<?php echo esc_url($subcategory['link'] ?? '#'); ?>" class="ukpa-chatbot-subcategory-link">
                                                <div class="ukpa-chatbot-subcategory-info">
                                                    <div class="ukpa-chatbot-subcategory-title"><?php echo esc_html($subcategory['title'] ?? ''); ?></div>
                                                    <div class="ukpa-chatbot-subcategory-count"><?php echo esc_html($subcategory['article_count'] ?? 0); ?> articles</div>
                                                </div>
                                                <div class="ukpa-chatbot-subcategory-arrow">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                                    </svg>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>

<?php if (!empty($menu_items)): ?>
    <div class="ukpa-chatbot-menu">
        <?php foreach ($menu_items as $item): ?>
            <a href="<?php echo esc_url($item['link'] ?? '#'); ?>" class="ukpa-chatbot-menu-item">
                <span><?php echo esc_html($item['text'] ?? ''); ?></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                </svg>
            </a>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
</div>
<?php
return ob_get_clean();
}

/**
 * Get the most recent chat from user's history
 */
private function get_most_recent_chat($chatbot_id = 1) {
    $user_id = get_current_user_id();
    $session_id = $this->get_user_session_id();
    
    // Try to get from cookies first (for non-logged in users)
    // Check for the correct cookie name pattern used by JavaScript
    $cookie_name = 'ukpa_chatbot_history_' . $chatbot_id;
    if (isset($_COOKIE[$cookie_name])) {
        $history = json_decode(stripslashes($_COOKIE[$cookie_name]), true);
        if ($history && is_array($history) && !empty($history)) {
            // Sort by last activity (most recent first)
            usort($history, function($a, $b) {
                return ($b['lastActivity'] ?? 0) - ($a['lastActivity'] ?? 0);
            });
            
            $most_recent = $history[0];
            if ($most_recent && !empty($most_recent['messages'])) {
                $last_message = end($most_recent['messages']);
                $preview = $last_message['text'] ?? '';
                if (strlen($preview) > 60) {
                    $preview = substr($preview, 0, 60) . '...';
                }
                
                return array(
                    'session_id' => $most_recent['id'] ?? '',
                    'preview' => $preview,
                    'time_ago' => $this->format_chat_time($most_recent['lastActivity'] ?? time()),
                    'message_count' => count($most_recent['messages'] ?? array())
                );
            }
        }
    }
    
    // For logged in users, try to get from database
    if ($user_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_sessions';
        
        $recent_session = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE user_id = %d AND chatbot_id = %d ORDER BY last_activity DESC LIMIT 1",
            $user_id,
            $chatbot_id
        ));
        
        if ($recent_session) {
            $messages = json_decode($recent_session->messages, true);
            if ($messages && !empty($messages)) {
                $last_message = end($messages);
                $preview = $last_message['text'] ?? '';
                if (strlen($preview) > 60) {
                    $preview = substr($preview, 0, 60) . '...';
                }
                
                return array(
                    'session_id' => $recent_session->session_id,
                    'preview' => $preview,
                    'time_ago' => $this->format_chat_time($recent_session->last_activity),
                    'message_count' => count($messages)
                );
            }
        }
    }
    
    return null;
}

/**
 * Render messages tab content
 */
private function render_messages_tab_content($content) {
    $welcome_message = $content['welcome_message'] ?? 'Hello! How can I help you today?';
    
    // Get chat history from session/cookies (will be handled by JS)
    $chat_history = array(); // This will be populated by JavaScript
    
    ob_start();
    ?>
    <div class="ukpa-chatbot-messages">
        <div class="ukpa-chatbot-messages-list">
            <!-- Welcome message - always shown -->
            <div class="ukpa-chatbot-message bot welcome">
                <div class="ukpa-chatbot-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="ukpa-chatbot-text">
                    <?php echo esc_html($welcome_message); ?>
                </div>
            </div>
            
            <!-- Chat history will be dynamically populated by JavaScript -->
            <div class="ukpa-chatbot-message-history"></div>
            
            <!-- Empty state - shown when no history -->
            <div class="ukpa-chatbot-empty-state creative">
                <div class="ukpa-chatbot-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="20" width="48" height="32" rx="16" fill="#667eea"/>
                        <ellipse cx="32" cy="36" rx="20" ry="16" fill="#fff"/>
                        <circle cx="24" cy="36" r="3" fill="#667eea"/>
                        <circle cx="40" cy="36" r="3" fill="#667eea"/>
                        <rect x="28" y="44" width="8" height="2" rx="1" fill="#667eea"/>
                        <rect x="28" y="16" width="8" height="8" rx="4" fill="#667eea"/>
                    </svg>
                </div>
                <div class="ukpa-chatbot-empty-title">No conversations yet</div>
                <div class="ukpa-chatbot-empty-description">Ask me anything about tax, calculators, or support!</div>
                <button class="ukpa-chatbot-start-conversation" onclick="if(window.startNewConversation) window.startNewConversation();">Start Conversation</button>
            </div>
            
            <!-- Ask a question button container -->
            <div class="ukpa-chatbot-ask-button-container">
                <button class="ukpa-chatbot-ask-button">
                    <span>Ask a question</span>
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
 * Render help tab content
 */
private function render_help_tab_content($content) {
    $title = $content['title'] ?? 'Help & Support';
    $description = $content['description'] ?? 'Get help and find answers to common questions.';
    $chatbot_id = $this->current_chatbot_id ?? 1;
    
    // Get FAQ categories and FAQs
    $categories = $this->get_faq_categories($chatbot_id);
    $faqs = $this->get_faqs($chatbot_id);
    
    ob_start();
    ?>
    <div class="ukpa-chatbot-help-content">
        <div class="ukpa-chatbot-help-header">
            <h4><?php echo esc_html($title); ?></h4>
            <p><?php echo esc_html($description); ?></p>
        </div>
        
        <!-- FAQ Search -->
        <div class="ukpa-chatbot-faq-search">
            <input type="text" placeholder="Search FAQs..." class="ukpa-chatbot-faq-search-input" id="ukpa-chatbot-faq-search">
            <div class="ukpa-chatbot-faq-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
                </svg>
            </div>
        </div>
        
        <!-- FAQ Categories -->
        <?php if (!empty($categories)): ?>
            <div class="ukpa-chatbot-faq-categories">
                <h5>Browse by Category</h5>
                <div class="ukpa-chatbot-faq-categories-grid">
                    <?php foreach ($categories as $category): ?>
                        <div class="ukpa-chatbot-faq-category" data-category="<?php echo esc_attr($category->name); ?>">
                            <div class="ukpa-chatbot-faq-category-icon">
                                <?php echo $this->get_category_icon($category->icon); ?>
                            </div>
                            <div class="ukpa-chatbot-faq-category-info">
                                <div class="ukpa-chatbot-faq-category-name"><?php echo esc_html($category->name); ?></div>
                                <div class="ukpa-chatbot-faq-category-count">
                                    <?php 
                                    $category_faqs = array_filter($faqs, function($faq) use ($category) {
                                        return $faq->category === $category->name && $faq->is_active;
                                    });
                                    echo count($category_faqs) . ' questions';
                                    ?>
                                </div>
                            </div>
                            <div class="ukpa-chatbot-faq-category-arrow">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
        
        <!-- FAQ List -->
        <div class="ukpa-chatbot-faq-list" id="ukpa-chatbot-faq-list">
            <?php if (!empty($faqs)): ?>
                <?php foreach ($faqs as $faq): ?>
                    <?php if ($faq->is_active): ?>
                        <div class="ukpa-chatbot-faq-item" data-category="<?php echo esc_attr($faq->category); ?>">
                            <div class="ukpa-chatbot-faq-question">
                                <div class="ukpa-chatbot-faq-question-text"><?php echo esc_html($faq->question); ?></div>
                                <div class="ukpa-chatbot-faq-question-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="ukpa-chatbot-faq-answer">
                                <div class="ukpa-chatbot-faq-answer-content">
                                    <?php echo wp_kses_post($faq->answer); ?>
                                </div>
                                <?php if (!empty($faq->tags)): ?>
                                    <div class="ukpa-chatbot-faq-tags">
                                        <?php 
                                        $tags = explode(',', $faq->tags);
                                        foreach ($tags as $tag): 
                                            $tag = trim($tag);
                                            if (!empty($tag)):
                                        ?>
                                            <span class="ukpa-chatbot-faq-tag"><?php echo esc_html($tag); ?></span>
                                        <?php 
                                            endif;
                                        endforeach; 
                                        ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="ukpa-chatbot-faq-empty">
                    <div class="ukpa-chatbot-faq-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h5>No FAQs Available</h5>
                    <p>FAQs will appear here once they are added in the admin dashboard.</p>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Contact Support -->
        <div class="ukpa-chatbot-help-contact">
            <h5>Still Need Help?</h5>
            <p>Can't find what you're looking for? Contact our support team.</p>
            <div class="ukpa-chatbot-help-contact-actions">
                <button class="ukpa-chatbot-contact-support-btn" onclick="startNewConversation()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                    </svg>
                    Chat with Support
                </button>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render tasks tab content
 */
private function render_tasks_tab_content($content) {
    $title = $content['title'] ?? 'Learning Tasks';
    $description = $content['description'] ?? 'Complete tasks and track your progress.';
    $tasks = $content['tasks'] ?? array();
    
    ob_start();
    ?>
    <div class="ukpa-chatbot-tasks-content">
        <h4><?php echo esc_html($title); ?></h4>
        <p><?php echo esc_html($description); ?></p>
        <?php if (!empty($tasks)): ?>
            <div class="ukpa-chatbot-tasks-list">
                <?php foreach ($tasks as $task): ?>
                    <div class="ukpa-chatbot-task-item <?php echo $task['completed'] ? 'completed' : ''; ?>">
                        <div class="ukpa-chatbot-task-checkbox">
                            <input type="checkbox" <?php checked($task['completed'], true); ?> disabled>
                        </div>
                        <div class="ukpa-chatbot-task-content">
                            <span class="ukpa-chatbot-task-text"><?php echo esc_html($task['text'] ?? ''); ?></span>
                            <?php if (!empty($task['link'])): ?>
                                <a href="<?php echo esc_url($task['link']); ?>" class="ukpa-chatbot-task-link">View</a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render calculators tab content
 */
private function render_calculators_tab_content($content) {
    $title = $content['title'] ?? 'Tax & Financial Calculators';
    $description = $content['description'] ?? 'Access various tax and financial calculators here.';
    $links = $content['links'] ?? array();
    
    ob_start();
    ?>
    <div class="ukpa-chatbot-calculators-content">
        <h4><?php echo esc_html($title); ?></h4>
        <p><?php echo esc_html($description); ?></p>
        <?php if (!empty($links)): ?>
            <div class="ukpa-chatbot-calculators-links">
                <?php foreach ($links as $link): ?>
                    <a href="<?php echo esc_url($link['link'] ?? '#'); ?>" class="ukpa-chatbot-calculator-link">
                        <?php echo esc_html($link['text'] ?? ''); ?>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render custom tab content
 */
private function render_custom_tab_content($content) {
    $custom_html = $content['custom_html'] ?? '';
    
    ob_start();
    ?>
    <div class="ukpa-chatbot-custom-content">
        <?php echo wp_kses_post($custom_html); ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Get user chat history
 */
private function get_user_chat_history() {
    global $wpdb;
    
    $session_id = $this->get_user_session_id();
    $table = $wpdb->prefix . 'ukpa_chatbot_conversations';
    
    // Get recent conversations grouped by session
    $query = $wpdb->prepare("
        SELECT DISTINCT 
            c1.id,
            c1.user_message,
            c1.created_at,
            c1.session_id
        FROM $table c1
        INNER JOIN (
            SELECT session_id, MAX(created_at) as max_date
            FROM $table
            WHERE session_id = %s
            GROUP BY session_id
        ) c2 ON c1.session_id = c2.session_id AND c1.created_at = c2.max_date
        WHERE c1.session_id = %s
        ORDER BY c1.created_at DESC
        LIMIT 10
    ", $session_id, $session_id);
    
    return $wpdb->get_results($query);
}

/**
 * Get user session ID
 */
private function get_user_session_id() {
    if (!session_id()) {
        session_start();
    }
    
    if (!isset($_SESSION['ukpa_chatbot_session_id'])) {
        $_SESSION['ukpa_chatbot_session_id'] = uniqid('chat_', true);
    }
    
    return $_SESSION['ukpa_chatbot_session_id'];
}

/**
 * Format chat time
 */
private function format_chat_time($timestamp) {
    $time = strtotime($timestamp);
    $now = time();
    $diff = $now - $time;
    
    if ($diff < 60) {
        return 'Just now';
    } elseif ($diff < 3600) {
        $minutes = floor($diff / 60);
        return $minutes . 'm ago';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . 'h ago';
    } elseif ($diff < 604800) {
        $days = floor($diff / 86400);
        return $days . 'd ago';
    } else {
        return date('M j', $time);
    }
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
        config longtext,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    // Chatbot sessions table
    $table_sessions = $wpdb->prefix . 'ukpa_chatbot_sessions';
    $sql_sessions = "CREATE TABLE $table_sessions (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        chatbot_id mediumint(9) NOT NULL,
        session_id varchar(255) NOT NULL,
        user_id bigint(20) DEFAULT NULL,
        messages longtext,
        last_activity datetime DEFAULT CURRENT_TIMESTAMP,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY chatbot_id (chatbot_id),
        KEY session_id (session_id),
        KEY user_id (user_id)
    ) $charset_collate;";
    
    // FAQ table
    $table_faqs = $wpdb->prefix . 'ukpa_chatbot_faqs';
    $sql_faqs = "CREATE TABLE $table_faqs (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        chatbot_id mediumint(9) NOT NULL,
        category varchar(100) DEFAULT 'General',
        question text NOT NULL,
        answer longtext NOT NULL,
        tags text,
        order_index int(11) DEFAULT 0,
        is_active tinyint(1) DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY chatbot_id (chatbot_id),
        KEY category (category),
        KEY is_active (is_active),
        KEY order_index (order_index)
    ) $charset_collate;";
    
    // FAQ categories table
    $table_faq_categories = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
    $sql_faq_categories = "CREATE TABLE $table_faq_categories (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        chatbot_id mediumint(9) NOT NULL,
        name varchar(100) NOT NULL,
        description text,
        icon varchar(50) DEFAULT 'help',
        order_index int(11) DEFAULT 0,
        is_active tinyint(1) DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY chatbot_id (chatbot_id),
        KEY is_active (is_active),
        KEY order_index (order_index)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_chatbots);
    dbDelta($sql_sessions);
    dbDelta($sql_faqs);
    dbDelta($sql_faq_categories);
    
    // Insert default FAQ categories
    $this->insert_default_faq_categories();
}

/**
 * Insert default FAQ categories
 */
private function insert_default_faq_categories() {
    global $wpdb;
    $table = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
    
    $default_categories = array(
        array('name' => 'General', 'description' => 'General questions and information', 'icon' => 'help', 'order_index' => 1),
        array('name' => 'Tax Calculators', 'description' => 'Questions about tax calculators', 'icon' => 'calculator', 'order_index' => 2),
        array('name' => 'Account & Billing', 'description' => 'Account and billing related questions', 'icon' => 'account', 'order_index' => 3),
        array('name' => 'Technical Support', 'description' => 'Technical issues and troubleshooting', 'icon' => 'support', 'order_index' => 4),
        array('name' => 'Features', 'description' => 'Information about features and capabilities', 'icon' => 'features', 'order_index' => 5)
    );
    
    foreach ($default_categories as $category) {
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE name = %s AND chatbot_id = 1",
            $category['name']
        ));
        
        if (!$exists) {
            $wpdb->insert($table, array_merge($category, array('chatbot_id' => 1)));
        }
    }
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
    $name = sanitize_text_field($_POST['chatbot_name'] ?? $_POST['name'] ?? '');
    $description = sanitize_textarea_field($_POST['chatbot_description'] ?? $_POST['description'] ?? '');
    
    // Handle both old config format and new tabs format
    $config = array();
    if (isset($_POST['config'])) {
        $config = json_decode(stripslashes($_POST['config']), true);
    }
    if (isset($_POST['tabs'])) {
        $tabs = json_decode(stripslashes($_POST['tabs']), true);
        $config['tabs'] = $tabs;
    }
    
    // Add other form fields to config
    $config['chatbot_type'] = sanitize_text_field($_POST['chatbot_type'] ?? 'nlp');
    $config['status'] = sanitize_text_field($_POST['chatbot_status'] ?? 'active');
    
    // Add backend configuration
    $config['backend_url'] = sanitize_url($_POST['backend_url'] ?? '');
    $config['use_backend'] = isset($_POST['use_backend']) ? true : false;
    
    global $wpdb;
    $table = $wpdb->prefix . 'ukpa_chatbots';
    
    $data = array(
        'name' => $name,
        'description' => $description,
        'config' => json_encode($config),
        'status' => $config['status'] ?? 'active'
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
            'chatbot_id' => $chatbot_id,
            'redirect_url' => admin_url('admin.php?page=ukpa-chatbot-manager')
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
    // Verify nonce for security (temporarily disabled for debugging)
    // if (!check_ajax_referer('ukpa_chatbot_nonce', 'nonce', false)) {
    //     error_log("Chatbot nonce verification failed");
    //     wp_send_json_error('Security check failed');
    //     return;
    // }
    
    $chatbot_id = intval($_POST['chatbot_id']);
    $message = sanitize_textarea_field($_POST['message']);
    $session_id = sanitize_text_field($_POST['session_id']);
    
    // Debug logging
    error_log("Chatbot message received - ID: $chatbot_id, Message: $message, Session: $session_id");
    
    // Get chatbot configuration
    global $wpdb;
    $table = $wpdb->prefix . 'ukpa_chatbots';
    $chatbot = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table WHERE id = %d AND status = 'active'",
        $chatbot_id
    ));
    
    if (!$chatbot) {
        error_log("Chatbot not found - ID: $chatbot_id");
        wp_send_json_error('Chatbot not found');
    }
    
    $config = json_decode($chatbot->config, true);
    
    // Debug the full config to see what's stored
    error_log("Full chatbot config: " . print_r($config, true));
    
    // Get backend configuration from chatbot config and global settings
    $backend_url = $config['backend_url'] ?? '';
    $api_token = get_option('ukpa_chatbot_api_token', '');
    $use_backend = $config['use_backend'] ?? false;
    
    // Debug backend configuration
    error_log("Backend Configuration - URL: '$backend_url', Token: " . ($api_token ? 'set' : 'empty') . ", Use Backend: " . ($use_backend ? 'yes' : 'no'));
    error_log("Expected backend URL format: http://localhost:3002 (base URL only)");
    error_log("Full API endpoint will be: " . rtrim($backend_url, '/') . '/ana/v1/routes/mainRouter/chatbot/ask');
    
    if ($use_backend && !empty($backend_url) && !empty($api_token)) {
        // Use backend API
        error_log("Using backend API - URL: $backend_url");
        $response = $this->call_backend_api($message, $session_id, $backend_url, $api_token);
    } else {
        // Fallback to local processing if backend not configured or disabled
        error_log("Using local processing - Backend enabled: " . ($use_backend ? 'yes' : 'no') . ", URL: '" . ($backend_url ?: 'empty') . "', Token: " . ($api_token ? 'set' : 'empty'));
        $response = $this->process_chatbot_message($message, $config, $session_id);
    }
    
    error_log("Final response: " . substr($response, 0, 100) . "...");
    error_log("Response length: " . strlen($response));
    
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
 * Call backend API for chatbot processing
 */
private function call_backend_api($message, $session_id, $backend_url, $api_token) {
    // The backend_url should be the base URL (e.g., http://localhost:3002)
    // We need to append the correct path to reach the chatbot endpoint
    $api_url = rtrim($backend_url, '/') . '/ana/v1/routes/mainRouter/chatbot/ask';
    
    error_log("Calling backend API at: $api_url");
    
    $body = array(
        'question' => $message,
        'session_id' => $session_id
    );
    
    $args = array(
        'method' => 'POST',
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-Plugin-Auth' => $api_token,
            'User-Agent' => 'UKPA-Chatbot-Plugin/1.0'
        ),
        'body' => json_encode($body),
        'timeout' => 30,
        'sslverify' => false // Set to true in production
    );
    
    $response = wp_remote_post($api_url, $args);
    
    if (is_wp_error($response)) {
        error_log('Chatbot backend API error: ' . $response->get_error_message());
        return 'Sorry, I\'m having trouble connecting to my knowledge base right now. Please try again later.';
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    
    error_log("Backend API response - Code: $response_code, Body: $response_body");
    
    if ($response_code !== 200) {
        error_log('Chatbot backend API error: HTTP ' . $response_code . ' - ' . $response_body);
        return 'Sorry, I\'m experiencing technical difficulties. Please try again later.';
    }
    
    $data = json_decode($response_body, true);
    
    if (!$data) {
        error_log('Chatbot backend API error: Invalid response format - ' . $response_body);
        return 'Sorry, I received an invalid response from my knowledge base. Please try again.';
    }
    
    // Debug log the full response data
    error_log('Backend response data: ' . print_r($data, true));
    
    // Return the full response data instead of just the answer
    // This allows the frontend to handle different response types
    $json_response = json_encode($data);
    error_log('Returning JSON response: ' . $json_response);
    return $json_response;
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
        'nonce' => wp_create_nonce('ukpa_chatbot_nonce'),
        'is_logged_in' => is_user_logged_in(),
        'backend_url' => 'http://localhost:3002/ana/v1/routes/mainRouter/chatbot/ask',
        'api_token' => 'ukpa_8e4f2cbb9d'
    ));
}

    /**
     * Get FAQ categories for a chatbot
     */
    private function get_faq_categories($chatbot_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE chatbot_id = %d AND is_active = 1 ORDER BY order_index ASC, name ASC",
            $chatbot_id
        ));
    }
    
    /**
     * Get FAQs for a chatbot
     */
    private function get_faqs($chatbot_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE chatbot_id = %d AND is_active = 1 ORDER BY order_index ASC, question ASC",
            $chatbot_id
        ));
    }
    
    /**
     * Get category icon SVG
     */
    private function get_category_icon($icon) {
        $icons = array(
            'help' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/></svg>',
            'calculator' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 7H11V9H13V7ZM13 11H11V13H13V11ZM13 15H11V17H13V15ZM9 7H7V9H9V7ZM9 11H7V13H9V11ZM9 15H7V17H9V15ZM17 7H15V9H17V7ZM17 11H15V13H17V11ZM17 15H15V17H17V15Z" fill="currentColor"/></svg>',
            'account' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>',
            'support' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>',
            'features' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>',
            'billing' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/></svg>',
            'technical' => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/></svg>'
        );
        
        return $icons[$icon] ?? $icons['help'];
    }
}

// Initialize the chatbot system
UKPA_Chatbot_System::get_instance();