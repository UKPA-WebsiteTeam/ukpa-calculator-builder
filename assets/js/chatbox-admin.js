/**
 * UKPA Chat Box Admin JavaScript
 * 
 * Handles admin settings page functionality
 */

(function($) {
    'use strict';
    
    // Admin namespace
    window.UKPAChatboxAdmin = {
        init: function() {
            this.bindEvents();
            this.initSettingsPage();
        },
        
        /**
         * Bind event listeners
         */
        bindEvents: function() {
            // Test connection button
            $(document).on('click', '#ukpa-chatbox-test-connection', this.testConnection.bind(this));
            
            // Copy shortcode button
            $(document).on('click', '#ukpa-chatbox-copy-shortcode', this.copyShortcode.bind(this));
            
            // Form validation
            $(document).on('blur', 'input[name="ukpa_chatbox_backend_url"]', this.validateBackendUrl.bind(this));
            $(document).on('blur', 'input[name="ukpa_chatbox_timeout"]', this.validateTimeout.bind(this));
            
            // Auto-save on change
            $(document).on('change', 'input, select, textarea', this.autoSave.bind(this));
        },
        
        /**
         * Initialize settings page
         */
        initSettingsPage: function() {
            // Initialize form validation
            this.validateAllFields();
            
            // Set up auto-save
            this.setupAutoSave();
        },
        
        /**
         * Test connection to backend
         */
        testConnection: function(e) {
            e.preventDefault();
            
            var $button = $(e.currentTarget);
            var $result = $('#ukpa-chatbox-test-result');
            var backendUrl = $('input[name="ukpa_chatbox_backend_url"]').val();
            var apiKey = $('input[name="ukpa_chatbox_api_key"]').val();
            var timeout = $('input[name="ukpa_chatbox_timeout"]').val() || 30;
            
            if (!backendUrl) {
                this.showTestResult('Please enter a backend URL first.', 'error');
                return;
            }
            
            // Disable button and show loading
            $button.prop('disabled', true).text('Testing...');
            this.showTestResult('Testing connection to backend...', 'loading');
            
            // Prepare test data
            var testData = {
                message: 'Hello, this is a test message from WordPress.',
                session_id: 'test_' + Date.now(),
                timestamp: Math.floor(Date.now() / 1000),
                user_agent: navigator.userAgent,
                test: true
            };
            
            if (apiKey) {
                testData.api_key = apiKey;
            }
            
            // Make test request
            $.ajax({
                url: ukpa_chatbox_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'ukpa_chatbox_test_connection',
                    backend_url: backendUrl,
                    api_key: apiKey,
                    timeout: timeout,
                    test_data: testData,
                    nonce: ukpa_chatbox_ajax.nonce
                },
                timeout: (parseInt(timeout) + 5) * 1000,
                success: function(response) {
                    try {
                        var data = typeof response === 'string' ? JSON.parse(response) : response;
                        
                        if (data.success) {
                            UKPAChatboxAdmin.showTestResult(
                                '✅ Connection successful! Backend responded in ' + data.response_time + 'ms.',
                                'success'
                            );
                        } else {
                            UKPAChatboxAdmin.showTestResult(
                                '❌ Connection failed: ' + data.message,
                                'error'
                            );
                        }
                    } catch (e) {
                        UKPAChatboxAdmin.showTestResult(
                            '❌ Invalid response from server',
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    var errorMessage = '❌ Connection failed';
                    
                    if (status === 'timeout') {
                        errorMessage += ': Request timed out after ' + timeout + ' seconds';
                    } else if (xhr.status === 0) {
                        errorMessage += ': Network error - check your internet connection';
                    } else if (xhr.status === 404) {
                        errorMessage += ': Backend URL not found (404)';
                    } else if (xhr.status === 403) {
                        errorMessage += ': Access denied (403) - check API key';
                    } else if (xhr.status === 500) {
                        errorMessage += ': Server error (500) - check backend logs';
                    } else {
                        errorMessage += ': HTTP ' + xhr.status + ' - ' + error;
                    }
                    
                    UKPAChatboxAdmin.showTestResult(errorMessage, 'error');
                },
                complete: function() {
                    $button.prop('disabled', false).text('Test Connection');
                }
            });
        },
        
        /**
         * Show test result
         */
        showTestResult: function(message, type) {
            var $result = $('#ukpa-chatbox-test-result');
            $result.removeClass('success error loading').addClass(type).text(message);
        },
        
        /**
         * Copy shortcode to clipboard
         */
        copyShortcode: function(e) {
            e.preventDefault();
            
            var $button = $(e.currentTarget);
            var shortcode = '[ukpa_chatbox id="custom"]';
            
            // Use modern clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shortcode).then(function() {
                    UKPAChatboxAdmin.showCopySuccess($button);
                }).catch(function() {
                    UKPAChatboxAdmin.fallbackCopy(shortcode, $button);
                });
            } else {
                UKPAChatboxAdmin.fallbackCopy(shortcode, $button);
            }
        },
        
        /**
         * Fallback copy method
         */
        fallbackCopy: function(text, $button) {
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                UKPAChatboxAdmin.showCopySuccess($button);
            } catch (err) {
                alert('Failed to copy shortcode. Please copy manually: ' + text);
            }
            
            document.body.removeChild(textArea);
        },
        
        /**
         * Show copy success
         */
        showCopySuccess: function($button) {
            var originalText = $button.text();
            $button.text('Copied!').addClass('copied');
            
            setTimeout(function() {
                $button.text(originalText).removeClass('copied');
            }, 2000);
        },
        
        /**
         * Validate backend URL
         */
        validateBackendUrl: function(e) {
            var $input = $(e.currentTarget);
            var url = $input.val().trim();
            
            if (!url) {
                this.showFieldError($input, 'Backend URL is required');
                return false;
            }
            
            try {
                new URL(url);
                this.showFieldSuccess($input);
                return true;
            } catch (e) {
                this.showFieldError($input, 'Please enter a valid URL');
                return false;
            }
        },
        
        /**
         * Validate timeout
         */
        validateTimeout: function(e) {
            var $input = $(e.currentTarget);
            var timeout = parseInt($input.val());
            
            if (isNaN(timeout) || timeout < 5 || timeout > 120) {
                this.showFieldError($input, 'Timeout must be between 5 and 120 seconds');
                return false;
            }
            
            this.showFieldSuccess($input);
            return true;
        },
        
        /**
         * Validate all fields
         */
        validateAllFields: function() {
            var isValid = true;
            
            isValid = this.validateBackendUrl({ currentTarget: $('input[name="ukpa_chatbox_backend_url"]') }) && isValid;
            isValid = this.validateTimeout({ currentTarget: $('input[name="ukpa_chatbox_timeout"]') }) && isValid;
            
            return isValid;
        },
        
        /**
         * Show field error
         */
        showFieldError: function($input, message) {
            $input.addClass('field-error');
            this.showFieldMessage($input, message, 'error');
        },
        
        /**
         * Show field success
         */
        showFieldSuccess: function($input) {
            $input.removeClass('field-error').addClass('field-success');
            this.hideFieldMessage($input);
            
            // Remove success class after a delay
            setTimeout(function() {
                $input.removeClass('field-success');
            }, 2000);
        },
        
        /**
         * Show field message
         */
        showFieldMessage: function($input, message, type) {
            var $message = $input.siblings('.field-message');
            
            if ($message.length === 0) {
                $message = $('<div class="field-message ' + type + '">' + message + '</div>');
                $input.after($message);
            } else {
                $message.removeClass('error success').addClass(type).text(message);
            }
        },
        
        /**
         * Hide field message
         */
        hideFieldMessage: function($input) {
            $input.siblings('.field-message').remove();
        },
        
        /**
         * Auto-save functionality
         */
        setupAutoSave: function() {
            var autoSaveTimer;
            var $form = $('.ukpa-chatbox-settings form');
            
            $form.on('change', 'input, select, textarea', function() {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(function() {
                    UKPAChatboxAdmin.autoSave();
                }, 2000);
            });
        },
        
        /**
         * Auto-save settings
         */
        autoSave: function() {
            var $form = $('.ukpa-chatbox-settings form');
            var formData = $form.serialize();
            
            $.ajax({
                url: ukpa_chatbox_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'ukpa_chatbox_auto_save',
                    form_data: formData,
                    nonce: ukpa_chatbox_ajax.nonce
                },
                success: function(response) {
                    try {
                        var data = typeof response === 'string' ? JSON.parse(response) : response;
                        
                        if (data.success) {
                            UKPAChatboxAdmin.showAutoSaveMessage('Settings saved automatically', 'success');
                        } else {
                            UKPAChatboxAdmin.showAutoSaveMessage('Auto-save failed: ' + data.message, 'error');
                        }
                    } catch (e) {
                        UKPAChatboxAdmin.showAutoSaveMessage('Auto-save failed', 'error');
                    }
                },
                error: function() {
                    UKPAChatboxAdmin.showAutoSaveMessage('Auto-save failed', 'error');
                }
            });
        },
        
        /**
         * Show auto-save message
         */
        showAutoSaveMessage: function(message, type) {
            var $message = $('.ukpa-chatbox-auto-save-message');
            
            if ($message.length === 0) {
                $message = $('<div class="ukpa-chatbox-auto-save-message ' + type + '-message">' + message + '</div>');
                $('.ukpa-chatbox-settings').prepend($message);
            } else {
                $message.removeClass('success-message error-message').addClass(type + '-message').text(message);
            }
            
            // Hide message after 3 seconds
            setTimeout(function() {
                $message.fadeOut();
            }, 3000);
        },
        
        /**
         * Track settings changes
         */
        trackSettingChange: function(settingName, value) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbox_setting_changed', {
                    setting_name: settingName,
                    setting_value: value
                });
            }
        }
    };
    
    // Initialize when DOM is ready
    $(document).ready(function() {
        UKPAChatboxAdmin.init();
    });
    
})(jQuery); 