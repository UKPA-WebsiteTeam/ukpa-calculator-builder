<?php
/**
 * UKPA Calculator Builder - Chatbot NLP Settings
 * 
 * Advanced NLP configuration for intelligent chatbot responses
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_NLP_Settings {
    
    public function __construct() {
        add_action('admin_init', array($this, 'init_nlp_settings'));
        // Menu is now handled by UKPA_Chatbot_Menu class
    }
    
    /**
     * Initialize NLP settings
     */
    public function init_nlp_settings() {
        register_setting('ukpa_nlp_settings', 'ukpa_nlp_similarity_threshold');
        register_setting('ukpa_nlp_settings', 'ukpa_nlp_context_memory');
        register_setting('ukpa_nlp_settings', 'ukpa_nlp_enable_sentiment');
        register_setting('ukpa_nlp_settings', 'ukpa_nlp_enable_entities');
        register_setting('ukpa_nlp_settings', 'ukpa_nlp_custom_synonyms');
        register_setting('ukpa_nlp_settings', 'ukpa_nlp_custom_stop_words');
        
        add_settings_section(
            'ukpa_nlp_general_section',
            'General NLP Settings',
            array($this, 'render_general_section_description'),
            'ukpa_nlp_settings'
        );
        
        add_settings_field(
            'ukpa_nlp_similarity_threshold',
            'Similarity Threshold',
            array($this, 'render_similarity_threshold_field'),
            'ukpa_nlp_settings',
            'ukpa_nlp_general_section'
        );
        
        add_settings_field(
            'ukpa_nlp_context_memory',
            'Context Memory Size',
            array($this, 'render_context_memory_field'),
            'ukpa_nlp_settings',
            'ukpa_nlp_general_section'
        );
        
        add_settings_section(
            'ukpa_nlp_features_section',
            'NLP Features',
            array($this, 'render_features_section_description'),
            'ukpa_nlp_settings'
        );
        
        add_settings_field(
            'ukpa_nlp_enable_sentiment',
            'Enable Sentiment Analysis',
            array($this, 'render_sentiment_field'),
            'ukpa_nlp_settings',
            'ukpa_nlp_features_section'
        );
        
        add_settings_field(
            'ukpa_nlp_enable_entities',
            'Enable Entity Extraction',
            array($this, 'render_entities_field'),
            'ukpa_nlp_settings',
            'ukpa_nlp_features_section'
        );
        
        add_settings_section(
            'ukpa_nlp_custom_section',
            'Custom NLP Data',
            array($this, 'render_custom_section_description'),
            'ukpa_nlp_settings'
        );
        
        add_settings_field(
            'ukpa_nlp_custom_synonyms',
            'Custom Synonyms',
            array($this, 'render_custom_synonyms_field'),
            'ukpa_nlp_settings',
            'ukpa_nlp_custom_section'
        );
        
        add_settings_field(
            'ukpa_nlp_custom_stop_words',
            'Custom Stop Words',
            array($this, 'render_custom_stop_words_field'),
            'ukpa_nlp_settings',
            'ukpa_nlp_custom_section'
        );
    }
    
    /**
     * Render NLP settings page
     */
    public function render_nlp_settings_page() {
        ?>
        <div class="wrap">
            <h1>Chatbot NLP Settings</h1>
            <p>Configure advanced Natural Language Processing features for your chatbots.</p>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('ukpa_nlp_settings');
                do_settings_sections('ukpa_nlp_settings');
                submit_button('Save NLP Settings');
                ?>
            </form>
            
            <div class="ukpa-nlp-settings-help">
                <h3>NLP Features Explained</h3>
                
                <h4>🔍 Fuzzy Matching</h4>
                <p>Allows the chatbot to understand misspelled words and similar phrases. For example, "calclator" will match "calculator".</p>
                
                <h4>🧠 Context Awareness</h4>
                <p>The chatbot remembers previous messages in the conversation to provide more relevant responses to follow-up questions.</p>
                
                <h4>📚 Synonym Recognition</h4>
                <p>Recognizes different ways to say the same thing. For example, "help" matches "assist", "support", "aid".</p>
                
                <h4>🎭 Sentiment Analysis</h4>
                <p>Detects the emotional tone of user messages to provide more appropriate responses.</p>
                
                <h4>🏷️ Entity Extraction</h4>
                <p>Identifies important information like numbers, dates, and currency amounts from user messages.</p>
                
                <h3>Configuration Tips</h3>
                <ul>
                    <li><strong>Similarity Threshold:</strong> Higher values (0.8-0.9) require closer matches, lower values (0.6-0.7) are more flexible</li>
                    <li><strong>Context Memory:</strong> Higher values remember more conversation history but use more memory</li>
                    <li><strong>Custom Synonyms:</strong> Add domain-specific terms that users might use</li>
                    <li><strong>Custom Stop Words:</strong> Remove common words that don't add meaning to your domain</li>
                </ul>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render general section description
     */
    public function render_general_section_description() {
        echo '<p>Configure the core NLP settings that affect how your chatbot understands and responds to user messages.</p>';
    }
    
    /**
     * Render features section description
     */
    public function render_features_section_description() {
        echo '<p>Enable or disable advanced NLP features to customize your chatbot\'s intelligence level.</p>';
    }
    
    /**
     * Render custom section description
     */
    public function render_custom_section_description() {
        echo '<p>Add custom synonyms and stop words to improve the chatbot\'s understanding of your specific domain.</p>';
    }
    
    /**
     * Render similarity threshold field
     */
    public function render_similarity_threshold_field() {
        $threshold = get_option('ukpa_nlp_similarity_threshold', '0.7');
        ?>
        <input type="range" name="ukpa_nlp_similarity_threshold" min="0.5" max="0.95" step="0.05" value="<?php echo esc_attr($threshold); ?>" oninput="this.nextElementSibling.value = this.value">
        <output><?php echo esc_html($threshold); ?></output>
        <p class="description">How similar words need to be for fuzzy matching. Higher values require closer matches.</p>
        <?php
    }
    
    /**
     * Render context memory field
     */
    public function render_context_memory_field() {
        $memory = get_option('ukpa_nlp_context_memory', '10');
        ?>
        <select name="ukpa_nlp_context_memory">
            <option value="5" <?php selected($memory, '5'); ?>>5 messages</option>
            <option value="10" <?php selected($memory, '10'); ?>>10 messages</option>
            <option value="15" <?php selected($memory, '15'); ?>>15 messages</option>
            <option value="20" <?php selected($memory, '20'); ?>>20 messages</option>
        </select>
        <p class="description">How many previous messages to remember for context-aware responses.</p>
        <?php
    }
    
    /**
     * Render sentiment analysis field
     */
    public function render_sentiment_field() {
        $enabled = get_option('ukpa_nlp_enable_sentiment', '1');
        ?>
        <label>
            <input type="checkbox" name="ukpa_nlp_enable_sentiment" value="1" <?php checked($enabled, '1'); ?>>
            Enable sentiment analysis for better emotional understanding
        </label>
        <p class="description">Detects positive, negative, or neutral sentiment in user messages.</p>
        <?php
    }
    
    /**
     * Render entity extraction field
     */
    public function render_entities_field() {
        $enabled = get_option('ukpa_nlp_enable_entities', '1');
        ?>
        <label>
            <input type="checkbox" name="ukpa_nlp_enable_entities" value="1" <?php checked($enabled, '1'); ?>>
            Enable entity extraction for better data understanding
        </label>
        <p class="description">Extracts numbers, dates, currency amounts, and other entities from messages.</p>
        <?php
    }
    
    /**
     * Render custom synonyms field
     */
    public function render_custom_synonyms_field() {
        $synonyms = get_option('ukpa_nlp_custom_synonyms', '');
        ?>
        <textarea name="ukpa_nlp_custom_synonyms" rows="8" cols="60" placeholder="word: synonym1, synonym2, synonym3&#10;another_word: alt1, alt2, alt3"><?php echo esc_textarea($synonyms); ?></textarea>
        <p class="description">Add custom synonyms in the format: word: synonym1, synonym2, synonym3 (one per line)</p>
        <p class="description"><strong>Example:</strong><br>
        calculator: calc, computation, figure out<br>
        tax: taxation, taxes, taxable<br>
        income: earnings, salary, wages</p>
        <?php
    }
    
    /**
     * Render custom stop words field
     */
    public function render_custom_stop_words_field() {
        $stop_words = get_option('ukpa_nlp_custom_stop_words', '');
        ?>
        <textarea name="ukpa_nlp_custom_stop_words" rows="4" cols="60" placeholder="word1, word2, word3"><?php echo esc_textarea($stop_words); ?></textarea>
        <p class="description">Add custom stop words separated by commas. These words will be ignored during processing.</p>
        <p class="description"><strong>Example:</strong> please, kindly, thank you, thanks</p>
        <?php
    }
}

// Initialize the NLP settings
// new UKPA_Chatbot_NLP_Settings(); // DISABLED 