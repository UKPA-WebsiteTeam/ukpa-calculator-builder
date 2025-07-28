<?php
/**
 * UKPA Calculator Builder - ChatGPT API Integration
 * 
 * Handles communication with trained ChatGPT API backend
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_GPT {
    
    private static $instance = null;
    private $api_endpoint = '';
    private $api_key = '';
    private $timeout = 30;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_gpt_settings();
    }
    
    /**
     * Initialize GPT settings
     */
    private function init_gpt_settings() {
        $this->api_endpoint = get_option('ukpa_gpt_api_endpoint', '');
        $this->api_key = get_option('ukpa_gpt_api_key', '');
        $this->timeout = get_option('ukpa_gpt_timeout', 30);
        
        // Ensure GPT endpoint is not interfering with main chatbot
        // GPT should only be used for specific GPT chatbots, not the main chatbox
    }
    
    /**
     * Process message with ChatGPT API
     */
    public function process_gpt_message($message, $config, $session_id) {
        // Check if GPT is enabled
        if (!$this->is_gpt_enabled()) {
            return $this->get_fallback_response($config);
        }
        
        // Prepare the request data
        $request_data = $this->prepare_request_data($message, $config, $session_id);
        
        // Send request to ChatGPT API
        $response = $this->send_gpt_request($request_data);
        
        // Process the response
        return $this->process_gpt_response($response, $config);
    }
    
    /**
     * Check if GPT is enabled
     */
    private function is_gpt_enabled() {
        return !empty($this->api_endpoint) && !empty($this->api_key);
    }
    
    /**
     * Prepare request data for ChatGPT API
     */
    private function prepare_request_data($message, $config, $session_id) {
        // Get conversation context
        $context = $this->get_conversation_context($session_id);
        
        // Prepare the request payload
        $request_data = array(
            'message' => $message,
            'session_id' => $session_id,
            'context' => $context,
            'config' => array(
                'personality' => $config['personality'] ?? 'helpful',
                'domain' => $config['domain'] ?? 'calculator',
                'max_tokens' => $config['max_tokens'] ?? 150,
                'temperature' => $config['temperature'] ?? 0.7
            ),
            'user_info' => $this->get_user_info(),
            'timestamp' => time()
        );
        
        return $request_data;
    }
    
    /**
     * Send request to ChatGPT API
     */
    private function send_gpt_request($request_data) {
        $url = $this->api_endpoint;
        
        $headers = array(
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->api_key,
            'User-Agent: UKPA-Chatbot/1.0'
        );
        
        $body = json_encode($request_data);
        
        // Use WordPress HTTP API
        $response = wp_remote_post($url, array(
            'headers' => $headers,
            'body' => $body,
            'timeout' => $this->timeout,
            'sslverify' => false // Set to true in production
        ));
        
        // Check for errors
        if (is_wp_error($response)) {
            error_log('ChatGPT API Error: ' . $response->get_error_message());
            return false;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            error_log('ChatGPT API Error: HTTP ' . $response_code . ' - ' . $response_body);
            return false;
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * Process ChatGPT API response
     */
    private function process_gpt_response($response, $config) {
        if (!$response || !isset($response['response'])) {
            return $this->get_fallback_response($config);
        }
        
        $gpt_response = $response['response'];
        $personality = $config['personality'] ?? 'helpful';
        
        // Format response based on personality
        return $this->format_response($gpt_response, $personality);
    }
    
    /**
     * Get conversation context
     */
    private function get_conversation_context($session_id) {
        // Get context from NLP engine
        $nlp = UKPA_Chatbot_NLP::get_instance();
        $context = $nlp->get_context($session_id);
        
        // Format context for API
        $formatted_context = array();
        foreach ($context as $message) {
            $formatted_context[] = array(
                'message' => $message['message'],
                'timestamp' => $message['timestamp']
            );
        }
        
        return $formatted_context;
    }
    
    /**
     * Get user information
     */
    private function get_user_info() {
        $user_info = array(
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'referer' => $_SERVER['HTTP_REFERER'] ?? '',
            'current_url' => $_SERVER['REQUEST_URI'] ?? ''
        );
        
        // Add WordPress user info if logged in
        if (is_user_logged_in()) {
            $user = wp_get_current_user();
            $user_info['user_id'] = $user->ID;
            $user_info['user_email'] = $user->user_email;
            $user_info['user_role'] = $user->roles[0] ?? '';
        }
        
        return $user_info;
    }
    
    /**
     * Get fallback response
     */
    private function get_fallback_response($config) {
        $fallback = $config['fallback'] ?? 'I\'m sorry, I\'m having trouble connecting to my AI service. Please try again later.';
        $personality = $config['personality'] ?? 'helpful';
        
        return $this->format_response($fallback, $personality);
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
     * Test ChatGPT API connection
     */
    public function test_api_connection() {
        if (!$this->is_gpt_enabled()) {
            return array(
                'success' => false,
                'message' => 'ChatGPT API is not configured. Please set API endpoint and key.'
            );
        }
        
        $test_data = array(
            'message' => 'Hello, this is a test message.',
            'session_id' => 'test_' . time(),
            'context' => array(),
            'config' => array(
                'personality' => 'helpful',
                'domain' => 'calculator',
                'max_tokens' => 50,
                'temperature' => 0.7
            ),
            'user_info' => array(),
            'timestamp' => time()
        );
        
        $response = $this->send_gpt_request($test_data);
        
        if ($response && isset($response['response'])) {
            return array(
                'success' => true,
                'message' => 'ChatGPT API connection successful!',
                'test_response' => $response['response']
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to connect to ChatGPT API. Please check your configuration.'
            );
        }
    }
    
    /**
     * Get API status
     */
    public function get_api_status() {
        return array(
            'enabled' => $this->is_gpt_enabled(),
            'endpoint' => $this->api_endpoint,
            'has_key' => !empty($this->api_key),
            'timeout' => $this->timeout
        );
    }
    
    /**
     * Update API settings
     */
    public function update_api_settings($endpoint, $key, $timeout = 30) {
        update_option('ukpa_gpt_api_endpoint', sanitize_url($endpoint));
        update_option('ukpa_gpt_api_key', sanitize_text_field($key));
        update_option('ukpa_gpt_timeout', intval($timeout));
        
        // Update instance variables
        $this->api_endpoint = $endpoint;
        $this->api_key = $key;
        $this->timeout = $timeout;
    }
}

// Initialize the ChatGPT integration - DISABLED
// UKPA_Chatbot_GPT::get_instance(); 