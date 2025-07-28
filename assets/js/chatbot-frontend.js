/**
 * UKPA Chatbot Frontend JavaScript
 */

jQuery(document).ready(function($) {
    
    // Initialize chatbot widgets
    initChatbotWidgets();
    
    function initChatbotWidgets() {
        $('.ukpa-chatbot-widget').each(function() {
            const widget = $(this);
            initChatbotWidget(widget);
        });
    }
    
    function initChatbotWidget(widget) {
        const chatbotId = widget.data('chatbot-id');
        const sessionId = widget.data('session-id');
        const theme = widget.data('theme') || 'light';
        const position = widget.data('position') || 'bottom-right';
        
        // Set theme and position
        widget.attr('data-theme', theme);
        widget.attr('data-position', position);
        
        // Cache DOM elements
        const toggle = widget.find('.ukpa-chatbot-toggle');
        const container = widget.find('.ukpa-chatbot-container');
        const closeBtn = widget.find('.ukpa-chatbot-close');
        const messagesContainer = widget.find('.ukpa-chatbot-messages');
        const input = widget.find('.ukpa-chatbot-text-input');
        const sendBtn = widget.find('.ukpa-chatbot-send');
        
        // Toggle chatbot
        toggle.on('click', function() {
            container.toggleClass('active');
            toggle.toggleClass('active');
            
            if (container.hasClass('active')) {
                input.focus();
                scrollToBottom();
            }
        });
        
        // Close chatbot
        closeBtn.on('click', function() {
            container.removeClass('active');
            toggle.removeClass('active');
        });
        
        // Send message on Enter key
        input.on('keypress', function(e) {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Send message on button click
        sendBtn.on('click', sendMessage);
        
        // Handle input changes
        input.on('input', function() {
            const hasText = $(this).val().trim().length > 0;
            sendBtn.prop('disabled', !hasText);
        });
        
        function sendMessage() {
            const message = input.val().trim();
            
            if (!message) {
                return;
            }
            
            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input
            input.val('');
            sendBtn.prop('disabled', true);
            
            // Show typing indicator
            showTypingIndicator();
            
            // Send message to server
            $.ajax({
                url: ukpa_chatbot_frontend.ajaxurl,
                type: 'POST',
                data: {
                    action: 'ukpa_chatbot_message',
                    chatbot_id: chatbotId,
                    message: message,
                    session_id: sessionId,
                    nonce: ukpa_chatbot_frontend.nonce
                },
                success: function(response) {
                    hideTypingIndicator();
                    
                    if (response.success) {
                        // Add bot response to chat
                        addMessage(response.data.response, 'bot');
                    } else {
                        // Show error message
                        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                    }
                },
                error: function() {
                    hideTypingIndicator();
                    addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                }
            });
        }
        
        function addMessage(text, sender) {
            const messageHtml = `
                <div class="ukpa-chatbot-message ${sender}">
                    <div class="ukpa-chatbot-avatar">
                        ${sender === 'bot' ? 
                            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/></svg>' :
                            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>'
                        }
                    </div>
                    <div class="ukpa-chatbot-text">
                        ${escapeHtml(text)}
                    </div>
                </div>
            `;
            
            messagesContainer.append(messageHtml);
            scrollToBottom();
        }
        
        function showTypingIndicator() {
            const typingHtml = `
                <div class="ukpa-chatbot-message bot ukpa-chatbot-typing">
                    <div class="ukpa-chatbot-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="ukpa-chatbot-text">
                        <div class="ukpa-chatbot-typing-dots">
                            <div class="ukpa-chatbot-typing-dot"></div>
                            <div class="ukpa-chatbot-typing-dot"></div>
                            <div class="ukpa-chatbot-typing-dot"></div>
                        </div>
                    </div>
                </div>
            `;
            
            messagesContainer.append(typingHtml);
            scrollToBottom();
        }
        
        function hideTypingIndicator() {
            messagesContainer.find('.ukpa-chatbot-typing').remove();
        }
        
        function scrollToBottom() {
            messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Close chatbot when clicking outside
        $(document).on('click', function(e) {
            if (!widget.is(e.target) && widget.has(e.target).length === 0) {
                container.removeClass('active');
                toggle.removeClass('active');
            }
        });
        
        // Prevent closing when clicking inside the container
        container.on('click', function(e) {
            e.stopPropagation();
        });
        
        // Handle window resize
        $(window).on('resize', function() {
            if (container.hasClass('active')) {
                scrollToBottom();
            }
        });
        
        // Initialize input state
        sendBtn.prop('disabled', true);
    }
    
    // Auto-initialize chatbots on dynamic content
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).hasClass('ukpa-chatbot-widget')) {
            initChatbotWidget($(e.target));
        }
    });
    
    // Handle theme changes
    $(document).on('click', '[data-theme-toggle]', function() {
        const widget = $(this).closest('.ukpa-chatbot-widget');
        const currentTheme = widget.data('theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        widget.attr('data-theme', newTheme);
        localStorage.setItem('ukpa_chatbot_theme', newTheme);
    });
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('ukpa_chatbot_theme');
    if (savedTheme) {
        $('.ukpa-chatbot-widget').attr('data-theme', savedTheme);
    }
    
    // Handle chatbot analytics (optional)
    function trackChatbotEvent(event, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chatbot_' + event, data);
        }
        
        if (typeof fbq !== 'undefined') {
            fbq('track', 'chatbot_' + event, data);
        }
    }
    
    // Track chatbot interactions
    $(document).on('click', '.ukpa-chatbot-toggle', function() {
        const widget = $(this).closest('.ukpa-chatbot-widget');
        const chatbotId = widget.data('chatbot-id');
        
        trackChatbotEvent('opened', {
            chatbot_id: chatbotId
        });
    });
    
    $(document).on('click', '.ukpa-chatbot-send', function() {
        const widget = $(this).closest('.ukpa-chatbot-widget');
        const chatbotId = widget.data('chatbot-id');
        const message = widget.find('.ukpa-chatbot-text-input').val();
        
        trackChatbotEvent('message_sent', {
            chatbot_id: chatbotId,
            message_length: message.length
        });
    });
    
    // Handle chatbot accessibility
    $(document).on('keydown', '.ukpa-chatbot-widget', function(e) {
        const widget = $(this);
        const container = widget.find('.ukpa-chatbot-container');
        const toggle = widget.find('.ukpa-chatbot-toggle');
        
        // Escape key closes chatbot
        if (e.key === 'Escape' && container.hasClass('active')) {
            container.removeClass('active');
            toggle.removeClass('active');
            toggle.focus();
        }
        
        // Tab key navigation
        if (e.key === 'Tab' && container.hasClass('active')) {
            const focusableElements = container.find('input, button, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements.first();
            const lastElement = focusableElements.last();
            
            if (e.shiftKey && document.activeElement === firstElement[0]) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement[0]) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
    
    // Add ARIA labels for accessibility
    $('.ukpa-chatbot-widget').each(function() {
        const widget = $(this);
        const toggle = widget.find('.ukpa-chatbot-toggle');
        const container = widget.find('.ukpa-chatbot-container');
        const input = widget.find('.ukpa-chatbot-text-input');
        const sendBtn = widget.find('.ukpa-chatbot-send');
        const closeBtn = widget.find('.ukpa-chatbot-close');
        
        toggle.attr({
            'aria-label': 'Open chat',
            'aria-expanded': 'false',
            'role': 'button'
        });
        
        container.attr({
            'aria-label': 'Chat window',
            'role': 'dialog'
        });
        
        input.attr({
            'aria-label': 'Type your message',
            'aria-describedby': 'ukpa-chatbot-send'
        });
        
        sendBtn.attr({
            'id': 'ukpa-chatbot-send',
            'aria-label': 'Send message'
        });
        
        closeBtn.attr({
            'aria-label': 'Close chat'
        });
        
        // Update ARIA states
        toggle.on('click', function() {
            const isActive = container.hasClass('active');
            toggle.attr('aria-expanded', isActive);
        });
    });
}); 