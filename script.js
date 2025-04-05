document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const chatWindow = document.getElementById("chat-window")
    const userInput = document.getElementById("user-input")
    const sendButton = document.getElementById("send-button")
    const settingsToggle = document.getElementById("settings-toggle")
    const settingsPanel = document.getElementById("settings-panel")
    const closeSettings = document.getElementById("close-settings")
    const themeToggle = document.getElementById("theme-toggle")
    const animationLevel = document.getElementById("animation-level")
    const systemTime = document.getElementById("system-time")
  
    // Server URL
    const SERVER_URL = "http://localhost:3000/response"
  
    // Update system time
    function updateSystemTime() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      systemTime.textContent = `${hours}:${minutes}:${seconds}`
    }
  
    // Initialize system time and update every second
    updateSystemTime()
    setInterval(updateSystemTime, 1000)
  
    // Toggle settings panel
    settingsToggle.addEventListener("click", () => {
      settingsPanel.classList.add("open")
    })
  
    closeSettings.addEventListener("click", () => {
      settingsPanel.classList.remove("open")
    })
  
    // Theme toggle (for future implementation)
    themeToggle.addEventListener("change", () => {
      document.body.classList.toggle("light-theme")
    })
  
    // Animation level toggle
    animationLevel.addEventListener("change", () => {
      const level = animationLevel.value
      document.body.className = "" // Reset classes
      document.body.classList.add(`animation-${level}`)
    })
  
    // Add a message to the chat window
    function addMessage(message, isUser = false) {
      const messageElement = document.createElement("div")
      messageElement.classList.add("message")
      messageElement.classList.add(isUser ? "user-message" : "jarvis-message")
  
      if (!isUser) {
        // For Jarvis messages, add typewriter effect for moderate animation level
        if (animationLevel.value === "moderate" || animationLevel.value === "high") {
          const textElement = document.createElement("div")
          textElement.classList.add("typewriter-text")
  
          // Split message by lines to handle code blocks better
          const lines = message.split("\n")
          lines.forEach((line, index) => {
            const lineElement = document.createElement("div")
            lineElement.textContent = line
            if (index < lines.length - 1) {
              lineElement.style.marginBottom = "0.5rem"
            }
            textElement.appendChild(lineElement)
          })
  
          messageElement.appendChild(textElement)
        } else {
          messageElement.textContent = message
        }
      } else {
        messageElement.textContent = message
      }
  
      chatWindow.appendChild(messageElement)
      chatWindow.scrollTop = chatWindow.scrollHeight
    }
  
    // Show typing indicator
    function showTypingIndicator() {
      const indicator = document.createElement("div")
      indicator.classList.add("typing-indicator")
      indicator.id = "typing-indicator"
  
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div")
        dot.classList.add("typing-dot")
        indicator.appendChild(dot)
      }
  
      chatWindow.appendChild(indicator)
      chatWindow.scrollTop = chatWindow.scrollHeight
    }
  
    // Remove typing indicator
    function removeTypingIndicator() {
      const indicator = document.getElementById("typing-indicator")
      if (indicator) {
        indicator.remove()
      }
    }
  
    // Send message to server and get response
    async function sendMessage(message) {
      try {
        showTypingIndicator()
  
        const response = await fetch(SERVER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
  
        const data = await response.json()
  
        removeTypingIndicator()
  
        if (data.error) {
          addMessage(`Error: ${data.error}`, false)
        } else {
          addMessage(data.response, false)
        }
      } catch (error) {
        removeTypingIndicator()
        addMessage(`Connection error: ${error.message}. Please check if the server is running.`, false)
        console.error("Error:", error)
      }
    }
  
    // Handle send button click
    sendButton.addEventListener("click", () => {
      const message = userInput.value.trim()
      if (message) {
        addMessage(message, true)
        userInput.value = ""
        sendMessage(message)
      }
    })
  
    // Handle enter key press
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const message = userInput.value.trim()
        if (message) {
          addMessage(message, true)
          userInput.value = ""
          sendMessage(message)
        }
      }
    })
  
    // Initialize focus on input
    userInput.focus()
  })
  