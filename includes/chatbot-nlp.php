<?php
/**
 * UKPA Calculator Builder - Chatbot NLP Engine
 * 
 * Advanced NLP features for intelligent chatbot responses
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_NLP {
    
    private static $instance = null;
    private $stop_words = array();
    private $synonyms = array();
    private $context_memory = array();
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_nlp_data();
    }
    
    /**
     * Initialize NLP data
     */
    private function init_nlp_data() {
        // Common stop words
        $this->stop_words = array(
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 
            'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 
            'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'said', 'each', 
            'which', 'she', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then', 
            'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 
            'time', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 
            'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 
            'get', 'come', 'made', 'may', 'part', 'i', 'you', 'your', 'me', 'my', 'myself'
        );
        
        // Synonyms for common words
        $this->synonyms = array(
            'hello' => array('hi', 'hey', 'good morning', 'good afternoon', 'good evening'),
            'help' => array('assist', 'support', 'aid', 'guide'),
            'calculator' => array('calc', 'calculation', 'compute', 'figure out'),
            'tax' => array('taxation', 'taxes', 'taxable'),
            'income' => array('earnings', 'salary', 'wages', 'revenue'),
            'property' => array('real estate', 'house', 'home', 'land'),
            'price' => array('cost', 'fee', 'charge', 'amount'),
            'contact' => array('reach', 'get in touch', 'call', 'email'),
            'information' => array('info', 'details', 'data', 'facts'),
            'calculate' => array('compute', 'figure', 'work out', 'determine'),
            'how' => array('what way', 'in what manner', 'by what means'),
            'what' => array('which', 'what kind of', 'what type of'),
            'when' => array('at what time', 'on what date', 'during what period'),
            'where' => array('at what place', 'in what location', 'which place'),
            'why' => array('for what reason', 'what cause', 'what purpose')
        );
    }
    
    /**
     * Process message with advanced NLP
     */
    public function process_message($message, $config, $session_id) {
        $message = strtolower(trim($message));
        
        // Store context
        $this->store_context($session_id, $message);
        
        // Get chatbot personality and responses
        $personality = $config['personality'] ?? 'helpful';
        $responses = $config['responses'] ?? array();
        $fallback = $config['fallback'] ?? 'I\'m sorry, I don\'t understand. Can you please rephrase your question?';
        
        // Try exact matches first
        $exact_response = $this->find_exact_match($message, $responses);
        if ($exact_response) {
            return $this->format_response($exact_response, $personality);
        }
        
        // Try fuzzy matching
        $fuzzy_response = $this->find_fuzzy_match($message, $responses);
        if ($fuzzy_response) {
            return $this->format_response($fuzzy_response, $personality);
        }
        
        // Try intent-based matching
        $intent_response = $this->find_intent_match($message, $config);
        if ($intent_response) {
            return $this->format_response($intent_response, $personality);
        }
        
        // Try semantic matching
        $semantic_response = $this->find_semantic_match($message, $responses);
        if ($semantic_response) {
            return $this->format_response($semantic_response, $personality);
        }
        
        // Try context-aware responses
        $context_response = $this->find_context_match($message, $config, $session_id);
        if ($context_response) {
            return $this->format_response($context_response, $personality);
        }
        
        // Return fallback response
        return $this->format_response($fallback, $personality);
    }
    
    /**
     * Find exact keyword matches
     */
    private function find_exact_match($message, $responses) {
        foreach ($responses as $response) {
            $keywords = array_map('strtolower', $response['keywords'] ?? array());
            $exact_match = $response['exact_match'] ?? false;
            
            if ($exact_match) {
                if (in_array($message, $keywords)) {
                    return $response['response'];
                }
            } else {
                foreach ($keywords as $keyword) {
                    if (strpos($message, $keyword) !== false) {
                        return $response['response'];
                    }
                }
            }
        }
        return null;
    }
    
    /**
     * Find fuzzy matches using similarity scoring
     */
    private function find_fuzzy_match($message, $responses) {
        $best_match = null;
        $best_score = 0;
        
        foreach ($responses as $response) {
            $keywords = array_map('strtolower', $response['keywords'] ?? array());
            
            foreach ($keywords as $keyword) {
                $similarity = $this->calculate_similarity($message, $keyword);
                if ($similarity > $best_score && $similarity > 0.7) { // 70% similarity threshold
                    $best_score = $similarity;
                    $best_match = $response['response'];
                }
            }
        }
        
        return $best_match;
    }
    
    /**
     * Calculate similarity between two strings
     */
    private function calculate_similarity($str1, $str2) {
        // Remove stop words
        $str1 = $this->remove_stop_words($str1);
        $str2 = $this->remove_stop_words($str2);
        
        // Calculate Levenshtein distance
        $distance = levenshtein($str1, $str2);
        $max_length = max(strlen($str1), strlen($str2));
        
        if ($max_length === 0) return 1.0;
        
        return 1 - ($distance / $max_length);
    }
    
    /**
     * Remove stop words from text
     */
    private function remove_stop_words($text) {
        $words = explode(' ', $text);
        $filtered = array();
        
        foreach ($words as $word) {
            if (!in_array($word, $this->stop_words)) {
                $filtered[] = $word;
            }
        }
        
        return implode(' ', $filtered);
    }
    
    /**
     * Find intent-based matches using regex patterns
     */
    private function find_intent_match($message, $config) {
        $intents = $config['intents'] ?? array();
        
        foreach ($intents as $intent) {
            $patterns = $intent['patterns'] ?? array();
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $message)) {
                    return $intent['response'];
                }
            }
        }
        
        return null;
    }
    
    /**
     * Find semantic matches using synonyms and related words
     */
    private function find_semantic_match($message, $responses) {
        $message_words = explode(' ', $message);
        $expanded_words = $this->expand_with_synonyms($message_words);
        
        foreach ($responses as $response) {
            $keywords = array_map('strtolower', $response['keywords'] ?? array());
            
            foreach ($keywords as $keyword) {
                $keyword_words = explode(' ', $keyword);
                $expanded_keywords = $this->expand_with_synonyms($keyword_words);
                
                // Check if any expanded words match
                foreach ($expanded_words as $word) {
                    if (in_array($word, $expanded_keywords)) {
                        return $response['response'];
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Expand words with synonyms
     */
    private function expand_with_synonyms($words) {
        $expanded = $words;
        
        foreach ($words as $word) {
            if (isset($this->synonyms[$word])) {
                $expanded = array_merge($expanded, $this->synonyms[$word]);
            }
        }
        
        return array_unique($expanded);
    }
    
    /**
     * Store conversation context
     */
    private function store_context($session_id, $message) {
        if (!isset($this->context_memory[$session_id])) {
            $this->context_memory[$session_id] = array();
        }
        
        $this->context_memory[$session_id][] = array(
            'message' => $message,
            'timestamp' => time()
        );
        
        // Keep only last 10 messages for context
        if (count($this->context_memory[$session_id]) > 10) {
            array_shift($this->context_memory[$session_id]);
        }
    }
    
    /**
     * Find context-aware responses
     */
    private function find_context_match($message, $config, $session_id) {
        if (!isset($this->context_memory[$session_id]) || empty($this->context_memory[$session_id])) {
            return null;
        }
        
        $context = $this->context_memory[$session_id];
        $recent_messages = array_slice($context, -3); // Last 3 messages
        
        // Check for follow-up questions
        $follow_up_patterns = array(
            '/^(what|how|when|where|why|which|who)\s+/i',
            '/^(tell me|show me|explain|describe|give me)\s+/i',
            '/^(yes|no|ok|okay|sure|absolutely|definitely)\s*/i'
        );
        
        foreach ($follow_up_patterns as $pattern) {
            if (preg_match($pattern, $message)) {
                // This is likely a follow-up question
                return $this->generate_contextual_response($message, $recent_messages, $config);
            }
        }
        
        return null;
    }
    
    /**
     * Generate contextual response based on conversation history
     */
    private function generate_contextual_response($message, $recent_messages, $config) {
        $last_message = end($recent_messages);
        
        // Check if we're in a calculator-related conversation
        if ($this->contains_calculator_keywords($last_message['message'])) {
            return $this->generate_calculator_response($message, $config);
        }
        
        // Check if we're in a contact-related conversation
        if ($this->contains_contact_keywords($last_message['message'])) {
            return $this->generate_contact_response($message, $config);
        }
        
        // Check if we're in a general help conversation
        if ($this->contains_help_keywords($last_message['message'])) {
            return $this->generate_help_response($message, $config);
        }
        
        return null;
    }
    
    /**
     * Check if message contains calculator keywords
     */
    private function contains_calculator_keywords($message) {
        $calculator_words = array('calculator', 'calculate', 'computation', 'figure', 'work out');
        foreach ($calculator_words as $word) {
            if (strpos($message, $word) !== false) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if message contains contact keywords
     */
    private function contains_contact_keywords($message) {
        $contact_words = array('contact', 'email', 'phone', 'call', 'reach', 'support');
        foreach ($contact_words as $word) {
            if (strpos($message, $word) !== false) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if message contains help keywords
     */
    private function contains_help_keywords($message) {
        $help_words = array('help', 'assist', 'support', 'guide', 'explain');
        foreach ($help_words as $word) {
            if (strpos($message, $word) !== false) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Generate calculator-related response
     */
    private function generate_calculator_response($message, $config) {
        $responses = array(
            'I can help you with various calculators including income tax, capital gains tax, and property tax calculators. Which specific calculator are you interested in?',
            'We have several calculators available: Income Tax, Capital Gains Tax, Property Tax, and more. What would you like to calculate?',
            'I can guide you through our calculator options. We have calculators for different tax scenarios. What type of calculation do you need?'
        );
        
        return $responses[array_rand($responses)];
    }
    
    /**
     * Generate contact-related response
     */
    private function generate_contact_response($message, $config) {
        $responses = array(
            'You can contact our support team at support@ukpacalculator.com or call us at +44 123 456 7890. We\'re available Monday to Friday, 9 AM to 5 PM.',
            'For immediate assistance, please email us at support@ukpacalculator.com or call +44 123 456 7890. Our team is ready to help!',
            'Need to get in touch? Email support@ukpacalculator.com or call +44 123 456 7890. We\'re here to help with any questions.'
        );
        
        return $responses[array_rand($responses)];
    }
    
    /**
     * Generate help-related response
     */
    private function generate_help_response($message, $config) {
        $responses = array(
            'I\'m here to help! You can ask me about our calculators, how to use them, or get general support. What do you need help with?',
            'I can assist you with calculator questions, pricing information, or general support. What would you like to know?',
            'Let me help you! I can guide you through our calculators, explain features, or answer any questions you have.'
        );
        
        return $responses[array_rand($responses)];
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
     * Get conversation context for a session
     */
    public function get_context($session_id) {
        return isset($this->context_memory[$session_id]) ? $this->context_memory[$session_id] : array();
    }
    
    /**
     * Clear context for a session
     */
    public function clear_context($session_id) {
        if (isset($this->context_memory[$session_id])) {
            unset($this->context_memory[$session_id]);
        }
    }
    
    /**
     * Analyze message sentiment (basic implementation)
     */
    public function analyze_sentiment($message) {
        $positive_words = array('good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'like', 'happy', 'satisfied');
        $negative_words = array('bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'poor', 'worst');
        
        $words = explode(' ', strtolower($message));
        $positive_count = 0;
        $negative_count = 0;
        
        foreach ($words as $word) {
            if (in_array($word, $positive_words)) {
                $positive_count++;
            } elseif (in_array($word, $negative_words)) {
                $negative_count++;
            }
        }
        
        if ($positive_count > $negative_count) {
            return 'positive';
        } elseif ($negative_count > $positive_count) {
            return 'negative';
        } else {
            return 'neutral';
        }
    }
    
    /**
     * Extract entities from message
     */
    public function extract_entities($message) {
        $entities = array();
        
        // Extract numbers
        preg_match_all('/\d+(?:\.\d+)?/', $message, $numbers);
        if (!empty($numbers[0])) {
            $entities['numbers'] = $numbers[0];
        }
        
        // Extract currency amounts
        preg_match_all('/£\d+(?:\.\d+)?|\$\d+(?:\.\d+)?/', $message, $currency);
        if (!empty($currency[0])) {
            $entities['currency'] = $currency[0];
        }
        
        // Extract dates
        preg_match_all('/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/', $message, $dates);
        if (!empty($dates[0])) {
            $entities['dates'] = $dates[0];
        }
        
        return $entities;
    }
}

// Initialize the NLP engine - DISABLED
// UKPA_Chatbot_NLP::get_instance(); 