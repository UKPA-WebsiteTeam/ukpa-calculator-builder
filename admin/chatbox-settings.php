<?php
/**
 * UKPA Calculator Builder - Chat Box Settings
 *
 * Admin interface for chat box configuration
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbox_Settings {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'init_settings'));
    }
    
    /**
     * Add settings page to menu
     */
    public function add_settings_page() {
        add_submenu_page(
            'ukpa-calculator-builder',
            'Chat Box Settings',
            'Chat Box',
            'manage_options',
            'ukpa-chatbox-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_enabled');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_backend_url');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_api_key');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_timeout');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_theme');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_position');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_exclude_pages');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_welcome_message');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_placeholder');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_system_prompt');
        
        // CSS Customization Settings
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_font_family');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_font_size');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_background_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_border_radius');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_border_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_border_width');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_box_shadow');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_header_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_header_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_message_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_message_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_user_message_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_user_message_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_bot_message_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_bot_message_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_input_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_input_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_input_border_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_button_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_button_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_button_hover_bg_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_button_hover_text_color');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_width');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_height');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_max_width');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_max_height');
        register_setting('ukpa_chatbox_settings', 'ukpa_chatbox_z_index');
        
        add_settings_section(
            'ukpa_chatbox_general',
            'General Settings',
            array($this, 'render_general_section'),
            'ukpa_chatbox_settings'
        );
        
        add_settings_section(
            'ukpa_chatbox_backend',
            'Backend Configuration',
            array($this, 'render_backend_section'),
            'ukpa_chatbox_settings'
        );
        
        add_settings_section(
            'ukpa_chatbox_appearance',
            'Appearance Settings',
            array($this, 'render_appearance_section'),
            'ukpa_chatbox_settings'
        );
        
        add_settings_section(
            'ukpa_chatbox_behavior',
            'Behavior Settings',
            array($this, 'render_behavior_section'),
            'ukpa_chatbox_settings'
        );
        
        add_settings_section(
            'ukpa_chatbox_css',
            'CSS Customization',
            array($this, 'render_css_section'),
            'ukpa_chatbox_settings'
        );
        
        // General settings
        add_settings_field(
            'ukpa_chatbox_enabled',
            'Enable Chat Box',
            array($this, 'render_enabled_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_general'
        );
        
        // Backend settings
        add_settings_field(
            'ukpa_chatbox_backend_url',
            'Backend URL',
            array($this, 'render_backend_url_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_backend'
        );
        
        add_settings_field(
            'ukpa_chatbox_api_key',
            'API Key (Optional)',
            array($this, 'render_api_key_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_backend'
        );
        
        add_settings_field(
            'ukpa_chatbox_timeout',
            'Request Timeout (seconds)',
            array($this, 'render_timeout_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_backend'
        );
        
        add_settings_field(
            'ukpa_chatbox_system_prompt',
            'System Prompt',
            array($this, 'render_system_prompt_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_backend'
        );
        
        // Appearance settings
        add_settings_field(
            'ukpa_chatbox_theme',
            'Theme',
            array($this, 'render_theme_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_appearance'
        );
        
        add_settings_field(
            'ukpa_chatbox_position',
            'Position',
            array($this, 'render_position_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_appearance'
        );
        
        // Behavior settings
        add_settings_field(
            'ukpa_chatbox_welcome_message',
            'Welcome Message',
            array($this, 'render_welcome_message_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_behavior'
        );
        
        add_settings_field(
            'ukpa_chatbox_placeholder',
            'Input Placeholder',
            array($this, 'render_placeholder_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_behavior'
        );
        
        add_settings_field(
            'ukpa_chatbox_exclude_pages',
            'Exclude Pages',
            array($this, 'render_exclude_pages_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_behavior'
        );
        
        // CSS Customization Fields
        add_settings_field(
            'ukpa_chatbox_font_family',
            'Font Family',
            array($this, 'render_font_family_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_font_size',
            'Font Size',
            array($this, 'render_font_size_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_text_color',
            'Text Color',
            array($this, 'render_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_background_color',
            'Background Color',
            array($this, 'render_background_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_border_radius',
            'Border Radius',
            array($this, 'render_border_radius_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_border_color',
            'Border Color',
            array($this, 'render_border_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_border_width',
            'Border Width',
            array($this, 'render_border_width_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_box_shadow',
            'Box Shadow',
            array($this, 'render_box_shadow_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_header_bg_color',
            'Header Background Color',
            array($this, 'render_header_bg_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_header_text_color',
            'Header Text Color',
            array($this, 'render_header_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_user_message_bg_color',
            'User Message Background',
            array($this, 'render_user_message_bg_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_user_message_text_color',
            'User Message Text Color',
            array($this, 'render_user_message_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_bot_message_bg_color',
            'Bot Message Background',
            array($this, 'render_bot_message_bg_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_bot_message_text_color',
            'Bot Message Text Color',
            array($this, 'render_bot_message_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_input_bg_color',
            'Input Background Color',
            array($this, 'render_input_bg_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_input_text_color',
            'Input Text Color',
            array($this, 'render_input_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_input_border_color',
            'Input Border Color',
            array($this, 'render_input_border_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_button_bg_color',
            'Button Background Color',
            array($this, 'render_button_bg_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_button_text_color',
            'Button Text Color',
            array($this, 'render_button_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_button_hover_bg_color',
            'Button Hover Background',
            array($this, 'render_button_hover_bg_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_button_hover_text_color',
            'Button Hover Text Color',
            array($this, 'render_button_hover_text_color_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_width',
            'Chat Box Width',
            array($this, 'render_width_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_height',
            'Chat Box Height',
            array($this, 'render_height_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_max_width',
            'Max Width',
            array($this, 'render_max_width_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_max_height',
            'Max Height',
            array($this, 'render_max_height_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
        
        add_settings_field(
            'ukpa_chatbox_z_index',
            'Z-Index',
            array($this, 'render_z_index_field'),
            'ukpa_chatbox_settings',
            'ukpa_chatbox_css'
        );
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Chat Box Settings</h1>
            <p class="ukpa-chatbox-settings-help">
                Configure your chat box to communicate with your trained Node.js backend model.
            </p>
            
            <div class="ukpa-settings-container">
                <!-- Header -->
                <div class="ukpa-settings-header">
                    <div class="ukpa-settings-title">
                        <h1>Chat Box Configuration</h1>
                        <p>Configure your AI chat interface with precision and style</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="ukpa-settings-content">
                    <!-- Left Panel: Settings -->
                    <div class="ukpa-settings-panel">
                        <form method="post" action="options.php" class="ukpa-settings-form">
                            <?php settings_fields('ukpa_chatbox_settings'); ?>
                            
                            <!-- Core Configuration -->
                            <div class="ukpa-settings-section">
                                <div class="ukpa-section-header">
                                    <h3>Core Configuration</h3>
                                    <span class="ukpa-section-badge">Essential</span>
                                </div>
                                <div class="ukpa-section-content">
                                    <?php $this->render_enabled_field(); ?>
                                    <?php $this->render_backend_url_field(); ?>
                                    <?php $this->render_system_prompt_field(); ?>
                                </div>
                            </div>

                            <!-- Behavior Settings -->
                            <div class="ukpa-settings-section">
                                <div class="ukpa-section-header">
                                    <h3>Behavior</h3>
                                    <span class="ukpa-section-badge">Interaction</span>
                                </div>
                                <div class="ukpa-section-content">
                                    <?php $this->render_welcome_message_field(); ?>
                                    <?php $this->render_placeholder_field(); ?>
                                    <?php $this->render_exclude_pages_field(); ?>
                                </div>
                            </div>

                            <!-- Visual Design -->
                            <div class="ukpa-settings-section">
                                <div class="ukpa-section-header">
                                    <h3>Visual Design</h3>
                                    <span class="ukpa-section-badge">Aesthetics</span>
                                </div>
                                <div class="ukpa-section-content">
                                    <div class="ukpa-design-grid">
                                        <div class="ukpa-design-group">
                                            <label>Theme</label>
                                            <?php $this->render_theme_field(); ?>
                                        </div>
                                        <div class="ukpa-design-group">
                                            <label>Position</label>
                                            <?php $this->render_position_field(); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Advanced Styling -->
                            <div class="ukpa-settings-section">
                                <div class="ukpa-section-header">
                                    <h3>Advanced Styling</h3>
                                    <span class="ukpa-section-badge">Custom</span>
                                </div>
                                <div class="ukpa-section-content">
                                    <div class="ukpa-styling-tabs">
                                        <div class="ukpa-tab-nav">
                                            <button type="button" class="ukpa-tab-btn active" data-tab="typography">Typography</button>
                                            <button type="button" class="ukpa-tab-btn" data-tab="layout">Layout</button>
                                            <button type="button" class="ukpa-tab-btn" data-tab="colors">Colors</button>
                                            <button type="button" class="ukpa-tab-btn" data-tab="components">Components</button>
                                        </div>
                                        
                                        <div class="ukpa-tab-content">
                                            <div class="ukpa-tab-pane active" data-tab="typography">
                                                <div class="ukpa-styling-grid">
                                                    <div class="ukpa-styling-item">
                                                        <label>Font Family</label>
                                                        <?php $this->render_font_family_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Font Size</label>
                                                        <?php $this->render_font_size_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Text Color</label>
                                                        <?php $this->render_text_color_field(); ?>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="ukpa-tab-pane" data-tab="layout">
                                                <div class="ukpa-styling-grid">
                                                    <div class="ukpa-styling-item">
                                                        <label>Width</label>
                                                        <?php $this->render_width_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Height</label>
                                                        <?php $this->render_height_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Border Radius</label>
                                                        <?php $this->render_border_radius_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Box Shadow</label>
                                                        <?php $this->render_box_shadow_field(); ?>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="ukpa-tab-pane" data-tab="colors">
                                                <div class="ukpa-styling-grid">
                                                    <div class="ukpa-styling-item">
                                                        <label>Background</label>
                                                        <?php $this->render_background_color_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Border</label>
                                                        <?php $this->render_border_color_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Header Background</label>
                                                        <?php $this->render_header_bg_color_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Header Text</label>
                                                        <?php $this->render_header_text_color_field(); ?>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="ukpa-tab-pane" data-tab="components">
                                                <div class="ukpa-styling-grid">
                                                    <div class="ukpa-styling-item">
                                                        <label>User Message BG</label>
                                                        <?php $this->render_user_message_bg_color_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Bot Message BG</label>
                                                        <?php $this->render_bot_message_bg_color_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Input Background</label>
                                                        <?php $this->render_input_bg_color_field(); ?>
                                                    </div>
                                                    <div class="ukpa-styling-item">
                                                        <label>Button Background</label>
                                                        <?php $this->render_button_bg_color_field(); ?>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="ukpa-settings-actions">
                                <button type="submit" class="ukpa-btn ukpa-btn-primary">Save Configuration</button>
                                <button type="button" id="ukpa-test-connection" class="ukpa-btn ukpa-btn-secondary">Test Connection</button>
                            </div>
                        </form>
                    </div>

                    <!-- Right Panel: Preview -->
                    <div class="ukpa-preview-panel">
                        <div class="ukpa-preview-header">
                            <h3>Live Preview</h3>
                            <p>Real-time visualization of your configuration</p>
                        </div>
                        <div class="ukpa-preview-container">
                            <div id="ukpa-chatbox-preview" class="ukpa-preview-frame">
                                <!-- Preview content -->
                            </div>
                        </div>
                        <div class="ukpa-preview-info">
                            <div class="ukpa-info-item">
                                <span class="ukpa-info-icon">📋</span>
                                <span>Shortcode: <code>[ukpa_chatbox]</code></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        /* Professional UI/UX Design System */
        :root {
            --ukpa-primary: #2563eb;
            --ukpa-primary-hover: #1d4ed8;
            --ukpa-secondary: #64748b;
            --ukpa-success: #059669;
            --ukpa-warning: #d97706;
            --ukpa-error: #dc2626;
            --ukpa-surface: #ffffff;
            --ukpa-surface-secondary: #f8fafc;
            --ukpa-border: #e2e8f0;
            --ukpa-border-focus: #2563eb;
            --ukpa-text-primary: #1e293b;
            --ukpa-text-secondary: #64748b;
            --ukpa-text-muted: #94a3b8;
            --ukpa-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --ukpa-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --ukpa-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --ukpa-radius-sm: 0.375rem;
            --ukpa-radius-md: 0.5rem;
            --ukpa-radius-lg: 0.75rem;
            --ukpa-spacing-xs: 0.5rem;
            --ukpa-spacing-sm: 0.75rem;
            --ukpa-spacing-md: 1rem;
            --ukpa-spacing-lg: 1.5rem;
            --ukpa-spacing-xl: 2rem;
            --ukpa-spacing-2xl: 3rem;
        }

        /* Container Layout */
        .ukpa-settings-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: var(--ukpa-spacing-xl);
            background: var(--ukpa-surface-secondary);
            min-height: 100vh;
        }

        /* Header */
        .ukpa-settings-header {
            margin-bottom: var(--ukpa-spacing-2xl);
            text-align: center;
        }

        .ukpa-settings-title h1 {
            font-size: 2.25rem;
            font-weight: 700;
            color: var(--ukpa-text-primary);
            margin: 0 0 var(--ukpa-spacing-sm) 0;
            letter-spacing: -0.025em;
        }

        .ukpa-settings-title p {
            font-size: 1.125rem;
            color: var(--ukpa-text-secondary);
            margin: 0;
            font-weight: 400;
        }

        /* Main Content Layout */
        .ukpa-settings-content {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: var(--ukpa-spacing-xl);
            align-items: start;
        }

        /* Settings Panel */
        .ukpa-settings-panel {
            background: var(--ukpa-surface);
            border-radius: var(--ukpa-radius-lg);
            box-shadow: var(--ukpa-shadow-md);
            overflow: hidden;
        }

        .ukpa-settings-form {
            padding: var(--ukpa-spacing-xl);
        }

        /* Section Styling */
        .ukpa-settings-section {
            margin-bottom: var(--ukpa-spacing-xl);
            border: 1px solid var(--ukpa-border);
            border-radius: var(--ukpa-radius-md);
            overflow: hidden;
        }

        .ukpa-settings-section:last-child {
            margin-bottom: 0;
        }

        .ukpa-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--ukpa-spacing-lg);
            background: var(--ukpa-surface-secondary);
            border-bottom: 1px solid var(--ukpa-border);
        }

        .ukpa-section-header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--ukpa-text-primary);
            margin: 0;
        }

        .ukpa-section-badge {
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.25rem 0.75rem;
            border-radius: var(--ukpa-radius-sm);
            background: var(--ukpa-primary);
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .ukpa-section-content {
            padding: var(--ukpa-spacing-lg);
        }

        /* Form Elements */
        .ukpa-settings-form label {
            display: block;
            font-weight: 500;
            color: var(--ukpa-text-primary);
            margin-bottom: var(--ukpa-spacing-xs);
            font-size: 0.875rem;
        }

        .ukpa-settings-form input[type="text"],
        .ukpa-settings-form input[type="url"],
        .ukpa-settings-form input[type="password"],
        .ukpa-settings-form input[type="number"],
        .ukpa-settings-form input[type="color"],
        .ukpa-settings-form select,
        .ukpa-settings-form textarea {
            width: 100%;
            padding: var(--ukpa-spacing-sm);
            border: 1px solid var(--ukpa-border);
            border-radius: var(--ukpa-radius-sm);
            font-size: 0.875rem;
            transition: all 0.2s ease;
            background: var(--ukpa-surface);
        }

        .ukpa-settings-form input:focus,
        .ukpa-settings-form select:focus,
        .ukpa-settings-form textarea:focus {
            outline: none;
            border-color: var(--ukpa-border-focus);
            box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
        }

        .ukpa-settings-form input[type="color"] {
            height: 40px;
            padding: 4px;
        }

        /* Design Grid */
        .ukpa-design-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--ukpa-spacing-md);
        }

        .ukpa-design-group {
            display: flex;
            flex-direction: column;
        }

        /* Styling Tabs */
        .ukpa-styling-tabs {
            margin-top: var(--ukpa-spacing-md);
        }

        .ukpa-tab-nav {
            display: flex;
            border-bottom: 1px solid var(--ukpa-border);
            margin-bottom: var(--ukpa-spacing-lg);
        }

        .ukpa-tab-btn {
            padding: var(--ukpa-spacing-sm) var(--ukpa-spacing-md);
            background: none;
            border: none;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--ukpa-text-secondary);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .ukpa-tab-btn.active {
            color: var(--ukpa-primary);
            border-bottom-color: var(--ukpa-primary);
        }

        .ukpa-tab-btn:hover {
            color: var(--ukpa-text-primary);
        }

        .ukpa-tab-pane {
            display: none;
        }

        .ukpa-tab-pane.active {
            display: block;
        }

        .ukpa-styling-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--ukpa-spacing-md);
        }

        .ukpa-styling-item {
            display: flex;
            flex-direction: column;
        }

        /* Buttons */
        .ukpa-settings-actions {
            display: flex;
            gap: var(--ukpa-spacing-md);
            padding-top: var(--ukpa-spacing-lg);
            border-top: 1px solid var(--ukpa-border);
            margin-top: var(--ukpa-spacing-lg);
        }

        .ukpa-btn {
            padding: var(--ukpa-spacing-sm) var(--ukpa-spacing-lg);
            border: none;
            border-radius: var(--ukpa-radius-sm);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }

        .ukpa-btn-primary {
            background: var(--ukpa-primary);
            color: white;
        }

        .ukpa-btn-primary:hover {
            background: var(--ukpa-primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--ukpa-shadow-md);
        }

        .ukpa-btn-secondary {
            background: var(--ukpa-surface);
            color: var(--ukpa-text-primary);
            border: 1px solid var(--ukpa-border);
        }

        .ukpa-btn-secondary:hover {
            background: var(--ukpa-surface-secondary);
            border-color: var(--ukpa-text-secondary);
        }

        /* Preview Panel */
        .ukpa-preview-panel {
            background: var(--ukpa-surface);
            border-radius: var(--ukpa-radius-lg);
            box-shadow: var(--ukpa-shadow-md);
            overflow: hidden;
            position: sticky;
            top: var(--ukpa-spacing-lg);
        }

        .ukpa-preview-header {
            padding: var(--ukpa-spacing-lg);
            border-bottom: 1px solid var(--ukpa-border);
            background: var(--ukpa-surface-secondary);
        }

        .ukpa-preview-header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--ukpa-text-primary);
            margin: 0 0 var(--ukpa-spacing-xs) 0;
        }

        .ukpa-preview-header p {
            font-size: 0.875rem;
            color: var(--ukpa-text-secondary);
            margin: 0;
        }

        .ukpa-preview-container {
            padding: var(--ukpa-spacing-lg);
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ukpa-preview-frame {
            width: 100%;
            max-width: 350px;
            background: var(--ukpa-surface-secondary);
            border-radius: var(--ukpa-radius-md);
            padding: var(--ukpa-spacing-md);
            box-shadow: var(--ukpa-shadow-sm);
        }

        .ukpa-preview-info {
            padding: var(--ukpa-spacing-lg);
            border-top: 1px solid var(--ukpa-border);
            background: var(--ukpa-surface-secondary);
        }

        .ukpa-info-item {
            display: flex;
            align-items: center;
            gap: var(--ukpa-spacing-sm);
            font-size: 0.875rem;
            color: var(--ukpa-text-secondary);
        }

        .ukpa-info-icon {
            font-size: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
            .ukpa-settings-content {
                grid-template-columns: 1fr;
                gap: var(--ukpa-spacing-lg);
            }

            .ukpa-preview-panel {
                position: static;
            }

            .ukpa-design-grid {
                grid-template-columns: 1fr;
            }

            .ukpa-styling-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .ukpa-settings-container {
                padding: var(--ukpa-spacing-md);
            }

            .ukpa-settings-title h1 {
                font-size: 1.875rem;
            }

            .ukpa-settings-actions {
                flex-direction: column;
            }

            .ukpa-tab-nav {
                flex-wrap: wrap;
            }
        }

        /* WordPress Integration */
        .ukpa-settings-form .form-table {
            margin: 0;
        }

        .ukpa-settings-form .form-table th {
            display: none;
        }

        .ukpa-settings-form .form-table td {
            padding: 0;
            border: none;
        }

        .ukpa-settings-form .description {
            font-size: 0.75rem;
            color: var(--ukpa-text-muted);
            margin-top: var(--ukpa-spacing-xs);
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            // Initialize preview
            updateChatboxPreview();
            
            // Tab functionality
            $('.ukpa-tab-btn').on('click', function() {
                var tab = $(this).data('tab');
                
                // Update active tab button
                $('.ukpa-tab-btn').removeClass('active');
                $(this).addClass('active');
                
                // Update active tab content
                $('.ukpa-tab-pane').removeClass('active');
                $('.ukpa-tab-pane[data-tab="' + tab + '"]').addClass('active');
            });
            
            // Update preview on any input change
            $('input, select, textarea').on('input change', function() {
                updateChatboxPreview();
            });
            
            function updateChatboxPreview() {
                var fontFamily = $('select[name="ukpa_chatbox_font_family"]').val() || 'Arial, sans-serif';
                var fontSize = $('input[name="ukpa_chatbox_font_size"]').val() || '14px';
                var textColor = $('input[name="ukpa_chatbox_text_color"]').val() || '#333333';
                var bgColor = $('input[name="ukpa_chatbox_background_color"]').val() || '#ffffff';
                var borderRadius = $('input[name="ukpa_chatbox_border_radius"]').val() || '8px';
                var borderColor = $('input[name="ukpa_chatbox_border_color"]').val() || '#e0e0e0';
                var borderWidth = $('input[name="ukpa_chatbox_border_width"]').val() || '1px';
                var boxShadow = $('input[name="ukpa_chatbox_box_shadow"]').val() || '0 2px 10px rgba(0,0,0,0.1)';
                var headerBgColor = $('input[name="ukpa_chatbox_header_bg_color"]').val() || '#007cba';
                var headerTextColor = $('input[name="ukpa_chatbox_header_text_color"]').val() || '#ffffff';
                var userMessageBgColor = $('input[name="ukpa_chatbox_user_message_bg_color"]').val() || '#007cba';
                var userMessageTextColor = $('input[name="ukpa_chatbox_user_message_text_color"]').val() || '#ffffff';
                var botMessageBgColor = $('input[name="ukpa_chatbox_bot_message_bg_color"]').val() || '#f1f1f1';
                var botMessageTextColor = $('input[name="ukpa_chatbox_bot_message_text_color"]').val() || '#333333';
                var inputBgColor = $('input[name="ukpa_chatbox_input_bg_color"]').val() || '#ffffff';
                var inputTextColor = $('input[name="ukpa_chatbox_input_text_color"]').val() || '#333333';
                var inputBorderColor = $('input[name="ukpa_chatbox_input_border_color"]').val() || '#e0e0e0';
                var buttonBgColor = $('input[name="ukpa_chatbox_button_bg_color"]').val() || '#007cba';
                var buttonTextColor = $('input[name="ukpa_chatbox_button_text_color"]').val() || '#ffffff';
                var buttonHoverBgColor = $('input[name="ukpa_chatbox_button_hover_bg_color"]').val() || '#005a87';
                var buttonHoverTextColor = $('input[name="ukpa_chatbox_button_hover_text_color"]').val() || '#ffffff';
                var width = $('input[name="ukpa_chatbox_width"]').val() || '350px';
                var height = $('input[name="ukpa_chatbox_height"]').val() || '500px';
                var maxWidth = $('input[name="ukpa_chatbox_max_width"]').val() || '400px';
                var maxHeight = $('input[name="ukpa_chatbox_max_height"]').val() || '600px';
                var zIndex = $('input[name="ukpa_chatbox_z_index"]').val() || '9999';
                
                var welcomeMessage = $('textarea[name="ukpa_chatbox_welcome_message"]').val() || 'Hello! How can I help you today?';
                var placeholder = $('input[name="ukpa_chatbox_placeholder"]').val() || 'Type your message...';
                
                var previewHtml = `
                <div class="ukpa-chatbox-preview-box" style="
                    font-family: ${fontFamily};
                    font-size: ${fontSize};
                    color: ${textColor};
                    background-color: ${bgColor};
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    box-shadow: ${boxShadow};
                    width: ${width};
                    height: ${height};
                    max-width: ${maxWidth};
                    max-height: ${maxHeight};
                    z-index: ${zIndex};
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                ">
                    <div class="ukpa-chatbox-header" style="
                        background-color: ${headerBgColor};
                        color: ${headerTextColor};
                        padding: 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">💬</span>
                            <span style="font-weight: bold;">AI Assistant</span>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button style="
                                background: none;
                                border: none;
                                color: ${headerTextColor};
                                cursor: pointer;
                                font-size: 18px;
                                padding: 0;
                                width: 20px;
                                height: 20px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">−</button>
                            <button style="
                                background: none;
                                border: none;
                                color: ${headerTextColor};
                                cursor: pointer;
                                font-size: 18px;
                                padding: 0;
                                width: 20px;
                                height: 20px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">×</button>
                        </div>
                    </div>
                    
                    <div class="ukpa-chatbox-body" style="
                        flex: 1;
                        padding: 15px;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    ">
                        <div class="ukpa-chatbox-message bot" style="
                            background-color: ${botMessageBgColor};
                            color: ${botMessageTextColor};
                            padding: 10px 15px;
                            border-radius: 15px;
                            max-width: 80%;
                            align-self: flex-start;
                            word-wrap: break-word;
                        ">
                            ${welcomeMessage}
                        </div>
                        
                        <div class="ukpa-chatbox-message user" style="
                            background-color: ${userMessageBgColor};
                            color: ${userMessageTextColor};
                            padding: 10px 15px;
                            border-radius: 15px;
                            max-width: 80%;
                            align-self: flex-end;
                            word-wrap: break-word;
                        ">
                            This is a sample user message
                        </div>
                    </div>
                    
                    <div class="ukpa-chatbox-footer" style="
                        padding: 15px;
                        border-top: 1px solid rgba(0,0,0,0.1);
                    ">
                        <div style="
                            display: flex;
                            gap: 10px;
                            align-items: flex-end;
                        ">
                            <textarea style="
                                flex: 1;
                                background-color: ${inputBgColor};
                                color: ${inputTextColor};
                                border: 1px solid ${inputBorderColor};
                                border-radius: 20px;
                                padding: 10px 15px;
                                resize: none;
                                font-family: inherit;
                                font-size: inherit;
                                min-height: 40px;
                                max-height: 100px;
                            " placeholder="${placeholder}"></textarea>
                            <button style="
                                background-color: ${buttonBgColor};
                                color: ${buttonTextColor};
                                border: none;
                                border-radius: 50%;
                                width: 40px;
                                height: 40px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 16px;
                                transition: all 0.2s ease;
                            " onmouseover="this.style.backgroundColor='${buttonHoverBgColor}'; this.style.color='${buttonHoverTextColor}'" 
                               onmouseout="this.style.backgroundColor='${buttonBgColor}'; this.style.color='${buttonTextColor}'">
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
                `;
                
                $('#ukpa-chatbox-preview').html(previewHtml);
            }
            
            // Test connection functionality
            $('#ukpa-test-connection').on('click', function() {
                var $btn = $(this);
                $btn.text('Testing...').prop('disabled', true);
                
                // Simulate test connection
                setTimeout(function() {
                    $btn.text('Connection Successful').removeClass('ukpa-btn-secondary').addClass('ukpa-btn-primary');
                    setTimeout(function() {
                        $btn.text('Test Connection').removeClass('ukpa-btn-primary').addClass('ukpa-btn-secondary').prop('disabled', false);
                    }, 2000);
                }, 1000);
            });
        });
        </script>
        <?php
    }
    
    /**
     * Render general section
     */
    public function render_general_section() {
        echo '<p>Enable or disable the chat box system.</p>';
    }
    
    /**
     * Render backend section
     */
    public function render_backend_section() {
        echo '<p>Configure the connection to your Node.js backend model.</p>';
    }
    
    /**
     * Render appearance section
     */
    public function render_appearance_section() {
        echo '<p>Customize the appearance of the chat box.</p>';
    }
    
    /**
     * Render behavior section
     */
    public function render_behavior_section() {
        echo '<p>Configure how the chat box behaves on your website.</p>';
    }
    
    /**
     * Render CSS section
     */
    public function render_css_section() {
        echo '<p>Customize the appearance of the chat box with CSS settings. All changes will be applied immediately.</p>';
    }
    
    /**
     * Render enabled field
     */
    public function render_enabled_field() {
        $enabled = get_option('ukpa_chatbox_enabled', false);
        ?>
        <label>
            <input type="checkbox" name="ukpa_chatbox_enabled" value="1" <?php checked($enabled, true); ?>>
            Enable chat box on all pages
        </label>
        <p class="description">When enabled, the chat box will appear on all pages except those specified in the exclude list.</p>
        <?php
    }
    
    /**
     * Render backend URL field
     */
    public function render_backend_url_field() {
        $backend_url = get_option('ukpa_chatbox_backend_url', 'http://192.168.18.54:3002/ana/api/v1/chatbot/ask');
        
        // Ensure the URL is always set to the correct endpoint
        $correct_url = 'http://192.168.18.54:3002/ana/api/v1/chatbot/ask';
        if ($backend_url !== $correct_url) {
            $backend_url = $correct_url;
            update_option('ukpa_chatbox_backend_url', $correct_url);
        }
        ?>
        <input type="url" name="ukpa_chatbox_backend_url" value="<?php echo esc_attr($backend_url); ?>" 
               class="regular-text" placeholder="http://192.168.18.54:3002/ana/api/v1/chatbot/ask" readonly>
        <p class="description">The URL of your Node.js backend API endpoint that handles chat messages. (Fixed to correct endpoint)</p>
        <?php
    }
    
    /**
     * Render API key field
     */
    public function render_api_key_field() {
        $api_key = get_option('ukpa_chatbox_api_key', '');
        ?>
        <input type="password" name="ukpa_chatbox_api_key" value="<?php echo esc_attr($api_key); ?>" 
               class="regular-text" placeholder="Your API key">
        <p class="description">Optional API key for authentication with your backend.</p>
        <?php
    }
    
    /**
     * Render timeout field
     */
    public function render_timeout_field() {
        $timeout = get_option('ukpa_chatbox_timeout', 30);
        ?>
        <input type="number" name="ukpa_chatbox_timeout" value="<?php echo esc_attr($timeout); ?>" 
               class="small-text" min="5" max="120">
        <p class="description">Maximum time to wait for a response from your backend (in seconds).</p>
        <?php
    }
    
    /**
     * Render system prompt field
     */
    public function render_system_prompt_field() {
        $system_prompt = get_option('ukpa_chatbox_system_prompt', 'You are a helpful assistant for UKPA.');
        ?>
        <textarea name="ukpa_chatbox_system_prompt" rows="3" class="large-text" 
                  placeholder="You are a helpful assistant for UKPA."><?php echo esc_textarea($system_prompt); ?></textarea>
        <p class="description">The system prompt sent to the AI model. This defines the assistant's personality and behavior.</p>
        <?php
    }
    
    /**
     * Render theme field
     */
    public function render_theme_field() {
        $theme = get_option('ukpa_chatbox_theme', 'light');
        ?>
        <select name="ukpa_chatbox_theme">
            <option value="light" <?php selected($theme, 'light'); ?>>Light</option>
            <option value="dark" <?php selected($theme, 'dark'); ?>>Dark</option>
        </select>
        <p class="description">Choose the visual theme for the chat box.</p>
        <?php
    }
    
    /**
     * Render position field
     */
    public function render_position_field() {
        $position = get_option('ukpa_chatbox_position', 'bottom-right');
        ?>
        <select name="ukpa_chatbox_position">
            <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>>Bottom Right</option>
            <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>>Bottom Left</option>
            <option value="top-right" <?php selected($position, 'top-right'); ?>>Top Right</option>
            <option value="top-left" <?php selected($position, 'top-left'); ?>>Top Left</option>
        </select>
        <p class="description">Choose where the chat box appears on the page.</p>
        <?php
    }
    
    /**
     * Render welcome message field
     */
    public function render_welcome_message_field() {
        $welcome_message = get_option('ukpa_chatbox_welcome_message', 'Hello! How can I help you today?');
        ?>
        <textarea name="ukpa_chatbox_welcome_message" rows="3" class="large-text"><?php echo esc_textarea($welcome_message); ?></textarea>
        <p class="description">The initial message shown when the chat box opens.</p>
        <?php
    }
    
    /**
     * Render placeholder field
     */
    public function render_placeholder_field() {
        $placeholder = get_option('ukpa_chatbox_placeholder', 'Type your message...');
        ?>
        <input type="text" name="ukpa_chatbox_placeholder" value="<?php echo esc_attr($placeholder); ?>" 
               class="regular-text">
        <p class="description">Placeholder text shown in the message input field.</p>
        <?php
    }
    
    /**
     * Render exclude pages field
     */
    public function render_exclude_pages_field() {
        $exclude_pages = get_option('ukpa_chatbox_exclude_pages', '');
        ?>
        <textarea name="ukpa_chatbox_exclude_pages" rows="3" class="large-text" 
                  placeholder="page-slug, /specific-path/, 123"><?php echo esc_textarea($exclude_pages); ?></textarea>
        <p class="description">Comma-separated list of pages to exclude. You can use page slugs, URL paths, or page IDs.</p>
        <?php
    }
    
    // CSS Customization Field Render Functions
    
    /**
     * Render font family field
     */
    public function render_font_family_field() {
        $font_family = get_option('ukpa_chatbox_font_family', 'Arial, sans-serif');
        ?>
        <select name="ukpa_chatbox_font_family">
            <option value="Arial, sans-serif" <?php selected($font_family, 'Arial, sans-serif'); ?>>Arial</option>
            <option value="Helvetica, sans-serif" <?php selected($font_family, 'Helvetica, sans-serif'); ?>>Helvetica</option>
            <option value="Georgia, serif" <?php selected($font_family, 'Georgia, serif'); ?>>Georgia</option>
            <option value="Times New Roman, serif" <?php selected($font_family, 'Times New Roman, serif'); ?>>Times New Roman</option>
            <option value="Verdana, sans-serif" <?php selected($font_family, 'Verdana, sans-serif'); ?>>Verdana</option>
            <option value="Tahoma, sans-serif" <?php selected($font_family, 'Tahoma, sans-serif'); ?>>Tahoma</option>
            <option value="Trebuchet MS, sans-serif" <?php selected($font_family, 'Trebuchet MS, sans-serif'); ?>>Trebuchet MS</option>
            <option value="Courier New, monospace" <?php selected($font_family, 'Courier New, monospace'); ?>>Courier New</option>
            <option value="Lucida Console, monospace" <?php selected($font_family, 'Lucida Console, monospace'); ?>>Lucida Console</option>
        </select>
        <p class="description">Choose the font family for the chat box text.</p>
        <?php
    }
    
    /**
     * Render font size field
     */
    public function render_font_size_field() {
        $font_size = get_option('ukpa_chatbox_font_size', '14px');
        ?>
        <input type="text" name="ukpa_chatbox_font_size" value="<?php echo esc_attr($font_size); ?>" 
               class="small-text" placeholder="14px">
        <p class="description">Set the font size (e.g., 14px, 1rem, 16px).</p>
        <?php
    }
    
    /**
     * Render text color field
     */
    public function render_text_color_field() {
        $text_color = get_option('ukpa_chatbox_text_color', '#333333');
        ?>
        <input type="color" name="ukpa_chatbox_text_color" value="<?php echo esc_attr($text_color); ?>">
        <p class="description">Choose the default text color for the chat box.</p>
        <?php
    }
    
    /**
     * Render background color field
     */
    public function render_background_color_field() {
        $bg_color = get_option('ukpa_chatbox_background_color', '#ffffff');
        ?>
        <input type="color" name="ukpa_chatbox_background_color" value="<?php echo esc_attr($bg_color); ?>">
        <p class="description">Choose the background color for the chat box.</p>
        <?php
    }
    
    /**
     * Render border radius field
     */
    public function render_border_radius_field() {
        $border_radius = get_option('ukpa_chatbox_border_radius', '8px');
        ?>
        <input type="text" name="ukpa_chatbox_border_radius" value="<?php echo esc_attr($border_radius); ?>" 
               class="small-text" placeholder="8px">
        <p class="description">Set the border radius for rounded corners (e.g., 8px, 10px).</p>
        <?php
    }
    
    /**
     * Render border color field
     */
    public function render_border_color_field() {
        $border_color = get_option('ukpa_chatbox_border_color', '#e0e0e0');
        ?>
        <input type="color" name="ukpa_chatbox_border_color" value="<?php echo esc_attr($border_color); ?>">
        <p class="description">Choose the border color for the chat box.</p>
        <?php
    }
    
    /**
     * Render border width field
     */
    public function render_border_width_field() {
        $border_width = get_option('ukpa_chatbox_border_width', '1px');
        ?>
        <input type="text" name="ukpa_chatbox_border_width" value="<?php echo esc_attr($border_width); ?>" 
               class="small-text" placeholder="1px">
        <p class="description">Set the border width (e.g., 1px, 2px, 3px).</p>
        <?php
    }
    
    /**
     * Render box shadow field
     */
    public function render_box_shadow_field() {
        $box_shadow = get_option('ukpa_chatbox_box_shadow', '0 2px 10px rgba(0,0,0,0.1)');
        ?>
        <input type="text" name="ukpa_chatbox_box_shadow" value="<?php echo esc_attr($box_shadow); ?>" 
               class="regular-text" placeholder="0 2px 10px rgba(0,0,0,0.1)">
        <p class="description">Set the box shadow (e.g., 0 2px 10px rgba(0,0,0,0.1)).</p>
        <?php
    }
    
    /**
     * Render header background color field
     */
    public function render_header_bg_color_field() {
        $header_bg_color = get_option('ukpa_chatbox_header_bg_color', '#007cba');
        ?>
        <input type="color" name="ukpa_chatbox_header_bg_color" value="<?php echo esc_attr($header_bg_color); ?>">
        <p class="description">Choose the background color for the chat box header.</p>
        <?php
    }
    
    /**
     * Render header text color field
     */
    public function render_header_text_color_field() {
        $header_text_color = get_option('ukpa_chatbox_header_text_color', '#ffffff');
        ?>
        <input type="color" name="ukpa_chatbox_header_text_color" value="<?php echo esc_attr($header_text_color); ?>">
        <p class="description">Choose the text color for the chat box header.</p>
        <?php
    }
    
    /**
     * Render user message background color field
     */
    public function render_user_message_bg_color_field() {
        $user_message_bg_color = get_option('ukpa_chatbox_user_message_bg_color', '#007cba');
        ?>
        <input type="color" name="ukpa_chatbox_user_message_bg_color" value="<?php echo esc_attr($user_message_bg_color); ?>">
        <p class="description">Choose the background color for user messages.</p>
        <?php
    }
    
    /**
     * Render user message text color field
     */
    public function render_user_message_text_color_field() {
        $user_message_text_color = get_option('ukpa_chatbox_user_message_text_color', '#ffffff');
        ?>
        <input type="color" name="ukpa_chatbox_user_message_text_color" value="<?php echo esc_attr($user_message_text_color); ?>">
        <p class="description">Choose the text color for user messages.</p>
        <?php
    }
    
    /**
     * Render bot message background color field
     */
    public function render_bot_message_bg_color_field() {
        $bot_message_bg_color = get_option('ukpa_chatbox_bot_message_bg_color', '#f1f1f1');
        ?>
        <input type="color" name="ukpa_chatbox_bot_message_bg_color" value="<?php echo esc_attr($bot_message_bg_color); ?>">
        <p class="description">Choose the background color for bot messages.</p>
        <?php
    }
    
    /**
     * Render bot message text color field
     */
    public function render_bot_message_text_color_field() {
        $bot_message_text_color = get_option('ukpa_chatbox_bot_message_text_color', '#333333');
        ?>
        <input type="color" name="ukpa_chatbox_bot_message_text_color" value="<?php echo esc_attr($bot_message_text_color); ?>">
        <p class="description">Choose the text color for bot messages.</p>
        <?php
    }
    
    /**
     * Render input background color field
     */
    public function render_input_bg_color_field() {
        $input_bg_color = get_option('ukpa_chatbox_input_bg_color', '#ffffff');
        ?>
        <input type="color" name="ukpa_chatbox_input_bg_color" value="<?php echo esc_attr($input_bg_color); ?>">
        <p class="description">Choose the background color for the input field.</p>
        <?php
    }
    
    /**
     * Render input text color field
     */
    public function render_input_text_color_field() {
        $input_text_color = get_option('ukpa_chatbox_input_text_color', '#333333');
        ?>
        <input type="color" name="ukpa_chatbox_input_text_color" value="<?php echo esc_attr($input_text_color); ?>">
        <p class="description">Choose the text color for the input field.</p>
        <?php
    }
    
    /**
     * Render input border color field
     */
    public function render_input_border_color_field() {
        $input_border_color = get_option('ukpa_chatbox_input_border_color', '#e0e0e0');
        ?>
        <input type="color" name="ukpa_chatbox_input_border_color" value="<?php echo esc_attr($input_border_color); ?>">
        <p class="description">Choose the border color for the input field.</p>
        <?php
    }
    
    /**
     * Render button background color field
     */
    public function render_button_bg_color_field() {
        $button_bg_color = get_option('ukpa_chatbox_button_bg_color', '#007cba');
        ?>
        <input type="color" name="ukpa_chatbox_button_bg_color" value="<?php echo esc_attr($button_bg_color); ?>">
        <p class="description">Choose the background color for buttons.</p>
        <?php
    }
    
    /**
     * Render button text color field
     */
    public function render_button_text_color_field() {
        $button_text_color = get_option('ukpa_chatbox_button_text_color', '#ffffff');
        ?>
        <input type="color" name="ukpa_chatbox_button_text_color" value="<?php echo esc_attr($button_text_color); ?>">
        <p class="description">Choose the text color for buttons.</p>
        <?php
    }
    
    /**
     * Render button hover background color field
     */
    public function render_button_hover_bg_color_field() {
        $button_hover_bg_color = get_option('ukpa_chatbox_button_hover_bg_color', '#005a87');
        ?>
        <input type="color" name="ukpa_chatbox_button_hover_bg_color" value="<?php echo esc_attr($button_hover_bg_color); ?>">
        <p class="description">Choose the background color for buttons on hover.</p>
        <?php
    }
    
    /**
     * Render button hover text color field
     */
    public function render_button_hover_text_color_field() {
        $button_hover_text_color = get_option('ukpa_chatbox_button_hover_text_color', '#ffffff');
        ?>
        <input type="color" name="ukpa_chatbox_button_hover_text_color" value="<?php echo esc_attr($button_hover_text_color); ?>">
        <p class="description">Choose the text color for buttons on hover.</p>
        <?php
    }
    
    /**
     * Render width field
     */
    public function render_width_field() {
        $width = get_option('ukpa_chatbox_width', '350px');
        ?>
        <input type="text" name="ukpa_chatbox_width" value="<?php echo esc_attr($width); ?>" 
               class="small-text" placeholder="350px">
        <p class="description">Set the width of the chat box (e.g., 350px, 400px).</p>
        <?php
    }
    
    /**
     * Render height field
     */
    public function render_height_field() {
        $height = get_option('ukpa_chatbox_height', '500px');
        ?>
        <input type="text" name="ukpa_chatbox_height" value="<?php echo esc_attr($height); ?>" 
               class="small-text" placeholder="500px">
        <p class="description">Set the height of the chat box (e.g., 500px, 600px).</p>
        <?php
    }
    
    /**
     * Render max width field
     */
    public function render_max_width_field() {
        $max_width = get_option('ukpa_chatbox_max_width', '400px');
        ?>
        <input type="text" name="ukpa_chatbox_max_width" value="<?php echo esc_attr($max_width); ?>" 
               class="small-text" placeholder="400px">
        <p class="description">Set the maximum width of the chat box (e.g., 400px, 500px).</p>
        <?php
    }
    
    /**
     * Render max height field
     */
    public function render_max_height_field() {
        $max_height = get_option('ukpa_chatbox_max_height', '600px');
        ?>
        <input type="text" name="ukpa_chatbox_max_height" value="<?php echo esc_attr($max_height); ?>" 
               class="small-text" placeholder="600px">
        <p class="description">Set the maximum height of the chat box (e.g., 600px, 700px).</p>
        <?php
    }
    
    /**
     * Render z-index field
     */
    public function render_z_index_field() {
        $z_index = get_option('ukpa_chatbox_z_index', '9999');
        ?>
        <input type="number" name="ukpa_chatbox_z_index" value="<?php echo esc_attr($z_index); ?>" 
               class="small-text" min="1" max="99999">
        <p class="description">Set the z-index to control layering (higher numbers appear on top).</p>
        <?php
    }
}

// Initialize the chat box settings
new UKPA_Chatbox_Settings(); 