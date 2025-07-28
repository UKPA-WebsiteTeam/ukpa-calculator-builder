<?php
/**
 * UKPA Calculator Builder - Chatbot Global Settings
 * 
 * Settings page for global chatbot configuration
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_Settings {
    
    public function __construct() {
        add_action('admin_init', array($this, 'init_settings'));
        // Menu is now handled by UKPA_Chatbot_Menu class
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting('ukpa_chatbot_settings', 'ukpa_global_chatbot_enabled');
        register_setting('ukpa_chatbot_settings', 'ukpa_global_chatbot_id');
        register_setting('ukpa_chatbot_settings', 'ukpa_global_chatbot_theme');
        register_setting('ukpa_chatbot_settings', 'ukpa_global_chatbot_position');
        register_setting('ukpa_chatbot_settings', 'ukpa_global_chatbot_exclude_pages');
        
        add_settings_section(
            'ukpa_chatbot_global_section',
            'Global Chatbot Settings',
            array($this, 'render_section_description'),
            'ukpa_chatbot_settings'
        );
        
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
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Chatbot Global Settings</h1>
            <p>Configure the global chatbot that will appear on all pages of your website.</p>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('ukpa_chatbot_settings');
                do_settings_sections('ukpa_chatbot_settings');
                submit_button('Save Settings');
                ?>
            </form>
            
            <div class="ukpa-chatbot-settings-help">
                <h3>How to Use Global Chatbot</h3>
                <ol>
                    <li><strong>Create a Chatbot:</strong> First, create a chatbot in the <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>">Chatbots</a> section.</li>
                    <li><strong>Enable Global Display:</strong> Check the "Enable Global Chatbot" option above.</li>
                    <li><strong>Select Chatbot:</strong> Choose which chatbot to display globally.</li>
                    <li><strong>Configure Appearance:</strong> Set the theme and position.</li>
                    <li><strong>Exclude Pages (Optional):</strong> Specify pages where the chatbot should not appear.</li>
                </ol>
                
                <h3>Exclude Pages Format</h3>
                <p>You can exclude specific pages by entering:</p>
                <ul>
                    <li><strong>Page IDs:</strong> 1, 2, 3</li>
                    <li><strong>Page Slugs:</strong> about, contact, privacy-policy</li>
                    <li><strong>URL Paths:</strong> /about/, /contact/, /admin/</li>
                </ul>
                <p>Separate multiple entries with commas.</p>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render section description
     */
    public function render_section_description() {
        echo '<p>Configure the chatbot that will appear on all pages of your website. The chatbot will be displayed in the footer of every page unless excluded.</p>';
    }
    
    /**
     * Render enabled field
     */
    public function render_enabled_field() {
        $enabled = get_option('ukpa_global_chatbot_enabled', '0');
        ?>
        <label>
            <input type="checkbox" name="ukpa_global_chatbot_enabled" value="1" <?php checked($enabled, '1'); ?>>
            Enable global chatbot on all pages
        </label>
        <p class="description">When enabled, the selected chatbot will appear on all pages of your website.</p>
        <?php
    }
    
    /**
     * Render chatbot select field
     */
    public function render_chatbot_select_field() {
        $selected_id = get_option('ukpa_global_chatbot_id', '');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbots = $wpdb->get_results("SELECT id, name FROM $table WHERE status = 'active' ORDER BY name");
        
        if (empty($chatbots)) {
            echo '<p style="color: #d63638;">No active chatbots found. <a href="' . admin_url('admin.php?page=ukpa-chatbot-add') . '">Create your first chatbot</a>.</p>';
            return;
        }
        ?>
        <select name="ukpa_global_chatbot_id">
            <option value="">-- Select a Chatbot --</option>
            <?php foreach ($chatbots as $chatbot): ?>
                <option value="<?php echo $chatbot->id; ?>" <?php selected($selected_id, $chatbot->id); ?>>
                    <?php echo esc_html($chatbot->name); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <p class="description">Choose which chatbot to display globally. <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>">Manage chatbots</a></p>
        <?php
    }
    
    /**
     * Render theme field
     */
    public function render_theme_field() {
        $theme = get_option('ukpa_global_chatbot_theme', 'light');
        ?>
        <select name="ukpa_global_chatbot_theme">
            <option value="light" <?php selected($theme, 'light'); ?>>Light Theme</option>
            <option value="dark" <?php selected($theme, 'dark'); ?>>Dark Theme</option>
        </select>
        <p class="description">Choose the visual theme for the global chatbot.</p>
        <?php
    }
    
    /**
     * Render position field
     */
    public function render_position_field() {
        $position = get_option('ukpa_global_chatbot_position', 'bottom-right');
        ?>
        <select name="ukpa_global_chatbot_position">
            <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>>Bottom Right</option>
            <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>>Bottom Left</option>
            <option value="top-right" <?php selected($position, 'top-right'); ?>>Top Right</option>
            <option value="top-left" <?php selected($position, 'top-left'); ?>>Top Left</option>
        </select>
        <p class="description">Choose where the chatbot should appear on the page.</p>
        <?php
    }
    
    /**
     * Render exclude pages field
     */
    public function render_exclude_pages_field() {
        $exclude_pages = get_option('ukpa_global_chatbot_exclude_pages', '');
        ?>
        <textarea name="ukpa_global_chatbot_exclude_pages" rows="4" cols="50" placeholder="Enter page IDs, slugs, or URL paths separated by commas"><?php echo esc_textarea($exclude_pages); ?></textarea>
        <p class="description">Enter page IDs, slugs, or URL paths where the chatbot should NOT appear. Separate multiple entries with commas.</p>
        <p class="description"><strong>Examples:</strong> 1, 2, 3 (page IDs) | about, contact (slugs) | /admin/, /checkout/ (URL paths)</p>
        <?php
    }
}

// Initialize the chatbot settings
// new UKPA_Chatbot_Settings(); // DISABLED 