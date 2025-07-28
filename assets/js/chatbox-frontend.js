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
            });
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
            
            // Send AJAX request
            $.ajax({
                url: ukpa_chatbox_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'ukpa_chatbox_message',
                    message: message,
                    session_id: this.sessionId,
                    nonce: ukpa_chatbox_ajax.nonce
                },
                timeout: 30000,
                success: function(response) {
                    try {
                        var data = typeof response === 'string' ? JSON.parse(response) : response;
                        
                        if (data.success) {
                            self.addMessage(data.response, 'bot', $chatbox);
                        } else {
                            self.addMessage('Sorry, I encountered an error: ' + data.message, 'bot', $chatbox);
                        }
                    } catch (e) {
                        self.addMessage('Sorry, I encountered an error processing the response.', 'bot', $chatbox);
                    }
                },
                error: function(xhr, status, error) {
                    var errorMessage = 'Sorry, I encountered an error.';
                    
                    if (status === 'timeout') {
                        errorMessage = 'Request timed out. Please try again.';
                    } else if (xhr.status === 0) {
                        errorMessage = 'Network error. Please check your connection.';
                    }
                    
                    self.addMessage(errorMessage, 'bot', $chatbox);
                },
                complete: function() {
                    // Hide typing indicator
                    self.hideTypingIndicator($chatbox);
                    
                    // Re-enable input
                    $input.prop('disabled', false);
                    $sendBtn.prop('disabled', false);
                    $input.focus();
                }
            });
        },
        
        /**
         * Add message to chat
         */
        addMessage: function(content, type, $chatbox) {
            var $messages = $chatbox.find('.ukpa-chatbox-messages');
            var time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            var messageHtml = `
                <div class="ukpa-chatbox-message ukpa-chatbox-message-${type}">
                    <div class="ukpa-chatbox-message-content">
                        ${this.escapeHtml(content)}
                    </div>
                    <div class="ukpa-chatbox-message-time">
                        ${time}
                    </div>
                </div>
            `;
            
            $messages.append(messageHtml);
            this.scrollToBottom($messages);
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
         * Escape HTML to prevent XSS
         */
        escapeHtml: function(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
        UKPAChatbox.init();
    });
    
})(jQuery); 