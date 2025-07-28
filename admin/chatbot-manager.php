<?php
/**
 * UKPA Calculator Builder - Chatbot Manager
 * 
 * Admin interface for managing chatbots
 */

if (!defined('ABSPATH')) exit;

class UKPA_Chatbot_Manager {
    
    public function __construct() {
        // Menu is now handled by UKPA_Chatbot_Menu class
    }
    
    /**
     * Render chatbot list page
     */
    public function render_chatbot_list() {
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbots';
        $chatbots = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">All Chatbots</h1>
            <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add'); ?>" class="page-title-action">Add New</a>
            
            <div class="ukpa-chatbot-list">
                <?php if (empty($chatbots)): ?>
                    <div class="ukpa-chatbot-empty">
                        <p>No chatbots found. <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add'); ?>">Create your first chatbot</a></p>
                    </div>
                <?php else: ?>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Shortcode</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($chatbots as $chatbot): ?>
                                <tr>
                                    <td>
                                        <strong><?php echo esc_html($chatbot->name); ?></strong>
                                    </td>
                                    <td><?php echo esc_html($chatbot->description); ?></td>
                                    <td>
                                        <?php 
                                        $config = json_decode($chatbot->config, true);
                                        $type = $config['chatbot_type'] ?? 'nlp';
                                        echo $type === 'gpt' ? 'GPT (AI)' : 'NLP (Keyword)';
                                        ?>
                                    </td>
                                    <td>
                                        <code>[ukpa_chatbot id="<?php echo $chatbot->id; ?>"]</code>
                                        <button class="ukpa-copy-shortcode" data-shortcode='[ukpa_chatbot id="<?php echo $chatbot->id; ?>"]'>
                                            Copy
                                        </button>
                                    </td>
                                    <td><?php echo date('M j, Y', strtotime($chatbot->created_at)); ?></td>
                                    <td>
                                        <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-add&edit=' . $chatbot->id); ?>" class="button button-small">Edit</a>
                                        <button class="button button-small ukpa-delete-chatbot" data-id="<?php echo $chatbot->id; ?>">Delete</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render chatbot form page
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
            'intents' => array()
        );
        
        $config = $chatbot ? json_decode($chatbot->config, true) : $default_config;
        ?>
        <div class="wrap">
            <h1><?php echo $chatbot ? 'Edit Chatbot' : 'Add New Chatbot'; ?></h1>
            
            <form id="ukpa-chatbot-form" method="post">
                <input type="hidden" name="chatbot_id" value="<?php echo $chatbot_id; ?>">
                
                <div class="ukpa-chatbot-form-grid">
                    <div class="ukpa-chatbot-form-main">
                        <div class="ukpa-chatbot-section">
                            <h2>Basic Information</h2>
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="chatbot_name">Name</label>
                                    </th>
                                    <td>
                                        <input type="text" id="chatbot_name" name="name" class="regular-text" 
                                               value="<?php echo $chatbot ? esc_attr($chatbot->name) : ''; ?>" required>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="chatbot_description">Description</label>
                                    </th>
                                    <td>
                                        <textarea id="chatbot_description" name="description" class="large-text" rows="3"><?php echo $chatbot ? esc_textarea($chatbot->description) : ''; ?></textarea>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="ukpa-chatbot-section">
                            <h2>Chatbot Configuration</h2>
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="chatbot_type">Chatbot Type</label>
                                    </th>
                                    <td>
                                        <select id="chatbot_type" name="config[chatbot_type]">
                                            <option value="nlp" <?php selected($config['chatbot_type'] ?? 'nlp', 'nlp'); ?>>NLP (Keyword-based)</option>
                                            <option value="gpt" <?php selected($config['chatbot_type'] ?? 'nlp', 'gpt'); ?>>GPT (AI-powered)</option>
                                        </select>
                                        <p class="description">Choose between keyword-based NLP or AI-powered GPT responses</p>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="welcome_message">Welcome Message</label>
                                    </th>
                                    <td>
                                        <input type="text" id="welcome_message" name="config[welcome_message]" class="large-text" 
                                               value="<?php echo esc_attr($config['welcome_message']); ?>">
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="personality">Personality</label>
                                    </th>
                                    <td>
                                        <select id="personality" name="config[personality]">
                                            <option value="helpful" <?php selected($config['personality'], 'helpful'); ?>>Helpful</option>
                                            <option value="professional" <?php selected($config['personality'], 'professional'); ?>>Professional</option>
                                            <option value="friendly" <?php selected($config['personality'], 'friendly'); ?>>Friendly</option>
                                            <option value="casual" <?php selected($config['personality'], 'casual'); ?>>Casual</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="fallback">Fallback Response</label>
                                    </th>
                                    <td>
                                        <textarea id="fallback" name="config[fallback]" class="large-text" rows="2"><?php echo esc_textarea($config['fallback']); ?></textarea>
                                    </td>
                                </tr>
                                <tr class="gpt-settings" style="display: none;">
                                    <th scope="row">
                                        <label for="domain">Domain</label>
                                    </th>
                                    <td>
                                        <input type="text" id="domain" name="config[domain]" class="regular-text" 
                                               value="<?php echo esc_attr($config['domain'] ?? 'calculator'); ?>" placeholder="calculator">
                                        <p class="description">The domain/context for your trained GPT model</p>
                                    </td>
                                </tr>
                                <tr class="gpt-settings" style="display: none;">
                                    <th scope="row">
                                        <label for="max_tokens">Max Tokens</label>
                                    </th>
                                    <td>
                                        <input type="number" id="max_tokens" name="config[max_tokens]" class="small-text" 
                                               value="<?php echo esc_attr($config['max_tokens'] ?? 150); ?>" min="50" max="500">
                                        <p class="description">Maximum response length (50-500 tokens)</p>
                                    </td>
                                </tr>
                                <tr class="gpt-settings" style="display: none;">
                                    <th scope="row">
                                        <label for="temperature">Temperature</label>
                                    </th>
                                    <td>
                                        <input type="range" id="temperature" name="config[temperature]" min="0.1" max="1.0" step="0.1" 
                                               value="<?php echo esc_attr($config['temperature'] ?? 0.7); ?>" oninput="this.nextElementSibling.value = this.value">
                                        <output><?php echo esc_html($config['temperature'] ?? 0.7); ?></output>
                                        <p class="description">Creativity level (0.1 = focused, 1.0 = creative)</p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="ukpa-chatbot-section nlp-settings">
                            <h2>Responses</h2>
                            <div id="ukpa-responses-container">
                                <?php if (!empty($config['responses'])): ?>
                                    <?php foreach ($config['responses'] as $index => $response): ?>
                                        <div class="ukpa-response-item" data-index="<?php echo $index; ?>">
                                            <div class="ukpa-response-header">
                                                <h4>Response <?php echo $index + 1; ?></h4>
                                                <button type="button" class="ukpa-remove-response">Remove</button>
                                            </div>
                                            <table class="form-table">
                                                <tr>
                                                    <th scope="row">Keywords</th>
                                                    <td>
                                                        <input type="text" name="config[responses][<?php echo $index; ?>][keywords]" 
                                                               class="large-text" value="<?php echo esc_attr(implode(', ', $response['keywords'])); ?>" 
                                                               placeholder="hello, hi, hey">
                                                        <p class="description">Separate keywords with commas</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Response</th>
                                                    <td>
                                                        <textarea name="config[responses][<?php echo $index; ?>][response]" 
                                                                  class="large-text" rows="3"><?php echo esc_textarea($response['response']); ?></textarea>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Exact Match</th>
                                                    <td>
                                                        <label>
                                                            <input type="checkbox" name="config[responses][<?php echo $index; ?>][exact_match]" 
                                                                   value="1" <?php checked($response['exact_match'] ?? false); ?>>
                                                            Require exact keyword match
                                                        </label>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                            <button type="button" id="ukpa-add-response" class="button">Add Response</button>
                        </div>
                        
                        <div class="ukpa-chatbot-section nlp-settings">
                            <h2>Intent Patterns</h2>
                            <div id="ukpa-intents-container">
                                <?php if (!empty($config['intents'])): ?>
                                    <?php foreach ($config['intents'] as $index => $intent): ?>
                                        <div class="ukpa-intent-item" data-index="<?php echo $index; ?>">
                                            <div class="ukpa-intent-header">
                                                <h4>Intent <?php echo $index + 1; ?></h4>
                                                <button type="button" class="ukpa-remove-intent">Remove</button>
                                            </div>
                                            <table class="form-table">
                                                <tr>
                                                    <th scope="row">Patterns</th>
                                                    <td>
                                                        <textarea name="config[intents][<?php echo $index; ?>][patterns]" 
                                                                  class="large-text" rows="3" placeholder="/hello/i, /hi there/i"><?php echo esc_textarea(implode("\n", $intent['patterns'])); ?></textarea>
                                                        <p class="description">One regex pattern per line</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Response</th>
                                                    <td>
                                                        <textarea name="config[intents][<?php echo $index; ?>][response]" 
                                                                  class="large-text" rows="3"><?php echo esc_textarea($intent['response']); ?></textarea>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                            <button type="button" id="ukpa-add-intent" class="button">Add Intent</button>
                        </div>
                    </div>
                    
                    <div class="ukpa-chatbot-form-sidebar">
                        <div class="ukpa-chatbot-preview">
                            <h3>Preview</h3>
                            <div id="ukpa-chatbot-preview-container">
                                <!-- Preview will be rendered here -->
                            </div>
                        </div>
                        
                        <div class="ukpa-chatbot-help">
                            <h3>Help</h3>
                            <ul>
                                <li><strong>Keywords:</strong> Simple text matching (case-insensitive)</li>
                                <li><strong>Patterns:</strong> Regular expressions for advanced matching</li>
                                <li><strong>Exact Match:</strong> Only trigger on exact keyword match</li>
                                <li><strong>Personality:</strong> Affects response tone and formatting</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <p class="submit">
                    <button type="submit" class="button button-primary">Save Chatbot</button>
                    <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>" class="button">Cancel</a>
                </p>
            </form>
        </div>
        <?php
    }
}

// Initialize the chatbot manager
// new UKPA_Chatbot_Manager(); // DISABLED 