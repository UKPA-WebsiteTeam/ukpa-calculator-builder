<?php
/**
 * UKPA Calculator Builder - Enhanced Chatbot Manager
 * 
 * Professional admin interface for managing chatbots with dynamic tab management
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_Manager {
    
    public function __construct() {
        add_action('wp_ajax_ukpa_save_chatbot_tabs', array($this, 'save_chatbot_tabs'));
        add_action('wp_ajax_ukpa_get_chatbot_tabs', array($this, 'get_chatbot_tabs'));
        add_action('wp_ajax_ukpa_delete_chatbot_tab', array($this, 'delete_chatbot_tab'));
        add_action('wp_ajax_ukpa_reorder_chatbot_tabs', array($this, 'reorder_chatbot_tabs'));
    }
    
    /**
     * Render chatbot list page
     */
    public function render_chatbot_list() {
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbots = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        ?>
        <div class="wrap ukpa-chatbot-manager">
            <div class="ukpa-header">
                <h1 class="wp-heading-inline">Chatbot Manager</h1>
                <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add'); ?>" class="page-title-action">Add New Chatbot</a>
            </div>
            
            <div class="ukpa-chatbot-overview">
                <div class="ukpa-stats-grid">
                    <div class="ukpa-stat-card">
                        <div class="ukpa-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-stat-content">
                            <h3><?php echo count($chatbots); ?></h3>
                            <p>Total Chatbots</p>
                        </div>
                    </div>
                    <div class="ukpa-stat-card">
                        <div class="ukpa-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-stat-content">
                            <h3><?php echo count(array_filter($chatbots, function($c) { return $c->status === 'active'; })); ?></h3>
                            <p>Active Chatbots</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ukpa-chatbot-list">
                <?php if (empty($chatbots)): ?>
                    <div class="ukpa-empty-state">
                        <div class="ukpa-empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <h3>No chatbots found</h3>
                        <p>Create your first chatbot to get started with dynamic tab management and professional UI.</p>
                        <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add'); ?>" class="button button-primary">Create First Chatbot</a>
                    </div>
                <?php else: ?>
                    <div class="ukpa-chatbot-grid">
                            <?php foreach ($chatbots as $chatbot): ?>
                            <?php $config = json_decode($chatbot->config, true); ?>
                            <div class="ukpa-chatbot-card">
                                <div class="ukpa-chatbot-card-header">
                                    <div class="ukpa-chatbot-info">
                                        <h3><?php echo esc_html($chatbot->name); ?></h3>
                                        <p><?php echo esc_html($chatbot->description); ?></p>
                                    </div>
                                    <div class="ukpa-chatbot-status">
                                        <span class="ukpa-status-badge <?php echo $chatbot->status === 'active' ? 'active' : 'inactive'; ?>">
                                            <?php echo ucfirst($chatbot->status); ?>
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="ukpa-chatbot-card-body">
                                    <div class="ukpa-chatbot-meta">
                                        <div class="ukpa-meta-item">
                                            <span class="ukpa-meta-label">Type:</span>
                                            <span class="ukpa-meta-value">
                                        <?php 
                                        $type = $config['chatbot_type'] ?? 'nlp';
                                        echo $type === 'gpt' ? 'GPT (AI)' : 'NLP (Keyword)';
                                        ?>
                                            </span>
                                        </div>
                                        <div class="ukpa-meta-item">
                                            <span class="ukpa-meta-label">Tabs:</span>
                                            <span class="ukpa-meta-value">
                                                <?php 
                                                $tabs = $config['tabs'] ?? [];
                                                echo count($tabs) . ' tabs';
                                                ?>
                                            </span>
                                        </div>
                                        <div class="ukpa-meta-item">
                                            <span class="ukpa-meta-label">Created:</span>
                                            <span class="ukpa-meta-value"><?php echo date('M j, Y', strtotime($chatbot->created_at)); ?></span>
                                        </div>
                                    </div>
                                    
                                    <div class="ukpa-chatbot-shortcode">
                                        <code>[ukpa_chatbot id="<?php echo $chatbot->id; ?>"]</code>
                                        <button class="ukpa-copy-shortcode" data-shortcode='[ukpa_chatbot id="<?php echo $chatbot->id; ?>"]'>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                                            </svg>
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="ukpa-chatbot-card-actions">
                                    <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add&edit=' . $chatbot->id); ?>" class="button button-primary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                                        </svg>
                                        Edit
                                    </a>
                                    <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-tabs&chatbot_id=' . $chatbot->id); ?>" class="button">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/>
                                        </svg>
                                        Manage Tabs
                                    </a>
                                    <button class="button ukpa-delete-chatbot" data-id="<?php echo $chatbot->id; ?>" data-name="<?php echo esc_attr($chatbot->name); ?>">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render chatbot form page with enhanced tab management
     */
    public function render_chatbot_form() {
        $chatbot_id = isset($_GET['edit']) ? intval($_GET['edit']) : 0;
        $chatbot = null;
        
        if ($chatbot_id > 0) {
            global $wpdb;
            $table = $wpdb->prefix . 'ukpa_chatbots';
            $chatbot = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $chatbot_id));
        }
        
        $default_config = array(
            'welcome_message' => 'Hello! How can I help you today?',
            'personality' => 'helpful',
            'fallback' => 'I\'m sorry, I don\'t understand. Can you please rephrase your question?',
            'responses' => array(),
            'intents' => array(),
            'tabs' => array(
                array(
                    'id' => 'home',
                    'name' => 'Home',
                    'icon' => 'home.svg',
                    'icon_text' => 'HOME',
                    'content_type' => 'home',
                    'enabled' => true,
                    'order' => 1,
                    'content' => array(
                        'greeting' => 'Hello! How can we help?',
                        'subtitle' => 'How can we help?',
                        'status_title' => 'Status: All Systems Operational',
                        'status_time' => 'Updated ' . date('M j, H:i') . ' UTC',
                        'search_placeholder' => 'Search for help',
                        'search_enabled' => true,
                        'categories' => array(
                            array(
                                'id' => 'getting-started',
                                'title' => 'Getting Started',
                                'description' => 'Everything you need to know to get started with our calculators.',
                                'article_count' => 29,
                                'expanded' => false,
                                'subcategories' => array(
                                    array('title' => 'Basic Setup', 'link' => '#', 'article_count' => 5),
                                    array('title' => 'First Calculator', 'link' => '#', 'article_count' => 8),
                                    array('title' => 'Advanced Features', 'link' => '#', 'article_count' => 16)
                                )
                            ),
                            array(
                                'id' => 'calculators',
                                'title' => 'Calculators',
                                'description' => 'Learn about different types of calculators and how to use them.',
                                'article_count' => 78,
                                'expanded' => false,
                                'subcategories' => array(
                                    array('title' => 'Income Tax', 'link' => '#', 'article_count' => 15),
                                    array('title' => 'Capital Gains', 'link' => '#', 'article_count' => 12),
                                    array('title' => 'Corporation Tax', 'link' => '#', 'article_count' => 18),
                                    array('title' => 'VAT', 'link' => '#', 'article_count' => 10)
                                )
                            ),
                            array(
                                'id' => 'support',
                                'title' => 'Support & Help',
                                'description' => 'Get help and find answers to common questions.',
                                'article_count' => 45,
                                'expanded' => false,
                                'subcategories' => array(
                                    array('title' => 'FAQ', 'link' => '#', 'article_count' => 20),
                                    array('title' => 'Contact Support', 'link' => '#', 'article_count' => 5),
                                    array('title' => 'Tutorials', 'link' => '#', 'article_count' => 20)
                                )
                            )
                        ),
                        'menu_items' => array(
                            array('text' => 'Start Calculating', 'link' => '#'),
                            array('text' => 'Calculator Help & FAQ', 'link' => '#'),
                            array('text' => 'Learning Tasks', 'link' => '#')
                        )
                    )
                ),
                array(
                    'id' => 'messages',
                    'name' => 'Messages',
                    'icon' => 'chat.svg',
                    'icon_text' => 'MESSAGES',
                    'content_type' => 'messages',
                    'enabled' => true,
                    'order' => 2,
                    'content' => array(
                        'input_placeholder' => 'Type your message...',
                        'welcome_message' => 'Hello! How can I help you today?'
                    )
                ),
                array(
                    'id' => 'help',
                    'name' => 'Help',
                    'icon' => 'help.svg',
                    'icon_text' => 'HELP',
                    'content_type' => 'help',
                    'enabled' => true,
                    'order' => 3,
                    'content' => array(
                        'title' => 'Help & Support',
                        'description' => 'Get help and find answers to common questions.',
                        'links' => array(
                            array('text' => 'FAQ', 'link' => '#'),
                            array('text' => 'Contact Support', 'link' => '#'),
                            array('text' => 'User Guide', 'link' => '#'),
                            array('text' => 'Tutorials', 'link' => '#')
                        )
                    )
                ),
                array(
                    'id' => 'tasks',
                    'name' => 'Tasks',
                    'icon' => 'settings.svg',
                    'icon_text' => 'TASKS',
                    'content_type' => 'tasks',
                    'enabled' => true,
                    'order' => 4,
                    'content' => array(
                        'title' => 'Learning Tasks',
                        'description' => 'Complete tasks and track your progress.',
                        'tasks' => array(
                            array('text' => 'Complete Basic Setup', 'completed' => false, 'link' => '#'),
                            array('text' => 'Learn Calculator Features', 'completed' => false, 'link' => '#'),
                            array('text' => 'Create Your First Calculator', 'completed' => false, 'link' => '#'),
                            array('text' => 'Explore Advanced Options', 'completed' => false, 'link' => '#')
                        )
                    )
                ),
                array(
                    'id' => 'calculators',
                    'name' => 'Calculators',
                    'icon' => 'calculator.svg',
                    'icon_text' => 'CALCULATORS',
                    'content_type' => 'calculators',
                    'enabled' => true,
                    'order' => 5,
                    'content' => array(
                        'title' => 'Tax & Financial Calculators',
                        'description' => 'Access various tax and financial calculators here.',
                        'links' => array(
                            array('text' => 'Income Tax Calculator', 'link' => '#'),
                            array('text' => 'Capital Gains Tax', 'link' => '#'),
                            array('text' => 'Corporation Tax', 'link' => '#'),
                            array('text' => 'VAT Calculator', 'link' => '#')
                        )
                    )
                )
            )
        );
        
        $config = $chatbot ? json_decode($chatbot->config, true) : $default_config;
        $config = wp_parse_args($config, $default_config);
        ?>
        
        <div class="wrap ukpa-chatbot-form">
            <div class="ukpa-header">
                <h1><?php echo $chatbot ? 'Edit Chatbot' : 'Create New Chatbot'; ?></h1>
                <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>" class="button">← Back to Chatbots</a>
            </div>
            
            <form id="ukpa-chatbot-form" method="post">
                <div class="ukpa-form-grid">
                    <!-- Basic Settings -->
                    <div class="ukpa-form-section">
                        <h2>Basic Settings</h2>
                        <div class="ukpa-form-row">
                            <label for="chatbot_name">Chatbot Name</label>
                            <input type="text" id="chatbot_name" name="chatbot_name" value="<?php echo $chatbot ? esc_attr($chatbot->name) : ''; ?>" required>
                        </div>
                        <div class="ukpa-form-row">
                                        <label for="chatbot_description">Description</label>
                            <textarea id="chatbot_description" name="chatbot_description" rows="3"><?php echo $chatbot ? esc_textarea($chatbot->description) : ''; ?></textarea>
                        </div>
                        <div class="ukpa-form-row">
                                        <label for="chatbot_type">Chatbot Type</label>
                            <select id="chatbot_type" name="chatbot_type">
                                            <option value="nlp" <?php selected($config['chatbot_type'] ?? 'nlp', 'nlp'); ?>>NLP (Keyword-based)</option>
                                            <option value="gpt" <?php selected($config['chatbot_type'] ?? 'nlp', 'gpt'); ?>>GPT (AI-powered)</option>
                                        </select>
                        </div>
                        <div class="ukpa-form-row">
                            <label for="chatbot_status">Status</label>
                            <select id="chatbot_status" name="chatbot_status">
                                <option value="active" <?php selected($chatbot ? $chatbot->status : 'active', 'active'); ?>>Active</option>
                                <option value="inactive" <?php selected($chatbot ? $chatbot->status : 'active', 'inactive'); ?>>Inactive</option>
                                        </select>
                        </div>
                    </div>
                    
                    <!-- Backend Configuration -->
                    <div class="ukpa-form-section">
                        <h2>Backend Configuration</h2>
                        <p class="ukpa-section-description">Configure the backend API URL for this specific chatbot. The API token is configured globally in Chatbot Settings.</p>
                        
                        <div class="ukpa-form-row">
                            <label for="backend_url">Backend API URL</label>
                            <input type="url" id="backend_url" name="backend_url" value="<?php echo esc_attr($config['backend_url'] ?? ''); ?>" placeholder="http://localhost:3002">
                            <p class="description">The base URL of your Node.js backend API (e.g., http://localhost:3002 or https://api.yourdomain.com). The chatbot endpoint will be automatically appended.</p>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="use_backend">Use Backend API</label>
                            <label class="ukpa-toggle">
                                <input type="checkbox" id="use_backend" name="use_backend" value="1" <?php checked($config['use_backend'] ?? false, true); ?>>
                                <span class="ukpa-toggle-slider"></span>
                            </label>
                            <p class="description">Enable this to use the backend API for processing. If disabled, the chatbot will use local processing.</p>
                        </div>
                    </div>
                    
                    <!-- Tab Management -->
                    <div class="ukpa-form-section">
                        <div class="ukpa-section-header">
                            <h2>Tab Management</h2>
                            <button type="button" class="button button-primary" id="add-tab-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                                </svg>
                                Add New Tab
                            </button>
                        </div>
                        
                        <div id="tabs-container" class="ukpa-tabs-container">
                            <?php foreach ($config['tabs'] as $index => $tab): ?>
                                <div class="ukpa-tab-item" data-tab-id="<?php echo esc_attr($tab['id']); ?>">
                                    <div class="ukpa-tab-header">
                                        <div class="ukpa-tab-drag-handle">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
                                            </svg>
                                        </div>
                                        <div class="ukpa-tab-info">
                                            <input type="text" class="ukpa-tab-name" value="<?php echo esc_attr($tab['name']); ?>" placeholder="Tab Name">
                                            <input type="text" class="ukpa-tab-icon-text" value="<?php echo esc_attr($tab['icon_text']); ?>" placeholder="Icon Text">
                                        </div>
                                        <div class="ukpa-tab-actions">
                                            <label class="ukpa-toggle">
                                                <input type="checkbox" class="ukpa-tab-enabled" <?php checked($tab['enabled'], true); ?>>
                                                <span class="ukpa-toggle-slider"></span>
                                            </label>
                                            <button type="button" class="ukpa-tab-edit-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                            <button type="button" class="ukpa-tab-delete-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="ukpa-tab-content" style="display: none;">
                                        <div class="ukpa-tab-settings">
                                            <div class="ukpa-form-row">
                                                <label>Tab ID</label>
                                                <input type="text" class="ukpa-tab-id" value="<?php echo esc_attr($tab['id']); ?>" placeholder="unique-tab-id">
                                            </div>
                                            <div class="ukpa-form-row">
                                                <label>Icon</label>
                                                <select class="ukpa-tab-icon">
                                                    <option value="home.svg" <?php selected($tab['icon'], 'home.svg'); ?>>Home</option>
                                                    <option value="chat.svg" <?php selected($tab['icon'], 'chat.svg'); ?>>Chat</option>
                                                    <option value="help.svg" <?php selected($tab['icon'], 'help.svg'); ?>>Help</option>
                                                    <option value="calculator.svg" <?php selected($tab['icon'], 'calculator.svg'); ?>>Calculator</option>
                                                    <option value="settings.svg" <?php selected($tab['icon'], 'settings.svg'); ?>>Settings</option>
                                                    <option value="info.svg" <?php selected($tab['icon'], 'info.svg'); ?>>Info</option>
                                                </select>
                                            </div>
                                                                                         <div class="ukpa-form-row">
                                                 <label>Content Type</label>
                                                 <select class="ukpa-tab-content-type">
                                                     <option value="home" <?php selected($tab['content_type'], 'home'); ?>>Home</option>
                                                     <option value="messages" <?php selected($tab['content_type'], 'messages'); ?>>Messages</option>
                                                     <option value="help" <?php selected($tab['content_type'], 'help'); ?>>Help</option>
                                                     <option value="tasks" <?php selected($tab['content_type'], 'tasks'); ?>>Tasks</option>
                                                     <option value="calculators" <?php selected($tab['content_type'], 'calculators'); ?>>Calculators</option>
                                                     <option value="custom" <?php selected($tab['content_type'], 'custom'); ?>>Custom HTML</option>
                                                 </select>
                                             </div>
                                            
                                            <!-- Dynamic content based on type -->
                                            <div class="ukpa-tab-content-editor">
                                                <?php $this->render_tab_content_editor($tab); ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
                
                <div class="ukpa-form-actions">
                    <button type="submit" class="button button-primary button-large">
                        <?php echo $chatbot ? 'Update Chatbot' : 'Create Chatbot'; ?>
                    </button>
                    <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>" class="button button-large">Cancel</a>
                </div>
                
                <input type="hidden" name="chatbot_id" value="<?php echo $chatbot_id; ?>">
                <input type="hidden" name="action" value="ukpa_save_chatbot">
                <?php wp_nonce_field('ukpa_save_chatbot', 'ukpa_chatbot_nonce'); ?>
            </form>
        </div>
        
        <!-- Tab Content Editor Modal -->
        <div id="tab-content-modal" class="ukpa-modal" style="display: none;">
            <div class="ukpa-modal-content">
                <div class="ukpa-modal-header">
                    <h3>Edit Tab Content</h3>
                    <button type="button" class="ukpa-modal-close">&times;</button>
                </div>
                <div class="ukpa-modal-body">
                    <div id="tab-content-editor"></div>
                </div>
                <div class="ukpa-modal-footer">
                    <button type="button" class="button button-primary" id="save-tab-content">Save Changes</button>
                    <button type="button" class="button" id="cancel-tab-content">Cancel</button>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render tab content editor based on content type
     */
    private function render_tab_content_editor($tab) {
        $content = $tab['content'] ?? array();
        $content_type = $tab['content_type'] ?? 'home';
        
        switch ($content_type) {
            case 'home':
                ?>
                <div class="ukpa-content-section">
                    <h4>Home Tab Content</h4>
                    <div class="ukpa-form-row">
                        <label>Greeting Message</label>
                        <input type="text" class="ukpa-content-greeting" value="<?php echo esc_attr($content['greeting'] ?? ''); ?>">
                    </div>
                    <div class="ukpa-form-row">
                        <label>Subtitle</label>
                        <input type="text" class="ukpa-content-subtitle" value="<?php echo esc_attr($content['subtitle'] ?? ''); ?>">
                    </div>
                    <div class="ukpa-form-row">
                        <label>Status Title</label>
                        <input type="text" class="ukpa-content-status-title" value="<?php echo esc_attr($content['status_title'] ?? ''); ?>">
                    </div>
                    <div class="ukpa-form-row">
                        <label>Status Time</label>
                        <input type="text" class="ukpa-content-status-time" value="<?php echo esc_attr($content['status_time'] ?? ''); ?>">
                    </div>
                    <div class="ukpa-form-row">
                        <label>Search Placeholder</label>
                        <input type="text" class="ukpa-content-search-placeholder" value="<?php echo esc_attr($content['search_placeholder'] ?? ''); ?>">
                    </div>
                    <div class="ukpa-form-row">
                        <label>
                            <input type="checkbox" class="ukpa-content-search-enabled" <?php checked($content['search_enabled'] ?? true, true); ?>>
                            Enable Search Functionality
                        </label>
                    </div>
                    
                    <div class="ukpa-form-row">
                        <label>Categories</label>
                        <div class="ukpa-categories">
                            <?php foreach ($content['categories'] ?? array() as $cat_index => $category): ?>
                                <div class="ukpa-category">
                                    <div class="ukpa-category-header">
                                        <input type="text" class="ukpa-category-title" value="<?php echo esc_attr($category['title'] ?? ''); ?>" placeholder="Category title">
                                        <input type="text" class="ukpa-category-description" value="<?php echo esc_attr($category['description'] ?? ''); ?>" placeholder="Category description">
                                        <input type="number" class="ukpa-category-article-count" value="<?php echo esc_attr($category['article_count'] ?? 0); ?>" placeholder="Article count">
                                        <button type="button" class="ukpa-remove-category">Remove Category</button>
                                    </div>
                                    <div class="ukpa-subcategories">
                                        <label>Subcategories</label>
                                        <?php foreach ($category['subcategories'] ?? array() as $sub_index => $subcategory): ?>
                                            <div class="ukpa-subcategory">
                                                <input type="text" class="ukpa-subcategory-title" value="<?php echo esc_attr($subcategory['title'] ?? ''); ?>" placeholder="Subcategory title">
                                                <input type="text" class="ukpa-subcategory-link" value="<?php echo esc_attr($subcategory['link'] ?? ''); ?>" placeholder="Link">
                                                <input type="number" class="ukpa-subcategory-article-count" value="<?php echo esc_attr($subcategory['article_count'] ?? 0); ?>" placeholder="Article count">
                                                <button type="button" class="ukpa-remove-subcategory">Remove</button>
                                            </div>
                                        <?php endforeach; ?>
                                        <button type="button" class="button ukpa-add-subcategory">Add Subcategory</button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <button type="button" class="button ukpa-add-category">Add Category</button>
                    </div>
                    
                    <div class="ukpa-form-row">
                        <label>Menu Items</label>
                        <div class="ukpa-menu-items">
                            <?php foreach ($content['menu_items'] ?? array() as $index => $item): ?>
                                <div class="ukpa-menu-item">
                                    <input type="text" class="ukpa-menu-text" value="<?php echo esc_attr($item['text'] ?? ''); ?>" placeholder="Menu text">
                                    <input type="text" class="ukpa-menu-link" value="<?php echo esc_attr($item['link'] ?? ''); ?>" placeholder="Link">
                                    <button type="button" class="ukpa-remove-menu-item">Remove</button>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <button type="button" class="button ukpa-add-menu-item">Add Menu Item</button>
                    </div>
                </div>
                <?php
                break;
                
            case 'messages':
                ?>
                <div class="ukpa-content-section">
                    <h4>Messages Tab Content</h4>
                    <div class="ukpa-form-row">
                        <label>Input Placeholder</label>
                        <input type="text" class="ukpa-content-input-placeholder" value="<?php echo esc_attr($content['input_placeholder'] ?? ''); ?>">
                    </div>
                    <div class="ukpa-form-row">
                        <label>Welcome Message</label>
                        <textarea class="ukpa-content-welcome-message" rows="3"><?php echo esc_textarea($content['welcome_message'] ?? ''); ?></textarea>
                    </div>
                </div>
                <?php
                break;
                
                         case 'help':
             case 'calculators':
                 ?>
                 <div class="ukpa-content-section">
                     <h4><?php echo ucfirst($content_type); ?> Tab Content</h4>
                     <div class="ukpa-form-row">
                         <label>Title</label>
                         <input type="text" class="ukpa-content-title" value="<?php echo esc_attr($content['title'] ?? ''); ?>">
                     </div>
                     <div class="ukpa-form-row">
                         <label>Description</label>
                         <textarea class="ukpa-content-description" rows="3"><?php echo esc_textarea($content['description'] ?? ''); ?></textarea>
                     </div>
                     <div class="ukpa-form-row">
                         <label>Links</label>
                         <div class="ukpa-links">
                             <?php foreach ($content['links'] ?? array() as $index => $link): ?>
                                 <div class="ukpa-link-item">
                                     <input type="text" class="ukpa-link-text" value="<?php echo esc_attr($link['text'] ?? ''); ?>" placeholder="Link text">
                                     <input type="text" class="ukpa-link-url" value="<?php echo esc_attr($link['link'] ?? ''); ?>" placeholder="URL">
                                     <button type="button" class="ukpa-remove-link">Remove</button>
                                 </div>
                             <?php endforeach; ?>
                         </div>
                         <button type="button" class="button ukpa-add-link">Add Link</button>
                     </div>
                 </div>
                 <?php
                 break;
                 
             case 'tasks':
                 ?>
                 <div class="ukpa-content-section">
                     <h4>Tasks Tab Content</h4>
                     <div class="ukpa-form-row">
                         <label>Title</label>
                         <input type="text" class="ukpa-content-title" value="<?php echo esc_attr($content['title'] ?? ''); ?>">
                     </div>
                     <div class="ukpa-form-row">
                         <label>Description</label>
                         <textarea class="ukpa-content-description" rows="3"><?php echo esc_textarea($content['description'] ?? ''); ?></textarea>
                     </div>
                     <div class="ukpa-form-row">
                         <label>Tasks</label>
                         <div class="ukpa-tasks">
                             <?php foreach ($content['tasks'] ?? array() as $index => $task): ?>
                                 <div class="ukpa-task-item">
                                     <input type="text" class="ukpa-task-text" value="<?php echo esc_attr($task['text'] ?? ''); ?>" placeholder="Task text">
                                     <input type="text" class="ukpa-task-link" value="<?php echo esc_attr($task['link'] ?? ''); ?>" placeholder="Task link">
                                     <label class="ukpa-task-completed">
                                         <input type="checkbox" class="ukpa-task-checkbox" <?php checked($task['completed'] ?? false, true); ?>>
                                         <span>Completed</span>
                                     </label>
                                     <button type="button" class="ukpa-remove-task">Remove</button>
                                 </div>
                             <?php endforeach; ?>
                         </div>
                         <button type="button" class="button ukpa-add-task">Add Task</button>
                     </div>
                 </div>
                 <?php
                 break;
                
            case 'custom':
                ?>
                <div class="ukpa-content-section">
                    <h4>Custom HTML Content</h4>
                    <div class="ukpa-form-row">
                        <label>Custom HTML</label>
                        <textarea class="ukpa-content-custom-html" rows="10" placeholder="Enter custom HTML content..."><?php echo esc_textarea($content['custom_html'] ?? ''); ?></textarea>
                    </div>
                </div>
                <?php
                break;
        }
    }
    
    /**
     * Save chatbot tabs via AJAX
     */
    public function save_chatbot_tabs() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $chatbot_id = intval($_POST['chatbot_id']);
        $tabs = $_POST['tabs'];
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $chatbot_id));
        
        if (!$chatbot) {
            wp_send_json_error('Chatbot not found');
        }
        
        $config = json_decode($chatbot->config, true);
        $config['tabs'] = $tabs;
        
        $result = $wpdb->update(
            $table,
            array('config' => json_encode($config)),
            array('id' => $chatbot_id),
            array('%s'),
            array('%d')
        );
        
        if ($result !== false) {
            wp_send_json_success('Tabs updated successfully');
        } else {
            wp_send_json_error('Failed to update tabs');
        }
    }
    
    /**
     * Get chatbot tabs via AJAX
     */
    public function get_chatbot_tabs() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        $chatbot_id = intval($_GET['chatbot_id']);
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $chatbot_id));
        
        if (!$chatbot) {
            wp_send_json_error('Chatbot not found');
        }
        
        $config = json_decode($chatbot->config, true);
        wp_send_json_success($config['tabs'] ?? array());
    }
    
    /**
     * Delete chatbot tab via AJAX
     */
    public function delete_chatbot_tab() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $chatbot_id = intval($_POST['chatbot_id']);
        $tab_id = sanitize_text_field($_POST['tab_id']);
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $chatbot_id));
        
        if (!$chatbot) {
            wp_send_json_error('Chatbot not found');
        }
        
        $config = json_decode($chatbot->config, true);
        $tabs = $config['tabs'] ?? array();
        
        // Remove the tab
        $tabs = array_filter($tabs, function($tab) use ($tab_id) {
            return $tab['id'] !== $tab_id;
        });
        
        $config['tabs'] = array_values($tabs);
        
        $result = $wpdb->update(
            $table,
            array('config' => json_encode($config)),
            array('id' => $chatbot_id),
            array('%s'),
            array('%d')
        );
        
        if ($result !== false) {
            wp_send_json_success('Tab deleted successfully');
        } else {
            wp_send_json_error('Failed to delete tab');
        }
    }
    
    /**
     * Reorder chatbot tabs via AJAX
     */
    public function reorder_chatbot_tabs() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $chatbot_id = intval($_POST['chatbot_id']);
        $tab_order = $_POST['tab_order'];
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbot = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $chatbot_id));
        
        if (!$chatbot) {
            wp_send_json_error('Chatbot not found');
        }
        
        $config = json_decode($chatbot->config, true);
        $tabs = $config['tabs'] ?? array();
        
        // Reorder tabs based on the new order
        $reordered_tabs = array();
        foreach ($tab_order as $index => $tab_id) {
            foreach ($tabs as $tab) {
                if ($tab['id'] === $tab_id) {
                    $tab['order'] = $index + 1;
                    $reordered_tabs[] = $tab;
                    break;
                }
            }
        }
        
        $config['tabs'] = $reordered_tabs;
        
        $result = $wpdb->update(
            $table,
            array('config' => json_encode($config)),
            array('id' => $chatbot_id),
            array('%s'),
            array('%d')
        );
        
        if ($result !== false) {
            wp_send_json_success('Tabs reordered successfully');
        } else {
            wp_send_json_error('Failed to reorder tabs');
        }
    }
}

// Initialize the chatbot manager
new UKPA_Chatbot_Manager(); 