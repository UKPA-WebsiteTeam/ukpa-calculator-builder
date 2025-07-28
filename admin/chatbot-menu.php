<?php
/**
 * UKPA Calculator Builder - Chatbot Menu Management
 * 
 * Centralized menu management for all chatbot-related pages
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_Menu {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_chatbot_menu'), 20);
    }
    
    /**
     * Add chatbot menu and submenus
     */
    public function add_chatbot_menu() {
        // Main Chatbot menu (this will be the first submenu)
        add_submenu_page(
            'ukpa-calculator-builder',
            'Chatbot',
            'Chatbot',
            'manage_options',
            'ukpa-chatbot',
            array($this, 'render_chatbot_dashboard')
        );
        
        // Add New Chatbot submenu
        add_submenu_page(
            'ukpa-calculator-builder',
            'Add New Chatbot',
            'Add New',
            'manage_options',
            'ukpa-chatbot-add',
            array($this, 'render_add_chatbot')
        );
        
        // Global Settings submenu
        add_submenu_page(
            'ukpa-calculator-builder',
            'Global Settings',
            'Global Settings',
            'manage_options',
            'ukpa-chatbot-settings',
            array($this, 'render_global_settings')
        );
        
        // NLP Settings submenu
        add_submenu_page(
            'ukpa-calculator-builder',
            'NLP Settings',
            'NLP Settings',
            'manage_options',
            'ukpa-chatbot-nlp-settings',
            array($this, 'render_nlp_settings')
        );
        
        // ChatGPT Settings submenu
        add_submenu_page(
            'ukpa-calculator-builder',
            'ChatGPT Settings',
            'ChatGPT Settings',
            'manage_options',
            'ukpa-chatbot-gpt-settings',
            array($this, 'render_gpt_settings')
        );
    }
    
    /**
     * Render chatbot dashboard
     */
    public function render_chatbot_dashboard() {
        // Redirect to the chatbot list
        $chatbot_manager = new UKPA_Chatbot_Manager();
        $chatbot_manager->render_chatbot_list();
    }
    
    /**
     * Render add chatbot page
     */
    public function render_add_chatbot() {
        $chatbot_manager = new UKPA_Chatbot_Manager();
        $chatbot_manager->render_chatbot_form();
    }
    
    /**
     * Render global settings page
     */
    public function render_global_settings() {
        $chatbot_settings = new UKPA_Chatbot_Settings();
        $chatbot_settings->render_settings_page();
    }
    
    /**
     * Render NLP settings page
     */
    public function render_nlp_settings() {
        $nlp_settings = new UKPA_Chatbot_NLP_Settings();
        $nlp_settings->render_nlp_settings_page();
    }
    
    /**
     * Render GPT settings page
     */
    public function render_gpt_settings() {
        $gpt_settings = new UKPA_Chatbot_GPT_Settings();
        $gpt_settings->render_gpt_settings_page();
    }
}

// Initialize the chatbot menu - DISABLED
// new UKPA_Chatbot_Menu(); 