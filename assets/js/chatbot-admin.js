/**
 * UKPA Chatbot Admin JavaScript
 */

jQuery(document).ready(function($) {
    
    // Initialize chatbot admin functionality
    initChatbotAdmin();
    
    function initChatbotAdmin() {
        // Handle form submission
        $('#ukpa-chatbot-form').on('submit', handleFormSubmit);
        
        // Handle add response button
        $('#ukpa-add-response').on('click', addResponseItem);
        
        // Handle add intent button
        $('#ukpa-add-intent').on('click', addIntentItem);
        
        // Handle remove buttons (delegated events)
        $(document).on('click', '.ukpa-remove-response', removeResponseItem);
        $(document).on('click', '.ukpa-remove-intent', removeIntentItem);
        
        // Handle copy shortcode buttons
        $(document).on('click', '.ukpa-copy-shortcode', copyShortcode);
        
        // Handle delete chatbot buttons
        $(document).on('click', '.ukpa-delete-chatbot', deleteChatbot);
        
        // Handle form field changes for preview
        $('#ukpa-chatbot-form').on('input change', updatePreview);
        
        // Handle chatbot type selection
        $('#chatbot_type').on('change', toggleChatbotTypeSettings);
        
        // Handle settings page functionality
        initSettingsPage();
        
        // Initialize chatbot type settings
        toggleChatbotTypeSettings();
        
        // Initialize preview
        updatePreview();
    }
    
    function initSettingsPage() {
        // Handle global chatbot enable/disable
        $('input[name="ukpa_global_chatbot_enabled"]').on('change', function() {
            const isEnabled = $(this).is(':checked');
            $('select[name="ukpa_global_chatbot_id"]').prop('disabled', !isEnabled);
            $('select[name="ukpa_global_chatbot_theme"]').prop('disabled', !isEnabled);
            $('select[name="ukpa_global_chatbot_position"]').prop('disabled', !isEnabled);
            $('textarea[name="ukpa_global_chatbot_exclude_pages"]').prop('disabled', !isEnabled);
        });
        
        // Initialize disabled state
        const isEnabled = $('input[name="ukpa_global_chatbot_enabled"]').is(':checked');
        if (!isEnabled) {
            $('select[name="ukpa_global_chatbot_id"]').prop('disabled', true);
            $('select[name="ukpa_global_chatbot_theme"]').prop('disabled', true);
            $('select[name="ukpa_global_chatbot_position"]').prop('disabled', true);
            $('textarea[name="ukpa_global_chatbot_exclude_pages"]').prop('disabled', true);
        }
    }
    
    /**
     * Handle form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = $(this);
        const submitButton = form.find('button[type="submit"]');
        const originalText = submitButton.text();
        
        // Show loading state
        submitButton.prop('disabled', true).text('Saving...');
        
        // Collect form data
        const formData = new FormData(form[0]);
        formData.append('action', 'ukpa_save_chatbot');
        formData.append('nonce', ukpa_chatbot_admin.nonce);
        
        // Process responses and intents
        const config = processFormConfig(form);
        formData.set('config', JSON.stringify(config));
        
        // Send AJAX request
        $.ajax({
            url: ukpa_chatbot_admin.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    showNotice('Chatbot saved successfully!', 'success');
                    
                    // Redirect to list page if this was a new chatbot
                    if (response.data && response.data.chatbot_id) {
                        setTimeout(function() {
                            window.location.href = 'admin.php?page=ukpa-chatbot-manager';
                        }, 1500);
                    }
                } else {
                    showNotice('Error saving chatbot: ' + response.data, 'error');
                }
            },
            error: function() {
                showNotice('Error saving chatbot. Please try again.', 'error');
            },
            complete: function() {
                submitButton.prop('disabled', false).text(originalText);
            }
        });
    }
    
    /**
     * Process form configuration
     */
    function processFormConfig(form) {
        const config = {
            welcome_message: form.find('#welcome_message').val(),
            personality: form.find('#personality').val(),
            fallback: form.find('#fallback').val(),
            responses: [],
            intents: []
        };
        
        // Process responses
        $('.ukpa-response-item').each(function(index) {
            const item = $(this);
            const keywords = item.find('input[name*="[keywords]"]').val().split(',').map(k => k.trim()).filter(k => k);
            const response = item.find('textarea[name*="[response]"]').val();
            const exactMatch = item.find('input[name*="[exact_match]"]').is(':checked');
            
            if (keywords.length > 0 && response) {
                config.responses.push({
                    keywords: keywords,
                    response: response,
                    exact_match: exactMatch
                });
            }
        });
        
        // Process intents
        $('.ukpa-intent-item').each(function(index) {
            const item = $(this);
            const patterns = item.find('textarea[name*="[patterns]"]').val().split('\n').map(p => p.trim()).filter(p => p);
            const response = item.find('textarea[name*="[response]"]').val();
            
            if (patterns.length > 0 && response) {
                config.intents.push({
                    patterns: patterns,
                    response: response
                });
            }
        });
        
        return config;
    }
    
    /**
     * Add new response item
     */
    function addResponseItem() {
        const container = $('#ukpa-responses-container');
        const index = container.children().length;
        
        const responseHtml = `
            <div class="ukpa-response-item" data-index="${index}">
                <div class="ukpa-response-header">
                    <h4>Response ${index + 1}</h4>
                    <button type="button" class="ukpa-remove-response">Remove</button>
                </div>
                <table class="form-table">
                    <tr>
                        <th scope="row">Keywords</th>
                        <td>
                            <input type="text" name="config[responses][${index}][keywords]" 
                                   class="large-text" placeholder="hello, hi, hey">
                            <p class="description">Separate keywords with commas</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Response</th>
                        <td>
                            <textarea name="config[responses][${index}][response]" 
                                      class="large-text" rows="3"></textarea>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Exact Match</th>
                        <td>
                            <label>
                                <input type="checkbox" name="config[responses][${index}][exact_match]" value="1">
                                Require exact keyword match
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
        `;
        
        container.append(responseHtml);
        updatePreview();
    }
    
    /**
     * Add new intent item
     */
    function addIntentItem() {
        const container = $('#ukpa-intents-container');
        const index = container.children().length;
        
        const intentHtml = `
            <div class="ukpa-intent-item" data-index="${index}">
                <div class="ukpa-intent-header">
                    <h4>Intent ${index + 1}</h4>
                    <button type="button" class="ukpa-remove-intent">Remove</button>
                </div>
                <table class="form-table">
                    <tr>
                        <th scope="row">Patterns</th>
                        <td>
                            <textarea name="config[intents][${index}][patterns]" 
                                      class="large-text" rows="3" placeholder="/hello/i, /hi there/i"></textarea>
                            <p class="description">One regex pattern per line</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Response</th>
                        <td>
                            <textarea name="config[intents][${index}][response]" 
                                      class="large-text" rows="3"></textarea>
                        </td>
                    </tr>
                </table>
            </div>
        `;
        
        container.append(intentHtml);
        updatePreview();
    }
    
    /**
     * Remove response item
     */
    function removeResponseItem() {
        $(this).closest('.ukpa-response-item').remove();
        reindexResponseItems();
        updatePreview();
    }
    
    /**
     * Remove intent item
     */
    function removeIntentItem() {
        $(this).closest('.ukpa-intent-item').remove();
        reindexIntentItems();
        updatePreview();
    }
    
    /**
     * Reindex response items
     */
    function reindexResponseItems() {
        $('.ukpa-response-item').each(function(index) {
            const item = $(this);
            item.attr('data-index', index);
            item.find('h4').text(`Response ${index + 1}`);
            
            // Update input names
            item.find('input[name*="[keywords]"]').attr('name', `config[responses][${index}][keywords]`);
            item.find('textarea[name*="[response]"]').attr('name', `config[responses][${index}][response]`);
            item.find('input[name*="[exact_match]"]').attr('name', `config[responses][${index}][exact_match]`);
        });
    }
    
    /**
     * Reindex intent items
     */
    function reindexIntentItems() {
        $('.ukpa-intent-item').each(function(index) {
            const item = $(this);
            item.attr('data-index', index);
            item.find('h4').text(`Intent ${index + 1}`);
            
            // Update input names
            item.find('textarea[name*="[patterns]"]').attr('name', `config[intents][${index}][patterns]`);
            item.find('textarea[name*="[response]"]').attr('name', `config[intents][${index}][response]`);
        });
    }
    
    /**
     * Copy shortcode to clipboard
     */
    function copyShortcode() {
        const shortcode = $(this).data('shortcode');
        
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = shortcode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // Show feedback
        const button = $(this);
        const originalText = button.text();
        button.text('Copied!').addClass('button-primary');
        
        setTimeout(function() {
            button.text(originalText).removeClass('button-primary');
        }, 2000);
    }
    
    /**
     * Delete chatbot
     */
    function deleteChatbot() {
        const chatbotId = $(this).data('id');
        
        if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
            return;
        }
        
        const button = $(this);
        const originalText = button.text();
        
        button.prop('disabled', true).text('Deleting...');
        
        $.ajax({
            url: ukpa_chatbot_admin.ajaxurl,
            type: 'POST',
            data: {
                action: 'ukpa_delete_chatbot',
                chatbot_id: chatbotId,
                nonce: ukpa_chatbot_admin.nonce
            },
            success: function(response) {
                if (response.success) {
                    showNotice('Chatbot deleted successfully!', 'success');
                    button.closest('tr').fadeOut();
                } else {
                    showNotice('Error deleting chatbot: ' + response.data, 'error');
                }
            },
            error: function() {
                showNotice('Error deleting chatbot. Please try again.', 'error');
            },
            complete: function() {
                button.prop('disabled', false).text(originalText);
            }
        });
    }
    
    /**
     * Update preview
     */
    function updatePreview() {
        const container = $('#ukpa-chatbot-preview-container');
        const name = $('#chatbot_name').val() || 'Chatbot';
        const welcomeMessage = $('#welcome_message').val() || 'Hello! How can I help you today?';
        
        const previewHtml = `
            <div class="ukpa-chatbot-preview-widget">
                <div style="background: #0073aa; color: white; padding: 10px; border-radius: 8px 8px 0 0; font-weight: bold;">
                    ${name}
                </div>
                <div style="background: #f8f9fa; padding: 15px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                        <div style="width: 24px; height: 24px; background: #0073aa; border-radius: 50%; margin-right: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
                            B
                        </div>
                        <div style="background: white; padding: 8px 12px; border-radius: 12px; border: 1px solid #e1e5e9; max-width: 80%; font-size: 12px;">
                            ${welcomeMessage}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="text" placeholder="Type your message..." style="flex: 1; border: 1px solid #ddd; border-radius: 16px; padding: 6px 12px; font-size: 12px;">
                        <button style="width: 28px; height: 28px; border: none; border-radius: 50%; background: #0073aa; color: white; cursor: pointer; font-size: 12px;">
                            →
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.html(previewHtml);
    }
    
    /**
     * Toggle chatbot type specific settings
     */
    function toggleChatbotTypeSettings() {
        const chatbotType = $('#chatbot_type').val();
        
        if (chatbotType === 'gpt') {
            $('.gpt-settings').show();
            $('.nlp-settings').hide();
        } else {
            $('.gpt-settings').hide();
            $('.nlp-settings').show();
        }
    }
    
    /**
     * Show notice
     */
    function showNotice(message, type) {
        const noticeClass = type === 'success' ? 'ukpa-notice-success' : 'ukpa-notice-error';
        const notice = $(`<div class="ukpa-notice ${noticeClass}">${message}</div>`);
        
        $('.wrap h1').after(notice);
        
        setTimeout(function() {
            notice.fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
    }
}); 