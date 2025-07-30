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
        const chatbotName = widget.data('chatbot-name') || 'AI Assistant';
        const sessionId = widget.data('session-id');
        const theme = widget.data('theme') || 'dark';
        const position = widget.data('position') || 'bottom-right';
        let currentSessionId = null; // Track current conversation session
        let sessionTimeout = null; // Track session timeout
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
        
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
        const backBtn = widget.find('.ukpa-chatbot-back-btn');
        const askButton = widget.find('.ukpa-chatbot-ask-button');
        
        // Ensure container is hidden by default
        container.removeClass('active');
        console.log('Chatbot initialized - Container hidden by default');
        
        // Ensure first tab is active by default
        const firstTab = widget.find('.ukpa-chatbot-tab').first();
        const firstTabPane = widget.find('.ukpa-chatbot-tab-pane').first();
        
        if (firstTab.length && firstTabPane.length) {
            // Remove active from all tabs and panes
            widget.find('.ukpa-chatbot-tab').removeClass('active');
            widget.find('.ukpa-chatbot-tab-pane').removeClass('active');
            
                    // Activate first tab and pane
        firstTab.addClass('active');
        firstTabPane.addClass('active');
        console.log('First tab activated:', firstTab.data('tab'));
        console.log('All tab panes:', widget.find('.ukpa-chatbot-tab-pane').length);
        console.log('Active tab panes after init:', widget.find('.ukpa-chatbot-tab-pane.active').length);
        }
        
        // Toggle chatbot
        toggle.on('click', function() {
            container.toggleClass('active');
            toggle.toggleClass('active');
            
            if (container.hasClass('active')) {
                // Ensure a tab is active when chatbot opens
                const activeTab = widget.find('.ukpa-chatbot-tab.active');
                const activePane = widget.find('.ukpa-chatbot-tab-pane.active');
                
                if (!activeTab.length || !activePane.length) {
                    // If no tab is active, activate the first one
                    const firstTab = widget.find('.ukpa-chatbot-tab').first();
                    const firstTabPane = widget.find('.ukpa-chatbot-tab-pane').first();
                    
                    if (firstTab.length && firstTabPane.length) {
                        widget.find('.ukpa-chatbot-tab').removeClass('active');
                        widget.find('.ukpa-chatbot-tab-pane').removeClass('active');
                        firstTab.addClass('active');
                        firstTabPane.addClass('active');
                    }
                }
                
                input.focus();
                scrollToBottom();
            }
        });
        
                // Close chatbot
        closeBtn.on('click', function() {
            container.removeClass('active');
            toggle.removeClass('active');
        });
        
        // Ask question button - expand chatbot
        askButton.on('click', function() {
            expandChatbot();
        });
        
        // Back button - collapse chatbot
        backBtn.on('click', function() {
            collapseChatbot();
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
        
        // Handle tab switching
        const tabs = widget.find('.ukpa-chatbot-tab');
        const tabPanes = widget.find('.ukpa-chatbot-tab-pane');
        
        tabs.on('click', function() {
            const tab = $(this);
            const tabName = tab.data('tab');
            
           
            // Remove active class from all tabs and panes
            tabs.removeClass('active');
            tabPanes.removeClass('active');
            
            // Add active class to clicked tab and corresponding pane
            tab.addClass('active');
            const targetPane = widget.find(`.ukpa-chatbot-tab-pane[data-tab="${tabName}"]`);
            targetPane.addClass('active');
            
            console.log('Target pane found:', targetPane.length);
            console.log('Active tab panes after:', tabPanes.filter('.active').length);
            
            // Debug: Check if all other panes are hidden
            tabPanes.each(function() {
                const pane = $(this);
                const isActive = pane.hasClass('active');
                const isVisible = pane.is(':visible');
                console.log('Pane', pane.data('tab'), '- Active:', isActive, '- Visible:', isVisible);
            });
            
            // Show history interface if switching to messages tab
            if (tabName === 'messages') {
                showHistoryInterface();
            }
            
            // Handle task completion if switching to tasks tab
            if (tabName === 'tasks') {
                initTaskCheckboxes(widget);
            }
        });
        
        // Handle search functionality
        const searchInput = widget.find('.ukpa-chatbot-search-input');
        searchInput.on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                const searchTerm = $(this).val().trim();
                if (searchTerm) {
                    // Switch to info tab and trigger search
                    widget.find('.ukpa-chatbot-tab[data-tab="info"]').click();
                    // You can add search functionality here
                    console.log('Searching for:', searchTerm);
                }
            }
        });
        
        // Expansion and collapse functions
        function expandChatbot() {
            console.log('Expanding chatbot...');
            // Make sure container is active first
            if (!container.hasClass('active')) {
                container.addClass('active');
                toggle.addClass('active');
            }
            container.addClass('expanded');
            backBtn.show();
            
            // Test if expanded class was applied
            setTimeout(() => {
                console.log('Container has expanded class:', container.hasClass('expanded'));
                console.log('Container is visible:', container.is(':visible'));
                console.log('Container display:', container.css('display'));
                console.log('Container dimensions:', container.width(), 'x', container.height());
            }, 100);
            
            // Switch to messages tab and show history interface
            const messagesTab = widget.find('.ukpa-chatbot-tab[data-tab="messages"]');
            const messagesPane = widget.find('.ukpa-chatbot-tab-pane[data-tab="messages"]');
            
            // Remove active from all tabs and panes
            widget.find('.ukpa-chatbot-tab').removeClass('active');
            widget.find('.ukpa-chatbot-tab-pane').removeClass('active');
            
            // Activate messages tab and pane
            messagesTab.addClass('active');
            messagesPane.addClass('active');
            
            // Show history interface
            showHistoryInterface();
            
            console.log('Chatbot expanded successfully');
        }
        
        function collapseChatbot() {
            container.removeClass('expanded');
            backBtn.hide();
            
            // Save current session before collapsing
            if (currentSessionId) {
                saveCurrentSession();
            }
        }
        
        // Handle menu item clicks
        widget.find('.ukpa-chatbot-menu-item').on('click', function(e) {
            e.preventDefault();
            const menuText = $(this).find('.ukpa-chatbot-menu-item-title').text();
            
            switch(menuText) {
                case 'Ask a question':
                    expandChatbot();
                    break;
                case 'Start Calculating':
                    widget.find('.ukpa-chatbot-tab[data-tab="calculators"]').click();
                    break;
                case 'Calculator Help & FAQ':
                    widget.find('.ukpa-chatbot-tab[data-tab="info"]').click();
                    break;
                case 'Learning Tasks':
                    widget.find('.ukpa-chatbot-tab[data-tab="calculators"]').click();
                    break;
                default:
                    console.log('Menu item clicked:', menuText);
            }
        });
        
        function sendMessage() {
            // Get the current active input field
            const currentInput = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-text-input');
            const message = currentInput.val().trim();
            
            if (!message) {
                return;
            }
            
            console.log('Sending message:', message);
            
            // Ensure chatbot is expanded for conversation
            if (!container.hasClass('expanded')) {
                if (!container.hasClass('active')) {
                    container.addClass('active');
                    toggle.addClass('active');
                }
                container.addClass('expanded');
                backBtn.show();
            }
            
            // Start new session if not already started
            if (!currentSessionId) {
                startNewSession();
            } else {
                resetSessionTimeout();
            }
            
            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input
            currentInput.val('');
            
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
                    session_id: currentSessionId,
                    nonce: ukpa_chatbot_frontend.nonce
                },
                success: function(response) {
                    hideTypingIndicator();
                    console.log('Chatbot response:', response);
                    
                    if (response.success) {
                        let data = response.data;
                        
                        // Parse the response if it's a JSON string
                        if (typeof data.response === 'string') {
                            try {
                                const parsedData = JSON.parse(data.response);
                                data = parsedData;
                                console.log('Parsed response data:', data);
                            } catch (e) {
                                console.log('Response is not JSON, treating as plain text');
                                // If it's not JSON, treat it as a plain text response
                                addMessage(data.response, 'bot');
                                setTimeout(() => saveCurrentSession(), 100);
                                return;
                            }
                        }
                        
                        // Handle different response types from backend
                        if (data.type === 'form' && data.calculator) {
                            // Show calculator form
                            if (data.answer) {
                                addMessage(data.answer, 'bot');
                            }
                            showCalculatorForm(data.calculator);
                        } else if (data.totalTax !== undefined) {
                            // Show calculation result
                            showCalculationResult(data);
                        } else if (data.type === 'calculator-confirm') {
                            // Show confirmation message with suggested actions
                            addMessage(data.answer, 'bot');
                            if (data.suggestedActions && data.suggestedActions.length > 0) {
                                showSuggestedActions(data.suggestedActions);
                            }
                        } else {
                            // Regular response
                            const messageText = data.answer || data.response || 'I understand your request.';
                            addMessage(messageText, 'bot');
                            
                            // Show suggested actions if available
                            if (data.suggestedActions && data.suggestedActions.length > 0) {
                                showSuggestedActions(data.suggestedActions);
                            }
                        }
                        
                        // Save session after each message
                        setTimeout(() => saveCurrentSession(), 100);
                    } else {
                        // Show error message
                        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                    }
                },
                error: function(xhr, status, error) {
                    hideTypingIndicator();
                    console.error('Chatbot AJAX Error:', {
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        statusCode: xhr.status
                    });
                    addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                }
            });
        }
        
        function addMessage(text, sender) {
            // Only add messages if chatbot is expanded
            if (!container.hasClass('expanded')) {
                return;
            }
            
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
            
            // Get the current active messages container
            const currentMessagesContainer = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-messages-list');
            
            // Add new messages at the end (normal conversation flow)
            currentMessagesContainer.append(messageHtml);
            
            // Scroll to show the new message
            const newMessage = currentMessagesContainer.find('.ukpa-chatbot-message').last();
            if (newMessage.length > 0) {
                newMessage[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        function showTypingIndicator() {
            // Only show typing indicator if chatbot is expanded
            if (!container.hasClass('expanded')) {
                return;
            }
            
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
            
            // Get the current active messages container
            const currentMessagesContainer = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-messages-list');
            
            // Add typing indicator at the end
            currentMessagesContainer.append(typingHtml);
            
            // Scroll to show the typing indicator
            const typingIndicator = currentMessagesContainer.find('.ukpa-chatbot-typing');
            if (typingIndicator.length > 0) {
                typingIndicator[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        function hideTypingIndicator() {
            // Remove typing indicator from all message containers
            widget.find('.ukpa-chatbot-typing').remove();
        }
        
        function scrollToBottom() {
            messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function showCalculatorForm(calculator) {
            console.log('Showing calculator form:', calculator);
            
            // Get the current active messages container
            const currentMessagesContainer = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-messages-list');
            
            // Group fields into pairs for 2-column layout
            const fields = calculator.fields || [];
            const fieldPairs = [];
            for (let i = 0; i < fields.length; i += 2) {
                fieldPairs.push(fields.slice(i, i + 2));
            }
            
            const formHtml = `
                <div class="ukpa-chatbot-calculator-form" style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin: 12px 0; border: 1px solid rgba(255,255,255,0.2); animation: formSlideIn 0.5s ease-out;">
                    <div class="ukpa-chatbot-form-header" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <div class="ukpa-chatbot-form-indicator" style="width: 4px; height: 20px; background: linear-gradient(180deg, #00ff88, #007cba); border-radius: 2px;"></div>
                        <h4 style="margin: 0; color: white; font-size: 16px;">${calculator.name} Calculator</h4>
                        <div class="ukpa-chatbot-form-pulse" style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: formPulse 2s infinite;"></div>
                    </div>
                    <form class="ukpa-chatbot-form">
                        ${fieldPairs.map(pair => `
                            <div class="ukpa-chatbot-form-row" style="display: flex; gap: 8px; margin-bottom: 8px;">
                                ${pair.map(field => `
                                    <div class="ukpa-chatbot-form-field" style="flex: 1; min-width: 0;">
                                        <label style="display: block; margin-bottom: 2px; color: white; font-size: 12px; font-weight: 500;">${field.label}</label>
                                        ${field.type === 'select' ? 
                                            `<select name="${field.key}" ${field.required ? 'required' : ''} style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; font-size: 12px;">
                                                <option value="">Select ${field.label}</option>
                                                ${field.options ? field.options.map(option => `<option value="${option}">${option}</option>`).join('') : ''}
                                            </select>` :
                                            `<input type="${field.type}" name="${field.key}" placeholder="${field.label}" ${field.required ? 'required' : ''} style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; font-size: 12px;">`
                                        }
                                    </div>
                                `).join('')}
                                ${pair.length === 1 ? '<div class="ukpa-chatbot-form-field" style="flex: 1; min-width: 0;"></div>' : ''}
                            </div>
                        `).join('')}
                        <button type="submit" class="ukpa-chatbot-form-submit" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 8px; transition: all 0.3s ease;">Calculate</button>
                    </form>
                </div>
            `;
            
            currentMessagesContainer.append(formHtml);
            
            // Scroll to the form with a slight delay to ensure it's rendered
            setTimeout(() => {
                const formElement = currentMessagesContainer.find('.ukpa-chatbot-calculator-form').last();
                if (formElement.length > 0) {
                    formElement[0].scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 100);
            
            // Add a subtle highlight effect to draw attention
            setTimeout(() => {
                const formElement = currentMessagesContainer.find('.ukpa-chatbot-calculator-form').last();
                formElement.addClass('form-highlight');
                setTimeout(() => formElement.removeClass('form-highlight'), 2000);
            }, 200);
            
            // Handle form submission
            currentMessagesContainer.find('.ukpa-chatbot-form').on('submit', function(e) {
                e.preventDefault();
                console.log('Form submitted');
                
                const form = $(this);
                const submitButton = form.find('.ukpa-chatbot-form-submit');
                const originalButtonText = submitButton.text();
                
                // Show loading state
                submitButton.text('Calculating...').prop('disabled', true).addClass('calculating');
                
                const formData = form.serializeArray();
                const data = {};
                formData.forEach(item => data[item.name] = item.value);
                data.calculator = calculator.name.toLowerCase();
                
                console.log('Form data:', data);
                
                // Send form data directly to backend (not through WordPress AJAX)
                $.ajax({
                    url: ukpa_chatbot_frontend.backend_url,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    headers: {
                        'X-Plugin-Auth': ukpa_chatbot_frontend.api_token
                    },
                    success: function(response) {
                        console.log('Direct backend response:', response);
                        
                        // Reset button state
                        submitButton.text(originalButtonText).prop('disabled', false).removeClass('calculating');
                        
                        // Check if it's a calculation result
                        if (response.totalTax !== undefined) {
                            showCalculationResult(response);
                        } else if (response.answer) {
                            addMessage(response.answer, 'bot');
                        } else {
                            addMessage('Calculation completed successfully!', 'bot');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Direct backend error:', error);
                        console.error('Response:', xhr.responseText);
                        
                        // Reset button state
                        submitButton.text(originalButtonText).prop('disabled', false).removeClass('calculating');
                        
                        // Fallback to WordPress AJAX if direct call fails
                        $.ajax({
                            url: ukpa_chatbot_frontend.ajaxurl,
                            type: 'POST',
                            data: {
                                action: 'ukpa_chatbot_message',
                                chatbot_id: chatbotId,
                                message: JSON.stringify(data),
                                session_id: currentSessionId,
                                nonce: ukpa_chatbot_frontend.nonce
                            },
                            success: function(wpResponse) {
                                console.log('WordPress AJAX response:', wpResponse);
                                if (wpResponse.success) {
                                    const wpData = wpResponse.data;
                                    if (wpData.totalTax !== undefined) {
                                        showCalculationResult(wpData);
                                    } else {
                                        addMessage(wpData.response || 'Calculation completed', 'bot');
                                    }
                                } else {
                                    addMessage('Sorry, there was an error with the calculation. Please try again.', 'bot');
                                }
                            },
                            error: function(wpXhr, wpStatus, wpError) {
                                console.error('WordPress AJAX error:', wpError);
                                addMessage('Sorry, there was an error with the calculation. Please try again.', 'bot');
                            }
                        });
                    }
                });
            });
        }
        
        function showCalculationResult(result) {
            console.log('Showing calculation result:', result);
            
            // Get the current active messages container
            const currentMessagesContainer = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-messages-list');
            
            const resultHtml = `
                <div class="ukpa-chatbot-calculation-result" style="background: rgba(0,124,186,0.2); border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid rgba(0,124,186,0.4); animation: resultSlideIn 0.5s ease-out;">
                    <div class="ukpa-chatbot-result-header" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <div class="ukpa-chatbot-result-indicator" style="width: 4px; height: 20px; background: linear-gradient(180deg, #00ff88, #007cba); border-radius: 2px;"></div>
                        <h4 style="margin: 0; color: white; font-size: 18px;">Calculation Result</h4>
                        <div class="ukpa-chatbot-result-pulse" style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: resultPulse 2s infinite;"></div>
                    </div>
                    <div class="ukpa-chatbot-result-content">
                        <div class="ukpa-chatbot-total-tax" style="margin-bottom: 12px;">
                            <strong style="color: #00ff88; font-size: 20px;">Total Tax: £${result.totalTax.toLocaleString()}</strong>
                        </div>
                        ${result.breakdown ? `
                            <div class="ukpa-chatbot-breakdown">
                                <h5 style="color: white; margin-bottom: 8px;">Breakdown:</h5>
                                <ul style="color: white; margin: 0; padding-left: 20px;">
                                    ${Object.entries(result.breakdown).map(([key, value]) => 
                                        `<li style="margin-bottom: 4px;">${key}: £${value.toLocaleString()}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${result.suggestedActions && result.suggestedActions.length > 0 ? `
                            <div class="ukpa-chatbot-result-actions" style="margin-top: 16px;">
                                ${result.suggestedActions.map(action => `
                                    <button class="ukpa-chatbot-action-btn" data-action="${action.value}" style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-right: 8px; cursor: pointer;">
                                        ${action.label}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            currentMessagesContainer.append(resultHtml);
            
            // Scroll to the result with a slight delay to ensure it's rendered
            setTimeout(() => {
                const resultElement = currentMessagesContainer.find('.ukpa-chatbot-calculation-result').last();
                if (resultElement.length > 0) {
                    resultElement[0].scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 100);
            
            // Add a highlight effect to draw attention
            setTimeout(() => {
                const resultElement = currentMessagesContainer.find('.ukpa-chatbot-calculation-result').last();
                resultElement.addClass('result-highlight');
                setTimeout(() => resultElement.removeClass('result-highlight'), 3000);
            }, 200);
            
            // Handle result action button clicks
            currentMessagesContainer.find('.ukpa-chatbot-result-actions .ukpa-chatbot-action-btn').on('click', function() {
                const action = $(this).data('action');
                console.log('Result action clicked:', action);
                
                // Send the action as a message
                const input = widget.find('.ukpa-chatbot-text-input');
                input.val(action);
                sendMessage();
            });
        }
        
        function showSuggestedActions(actions) {
            console.log('Showing suggested actions:', actions);
            
            // Get the current active messages container
            const currentMessagesContainer = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-messages-list');
            
            // Find the last bot message to attach suggestions to it
            const lastBotMessage = currentMessagesContainer.find('.ukpa-chatbot-message.bot').last();
            
            if (lastBotMessage.length > 0) {
                // Create suggestions container that hangs with the message
                const suggestionsHtml = `
                    <div class="ukpa-chatbot-suggestions-hanging">
                        <div class="ukpa-chatbot-suggestions-connector"></div>
                        <div class="ukpa-chatbot-suggestions-container">
                            ${actions.map(action => `
                                <button class="ukpa-chatbot-suggestion-chip" data-action="${action.value}">
                                    <span class="ukpa-chatbot-suggestion-text">${action.label}</span>
                                    <div class="ukpa-chatbot-suggestion-highlight"></div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                // Append suggestions after the last bot message
                lastBotMessage.after(suggestionsHtml);
                
                // Add highlighting animation
                setTimeout(() => {
                    currentMessagesContainer.find('.ukpa-chatbot-suggestion-chip').addClass('highlighted');
                }, 100);
                
                // Handle suggested action button clicks
                currentMessagesContainer.find('.ukpa-chatbot-suggestion-chip').on('click', function() {
                    const action = $(this).data('action');
                    console.log('Suggestion clicked:', action);
                    
                    // Add click animation
                    $(this).addClass('clicked');
                    
                    // Send the action as a message
                    const input = widget.find('.ukpa-chatbot-text-input');
                    input.val(action);
                    sendMessage();
                });
            } else {
                // Fallback: append to container if no bot message found
                const actionsHtml = `
                    <div class="ukpa-chatbot-suggested-actions">
                        ${actions.map(action => `
                            <button class="ukpa-chatbot-action-btn" data-action="${action.value}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                `;
                
                currentMessagesContainer.append(actionsHtml);
                
                // Handle suggested action button clicks
                currentMessagesContainer.find('.ukpa-chatbot-action-btn').on('click', function() {
                    const action = $(this).data('action');
                    console.log('Action button clicked:', action);
                    
                    // Send the action as a message
                    const input = widget.find('.ukpa-chatbot-text-input');
                    input.val(action);
                    sendMessage();
                });
            }
            
            scrollToBottom();
        }
        
        function initTaskCheckboxes(widget) {
            const taskCheckboxes = widget.find('.ukpa-chatbot-task-checkbox input[type="checkbox"]');
            taskCheckboxes.on('change', function() {
                const checkbox = $(this);
                const taskItem = checkbox.closest('.ukpa-chatbot-task-item');
                const isCompleted = checkbox.is(':checked');
                
                if (isCompleted) {
                    taskItem.addClass('completed');
                } else {
                    taskItem.removeClass('completed');
                }
                
                // You can add AJAX call here to save task completion status
                // saveTaskCompletion(checkbox.data('task-id'), isCompleted);
            });
        }
        
        // Initialize search functionality
        function initSearch(widget) {
            const searchInput = widget.find('#ukpa-chatbot-search-input');
            if (searchInput.length) {
                searchInput.on('input', function() {
                    const query = $(this).val().toLowerCase();
                    searchCategories(widget, query);
                });
            }
        }
        
        // Search categories
        function searchCategories(widget, query) {
            const categories = widget.find('.ukpa-chatbot-category');
            categories.each(function() {
                const category = $(this);
                const title = category.find('.ukpa-chatbot-category-title').text().toLowerCase();
                const description = category.find('.ukpa-chatbot-category-description').text().toLowerCase();
                
                if (title.includes(query) || description.includes(query)) {
                    category.show();
                } else {
                    category.hide();
                }
            });
        }
        
        // Initialize category expansion
        function initCategoryExpansion(widget) {
            widget.find('.ukpa-chatbot-category-header').on('click', function() {
                const category = $(this).closest('.ukpa-chatbot-category');
                const subcategories = category.find('.ukpa-chatbot-subcategories');
                const arrow = category.find('.ukpa-chatbot-category-arrow');
                
                if (subcategories.is(':visible')) {
                    subcategories.slideUp(200);
                    category.removeClass('expanded');
                } else {
                    subcategories.slideDown(200);
                    category.addClass('expanded');
                }
            });
        }
        
        // Initialize suggestion chips
        function initSuggestionChips(widget) {
            widget.find('.ukpa-chatbot-suggestion-chip').on('click', function() {
                const suggestion = $(this).text().replace(/"/g, '');
                expandChatbot();
                
                // Set the suggestion as the input value
                setTimeout(() => {
                    const input = widget.find('.ukpa-chatbot-text-input');
                    if (input.length) {
                        input.val(suggestion);
                        input.focus();
                    }
                }, 300);
            });
        }
        
        // Initialize chat history system
        initializeChatHistory();
        
        // Make startNewConversation globally accessible
        window.startNewConversation = startNewConversation;
        
        // More robust event binding for Start Conversation button
        $(document).on('click', '.ukpa-chatbot-start-conversation', function(e) {
            e.preventDefault();
            e.stopPropagation();
            startNewConversation();
        });
        
        // Handle Start Conversation button in empty state
        widget.on('click', '.ukpa-chatbot-start-conversation', function(e) {
            console.log('Start Conversation button clicked!');
            e.preventDefault();
            e.stopPropagation();
            startNewConversation();
        });
        
        // Handle chat session clicks
        widget.on('click', '.ukpa-chatbot-chat-session', function() {
            const sessionId = $(this).data('session-id');
            restartConversation(sessionId);
        });
        
        // Handle "Ask a question" button (removed since we removed the button)
        // widget.on('click', '.ukpa-chatbot-ask-button', function() {
        //     console.log('Ask a question button clicked!');
        //     startNewConversation();
        // });
        
        // Handle "Clear History" button (using event delegation)
        $(document).on('click', '.ukpa-chatbot-clear-history', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clear history button clicked!');
            console.log('Chatbot ID:', chatbotId);
            console.log('Cookie name:', 'ukpa_chatbot_history_' + chatbotId);
            
            if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                // Clear the cookie using multiple methods
                const cookieName = 'ukpa_chatbot_history_' + chatbotId;
                console.log('Clearing cookie:', cookieName);
                
                // Method 1: Set to expire immediately
                setCookie(cookieName, '', -1);
                
                // Method 2: Direct cookie deletion
                document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                // Method 3: Clear from localStorage as well (if used)
                localStorage.removeItem(cookieName);
                
                console.log('Cookie cleared using multiple methods');
                
                // Clear the display
                const historyContainer = widget.find('.ukpa-chatbot-message-history');
                const emptyState = widget.find('.ukpa-chatbot-empty-state');
                console.log('History container found:', historyContainer.length > 0);
                console.log('Empty state found:', emptyState.length > 0);
                
                historyContainer.removeClass('has-history').html('');
                emptyState.show();
                
                // Clear current session
                currentSessionId = null;
                
                console.log('Chat history cleared');
                
                // Force reload the history display
                setTimeout(() => {
                    loadChatHistory();
                    updateMessageTabDisplay();
                }, 100);
            }
        });
        
        // Handle "Start New Conversation" button
        $(document).on('click', '.ukpa-chatbot-start-new', function() {
            console.log('Start new conversation button clicked!');
            startNewConversation();
        });
        
        // Handle "Ask a question" button in history - using widget context
        widget.on('click', '.ukpa-chatbot-ask-question-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Ask question button clicked!');
            startNewConversation();
        });
        
        // Handle clicking on chat session to resume conversation - using widget context
        widget.on('click', '.ukpa-chatbot-chat-session', function() {
            const sessionId = $(this).data('session-id');
            console.log('Resuming session:', sessionId);
            resumeConversation(sessionId);
        });
        
        // Session management functions
        function startNewSession() {
            currentSessionId = 'session_' + Date.now();
            resetSessionTimeout();
            console.log('New session started:', currentSessionId);
        }
        
        function resetSessionTimeout() {
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }
            sessionTimeout = setTimeout(() => {
                console.log('Session timeout - saving current session');
                saveCurrentSession();
                currentSessionId = null;
            }, SESSION_TIMEOUT);
        }
        
        function saveCurrentSession() {
            if (!currentSessionId) return;
            
            const messagesContainer = widget.find('.ukpa-chatbot-messages-list');
            const messages = [];
            
            messagesContainer.find('.ukpa-chatbot-message').each(function() {
                const messageEl = $(this);
                const isBot = messageEl.hasClass('bot');
                const text = messageEl.find('.ukpa-chatbot-text').text().trim();
                
                if (text && !messageEl.hasClass('welcome')) {
                    messages.push({
                        text: text,
                        sender: isBot ? 'bot' : 'user',
                        timestamp: Date.now()
                    });
                }
            });
            
            if (messages.length > 0) {
                const session = {
                    id: currentSessionId,
                    messages: messages,
                    lastActivity: Date.now(),
                    unread: false
                };
                
                saveSessionToHistory(session);
            }
        }
        
        function getChatHistory() {
            const chatHistory = getCookie('ukpa_chatbot_history_' + chatbotId);
            if (chatHistory) {
                try {
                    return JSON.parse(chatHistory);
                } catch (e) {
                    console.error('Error parsing chat history:', e);
                    return [];
                }
            }
            return [];
        }
        
        function saveSessionToHistory(session) {
            const history = getChatHistory();
            const existingIndex = history.findIndex(s => s.id === session.id);
            
            if (existingIndex >= 0) {
                history[existingIndex] = session;
            } else {
                history.unshift(session); // Add to beginning
            }
            
            // Keep only last 10 sessions
            if (history.length > 10) {
                history.splice(10);
            }
            
            saveChatHistory(history);
        }
        
        function resumeConversation(sessionId) {
            console.log('Resuming conversation for session:', sessionId);
            currentSessionId = sessionId;
            resetSessionTimeout();
            
            // Always expand chatbot for conversation interface
            if (!container.hasClass('active')) {
                container.addClass('active');
                toggle.addClass('active');
            }
            container.addClass('expanded');
            backBtn.show();
            
            // Switch to messages tab if not already
            const messagesTab = widget.find('.ukpa-chatbot-tab[data-tab="messages"]');
            if (!messagesTab.hasClass('active')) {
                widget.find('.ukpa-chatbot-tab').removeClass('active');
                widget.find('.ukpa-chatbot-tab-pane').removeClass('active');
                messagesTab.addClass('active');
                widget.find('.ukpa-chatbot-tab-pane[data-tab="messages"]').addClass('active');
            }
            
            showConversationInterface();
            
            // Wait a moment for the interface to be set up, then load messages
            setTimeout(() => {
                loadSessionMessages(sessionId);
            }, 100);
        }
        
        function initializeChatHistory() {
            loadChatHistory();
            updateMessageTabDisplay();
        }
        
        function loadChatHistory() {
            const chatHistory = getCookie('ukpa_chatbot_history_' + chatbotId);
            console.log('Loading chat history for chatbot:', chatbotId);
            console.log('Chat history cookie:', chatHistory ? 'found' : 'not found');
            
            if (chatHistory) {
                try {
                    const history = JSON.parse(chatHistory);
                    console.log('Parsed history:', history);
                    displayChatHistory(history);
                } catch (e) {
                    console.error('Error parsing chat history:', e);
                    displayChatHistory([]); // Show empty state if parsing fails
                }
            } else {
                // No history found, show empty state
                console.log('No history found, showing empty state');
                displayChatHistory([]);
            }
        }
        
        function displayChatHistory(history) {
            console.log('displayChatHistory called with:', history);
            const historyContainer = widget.find('.ukpa-chatbot-message-history');
            const emptyState = widget.find('.ukpa-chatbot-empty-state');
            console.log('History container found:', historyContainer.length);
            console.log('Empty state found:', emptyState.length);
            
            if (history && history.length > 0) {
                let historyHtml = '';
                history.forEach(session => {
                    const lastMessage = session.messages[session.messages.length - 1];
                    const preview = lastMessage ? lastMessage.text.substring(0, 60) + (lastMessage.text.length > 60 ? '...' : '') : 'No messages';
                    const timeAgo = getTimeAgo(session.lastActivity);
                    const hasUnread = session.unread || false;
                    const messageCount = session.messages ? session.messages.length : 0;
                    
                    historyHtml += `
                        <div class="ukpa-chatbot-chat-session" data-session-id="${session.id}" style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;">
                            <div class="ukpa-chatbot-chat-session-avatar" style="margin-right: 12px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="ukpa-chatbot-chat-session-content" style="flex: 1;">
                                <div class="ukpa-chatbot-chat-session-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <div class="ukpa-chatbot-chat-session-title" style="font-weight: 500;">${chatbotName}</div>
                                    <div class="ukpa-chatbot-chat-session-time" style="font-size: 12px; opacity: 0.7;">${timeAgo}</div>
                                </div>
                                <div class="ukpa-chatbot-chat-session-preview" style="font-size: 14px; opacity: 0.8; margin-bottom: 4px;">${preview}</div>
                                <div class="ukpa-chatbot-chat-session-meta" style="font-size: 12px; opacity: 0.6;">${messageCount} messages</div>
                            </div>
                            ${hasUnread ? '<div class="ukpa-chatbot-chat-session-unread" style="width: 8px; height: 8px; background: #007cba; border-radius: 50%; margin-left: 8px;"></div>' : ''}
                        </div>
                    `;
                });
                
                // Add "Ask a question" button at the bottom
                historyHtml += `
                    <div class="ukpa-chatbot-ask-button-container" style="margin-top: 20px; text-align: center;">
                        <button class="ukpa-chatbot-ask-question-btn" style="background: white; color: #333; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; margin: 0 auto;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                            Ask a question
                        </button>
                    </div>
                `;
                
                historyContainer.html(historyHtml);
                historyContainer.addClass('has-history');
                emptyState.hide();
                
                // Add direct click handler as backup
                const askButton = historyContainer.find('.ukpa-chatbot-ask-question-btn');
                if (askButton.length > 0) {
                    askButton.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        startNewConversation();
                    });
                }
                
                // Add click handlers for chat sessions
                historyContainer.find('.ukpa-chatbot-chat-session').on('click', function() {
                    const sessionId = $(this).data('session-id');
                    console.log('Chat session clicked:', sessionId);
                    resumeConversation(sessionId);
                });
            } else {
                historyContainer.removeClass('has-history').html('');
                emptyState.html(`
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="margin-bottom: 20px;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.5;">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <p style="margin-bottom: 20px; opacity: 0.7;">No conversations yet</p>
                        <button class="ukpa-chatbot-start-new" style="background: white; color: #333; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; margin: 0 auto;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                            Start New Conversation
                        </button>
                    </div>
                `).show();
                
                console.log('Empty state shown with content');
                
                // Add direct click handler as backup
                const startNewButton = emptyState.find('.ukpa-chatbot-start-new');
                if (startNewButton.length > 0) {
                    startNewButton.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        startNewConversation();
                    });
                }
            }
        }
        
        function startNewConversation() {
            console.log('startNewConversation function called');
            
            // Switch to messages tab if not already
            const messagesTab = widget.find('.ukpa-chatbot-tab[data-tab="messages"]');
            
            if (!messagesTab.hasClass('active')) {
                messagesTab.click();
            }
            
            // Always expand chatbot for conversation interface
            console.log('Expanding chatbot for conversation...');
            if (!container.hasClass('active')) {
                container.addClass('active');
                toggle.addClass('active');
            }
            container.addClass('expanded');
            backBtn.show();
            
            // Remove active from all tabs and panes
            widget.find('.ukpa-chatbot-tab').removeClass('active');
            widget.find('.ukpa-chatbot-tab-pane').removeClass('active');
            
            // Activate messages tab and pane
            messagesTab.addClass('active');
            widget.find('.ukpa-chatbot-tab-pane[data-tab="messages"]').addClass('active');
            
            // Create new session
            currentSessionId = 'session_' + Date.now();
            
            // Show conversation interface
            showConversationInterface();
        }
        
        function showConversationInterface() {
            console.log('showConversationInterface called');
            const messagesPane = widget.find('.ukpa-chatbot-tab-pane[data-tab="messages"]');
            console.log('Messages pane found:', messagesPane.length);
            
            // Clear the pane and show conversation interface
            messagesPane.html(`
                <div class="ukpa-chatbot-conversation-header" style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div class="ukpa-chatbot-back-btn" style="cursor: pointer; padding: 8px; margin-right: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="ukpa-chatbot-conversation-title" style="flex: 1;">
                        <div style="display: flex; align-items: center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                            <span>${chatbotName} AI Agent</span>
                        </div>
                    </div>
                    <div class="ukpa-chatbot-minimize-btn" style="cursor: pointer; padding: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 13H5v-2h14v2z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
                <div class="ukpa-chatbot-messages-list" style="flex: 1; overflow-y: auto; padding: 16px;">
                    <div class="ukpa-chatbot-message bot welcome">
                        <div class="ukpa-chatbot-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="ukpa-chatbot-text">
                            Hi there, you're speaking with UKPA AI Agent.
                        </div>
                    </div>
                </div>
                <div class="ukpa-chatbot-input-container" style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div class="ukpa-chatbot-input" style="display: flex; align-items: center; background: rgba(255,255,255,0.1); border-radius: 24px; padding: 8px 16px;">
                        <div style="display: flex; align-items: center; margin-right: 12px;">
                            <button class="ukpa-chatbot-emoji-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 4px; margin-right: 8px;">😊</button>
                            <button class="ukpa-chatbot-gif-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 4px; margin-right: 8px;">GIF</button>
                            <button class="ukpa-chatbot-attach-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">📎</button>
                        </div>
                        <input type="text" placeholder="Ask a question..." class="ukpa-chatbot-text-input" style="flex: 1; background: none; border: none; color: white; outline: none; font-size: 14px;">
                        <button class="ukpa-chatbot-send" style="background: none; border: none; color: white; cursor: pointer; padding: 8px; border-radius: 50%;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="ukpa-chatbot-privacy-banner" style="background: rgba(255,255,255,0.05); padding: 8px 16px; font-size: 12px; color: rgba(255,255,255,0.7); text-align: center;">
                    By chatting with us, you agree to the monitoring and recording of this chat to deliver our services and processing of your personal data in accordance with our Privacy Policy. <a href="#" style="color: white; text-decoration: underline;">See our Privacy Policy</a>
                    <button class="ukpa-chatbot-close-privacy" style="background: none; border: none; color: white; cursor: pointer; float: right; font-size: 16px;">×</button>
                </div>
            `);
            
            // Bind events for the new interface
            bindConversationEvents();
        }
        
        function bindConversationEvents() {
            // Back button to return to history
            widget.find('.ukpa-chatbot-back-btn').on('click', function() {
                showHistoryInterface();
            });
            
            // Minimize button to collapse chatbot
            widget.find('.ukpa-chatbot-minimize-btn').on('click', function() {
                collapseChatbot();
            });
            
            // Close privacy banner
            widget.find('.ukpa-chatbot-close-privacy').on('click', function() {
                widget.find('.ukpa-chatbot-privacy-banner').hide();
            });
            
            // Send button
            widget.find('.ukpa-chatbot-send').on('click', function() {
                sendMessage();
            });
            
            // Enter key to send
            widget.find('.ukpa-chatbot-text-input').on('keypress', function(e) {
                if (e.which === 13 && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        function showHistoryInterface() {
            const messagesPane = widget.find('.ukpa-chatbot-tab-pane[data-tab="messages"]');
            
            // Clear the pane and show history interface
            messagesPane.html(`
                <div class="ukpa-chatbot-message-history" style="flex: 1; overflow-y: auto; padding: 16px;"></div>
                <div class="ukpa-chatbot-empty-state" style="display: none; text-align: center; padding: 40px 20px;">
                    <p>No conversations yet</p>
                </div>
            `);
            
            // Load and display history
            loadChatHistory();
        }
        
        function restartConversation(sessionId) {
            // Switch to messages tab
            const messagesTab = widget.find('.ukpa-chatbot-tab[data-tab="messages"]');
            if (!messagesTab.hasClass('active')) {
                messagesTab.click();
            }
            
            // Expand chatbot
            if (!container.hasClass('expanded')) {
                expandChatbot();
            }
            
            // Load session messages
            currentSessionId = sessionId;
            loadSessionMessages(sessionId);
            
            // Ensure input field exists
            const messagesPane = widget.find('.ukpa-chatbot-tab-pane[data-tab="messages"]');
            let inputContainer = messagesPane.find('.ukpa-chatbot-input');
            
            if (inputContainer.length === 0) {
                const inputHtml = `
                    <div class="ukpa-chatbot-input">
                        <input type="text" placeholder="Type your message..." class="ukpa-chatbot-text-input">
                        <button class="ukpa-chatbot-send">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                `;
                messagesPane.append(inputHtml);
                
                // Re-bind events for new input
                const newInput = messagesPane.find('.ukpa-chatbot-text-input');
                const newSendBtn = messagesPane.find('.ukpa-chatbot-send');
                
                newInput.on('keypress', function(e) {
                    if (e.which === 13 && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });
                
                newSendBtn.on('click', sendMessage);
            }
            
            // Focus input
            setTimeout(function() {
                const inputField = messagesPane.find('.ukpa-chatbot-text-input');
                if (inputField.length) {
                    inputField.focus();
                }
            }, 200);
        }
        
        function loadSessionMessages(sessionId) {
            console.log('Loading session messages for session:', sessionId);
            const chatHistory = getCookie('ukpa_chatbot_history_' + chatbotId);
            if (chatHistory) {
                try {
                    const history = JSON.parse(chatHistory);
                    const session = history.find(s => s.id === sessionId);
                    if (session) {
                        console.log('Found session:', session);
                        
                        // Clear the messages list but keep the welcome message
                        const messagesList = widget.find('.ukpa-chatbot-messages-list');
                        messagesList.find('.ukpa-chatbot-message:not(.welcome)').remove();
                        
                        // Add all messages from the session
                        session.messages.forEach(msg => {
                            const messageHtml = `
                                <div class="ukpa-chatbot-message ${msg.sender}">
                                    <div class="ukpa-chatbot-avatar">
                                        ${msg.sender === 'bot' ? 
                                            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/></svg>' :
                                            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>'
                                        }
                                    </div>
                                    <div class="ukpa-chatbot-text">
                                        ${escapeHtml(msg.text)}
                                    </div>
                                </div>
                            `;
                            messagesList.append(messageHtml);
                        });
                        
                        // Scroll to bottom to show latest messages
                        scrollToBottom();
                        
                        // Mark as read
                        session.unread = false;
                        saveChatHistory(history);
                        updateMessageTabDisplay();
                        
                        console.log('Session messages loaded successfully');
                    } else {
                        console.log('Session not found:', sessionId);
                    }
                } catch (e) {
                    console.error('Error loading session messages:', e);
                }
            } else {
                console.log('No chat history found');
            }
        }
        
        function clearCurrentChat() {
            const messagesContainer = widget.find('.ukpa-chatbot-tab-pane.active .ukpa-chatbot-messages-list');
            messagesContainer.find('.ukpa-chatbot-message:not(.welcome)').remove();
        }
        
        function saveMessageToHistory(message, sender) {
            const chatHistory = getCookie('ukpa_chatbot_history_' + chatbotId);
            let history = chatHistory ? JSON.parse(chatHistory) : [];
            
            let session = history.find(s => s.id === currentSessionId);
            if (!session) {
                session = {
                    id: currentSessionId,
                    messages: [],
                    lastActivity: new Date().toISOString(),
                    unread: false
                };
                history.unshift(session);
            }
            
            session.messages.push({
                text: message,
                sender: sender,
                timestamp: new Date().toISOString()
            });
            session.lastActivity = new Date().toISOString();
            
            saveChatHistory(history);
            updateMessageTabDisplay();
        }
        
        function saveChatHistory(history) {
            setCookie('ukpa_chatbot_history_' + chatbotId, JSON.stringify(history), 30); // 30 days
        }
        
        function updateMessageTabDisplay() {
            const chatHistory = getCookie('ukpa_chatbot_history_' + chatbotId);
            if (chatHistory) {
                try {
                    const history = JSON.parse(chatHistory);
                    displayChatHistory(history);
                } catch (e) {
                    console.error('Error updating message tab display:', e);
                }
            }
        }
        
        function getTimeAgo(timestamp) {
            const now = new Date();
            const time = new Date(timestamp);
            const diffMs = now - time;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        }
        
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }
        
        function setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        }
        
        // Override addMessage to save to history
        const originalAddMessage = addMessage;
        addMessage = function(text, sender, saveToHistory = true) {
            originalAddMessage(text, sender);
            if (saveToHistory && currentSessionId) {
                saveMessageToHistory(text, sender);
            }
        };
        
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