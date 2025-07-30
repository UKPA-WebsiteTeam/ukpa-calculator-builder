<?php
/**
 * UKPA Calculator Builder - Chatbot Menu Integration
 * 
 * Integrates chatbot management into the calculator builder menu structure
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_Menu {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_chatbot_submenus'), 25);
        add_action('admin_init', array($this, 'init_chatbot_settings'));
    }
    
    /**
     * Add chatbot submenus to the calculator builder menu
     */
    public function add_chatbot_submenus() {
        add_submenu_page(
            'ukpa-calculator-builder',
            'Chatbot Manager',
            'Chatbot Manager',
            'manage_options',
            'ukpa-chatbot-manager',
            array($this, 'render_chatbot_manager')
        );
        
        add_submenu_page(
            'ukpa-calculator-builder',
            'Add New Chatbot',
            'Add New Chatbot',
            'manage_options',
            'ukpa-chatbot-add',
            array($this, 'render_add_chatbot')
        );
        
        add_submenu_page(
            'ukpa-calculator-builder',
            'FAQ Manager',
            'FAQ Manager',
            'manage_options',
            'ukpa-faq-manager',
            array($this, 'render_faq_manager')
        );
        
        add_submenu_page(
            'ukpa-calculator-builder',
            'Chatbot Settings',
            'Chatbot Settings',
            'manage_options',
            'ukpa-chatbot-settings',
            array($this, 'render_chatbot_settings')
        );
    }
    
    /**
     * Initialize chatbot settings
     */
    public function init_chatbot_settings() {
        // Register settings for the chatbot configuration
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_enabled');
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_id');
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_theme');
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_position');
        register_setting('ukpa_chatbot_options', 'ukpa_global_chatbot_exclude_pages');
        
        // Add settings sections
        add_settings_section(
            'ukpa_chatbot_global_section',
            'Global Chatbot Configuration',
            array($this, 'render_global_section_description'),
            'ukpa_chatbot_settings'
        );
        
        // Add settings fields
        add_settings_field(
            'ukpa_global_chatbot_enabled',
            'Enable Global Chatbot',
            array($this, 'render_enabled_field'),
            'ukpa_chatbot_settings',
            'ukpa_chatbot_global_section'
        );
        
        add_settings_field(
            'ukpa_global_chatbot_id',
            'Select Chatbot',
            array($this, 'render_chatbot_select_field'),
            'ukpa_chatbot_settings',
            'ukpa_chatbot_global_section'
        );
        
        add_settings_field(
            'ukpa_global_chatbot_theme',
            'Theme',
            array($this, 'render_theme_field'),
            'ukpa_chatbot_settings',
            'ukpa_chatbot_global_section'
        );
        
        add_settings_field(
            'ukpa_global_chatbot_position',
            'Position',
            array($this, 'render_position_field'),
            'ukpa_chatbot_settings',
            'ukpa_chatbot_global_section'
        );
        
        add_settings_field(
            'ukpa_global_chatbot_exclude_pages',
            'Exclude Pages',
            array($this, 'render_exclude_pages_field'),
            'ukpa_chatbot_settings',
            'ukpa_chatbot_global_section'
        );
    }
    
    /**
     * Render chatbot manager page
     */
    public function render_chatbot_manager() {
        $chatbot_manager = new UKPA_Chatbot_Manager();
        $chatbot_manager->render_chatbot_list();
    }
    
    /**
     * Render add chatbot page
     */
    public function render_add_chatbot() {
        require_once plugin_dir_path(__FILE__) . 'chatbot-manager.php';
        $manager = new UKPA_Chatbot_Manager();
        $manager->render_chatbot_form();
    }
    
    public function render_faq_manager() {
        require_once plugin_dir_path(__FILE__) . 'faq-manager.php';
        $faq_manager = new UKPA_FAQ_Manager();
        $faq_manager->render_faq_manager();
    }
    
    /**
     * Render chatbot settings page
     */
    public function render_chatbot_settings() {
        ?>
        <div class="wrap ukpa-chatbot-settings">
            <div class="ukpa-header">
                <h1>Chatbot Settings</h1>
            </div>
            
            <div class="ukpa-settings-grid">
                <!-- Global Settings -->
                <div class="ukpa-settings-section">
                    <h2>Global Configuration</h2>
                    <form method="post" action="options.php">
                        <?php
                        settings_fields('ukpa_chatbot_options');
                        do_settings_sections('ukpa_chatbot_settings');
                        submit_button('Save Settings');
                        ?>
                    </form>
                </div>
                
                <!-- Quick Actions -->
                <div class="ukpa-settings-section">
                    <h2>Quick Actions</h2>
                    <div class="ukpa-quick-actions">
                        <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>" class="button button-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                            Manage Chatbots
                        </a>
                        <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add'); ?>" class="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                            </svg>
                            Create New Chatbot
                        </a>
                    </div>
                    
                    <div class="ukpa-help-section">
                        <h3>How to Use</h3>
                        <ol>
                            <li><strong>Create a Chatbot:</strong> First, create a chatbot in the <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>">Chatbots</a> section.</li>
                            <li><strong>Enable Global Display:</strong> Check the "Enable Global Chatbot" option above.</li>
                            <li><strong>Select Chatbot:</strong> Choose which chatbot to display globally.</li>
                            <li><strong>Configure Appearance:</strong> Set the theme and position.</li>
                            <li><strong>Exclude Pages (Optional):</strong> Specify pages where the chatbot should not appear.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render global section description
     */
    public function render_global_section_description() {
        echo '<p>Configure the global chatbot that will appear on all pages of your website.</p>';
    }
    
    /**
     * Render enabled field
     */
    public function render_enabled_field() {
        $enabled = get_option('ukpa_global_chatbot_enabled', '0');
        ?>
        <label class="ukpa-toggle">
            <input type="checkbox" name="ukpa_global_chatbot_enabled" value="1" <?php checked($enabled, '1'); ?>>
            <span class="ukpa-toggle-slider"></span>
        </label>
        <p class="description">Enable the global chatbot widget on your website.</p>
        <?php
    }
    
    /**
     * Render chatbot select field
     */
    public function render_chatbot_select_field() {
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbots = $wpdb->get_results("SELECT id, name FROM $table WHERE status = 'active' ORDER BY name");
        $selected = get_option('ukpa_global_chatbot_id', '');
        ?>
        <select name="ukpa_global_chatbot_id" class="regular-text">
            <option value="">Select a chatbot...</option>
            <?php foreach ($chatbots as $chatbot): ?>
                <option value="<?php echo $chatbot->id; ?>" <?php selected($selected, $chatbot->id); ?>>
                    <?php echo esc_html($chatbot->name); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <p class="description">Choose which chatbot to display globally. Only active chatbots are shown.</p>
        <?php
    }
    
    /**
     * Render theme field
     */
    public function render_theme_field() {
        $theme = get_option('ukpa_global_chatbot_theme', 'light');
        ?>
        <select name="ukpa_global_chatbot_theme" class="regular-text">
            <option value="light" <?php selected($theme, 'light'); ?>>Light</option>
            <option value="dark" <?php selected($theme, 'dark'); ?>>Dark</option>
        </select>
        <p class="description">Choose the visual theme for the chatbot widget.</p>
        <?php
    }
    
    /**
     * Render position field
     */
    public function render_position_field() {
        $position = get_option('ukpa_global_chatbot_position', 'bottom-right');
        ?>
        <select name="ukpa_global_chatbot_position" class="regular-text">
            <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>>Bottom Right</option>
            <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>>Bottom Left</option>
            <option value="top-right" <?php selected($position, 'top-right'); ?>>Top Right</option>
            <option value="top-left" <?php selected($position, 'top-left'); ?>>Top Left</option>
        </select>
        <p class="description">Choose where the chatbot widget should appear on the page.</p>
        <?php
    }
    
    /**
     * Render exclude pages field
     */
    public function render_exclude_pages_field() {
        $exclude_pages = get_option('ukpa_global_chatbot_exclude_pages', '');
        ?>
        <textarea name="ukpa_global_chatbot_exclude_pages" rows="4" class="large-text" placeholder="Enter page URLs or slugs to exclude (one per line)&#10;Example:&#10;/contact&#10;/privacy-policy&#10;https://yoursite.com/specific-page"><?php echo esc_textarea($exclude_pages); ?></textarea>
        <p class="description">Enter page URLs or slugs where the chatbot should not appear. One per line.</p>
        <?php
    }
}

// Initialize the chatbot menu
new UKPA_Chatbot_Menu(); 