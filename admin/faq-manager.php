<?php
/**
 * UKPA Calculator Builder - FAQ Manager
 * 
 * Admin interface for managing FAQ categories and questions
 */

if (!defined('ABSPATH')) exit;

class UKPA_FAQ_Manager {
    
    public function __construct() {
        add_action('wp_ajax_ukpa_save_faq', array($this, 'save_faq'));
        add_action('wp_ajax_ukpa_delete_faq', array($this, 'delete_faq'));
        add_action('wp_ajax_ukpa_get_faq', array($this, 'get_faq'));
        add_action('wp_ajax_ukpa_save_faq_category', array($this, 'save_faq_category'));
        add_action('wp_ajax_ukpa_delete_faq_category', array($this, 'delete_faq_category'));
        add_action('wp_ajax_ukpa_get_faq_category', array($this, 'get_faq_category'));
        add_action('wp_ajax_ukpa_reorder_faqs', array($this, 'reorder_faqs'));
    }
    
    /**
     * Render FAQ manager page
     */
    public function render_faq_manager() {
        global $wpdb;
        $chatbot_id = isset($_GET['chatbot_id']) ? intval($_GET['chatbot_id']) : 1;
        
        // Get FAQ categories and FAQs
        $categories_table = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
        $faqs_table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        $categories = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $categories_table WHERE chatbot_id = %d ORDER BY order_index ASC, name ASC",
            $chatbot_id
        ));
        
        $faqs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $faqs_table WHERE chatbot_id = %d ORDER BY order_index ASC, question ASC",
            $chatbot_id
        ));
        
        ?>
        <div class="wrap ukpa-faq-manager">
            <div class="ukpa-header">
                <h1 class="wp-heading-inline">FAQ Manager</h1>
                <a href="<?php echo admin_url('admin.php?page=ukpa-chatbot-manager'); ?>" class="page-title-action">← Back to Chatbots</a>
            </div>
            
            <div class="ukpa-faq-overview">
                <div class="ukpa-stats-grid">
                    <div class="ukpa-stat-card">
                        <div class="ukpa-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-stat-content">
                            <h3><?php echo count($faqs); ?></h3>
                            <p>Total FAQs</p>
                        </div>
                    </div>
                    <div class="ukpa-stat-card">
                        <div class="ukpa-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-stat-content">
                            <h3><?php echo count($categories); ?></h3>
                            <p>FAQ Categories</p>
                        </div>
                    </div>
                    <div class="ukpa-stat-card">
                        <div class="ukpa-stat-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-stat-content">
                            <h3><?php echo count(array_filter($faqs, function($faq) { return $faq->is_active; })); ?></h3>
                            <p>Active FAQs</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ukpa-faq-content">
                <div class="ukpa-faq-tabs">
                    <button class="ukpa-faq-tab active" data-tab="faqs">Manage FAQs</button>
                    <button class="ukpa-faq-tab" data-tab="categories">Manage Categories</button>
                </div>
                
                <!-- FAQs Tab -->
                <div class="ukpa-faq-tab-content active" id="faqs-tab">
                    <div class="ukpa-faq-header">
                        <h2>Manage FAQs</h2>
                        <button class="button button-primary" id="add-faq-btn">Add New FAQ</button>
                    </div>
                    
                    <div class="ukpa-faq-list" id="faqs-list">
                        <?php if (empty($faqs)): ?>
                            <div class="ukpa-empty-state">
                                <div class="ukpa-empty-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <h3>No FAQs found</h3>
                                <p>Create your first FAQ to help users find answers quickly.</p>
                                <button class="button button-primary" id="add-first-faq-btn">Add First FAQ</button>
                            </div>
                        <?php else: ?>
                            <?php foreach ($faqs as $faq): ?>
                                <div class="ukpa-faq-item" data-faq-id="<?php echo $faq->id; ?>">
                                    <div class="ukpa-faq-item-header">
                                        <div class="ukpa-faq-item-info">
                                            <div class="ukpa-faq-question"><?php echo esc_html($faq->question); ?></div>
                                            <div class="ukpa-faq-meta">
                                                <span class="ukpa-faq-category"><?php echo esc_html($faq->category); ?></span>
                                                <span class="ukpa-faq-status <?php echo $faq->is_active ? 'active' : 'inactive'; ?>">
                                                    <?php echo $faq->is_active ? 'Active' : 'Inactive'; ?>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="ukpa-faq-item-actions">
                                            <button class="button ukpa-edit-faq-btn" data-faq-id="<?php echo $faq->id; ?>">Edit</button>
                                            <button class="button ukpa-delete-faq-btn" data-faq-id="<?php echo $faq->id; ?>">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Categories Tab -->
                <div class="ukpa-faq-tab-content" id="categories-tab">
                    <div class="ukpa-faq-header">
                        <h2>Manage Categories</h2>
                        <button class="button button-primary" id="add-category-btn">Add New Category</button>
                    </div>
                    
                    <div class="ukpa-categories-list" id="categories-list">
                        <?php if (empty($categories)): ?>
                            <div class="ukpa-empty-state">
                                <div class="ukpa-empty-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <h3>No categories found</h3>
                                <p>Create categories to organize your FAQs.</p>
                                <button class="button button-primary" id="add-first-category-btn">Add First Category</button>
                            </div>
                        <?php else: ?>
                            <?php foreach ($categories as $category): ?>
                                <div class="ukpa-category-item" data-category-id="<?php echo $category->id; ?>">
                                    <div class="ukpa-category-item-header">
                                        <div class="ukpa-category-item-info">
                                            <div class="ukpa-category-name"><?php echo esc_html($category->name); ?></div>
                                            <div class="ukpa-category-meta">
                                                <span class="ukpa-category-description"><?php echo esc_html($category->description); ?></span>
                                                <span class="ukpa-category-status <?php echo $category->is_active ? 'active' : 'inactive'; ?>">
                                                    <?php echo $category->is_active ? 'Active' : 'Inactive'; ?>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="ukpa-category-item-actions">
                                            <button class="button ukpa-edit-category-btn" data-category-id="<?php echo $category->id; ?>">Edit</button>
                                            <button class="button ukpa-delete-category-btn" data-category-id="<?php echo $category->id; ?>">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- FAQ Modal -->
        <div id="faq-modal" class="ukpa-modal">
            <div class="ukpa-modal-content">
                <div class="ukpa-modal-header">
                    <h3 id="faq-modal-title">Add New FAQ</h3>
                    <button class="ukpa-modal-close">&times;</button>
                </div>
                <div class="ukpa-modal-body">
                    <form id="faq-form">
                        <input type="hidden" id="faq-id" name="faq_id" value="">
                        <input type="hidden" name="chatbot_id" value="<?php echo $chatbot_id; ?>">
                        
                        <div class="ukpa-form-row">
                            <label for="faq-category">Category</label>
                            <select id="faq-category" name="category" required>
                                <option value="">Select Category</option>
                                <?php foreach ($categories as $category): ?>
                                    <option value="<?php echo esc_attr($category->name); ?>"><?php echo esc_html($category->name); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="faq-question">Question</label>
                            <input type="text" id="faq-question" name="question" required>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="faq-answer">Answer</label>
                            <textarea id="faq-answer" name="answer" rows="6" required></textarea>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="faq-tags">Tags (comma separated)</label>
                            <input type="text" id="faq-tags" name="tags" placeholder="e.g., tax, calculator, help">
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="faq-order">Order</label>
                            <input type="number" id="faq-order" name="order_index" value="0" min="0">
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label>
                                <input type="checkbox" id="faq-active" name="is_active" value="1" checked>
                                Active
                            </label>
                        </div>
                    </form>
                </div>
                <div class="ukpa-modal-footer">
                    <button type="button" class="button" id="faq-modal-cancel">Cancel</button>
                    <button type="button" class="button button-primary" id="faq-modal-save">Save FAQ</button>
                </div>
            </div>
        </div>
        
        <!-- Category Modal -->
        <div id="category-modal" class="ukpa-modal">
            <div class="ukpa-modal-content">
                <div class="ukpa-modal-header">
                    <h3 id="category-modal-title">Add New Category</h3>
                    <button class="ukpa-modal-close">&times;</button>
                </div>
                <div class="ukpa-modal-body">
                    <form id="category-form">
                        <input type="hidden" id="category-id" name="category_id" value="">
                        <input type="hidden" name="chatbot_id" value="<?php echo $chatbot_id; ?>">
                        
                        <div class="ukpa-form-row">
                            <label for="category-name">Category Name</label>
                            <input type="text" id="category-name" name="name" required>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="category-description">Description</label>
                            <textarea id="category-description" name="description" rows="3"></textarea>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="category-icon">Icon</label>
                            <select id="category-icon" name="icon">
                                <option value="help">Help</option>
                                <option value="calculator">Calculator</option>
                                <option value="account">Account</option>
                                <option value="support">Support</option>
                                <option value="features">Features</option>
                                <option value="billing">Billing</option>
                                <option value="technical">Technical</option>
                            </select>
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label for="category-order">Order</label>
                            <input type="number" id="category-order" name="order_index" value="0" min="0">
                        </div>
                        
                        <div class="ukpa-form-row">
                            <label>
                                <input type="checkbox" id="category-active" name="is_active" value="1" checked>
                                Active
                            </label>
                        </div>
                    </form>
                </div>
                <div class="ukpa-modal-footer">
                    <button type="button" class="button" id="category-modal-cancel">Cancel</button>
                    <button type="button" class="button button-primary" id="category-modal-save">Save Category</button>
                </div>
            </div>
        </div>
        

        <?php
    }
    
    /**
     * Save FAQ
     */
    public function save_faq() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        $data = array(
            'chatbot_id' => intval($_POST['chatbot_id']),
            'category' => sanitize_text_field($_POST['category']),
            'question' => sanitize_text_field($_POST['question']),
            'answer' => wp_kses_post($_POST['answer']),
            'tags' => sanitize_text_field($_POST['tags']),
            'order_index' => intval($_POST['order_index']),
            'is_active' => isset($_POST['is_active']) ? 1 : 0
        );
        
        if (!empty($_POST['faq_id'])) {
            // Update existing FAQ
            $result = $wpdb->update($table, $data, array('id' => intval($_POST['faq_id'])));
        } else {
            // Insert new FAQ
            $result = $wpdb->insert($table, $data);
        }
        
        if ($result !== false) {
            wp_send_json_success('FAQ saved successfully');
        } else {
            wp_send_json_error('Error saving FAQ');
        }
    }
    
    /**
     * Delete FAQ
     */
    public function delete_faq() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        $result = $wpdb->delete($table, array('id' => intval($_POST['faq_id'])));
        
        if ($result !== false) {
            wp_send_json_success('FAQ deleted successfully');
        } else {
            wp_send_json_error('Error deleting FAQ');
        }
    }
    
    /**
     * Save FAQ category
     */
    public function save_faq_category() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
        
        $data = array(
            'chatbot_id' => intval($_POST['chatbot_id']),
            'name' => sanitize_text_field($_POST['name']),
            'description' => sanitize_textarea_field($_POST['description']),
            'icon' => sanitize_text_field($_POST['icon']),
            'order_index' => intval($_POST['order_index']),
            'is_active' => isset($_POST['is_active']) ? 1 : 0
        );
        
        if (!empty($_POST['category_id'])) {
            // Update existing category
            $result = $wpdb->update($table, $data, array('id' => intval($_POST['category_id'])));
        } else {
            // Insert new category
            $result = $wpdb->insert($table, $data);
        }
        
        if ($result !== false) {
            wp_send_json_success('Category saved successfully');
        } else {
            wp_send_json_error('Error saving category');
        }
    }
    
    /**
     * Delete FAQ category
     */
    public function delete_faq_category() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $categories_table = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
        $faqs_table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        $category_id = intval($_POST['category_id']);
        
        // Get category name first
        $category = $wpdb->get_row($wpdb->prepare("SELECT name FROM $categories_table WHERE id = %d", $category_id));
        
        if ($category) {
            // Delete FAQs in this category
            $wpdb->delete($faqs_table, array('category' => $category->name));
            
            // Delete category
            $result = $wpdb->delete($categories_table, array('id' => $category_id));
            
            if ($result !== false) {
                wp_send_json_success('Category deleted successfully');
            } else {
                wp_send_json_error('Error deleting category');
            }
        } else {
            wp_send_json_error('Category not found');
        }
    }
    
    /**
     * Get FAQ data for editing
     */
    public function get_faq() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        $faq_id = intval($_POST['faq_id']);
        $faq = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $faq_id));
        
        if ($faq) {
            wp_send_json_success($faq);
        } else {
            wp_send_json_error('FAQ not found');
        }
    }
    
    /**
     * Get FAQ category data for editing
     */
    public function get_faq_category() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faq_categories';
        
        $category_id = intval($_POST['category_id']);
        $category = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $category_id));
        
        if ($category) {
            wp_send_json_success($category);
        } else {
            wp_send_json_error('Category not found');
        }
    }
    
    /**
     * Reorder FAQs
     */
    public function reorder_faqs() {
        check_ajax_referer('ukpa_chatbot_nonce', 'nonce');
        
        global $wpdb;
        $table = $wpdb->prefix . 'ukpa_chatbot_faqs';
        
        $faq_orders = $_POST['faq_orders'];
        
        if (is_array($faq_orders)) {
            foreach ($faq_orders as $order_data) {
                $wpdb->update(
                    $table,
                    array('order_index' => intval($order_data['order'])),
                    array('id' => intval($order_data['id']))
                );
            }
            wp_send_json_success('FAQs reordered successfully');
        } else {
            wp_send_json_error('Invalid order data');
        }
    }
} 