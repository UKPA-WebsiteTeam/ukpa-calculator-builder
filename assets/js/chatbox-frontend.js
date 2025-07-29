/**
 * UKPA Chat Box Frontend JavaScript - Fixed Toggle Issue
 */
;(($) => {
    // Chat box namespace
    window.UKPAChatbox = {
      sessionId: null,
      currentTab: "home",
      isOpen: false,
      chatHistory: [],
  
      init: function () {
        console.log("🚀 [FRONTEND] Initializing UKPA Chatbox...")
        this.generateSessionId()
        this.bindEvents()
        this.initTabSystem()
        this.loadInitialMessages()
        console.log("✅ [FRONTEND] Chatbox initialization complete")
      },
  
      generateSessionId: function () {
        this.sessionId = "ukpa_chatbox_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
        console.log("🔄 [FRONTEND] Generated session ID:", this.sessionId)
      },
  
      initTabSystem: function () {
        console.log("🔄 [FRONTEND] Initializing tab system...")
        this.showTab("home")
        console.log("✅ [FRONTEND] Tab system initialized")
      },
  
            bindEvents: function () {
        var self = this
        console.log("🔄 [FRONTEND] Binding events...")

        // Toggle button click
        $(document).on("click", "#ukpa-chatbox-toggle", (e) => {
          e.preventDefault()
          console.log("🔄 [FRONTEND] Toggle button clicked")
          self.toggleChatbox()
        })

        // Close button click
        $(document).on("click", "#ukpa-close-btn", (e) => {
          e.preventDefault()
          console.log("🔄 [FRONTEND] Close button clicked")
          self.toggleChatbox()
        })

        // Tab navigation
        $(document).on("click", ".ukpa-nav-item", function (e) {
          e.preventDefault()
          var tabName = $(this).data("tab")
          console.log("🔄 [FRONTEND] Tab clicked:", tabName)
          self.showTab(tabName)
        })

        // Ask question buttons
        $(document).on("click", "#ukpa-ask-question-home", (e) => {
          e.preventDefault()
          console.log("🔄 [FRONTEND] Ask question home clicked")
          self.showTab("messages")
        })

        $(document).on("click", "#ukpa-ask-question-messages", (e) => {
          e.preventDefault()
          console.log("🔄 [FRONTEND] Ask question messages clicked")
          self.showInputField()
        })

        // Help items
        $(document).on("click", ".ukpa-help-item[data-action]", function (e) {
          e.preventDefault()
          console.log("🔄 [FRONTEND] Help item clicked:", $(this).data("action"))
          self.handleQuickAction($(this))
        })

        // Send message
        $(document).on("click", "#ukpa-send-btn", (e) => {
          e.preventDefault()
          console.log("🔄 [FRONTEND] Send button clicked")
          self.sendMessage()
        })

        // Enter key in input
        $(document).on("keypress", "#ukpa-message-input", (e) => {
          if (e.which === 13) {
            console.log("🔄 [FRONTEND] Enter key pressed in input")
            self.sendMessage()
          }
        })

        // Escape key to close
        $(document).on("keydown", (e) => {
          if (e.key === "Escape" && self.isOpen) {
            console.log("🔄 [FRONTEND] Escape key pressed")
            self.toggleChatbox()
          }
        })

        console.log("✅ [FRONTEND] Events bound successfully")
      },
  
      toggleChatbox: function () {
        var $chatbox = $("#ukpa-chatbox")
        var $toggle = $("#ukpa-chatbox-toggle")
  
        console.log("Toggling chatbox. Current state:", this.isOpen)
  
        if (this.isOpen) {
          $chatbox.removeClass("ukpa-active")
          $toggle.show()
          this.isOpen = false
          console.log("Chatbox closed")
        } else {
          $chatbox.addClass("ukpa-active")
          $toggle.hide()
          this.isOpen = true
          console.log("Chatbox opened")
        }
      },
  
      showTab: function (tabName) {
        console.log("Switching to tab:", tabName)
  
        // Remove active class from all nav items and views
        $(".ukpa-nav-item").removeClass("ukpa-active")
        $(".ukpa-view").removeClass("ukpa-active")
  
        // Add active class to selected nav item and view
        $('.ukpa-nav-item[data-tab="' + tabName + '"]').addClass("ukpa-active")
        $("#ukpa-" + tabName + "-view").addClass("ukpa-active")
  
        this.currentTab = tabName
        console.log("Tab switched to:", tabName)
      },
  
      handleQuickAction: function ($element) {
        var action = $element.data("action")
        console.log("Quick action:", action)
  
        switch (action) {
          case "calculate":
            this.showTab("messages")
            setTimeout(() => {
              this.sendChatMessage("I need help with calculations")
            }, 300)
            break
          case "help":
            this.showTab("help")
            break
          case "tasks":
            this.showTab("tasks")
            break
          case "troubleshoot":
            this.showTab("messages")
            setTimeout(() => {
              this.sendChatMessage("I'm having trouble with my calculator")
            }, 300)
            break
        }
      },
  
      showInputField: () => {
        $("#ukpa-ask-question-messages").hide()
        $("#ukpa-input-group").show()
        $("#ukpa-message-input").focus()
      },
  
            sendMessage: function () {
        var $input = $("#ukpa-message-input")
        var message = $input.val().trim()

        if (!message) return

        console.log("🔄 [FRONTEND] Sending message:", message)

        // Add user message
        this.addMessage(message, "user")

        // Clear input
        $input.val("")

        // Show typing indicator
        this.showTypingIndicator()

        // Send to backend
        console.log("🔄 [FRONTEND] Calling sendToBackend...")
        this.sendToBackend(message)
          .then((response) => {
            console.log("✅ [FRONTEND] Backend response received:", response)
            this.removeTypingIndicator()

            if (response.success && response.data && response.data.response) {
              console.log("✅ [FRONTEND] Using response.data.response:", response.data.response)
              this.addMessage(response.data.response, "bot")
            } else if (response.answer) {
              console.log("✅ [FRONTEND] Using response.answer:", response.answer)
              this.addMessage(response.answer, "bot")
            } else if (response.response) {
              console.log("✅ [FRONTEND] Using response.response:", response.response)
              this.addMessage(response.response, "bot")
            } else {
              console.log("❌ [FRONTEND] No valid response found in:", response)
              this.addMessage("Sorry, I encountered an error. Please try again.", "bot")
            }
          })
          .catch((error) => {
            console.error("❌ [FRONTEND] Error:", error)
            this.removeTypingIndicator()
            this.addMessage("Sorry, I'm having trouble connecting. Please try again later.", "bot")
          })
          .always(() => {
            console.log("🔄 [FRONTEND] Request completed, hiding input...")
            // Hide input and show ask button
            setTimeout(() => {
              $("#ukpa-input-group").hide()
              $("#ukpa-ask-question-messages").show()
            }, 500)
          })
      },
  
      sendChatMessage: function (message) {
        $("#ukpa-message-input").val(message)
        this.showInputField()
        this.sendMessage()
      },
  
      sendToBackend: function (message) {
        var ukpa_chatbox_ajax = window.ukpa_chatbox_ajax // Declare the variable
        console.log("🔄 [FRONTEND] sendToBackend called with message:", message)
        console.log("🔄 [FRONTEND] ukpa_chatbox_ajax config:", ukpa_chatbox_ajax)
        
        if (typeof ukpa_chatbox_ajax !== "undefined" && ukpa_chatbox_ajax.ajax_url.includes("admin-ajax.php")) {
          // Use WordPress AJAX
          console.log("🔄 [FRONTEND] Using WordPress AJAX")
          console.log("🔄 [FRONTEND] AJAX URL:", ukpa_chatbox_ajax.ajax_url)
          console.log("🔄 [FRONTEND] Session ID:", this.sessionId)
          console.log("🔄 [FRONTEND] Nonce:", ukpa_chatbox_ajax.nonce)
          
          return $.ajax({
            url: ukpa_chatbox_ajax.ajax_url,
            type: "POST",
            data: {
              action: "ukpa_chatbox_message",
              message: message,
              session_id: this.sessionId,
              nonce: ukpa_chatbox_ajax.nonce,
            },
          }).then(function(response) {
            console.log("✅ [FRONTEND] WordPress AJAX response:", response)
            return response;
          }).catch(function(error) {
            console.error("❌ [FRONTEND] WordPress AJAX error:", error)
            throw error;
          });
        } else {
          // Use direct backend connection
          console.log("🔄 [FRONTEND] Using direct backend connection")
          console.log("🔄 [FRONTEND] Backend URL:", ukpa_chatbox_ajax.backend_url || "http://localhost:3002/ana/api/v1/chatbot/ask")
          
          return fetch(ukpa_chatbox_ajax.backend_url || "http://localhost:3002/ana/api/v1/chatbot/ask", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: message,
            }),
          }).then((response) => {
            console.log("✅ [FRONTEND] Fetch response status:", response.status)
            if (!response.ok) {
              throw new Error("HTTP " + response.status + ": " + response.statusText)
            }
            return response.json()
          }).then((data) => {
            console.log("✅ [FRONTEND] Fetch response data:", data)
            return data;
          })
        }
      },
  
      addMessage: function (text, sender) {
        var $chatMessages = $("#ukpa-chat-messages")
        var currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  
        var messageHtml = `
              <div class="ukpa-message ukpa-${sender}-message">
                  <div class="ukpa-message-avatar">
                      <i class="fas fa-${sender === "user" ? "user" : "robot"}"></i>
                  </div>
                  <div class="ukpa-message-content">
                      <div class="ukpa-message-text">${this.escapeHtml(text)}</div>
                      <div class="ukpa-message-time">${currentTime}</div>
                  </div>
              </div>
          `
  
        $chatMessages.append(messageHtml)
        $chatMessages.scrollTop($chatMessages[0].scrollHeight)
      },
  
      showTypingIndicator: () => {
        var $chatMessages = $("#ukpa-chat-messages")
        var typingHtml = `
              <div class="ukpa-message ukpa-bot-message ukpa-typing-indicator" id="ukpa-typing-indicator">
                  <div class="ukpa-message-avatar">
                      <i class="fas fa-robot"></i>
                  </div>
                  <div class="ukpa-message-content">
                      <div class="ukpa-message-text">
                          <span class="ukpa-typing-dots">
                              <span></span><span></span><span></span>
                          </span>
                          Calculating...
                      </div>
                  </div>
              </div>
          `
  
        $chatMessages.append(typingHtml)
        $chatMessages.scrollTop($chatMessages[0].scrollHeight)
      },
  
      removeTypingIndicator: () => {
        $("#ukpa-typing-indicator").remove()
      },
  
      loadInitialMessages: function () {
        var ukpa_chatbox_ajax = window.ukpa_chatbox_ajax
        var welcomeMessage =
          ukpa_chatbox_ajax.welcome_message ||
          "Hello! I'm your calculator assistant. How can I help you with calculations today?"
  
        var $chatMessages = $("#ukpa-chat-messages")
        var currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  
        var messageHtml = `
          <div class="ukpa-message ukpa-bot-message">
              <div class="ukpa-message-avatar">
                  <i class="fas fa-robot"></i>
              </div>
              <div class="ukpa-message-content">
                  <div class="ukpa-message-text">${this.escapeHtml(welcomeMessage)}</div>
                  <div class="ukpa-message-time">${currentTime}</div>
              </div>
          </div>
      `
  
        $chatMessages.append(messageHtml)
      },
  
      escapeHtml: (text) => {
        if (typeof text !== "string") {
          return ""
        }
        var div = document.createElement("div")
        div.textContent = text
        return div.innerHTML
      },
    }
  
    // Initialize when DOM is ready
    $(document).ready(() => {
      if (window.UKPAChatboxInitialized) {
        return
      }
      window.UKPAChatboxInitialized = true
  
      console.log("DOM ready, initializing chatbox...")
      window.UKPAChatbox.init()
    })
  })(window.jQuery) // Use window.jQuery to declare the variable
  