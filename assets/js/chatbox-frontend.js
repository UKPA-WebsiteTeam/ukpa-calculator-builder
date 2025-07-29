/**
 * UKPA Chat Box Frontend JavaScript
 * 
 * Handles chat box interactions and communication with backend
 */

(function($) {
    'use strict';
    
    // Chat box namespace
    window.UKPAChatbox = {
        sessionId: null,
        isTyping: false,
        init: function() {
            this.generateSessionId();
            this.bindEvents();
            this.initChatboxWidgets();
        },
        
        /**
         * Generate unique session ID
         */
        generateSessionId: function() {
            this.sessionId = 'ukpa_chatbox_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        /**
         * Bind event listeners
         */
        bindEvents: function() {
            $(document).on('click', '.ukpa-chatbox-toggle-btn', this.handleToggle.bind(this));
            $(document).on('click', '.ukpa-chatbox-close', this.handleClose.bind(this));
            $(document).on('click', '.ukpa-chatbox-minimize', this.handleMinimize.bind(this));
            $(document).on('submit', '.ukpa-chatbox-form', this.handleSubmit.bind(this));
            $(document).on('keydown', '.ukpa-chatbox-input', this.handleKeydown.bind(this));
            $(document).on('input', '.ukpa-chatbox-input', this.handleInput.bind(this));
            
            // Close on escape key
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    $('.ukpa-chatbox.active').removeClass('active');
                }
            });
        },
        
        /**
         * Initialize chat box widgets
         */
        initChatboxWidgets: function() {
            $('.ukpa-chatbox').each(function() {
                var $chatbox = $(this);
                var $input = $chatbox.find('.ukpa-chatbox-input');
                
                // Auto-resize textarea
                $input.on('input', function() {
                    this.style.height = 'auto';
                    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
                });
                
                // Focus input when chat opens
                $chatbox.on('shown', function() {
                    $input.focus();
                });
                // Demo form removed
            });
        },
        
        /**
         * Add demo form for testing
         */
        addDemoForm: function($chatbox) {
            var demoFormData = {
                type: 'form',
                calculator: 'demo',
                message: 'Please fill in the demo form to see how it works:',
                fields: [
                    {
                        key: 'fullName',
                        label: 'Full Name',
                        type: 'text',
                        required: true
                    },
                    {
                        key: 'email',
                        label: 'Email Address',
                        type: 'text',
                        required: true
                    },
                    {
                        key: 'age',
                        label: 'Age',
                        type: 'number',
                        required: true
                    },
                    {
                        key: 'country',
                        label: 'Country',
                        type: 'select',
                        required: true,
                        options: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Other']
                    },
                    {
                        key: 'newsletter',
                        label: 'Subscribe to Newsletter',
                        type: 'radio',
                        required: false,
                        options: ['Yes', 'No']
                    }
                ]
            };
            
            this.addMessage('', 'bot', $chatbox, demoFormData);
        },
        
        /**
         * Handle toggle button click
         */
        handleToggle: function(e) {
            e.preventDefault();
            var $toggle = $(e.currentTarget);
            var $chatbox = $toggle.closest('.ukpa-chatbox-toggle').siblings('.ukpa-chatbox');
            
            if ($chatbox.hasClass('active')) {
                this.handleClose(e);
            } else {
                $chatbox.addClass('active');
                $chatbox.trigger('shown');
            }
        },
        
        /**
         * Handle close button click
         */
        handleClose: function(e) {
            e.preventDefault();
            var $chatbox = $(e.currentTarget).closest('.ukpa-chatbox');
            $chatbox.removeClass('active');
        },
        
        /**
         * Handle minimize button click
         */
        handleMinimize: function(e) {
            e.preventDefault();
            var $chatbox = $(e.currentTarget).closest('.ukpa-chatbox');
            $chatbox.removeClass('active');
        },
        
        /**
         * Handle form submission
         */
        handleSubmit: function(e) {
            e.preventDefault();
            var $form = $(e.currentTarget);
            var $input = $form.find('.ukpa-chatbox-input');
            var message = $input.val().trim();
            
            if (!message) {
                return;
            }
            
            this.sendMessage(message, $form.closest('.ukpa-chatbox'));
            $input.val('').trigger('input');
        },
        
        /**
         * Handle keydown events
         */
        handleKeydown: function(e) {
            // Send on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                $(e.currentTarget).closest('form').submit();
            }
        },
        
        /**
         * Handle input events
         */
        handleInput: function(e) {
            var $input = $(e.currentTarget);
            var $sendBtn = $input.closest('.ukpa-chatbox-form').find('.ukpa-chatbox-send');
            
            // Enable/disable send button based on input
            if ($input.val().trim()) {
                $sendBtn.prop('disabled', false);
            } else {
                $sendBtn.prop('disabled', true);
            }
        },
        
        /**
         * Send message to backend
         */
        sendMessage: function(message, $chatbox) {
            var self = this;
            
            // Add user message to chat
            this.addMessage(message, 'user', $chatbox);
            
            // Show typing indicator
            this.showTypingIndicator($chatbox);
            
            // Disable input during request
            var $input = $chatbox.find('.ukpa-chatbox-input');
            var $sendBtn = $chatbox.find('.ukpa-chatbox-send');
            $input.prop('disabled', true);
            $sendBtn.prop('disabled', true);
            
            // Log the request data for debugging
            console.log('Sending message:', message);
            
            // Send fetch request directly to backend
            fetch('http://localhost:3002/ana/api/v1/chatbot/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: message
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    // Get error details
                    return response.text().then(errorText => {
                        console.error('Error response body:', errorText);
                        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                
                // Handle the response from backend
                if (data.type === 'form') {
                    // Show form if backend requests it
                    self.addMessage('', 'bot', $chatbox, data);
                } else if (data.success && data.totalTax !== undefined) {
                    // Handle calculator calculation results
                    var message = '📊 **Income Tax Calculation Results:**\n\n';
                    message += '💰 **Total Tax Due: £' + data.totalTax.toLocaleString() + '**\n\n';
                    
                    if (data.breakdown) {
                        message += '📋 **Tax Breakdown:**\n';
                        if (data.breakdown.nonSavingIncomeTax > 0) {
                            message += '• Non-Savings Income Tax: £' + data.breakdown.nonSavingIncomeTax.toLocaleString() + '\n';
                        }
                        if (data.breakdown.savingsIncomeTax > 0) {
                            message += '• Savings Income Tax: £' + data.breakdown.savingsIncomeTax.toLocaleString() + '\n';
                        }
                        if (data.breakdown.dividendIncomeTax > 0) {
                            message += '• Dividend Income Tax: £' + data.breakdown.dividendIncomeTax.toLocaleString() + '\n';
                        }
                    }
                    
                    if (data.allowanceBreakdown) {
                        message += '\n📈 **Personal Allowance:**\n';
                        message += '• Personal Allowance: £' + data.allowanceBreakdown.personalAllowance.toLocaleString() + '\n';
                        message += '• Adjusted Allowance: £' + data.allowanceBreakdown.adjustedAllowance.toLocaleString() + '\n';
                    }
                    
                    self.addMessage(message, 'bot', $chatbox, data);
                } else {
                    // Always pass data as formData for bot messages
                    self.addMessage(data.answer || data.response || 'No response received', 'bot', $chatbox, data);
                }
            })
            .catch(error => {
                console.error('Fetch error details:', error);
                console.error('Error message:', error.message);
                
                var errorMessage = 'Sorry, I encountered an error: ' + error.message;
                
                // Provide more specific error messages
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
                } else if (error.message.includes('HTTP 400')) {
                    errorMessage = 'Bad request: The data sent was invalid. Please check your input.';
                } else if (error.message.includes('HTTP 500')) {
                    errorMessage = 'Server error: The backend encountered an internal error. Please try again later.';
                } else if (error.message.includes('HTTP 404')) {
                    errorMessage = 'Not found: The API endpoint was not found.';
                }
                
                self.addMessage(errorMessage, 'bot', $chatbox);
            })
            .finally(() => {
                // Hide typing indicator
                self.hideTypingIndicator($chatbox);
                
                // Re-enable input
                $input.prop('disabled', false);
                $sendBtn.prop('disabled', false);
                $input.focus();
            });
        },
        
        /**
         * Add message to chat
         */
        addMessage: function(content, type, $chatbox, formData) {
            var $messages = $chatbox.find('.ukpa-chatbox-messages');
            var time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            var messageContent = '';
            
            // Check if this is a form message
            if (formData && formData.type === 'form') {
                messageContent = this.renderDynamicForm(formData, $chatbox);
            } else {
                messageContent = this.escapeHtml(content);
            }
            
            var messageHtml = `
                <div class="ukpa-chatbox-message ukpa-chatbox-message-${type}">
                    <div class="ukpa-chatbox-message-content">
                        ${messageContent}
                    </div>
                    <div class="ukpa-chatbox-message-time">
                        ${time}
                    </div>
                </div>
            `;
            
            $messages.append(messageHtml);
            // Render suggested actions inline beside the message time
            if (formData && formData.suggestedActions && Array.isArray(formData.suggestedActions) && formData.suggestedActions.length > 0) {
                var $lastMsg = $messages.children('.ukpa-chatbox-message-bot').last();
                var $time = $lastMsg.find('.ukpa-chatbox-message-time');
                var $actionsDiv = $('<div class="ukpa-chatbox-suggested-actions-inline"></div>');
                console.log('[UKPA Chatbox] Showing suggested actions (inline beside time):', formData.suggestedActions);
                formData.suggestedActions.forEach(function(action) {
                    var $btn = $('<button type="button" class="ukpa-suggested-action-btn"></button>')
                        .text(action.label)
                        .on('click', function() {
                            $('.ukpa-chatbox-input', $chatbox).val(action.value);
                            $('.ukpa-chatbox-form', $chatbox).submit();
                        });
                    $actionsDiv.append($btn);
                });
                // Wrap time and actions in a flex container
                var $timeAndActions = $lastMsg.find('.ukpa-chatbox-message-time-and-actions');
                if ($timeAndActions.length === 0) {
                    $timeAndActions = $('<div class="ukpa-chatbox-message-time-and-actions"></div>');
                    $time.after($timeAndActions);
                    $timeAndActions.append($time);
                }
                $timeAndActions.append($actionsDiv);
            } else {
                // Remove any old inline suggestions
                $messages.find('.ukpa-chatbox-suggested-actions-inline').remove();
                $messages.find('.ukpa-chatbox-message-time-and-actions').each(function() {
                    // If only time remains, unwrap
                    if ($(this).children().length === 1 && $(this).children('.ukpa-chatbox-message-time').length === 1) {
                        $(this).replaceWith($(this).children('.ukpa-chatbox-message-time'));
                    }
                });
                console.log('[UKPA Chatbox] No suggested actions to show. Cleared inline actions.');
            }
            this.scrollToBottom($messages);
        },
        
        /**
         * Render dynamic form
         */
        renderDynamicForm: function(formData, $chatbox) {
            console.log('=== RENDERING DYNAMIC FORM ===');
            console.log('Form data received:', formData);
            var fields = formData.fields || (formData.calculator && formData.calculator.fields) || [];
            console.log('Form fields:', fields);
            var self = this;
            var formId = 'ukpa-form-' + Date.now();
            console.log('Generated form ID:', formId);
            var formHtml = `
                <div class="ukpa-dynamic-form" data-form-id="${formId}">
                    <div class="ukpa-form-header">
                        <h4>${this.escapeHtml(formData.message || 'Please fill in the details:')}</h4>
                    </div>
                    <form class="ukpa-form" data-calculator="${formData.calculator ? (formData.calculator.name || '') : ''}">
                        ${this.renderFormFields(fields)}
                        <div class="ukpa-form-actions">
                            <button type="submit" class="ukpa-form-submit">Submit</button>
                            <button type="button" class="ukpa-form-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            console.log('Generated form HTML:', formHtml);
            setTimeout(function() {
                self.bindFormEvents(formId, $chatbox);
            }, 100);
            return formHtml;
        },
        
        /**
         * Render form fields
         */
        renderFormFields: function(fields) {
            console.log('=== RENDERING FORM FIELDS ===');
            console.log('Fields array:', fields);
            
            var self = this;
            var fieldsHtml = '';
            
            fields.forEach(function(field, index) {
                console.log(`Processing field ${index + 1}:`, field);
                
                var fieldHtml = '';
                var required = field.required ? 'required' : '';
                var fieldClass = 'ukpa-form-field';
                
                switch (field.type) {
                    case 'select':
                        console.log('Creating select field:', field.key, 'with options:', field.options);
                        fieldHtml = `
                            <div class="${fieldClass}">
                                <label for="${field.key}">${self.escapeHtml(field.label)}</label>
                                <select name="${field.key}" id="${field.key}" ${required}>
                                    <option value="">Select ${self.escapeHtml(field.label)}</option>
                                    ${self.renderSelectOptions(field.options || [])}
                                </select>
                            </div>
                        `;
                        break;
                        
                    case 'number':
                        console.log('Creating number field:', field.key);
                        fieldHtml = `
                            <div class="${fieldClass}">
                                <label for="${field.key}">${self.escapeHtml(field.label)}</label>
                                <input type="number" name="${field.key}" id="${field.key}" 
                                       placeholder="Enter ${self.escapeHtml(field.label)}" ${required}>
                            </div>
                        `;
                        break;
                        
                    case 'radio':
                        console.log('Creating radio field:', field.key, 'with options:', field.options);
                        fieldHtml = `
                            <div class="${fieldClass}">
                                <label>${self.escapeHtml(field.label)}</label>
                                <div class="ukpa-radio-group">
                                    ${self.renderRadioOptions(field.key, field.options || [])}
                                </div>
                            </div>
                        `;
                        break;
                        
                    default:
                        console.log('Creating text field:', field.key);
                        fieldHtml = `
                            <div class="${fieldClass}">
                                <label for="${field.key}">${self.escapeHtml(field.label)}</label>
                                <input type="text" name="${field.key}" id="${field.key}" 
                                       placeholder="Enter ${self.escapeHtml(field.label)}" ${required}>
                            </div>
                        `;
                }
                
                fieldsHtml += fieldHtml;
                console.log(`Field ${index + 1} HTML generated:`, fieldHtml);
            });
            
            console.log('Final fields HTML:', fieldsHtml);
            return fieldsHtml;
        },
        
        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml: function(text) {
            if (typeof text !== 'string') {
                return '';
            }
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        /**
         * Render select options
         */
        renderSelectOptions: function(options) {
            var optionsHtml = '';
            options.forEach(function(option) {
                optionsHtml += `<option value="${this.escapeHtml(option.value || option)}">${this.escapeHtml(option.label || option)}</option>`;
            }.bind(this));
            return optionsHtml;
        },
        
        /**
         * Render radio options
         */
        renderRadioOptions: function(name, options) {
            var optionsHtml = '';
            options.forEach(function(option) {
                optionsHtml += `
                    <label class="ukpa-radio-option">
                        <input type="radio" name="${name}" value="${this.escapeHtml(option.value || option)}">
                        <span>${this.escapeHtml(option.label || option)}</span>
                    </label>
                `;
            }.bind(this));
            return optionsHtml;
        },
        
        /**
         * Bind form events
         */
        bindFormEvents: function(formId, $chatbox) {
            var self = this;
            var $form = $chatbox.find('[data-form-id="' + formId + '"] .ukpa-form');
            var $submitBtn = $form.find('.ukpa-form-submit');
            var $cancelBtn = $form.find('.ukpa-form-cancel');
            
            // Submit form
            $submitBtn.on('click', function(e) {
                e.preventDefault();
                self.handleFormSubmit(e, $chatbox);
            });
            
            // Cancel form
            $cancelBtn.on('click', function(e) {
                e.preventDefault();
                self.removeForm(formId, $chatbox);
            });
            
            // Enter key to submit
            $form.on('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.handleFormSubmit(e, $chatbox);
                }
            });
        },
        
        /**
         * Handle form submission
         */
        handleFormSubmit: function(e, $chatbox) {
            e.preventDefault();
            
            var $form = $(e.target).closest('form');
            var formData = {};
            
            console.log('=== FORM SUBMISSION STARTED ===');
            console.log('Event target:', e.target);
            console.log('Form element:', $form);
            console.log('Form length:', $form.length);
            console.log('Form HTML:', $form.html());
            
            // Get calculator type from form data attribute
            var calculator = $form.data('calculator');
            console.log('Calculator type:', calculator);
            
            // Debug: Check all form elements
            console.log('=== CHECKING FORM ELEMENTS ===');
            var allInputs = $form.find('input, select, textarea');
            console.log('Total form elements found:', allInputs.length);
            
            allInputs.each(function(index) {
                var $field = $(this);
                console.log(`Element ${index + 1}:`, {
                    tagName: this.tagName,
                    name: $field.attr('name'),
                    id: $field.attr('id'),
                    type: $field.attr('type'),
                    value: $field.val(),
                    element: this
                });
            });
            
            // Collect form data
            $form.find('input, select, textarea').each(function() {
                var $field = $(this);
                var name = $field.attr('name');
                var value = $field.val();
                var type = $field.attr('type');
                
                console.log('Field found:', {
                    name: name,
                    value: value,
                    type: type,
                    element: this,
                    elementHTML: this.outerHTML
                });
                
                if (name && value !== undefined && value !== '') {
                    // Convert numeric values
                    if (type === 'number' || !isNaN(value)) {
                        formData[name] = parseFloat(value) || value;
                        console.log('Converted to number:', name, '=', formData[name]);
                    } else {
                        formData[name] = value;
                        console.log('Kept as string:', name, '=', formData[name]);
                    }
                } else {
                    console.log('Skipping field:', {
                        name: name,
                        hasName: !!name,
                        value: value,
                        hasValue: value !== undefined && value !== '',
                        reason: !name ? 'no name' : 'no value'
                    });
                }
            });
            
            // Add calculator type to form data
            if (calculator) {
                formData.calculator = calculator;
                console.log('Added calculator type:', calculator);
            }
            
            console.log('=== FINAL FORM DATA OBJECT ===');
            console.log('Raw formData object:', formData);
            console.log('JSON.stringify(formData):', JSON.stringify(formData, null, 2));
            
            // Show user's form data as a message
            var userMessage = this.formatFormDataForDisplay(formData);
            this.addMessage(userMessage, 'user', $chatbox);
            
            // Remove the form
            $form.closest('.ukpa-dynamic-form').remove();
            
            // Send form data to backend
            this.sendFormData(formData, $chatbox);
        },
        
        /**
         * Format form data for display
         */
        formatFormDataForDisplay: function(formData) {
            var displayText = 'Form submitted with:\n';
            Object.keys(formData).forEach(function(key) {
                if (key !== 'calculator') {
                    displayText += `• ${key}: ${formData[key]}\n`;
                }
            });
            return displayText.trim();
        },
        
        /**
         * Send form data to backend
         */
        sendFormData: function(formData, $chatbox) {
            console.log('=== UPDATED sendFormData FUNCTION LOADED ===');
            var self = this;
            var url = 'http://192.168.18.54:3002/ana/api/v1/chatbot/ask';
            // If this is a calculator form, ensure all required fields are present and numbers
            if (formData.calculator && formData.calculator.toLowerCase() === 'income tax') {
                // Ensure all fields are present and numbers
                formData.taxYear = String(formData.taxYear || '');
                formData.propertyIncome = Number(formData.propertyIncome || 0);
                formData.tradingIncome = Number(formData.tradingIncome || 0);
                formData.employmentIncome = Number(formData.employmentIncome || 0);
                formData.savingIncome = Number(formData.savingIncome || 0);
                formData.dividendIncome = Number(formData.dividendIncome || 0);
                // Keep calculator property for backend detection
            }
            // Show typing indicator
            this.showTypingIndicator($chatbox);
            // Disable input during request
            var $input = $chatbox.find('.ukpa-chatbox-input');
            var $sendBtn = $chatbox.find('.ukpa-chatbox-send');
            $input.prop('disabled', true);
            $sendBtn.prop('disabled', true);
            // Log the request data for debugging
            console.log('Sending form data:', formData);
            // Send fetch request with form data
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    // Get error details
                    return response.text().then(errorText => {
                        console.error('Error response body:', errorText);
                        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                
                // Handle the response from backend
                if (data.type === 'form') {
                    // Show form if backend requests it
                    self.addMessage('', 'bot', $chatbox, data);
                } else if (data.success && data.totalTax !== undefined) {
                    // Handle calculator calculation results
                    var calculationMessage = '📊 **Income Tax Calculation Results**\n\n';
                    calculationMessage += '💰 **Total Tax Due**: £' + data.totalTax.toLocaleString() + '\n\n';
                    
                    if (data.breakdown) {
                        calculationMessage += '📋 **Tax Breakdown**:\n';
                        if (data.breakdown.nonSavingIncomeTax > 0) {
                            calculationMessage += '• Non-Savings Income Tax: £' + data.breakdown.nonSavingIncomeTax.toLocaleString() + '\n';
                        }
                        if (data.breakdown.savingsIncomeTax > 0) {
                            calculationMessage += '• Savings Income Tax: £' + data.breakdown.savingsIncomeTax.toLocaleString() + '\n';
                        }
                        if (data.breakdown.dividendIncomeTax > 0) {
                            calculationMessage += '• Dividend Income Tax: £' + data.breakdown.dividendIncomeTax.toLocaleString() + '\n';
                        }
                    }
                    
                    if (data.allowanceBreakdown) {
                        calculationMessage += '\n🎯 **Personal Allowance**: £' + data.allowanceBreakdown.personalAllowance.toLocaleString();
                        if (data.allowanceBreakdown.adjustedAllowance !== data.allowanceBreakdown.personalAllowance) {
                            calculationMessage += ' (adjusted to £' + data.allowanceBreakdown.adjustedAllowance.toLocaleString() + ' for high income)';
                        }
                    }
                    
                    self.addMessage(calculationMessage, 'bot', $chatbox, data);
                } else {
                    // Show normal chat response
                    self.addMessage(data.answer || data.response || 'No response received', 'bot', $chatbox, data);
                }
            })
            .catch(error => {
                console.error('Fetch error details:', error);
                console.error('Error message:', error.message);
                
                var errorMessage = 'Sorry, I encountered an error: ' + error.message;
                
                // Provide more specific error messages
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
                } else if (error.message.includes('HTTP 400')) {
                    errorMessage = 'Bad request: The data sent was invalid. Please check your input.';
                } else if (error.message.includes('HTTP 500')) {
                    errorMessage = 'Server error: The backend encountered an internal error. Please try again later.';
                } else if (error.message.includes('HTTP 404')) {
                    errorMessage = 'Not found: The API endpoint was not found.';
                }
                
                self.addMessage(errorMessage, 'bot', $chatbox);
            })
            .finally(() => {
                // Hide typing indicator
                self.hideTypingIndicator($chatbox);
                
                // Re-enable input
                $input.prop('disabled', false);
                $sendBtn.prop('disabled', false);
                $input.focus();
            });
        },
        
        /**
         * Remove form
         */
        removeForm: function(formId, $chatbox) {
            $chatbox.find('[data-form-id="' + formId + '"]').remove();
        },
        
        /**
         * Show typing indicator
         */
        showTypingIndicator: function($chatbox) {
            var $typing = $chatbox.find('.ukpa-chatbox-typing');
            $typing.show();
            this.scrollToBottom($chatbox.find('.ukpa-chatbox-messages'));
        },
        
        /**
         * Hide typing indicator
         */
        hideTypingIndicator: function($chatbox) {
            var $typing = $chatbox.find('.ukpa-chatbox-typing');
            $typing.hide();
        },
        
        /**
         * Scroll to bottom of messages
         */
        scrollToBottom: function($messages) {
            $messages.scrollTop($messages[0].scrollHeight);
        },
        
        /**
         * Track analytics (optional)
         */
        trackEvent: function(eventName, data) {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, data);
            }
            
            if (typeof fbq !== 'undefined') {
                fbq('track', eventName, data);
            }
        }
    };
    
    // Initialize when DOM is ready
    $(document).ready(function() {
        // Prevent multiple initializations
        if (window.UKPAChatboxInitialized) {
            return;
        }
        window.UKPAChatboxInitialized = true;
        UKPAChatbox.init();
    });
    
})(jQuery); 