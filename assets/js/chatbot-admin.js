/**
 * UKPA Chatbot Admin JavaScript - Professional UI/UX
 * Enhanced functionality for chatbot management with dynamic tab management
 */

jQuery(document).ready(function($) {
    
    // Prevent multiple initializations
    if (window.ukpaChatbotAdminInitialized) {
        return;
    }
    window.ukpaChatbotAdminInitialized = true;
    
    // Initialize chatbot admin functionality
    initChatbotAdmin();
    
    function initChatbotAdmin() {
        initCopyShortcode();
        initDeleteChatbot();
        initTabManagement();
        initFormValidation();
        initModalHandlers();
        initDragAndDrop();
        initContentEditors();
        initAutoSave();
    }
    
    /**
     * Initialize copy shortcode functionality
     */
    function initCopyShortcode() {
        $('.ukpa-copy-shortcode').on('click', function() {
            const shortcode = $(this).data('shortcode');
            const button = $(this);
            const originalText = button.text();
            
            // Copy to clipboard
            navigator.clipboard.writeText(shortcode).then(function() {
                // Show success feedback
                button.text('Copied!');
                button.addClass('copied');
                
                setTimeout(function() {
                    button.text(originalText);
                    button.removeClass('copied');
                }, 2000);
                
                // Show notification
                showNotification('Shortcode copied to clipboard!', 'success');
            }).catch(function() {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = shortcode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                button.text('Copied!');
                setTimeout(function() {
                    button.text(originalText);
                }, 2000);
                
                showNotification('Shortcode copied to clipboard!', 'success');
            });
        });
    }
    
    /**
     * Initialize delete chatbot functionality
     */
    function initDeleteChatbot() {
        $('.ukpa-delete-chatbot').on('click', function() {
            const chatbotId = $(this).data('id');
            const chatbotName = $(this).data('name');
            
            if (confirm(`Are you sure you want to delete the chatbot "${chatbotName}"? This action cannot be undone.`)) {
                const button = $(this);
                const originalText = button.text();
                
                button.prop('disabled', true).text('Deleting...');
                
        $.ajax({
                    url: ukpa_ajax.ajaxurl,
            type: 'POST',
                    data: {
                        action: 'ukpa_delete_chatbot',
                        chatbot_id: chatbotId,
                        nonce: ukpa_ajax.nonce
                    },
            success: function(response) {
                if (response.success) {
                            button.closest('.ukpa-chatbot-card').fadeOut(300, function() {
                                $(this).remove();
                                updateStats();
                            });
                            showNotification('Chatbot deleted successfully!', 'success');
                } else {
                            showNotification('Failed to delete chatbot: ' + response.data, 'error');
                }
            },
            error: function() {
                        showNotification('An error occurred while deleting the chatbot.', 'error');
            },
            complete: function() {
                        button.prop('disabled', false).text(originalText);
                    }
                });
            }
        });
    }
    
    /**
     * Initialize tab management functionality
     */
    function initTabManagement() {
        // Add new tab
        $('#add-tab-btn').on('click', function() {
            addNewTab();
        });
        
        // Tab header click to expand/collapse
        $(document).on('click', '.ukpa-tab-header', function() {
            const tabItem = $(this).closest('.ukpa-tab-item');
            const tabContent = tabItem.find('.ukpa-tab-content');
            
            tabItem.toggleClass('active');
            tabContent.slideToggle(200);
        });
        
        // Tab edit button
        $(document).on('click', '.ukpa-tab-edit-btn', function(e) {
            e.stopPropagation();
            const tabItem = $(this).closest('.ukpa-tab-item');
            openTabContentModal(tabItem);
        });
        
        // Tab delete button
        $(document).on('click', '.ukpa-tab-delete-btn', function(e) {
            e.stopPropagation();
            const tabItem = $(this).closest('.ukpa-tab-item');
            const tabName = tabItem.find('.ukpa-tab-name').val();
            
            if (confirm(`Are you sure you want to delete the tab "${tabName}"?`)) {
                tabItem.fadeOut(300, function() {
                    $(this).remove();
                    updateTabOrders();
                });
            }
        });
        
        // Tab enabled toggle
        $(document).on('change', '.ukpa-tab-enabled', function() {
            const tabItem = $(this).closest('.ukpa-tab-item');
            const isEnabled = $(this).is(':checked');
            
            if (isEnabled) {
                tabItem.removeClass('disabled');
            } else {
                tabItem.addClass('disabled');
            }
        });
        
        // Tab content type change
        $(document).on('change', '.ukpa-tab-content-type', function() {
            const tabItem = $(this).closest('.ukpa-tab-item');
            const contentType = $(this).val();
            updateTabContentEditor(tabItem, contentType);
        });
    }
    
    /**
     * Add new tab
     */
    function addNewTab() {
        const tabId = 'tab_' + Date.now();
        const newTab = `
            <div class="ukpa-tab-item" data-tab-id="${tabId}">
                <div class="ukpa-tab-header">
                    <div class="ukpa-tab-drag-handle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="ukpa-tab-info">
                        <input type="text" class="ukpa-tab-name" value="New Tab" placeholder="Tab Name">
                        <input type="text" class="ukpa-tab-icon-text" value="NEW" placeholder="Icon Text">
                    </div>
                    <div class="ukpa-tab-actions">
                        <label class="ukpa-toggle">
                            <input type="checkbox" class="ukpa-tab-enabled" checked>
                            <span class="ukpa-toggle-slider"></span>
                        </label>
                        <button type="button" class="ukpa-tab-edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button type="button" class="ukpa-tab-delete-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="ukpa-tab-content" style="display: none;">
                    <div class="ukpa-tab-settings">
                        <div class="ukpa-form-row">
                            <label>Tab ID</label>
                            <input type="text" class="ukpa-tab-id" value="${tabId}" placeholder="unique-tab-id">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Icon</label>
                            <select class="ukpa-tab-icon">
                                <option value="home.svg">Home</option>
                                <option value="chat.svg">Chat</option>
                                <option value="help.svg">Help</option>
                                <option value="calculator.svg">Calculator</option>
                                <option value="settings.svg">Settings</option>
                                <option value="info.svg">Info</option>
                            </select>
                        </div>
                        <div class="ukpa-form-row">
                            <label>Content Type</label>
                            <select class="ukpa-tab-content-type">
                                <option value="home">Home</option>
                                <option value="messages">Messages</option>
                                <option value="info">Info</option>
                                <option value="calculators">Calculators</option>
                                <option value="custom">Custom HTML</option>
                            </select>
                        </div>
                        <div class="ukpa-tab-content-editor">
                            <!-- Content editor will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('#tabs-container').append(newTab);
        updateTabOrders();
        
        // Auto-expand the new tab
        const newTabItem = $(`[data-tab-id="${tabId}"]`);
        newTabItem.addClass('active');
        newTabItem.find('.ukpa-tab-content').slideDown(200);
        
        showNotification('New tab added successfully!', 'success');
    }
    
    /**
     * Initialize drag and drop functionality
     */
    function initDragAndDrop() {
        if (typeof Sortable !== 'undefined') {
            new Sortable(document.getElementById('tabs-container'), {
                handle: '.ukpa-tab-drag-handle',
                animation: 150,
                ghostClass: 'drag-over',
                chosenClass: 'dragging',
                onEnd: function() {
                    updateTabOrders();
                }
            });
        }
    }
    
    /**
     * Update tab orders
     */
    function updateTabOrders() {
        $('.ukpa-tab-item').each(function(index) {
            $(this).find('.ukpa-tab-order').val(index + 1);
        });
    }
    
    /**
     * Initialize content editors
     */
    function initContentEditors() {
        // Add menu item
        $(document).on('click', '.ukpa-add-menu-item', function() {
            const menuItems = $(this).siblings('.ukpa-menu-items');
            const newItem = `
                <div class="ukpa-menu-item">
                    <input type="text" class="ukpa-menu-text" placeholder="Menu text">
                    <input type="text" class="ukpa-menu-link" placeholder="Link">
                    <button type="button" class="ukpa-remove-menu-item">Remove</button>
                </div>
            `;
            menuItems.append(newItem);
        });
        
        // Remove menu item
        $(document).on('click', '.ukpa-remove-menu-item', function() {
            $(this).closest('.ukpa-menu-item').remove();
        });
        
        // Add link
        $(document).on('click', '.ukpa-add-link', function() {
            const links = $(this).siblings('.ukpa-links');
            const newLink = `
                <div class="ukpa-link-item">
                    <input type="text" class="ukpa-link-text" placeholder="Link text">
                    <input type="text" class="ukpa-link-url" placeholder="URL">
                    <button type="button" class="ukpa-remove-link">Remove</button>
                </div>
            `;
            links.append(newLink);
        });
        
        // Remove link
        $(document).on('click', '.ukpa-remove-link', function() {
            $(this).closest('.ukpa-link-item').remove();
        });
        
        // Add task
        $(document).on('click', '.ukpa-add-task', function() {
            const tasks = $(this).siblings('.ukpa-tasks');
            const newTask = `
                <div class="ukpa-task-item">
                    <input type="text" class="ukpa-task-text" placeholder="Task text">
                    <input type="text" class="ukpa-task-link" placeholder="Task link">
                    <label class="ukpa-task-completed">
                        <input type="checkbox" class="ukpa-task-checkbox">
                        <span>Completed</span>
                    </label>
                    <button type="button" class="ukpa-remove-task">Remove</button>
                </div>
            `;
            tasks.append(newTask);
        });
        
        // Remove task
        $(document).on('click', '.ukpa-remove-task', function() {
            $(this).closest('.ukpa-task-item').remove();
        });
    }
    
    /**
     * Update tab content editor based on content type
     */
    function updateTabContentEditor(tabItem, contentType) {
        const editor = tabItem.find('.ukpa-tab-content-editor');
        
        let content = '';
        switch (contentType) {
            case 'home':
                content = `
                    <div class="ukpa-content-section">
                        <h4>Home Tab Content</h4>
                        <div class="ukpa-form-row">
                            <label>Greeting Message</label>
                            <input type="text" class="ukpa-content-greeting" value="Hello! How can we help?">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Status Title</label>
                            <input type="text" class="ukpa-content-status-title" value="Status: All Systems Operational">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Status Time</label>
                            <input type="text" class="ukpa-content-status-time" value="Updated ${new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})} UTC">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Search Placeholder</label>
                            <input type="text" class="ukpa-content-search-placeholder" value="Search for help">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Menu Items</label>
                            <div class="ukpa-menu-items">
                                <div class="ukpa-menu-item">
                                    <input type="text" class="ukpa-menu-text" value="Start Calculating" placeholder="Menu text">
                                    <input type="text" class="ukpa-menu-link" value="#" placeholder="Link">
                                    <button type="button" class="ukpa-remove-menu-item">Remove</button>
                                </div>
                            </div>
                            <button type="button" class="button ukpa-add-menu-item">Add Menu Item</button>
                        </div>
                    </div>
                `;
                break;
                
            case 'messages':
                content = `
                    <div class="ukpa-content-section">
                        <h4>Messages Tab Content</h4>
                        <div class="ukpa-form-row">
                            <label>Input Placeholder</label>
                            <input type="text" class="ukpa-content-input-placeholder" value="Type your message...">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Welcome Message</label>
                            <textarea class="ukpa-content-welcome-message" rows="3">Hello! How can I help you today?</textarea>
                        </div>
                    </div>
                `;
                break;
                
            case 'help':
            case 'calculators':
                content = `
                    <div class="ukpa-content-section">
                        <h4>${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Tab Content</h4>
                        <div class="ukpa-form-row">
                            <label>Title</label>
                            <input type="text" class="ukpa-content-title" value="${contentType === 'help' ? 'Help & Support' : 'Tax & Financial Calculators'}">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Description</label>
                            <textarea class="ukpa-content-description" rows="3">${contentType === 'help' ? 'Get help and find answers to common questions.' : 'Access various tax and financial calculators here.'}</textarea>
                        </div>
                        <div class="ukpa-form-row">
                            <label>Links</label>
                            <div class="ukpa-links">
                                <div class="ukpa-link-item">
                                    <input type="text" class="ukpa-link-text" value="${contentType === 'help' ? 'FAQ' : 'Income Tax Calculator'}" placeholder="Link text">
                                    <input type="text" class="ukpa-link-url" value="#" placeholder="URL">
                                    <button type="button" class="ukpa-remove-link">Remove</button>
                                </div>
                            </div>
                            <button type="button" class="button ukpa-add-link">Add Link</button>
                        </div>
                    </div>
                `;
                break;
                
            case 'tasks':
                content = `
                    <div class="ukpa-content-section">
                        <h4>Tasks Tab Content</h4>
                        <div class="ukpa-form-row">
                            <label>Title</label>
                            <input type="text" class="ukpa-content-title" value="Learning Tasks">
                        </div>
                        <div class="ukpa-form-row">
                            <label>Description</label>
                            <textarea class="ukpa-content-description" rows="3">Complete tasks and track your progress.</textarea>
                        </div>
                        <div class="ukpa-form-row">
                            <label>Tasks</label>
                            <div class="ukpa-tasks">
                                <div class="ukpa-task-item">
                                    <input type="text" class="ukpa-task-text" value="Complete Basic Setup" placeholder="Task text">
                                    <input type="text" class="ukpa-task-link" value="#" placeholder="Task link">
                                    <label class="ukpa-task-completed">
                                        <input type="checkbox" class="ukpa-task-checkbox">
                                        <span>Completed</span>
                                    </label>
                                    <button type="button" class="ukpa-remove-task">Remove</button>
                                </div>
                            </div>
                            <button type="button" class="button ukpa-add-task">Add Task</button>
                        </div>
                    </div>
                `;
                break;
                
            case 'custom':
                content = `
                    <div class="ukpa-content-section">
                        <h4>Custom HTML Content</h4>
                        <div class="ukpa-form-row">
                            <label>Custom HTML</label>
                            <textarea class="ukpa-content-custom-html" rows="10" placeholder="Enter custom HTML content..."></textarea>
                        </div>
            </div>
        `;
                break;
        }
        
        editor.html(content);
    }
    
    /**
     * Initialize modal handlers
     */
    function initModalHandlers() {
        // Close modal
        $('.ukpa-modal-close, #cancel-tab-content').on('click', function() {
            closeModal();
        });
        
        // Close modal on backdrop click
        $('.ukpa-modal').on('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Save tab content
        $('#save-tab-content').on('click', function() {
            saveTabContent();
        });
    }
    
    /**
     * Open tab content modal
     */
    function openTabContentModal(tabItem) {
        const modal = $('#tab-content-modal');
        const editor = $('#tab-content-editor');
        
        // Clone the tab content for editing
        const contentClone = tabItem.find('.ukpa-tab-content').clone();
        editor.html(contentClone);
        
        modal.show();
        
        // Store reference to original tab item
        modal.data('editing-tab', tabItem);
    }
    
    /**
     * Close modal
     */
    function closeModal() {
        $('#tab-content-modal').hide();
        $('#tab-content-editor').empty();
    }
    
    /**
     * Save tab content
     */
    function saveTabContent() {
        const modal = $('#tab-content-modal');
        const originalTab = modal.data('editing-tab');
        const editor = $('#tab-content-editor');
        
        // Update original tab with edited content
        originalTab.find('.ukpa-tab-content').html(editor.html());
        
        closeModal();
        showNotification('Tab content saved successfully!', 'success');
    }
    
    /**
     * Initialize form validation
     */
    function initFormValidation() {
        $('#ukpa-chatbot-form').on('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                saveChatbot();
            }
        });
    }
    
    /**
     * Validate form
     */
    function validateForm() {
        let isValid = true;
        const errors = [];
        
        // Check required fields
        if (!$('#chatbot_name').val().trim()) {
            errors.push('Chatbot name is required');
            isValid = false;
        }
        
        // Check if at least one tab exists
        if ($('.ukpa-tab-item').length === 0) {
            errors.push('At least one tab is required');
            isValid = false;
        }
        
        // Check tab names
        $('.ukpa-tab-name').each(function() {
            if (!$(this).val().trim()) {
                errors.push('All tabs must have names');
                isValid = false;
                return false;
            }
        });
        
        if (!isValid) {
            showNotification('Please fix the following errors: ' + errors.join(', '), 'error');
        }
        
        return isValid;
    }
    
    /**
     * Save chatbot
     */
    function saveChatbot() {
        const form = $('#ukpa-chatbot-form');
        const submitBtn = form.find('button[type="submit"]');
        const originalText = submitBtn.text();
        
        submitBtn.prop('disabled', true).text('Saving...');
        
        // Collect form data
        const formData = new FormData(form[0]);
        formData.append('action', 'ukpa_save_chatbot');
        formData.append('nonce', ukpa_ajax.nonce);
        
        // Collect tabs data
        const tabs = [];
        $('.ukpa-tab-item').each(function(index) {
            const tabItem = $(this);
            const tab = {
                id: tabItem.find('.ukpa-tab-id').val(),
                name: tabItem.find('.ukpa-tab-name').val(),
                icon: tabItem.find('.ukpa-tab-icon').val(),
                icon_text: tabItem.find('.ukpa-tab-icon-text').val(),
                content_type: tabItem.find('.ukpa-tab-content-type').val(),
                enabled: tabItem.find('.ukpa-tab-enabled').is(':checked'),
                order: index + 1,
                content: collectTabContent(tabItem)
            };
            tabs.push(tab);
        });
        
        formData.append('tabs', JSON.stringify(tabs));
        

        
        $.ajax({
            url: ukpa_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    showNotification('Chatbot saved successfully!', 'success');
                    setTimeout(function() {
                        window.location.href = response.data.redirect_url || window.location.href;
                    }, 1500);
                } else {
                    showNotification('Failed to save chatbot: ' + response.data, 'error');
                }
            },
            error: function(xhr, status, error) {
                showNotification('An error occurred while saving the chatbot.', 'error');
            },
            complete: function() {
                submitBtn.prop('disabled', false).text(originalText);
            }
        });
    }
    
    /**
     * Collect tab content data
     */
    function collectTabContent(tabItem) {
        const contentType = tabItem.find('.ukpa-tab-content-type').val();
        const content = {};
        
        switch (contentType) {
            case 'home':
                content.greeting = tabItem.find('.ukpa-content-greeting').val();
                content.status_title = tabItem.find('.ukpa-content-status-title').val();
                content.status_time = tabItem.find('.ukpa-content-status-time').val();
                content.search_placeholder = tabItem.find('.ukpa-content-search-placeholder').val();
                content.menu_items = [];
                tabItem.find('.ukpa-menu-item').each(function() {
                    content.menu_items.push({
                        text: $(this).find('.ukpa-menu-text').val(),
                        link: $(this).find('.ukpa-menu-link').val()
                    });
                });
                break;
                
            case 'messages':
                content.input_placeholder = tabItem.find('.ukpa-content-input-placeholder').val();
                content.welcome_message = tabItem.find('.ukpa-content-welcome-message').val();
                break;
                
            case 'help':
            case 'calculators':
                content.title = tabItem.find('.ukpa-content-title').val();
                content.description = tabItem.find('.ukpa-content-description').val();
                content.links = [];
                tabItem.find('.ukpa-link-item').each(function() {
                    content.links.push({
                        text: $(this).find('.ukpa-link-text').val(),
                        link: $(this).find('.ukpa-link-url').val()
                    });
                });
                break;
                
            case 'tasks':
                content.title = tabItem.find('.ukpa-content-title').val();
                content.description = tabItem.find('.ukpa-content-description').val();
                content.tasks = [];
                tabItem.find('.ukpa-task-item').each(function() {
                    content.tasks.push({
                        text: $(this).find('.ukpa-task-text').val(),
                        link: $(this).find('.ukpa-task-link').val(),
                        completed: $(this).find('.ukpa-task-checkbox').is(':checked')
                    });
                });
                break;
                
            case 'custom':
                content.custom_html = tabItem.find('.ukpa-content-custom-html').val();
                break;
        }
        
        return content;
    }
    
    /**
     * Initialize auto-save functionality
     */
    function initAutoSave() {
        let autoSaveTimer;
        
        $('.ukpa-tab-item input, .ukpa-tab-item select, .ukpa-tab-item textarea').on('input change', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(function() {
                // Auto-save logic can be implemented here
                // For now, just show a subtle indicator
                showAutoSaveIndicator();
            }, 2000);
        });
    }
    
    /**
     * Show auto-save indicator
     */
    function showAutoSaveIndicator() {
        const indicator = $('<div class="ukpa-auto-save-indicator">Auto-saving...</div>');
        $('body').append(indicator);
        
        setTimeout(function() {
            indicator.fadeOut(300, function() {
                $(this).remove();
            });
        }, 1500);
    }
    
    /**
     * Update stats
     */
    function updateStats() {
        const totalChatbots = $('.ukpa-chatbot-card').length;
        const activeChatbots = $('.ukpa-status-badge.active').length;
        
        $('.ukpa-stat-card:first .ukpa-stat-content h3').text(totalChatbots);
        $('.ukpa-stat-card:last .ukpa-stat-content h3').text(activeChatbots);
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        const notification = $(`
            <div class="ukpa-notification ukpa-notification-${type}">
                <div class="ukpa-notification-content">
                    <span class="ukpa-notification-message">${message}</span>
                    <button class="ukpa-notification-close">&times;</button>
                </div>
            </div>
        `);
        
        $('body').append(notification);
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
        
        // Manual close
        notification.find('.ukpa-notification-close').on('click', function() {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        // Animate in
        notification.hide().fadeIn(300);
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    $(document).on('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if ($('#ukpa-chatbot-form').length) {
                $('#ukpa-chatbot-form').submit();
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            if ($('#tab-content-modal').is(':visible')) {
                closeModal();
            }
        }
    });
    
    /**
     * Initialize tooltips
     */
    $('[data-tooltip]').each(function() {
        const element = $(this);
        const tooltipText = element.data('tooltip');
        
        element.addClass('ukpa-tooltip');
        element.append(`<span class="ukpa-tooltip-text">${tooltipText}</span>`);
    });
    
    /**
     * Initialize responsive behavior
     */
    function initResponsive() {
        const checkResponsive = function() {
            if (window.innerWidth <= 768) {
                $('body').addClass('ukpa-mobile');
            } else {
                $('body').removeClass('ukpa-mobile');
            }
        };
        
        checkResponsive();
        $(window).on('resize', checkResponsive);
    }
    
    initResponsive();
    
    // Export functions for global access
    window.UKPA_Chatbot_Admin = {
        addNewTab: addNewTab,
        showNotification: showNotification,
        updateStats: updateStats
    };
    
});

// Additional CSS for notifications - moved inside jQuery ready to avoid redeclaration
if (!window.ukpaNotificationStylesInjected) {
    const notificationStyles = `
<style>
.ukpa-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100001;
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-left: 4px solid;
    animation: slideInRight 0.3s ease;
}

.ukpa-notification-success {
    border-left-color: #28a745;
}

.ukpa-notification-error {
    border-left-color: #dc3545;
}

.ukpa-notification-warning {
    border-left-color: #ffc107;
}

.ukpa-notification-info {
    border-left-color: #17a2b8;
}

.ukpa-notification-content {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.ukpa-notification-message {
    flex: 1;
    margin-right: 1rem;
}

.ukpa-notification-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ukpa-notification-close:hover {
    color: #333;
}

.ukpa-auto-save-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0073aa;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    z-index: 100000;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.ukpa-mobile .ukpa-chatbot-grid {
    grid-template-columns: 1fr;
}

.ukpa-mobile .ukpa-form-grid {
    grid-template-columns: 1fr;
}

.ukpa-mobile .ukpa-tab-settings {
    grid-template-columns: 1fr;
}
</style>
`;

    // Inject notification styles
    jQuery('head').append(notificationStyles);
    window.ukpaNotificationStylesInjected = true;
} 