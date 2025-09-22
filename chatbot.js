// chatbot.js
// Modular, context-aware, polite, and professional chatbot for e-commerce site
(function (window) {
    // Configuration: Set this on each page
    const chatbotConfig = window.chatbotConfig || {
        page: 'home',
        productList: [],
        user: null
    };

    // Persona and system prompt
    function getSystemPrompt() {
        let base = `You are a polite, professional, and helpful AI assistant for an e-commerce website. Always be relevant to the user's current page and needs. If you don't know, offer to connect to support.`;
        if (chatbotConfig.page === 'contact') base += ' The user is on the Contact page, likely seeking support or information.';
        if (chatbotConfig.page === 'products') base += ' The user is browsing products. Answer about inventory, recommendations, or product details.';
        if (chatbotConfig.page === 'dashboard') base += ' The user is viewing analytics. Help explain metrics or summarize data.';
        if (chatbotConfig.user && chatbotConfig.user.name) base += ` The user is named ${chatbotConfig.user.name}.`;
        return base;
    }

    // DOM references
    const chatDom = {
        toggle: document.getElementById("chatToggle"),
        widget: document.getElementById("chatWidget"),
        close: document.getElementById("chatClose"),
        messages: document.getElementById("chatMessages"),
        form: document.getElementById("chatForm"),
        input: document.getElementById("chatInput"),
    };

    // Append message to chat
    function appendMessage(role, text) {
        const el = document.createElement("div");
        el.className = `msg ${role}`;
        el.innerHTML = text;
        chatDom.messages.appendChild(el);
        chatDom.messages.scrollTop = chatDom.messages.scrollHeight;
    }

    // Typing indicator
    let typingEl = null;
    function setTyping(visible) {
        if (visible) {
            if (!typingEl) {
                typingEl = document.createElement("div");
                typingEl.className = "msg bot";
                typingEl.innerHTML = 'Typing… <span class="chat-spinner" aria-label="Loading"></span>';
                chatDom.messages.appendChild(typingEl);
            }
        } else if (typingEl) {
            typingEl.remove();
            typingEl = null;
        }
    }

    // Open/close chat
    function openChat() {
        chatDom.widget.hidden = false;
        chatDom.widget.classList.add("open");
        setTimeout(() => chatDom.input.focus(), 0);
    }
    function closeChat() {
        chatDom.widget.classList.remove("open");
        chatDom.widget.hidden = true;
    }

    // Find product in message
    function findProductInMessage(message) {
        const lowerMsg = message.toLowerCase();
        return (chatbotConfig.productList || []).find(product =>
            lowerMsg.includes(product.name.toLowerCase()) ||
            lowerMsg.includes(product.name.replace(/s$/, '').toLowerCase())
        );
    }

    // 🔗 Send message to N8N webhook
    async function sendToN8N(message) {
        const N8N_WEBHOOK_URL = "https://waseem-c.app.n8n.cloud/webhook-test/16849e3c-ee6b-4810-9f04-b371861da78d";
        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    page: chatbotConfig.page,
                    user: chatbotConfig.user || null,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (err) {
            console.warn("N8N webhook failed:", err);
        }
    }

    // // Send to AI backend (Gemini/OpenAI)
    // async function sendToAI(message) {
    //     const GEMINI_API_KEY = window.GEMINI_API_KEY || "AIzaSyBLDV6B3tI2Ze_YVqZ8qBlNVZIgp9bLhTU";
    //     const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;
    //     const systemPrompt = getSystemPrompt();
    //     const fullPrompt = `${systemPrompt}\nUser: ${message}`;
    //     try {
    //         const response = await fetch(GEMINI_API_URL, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 contents: [
    //                     { role: "user", parts: [{ text: fullPrompt }] }
    //                 ]
    //             })
    //         });
    //         if (!response.ok) {
    //             const text = await response.text().catch(() => "");
    //             throw new Error(text || `Request failed (${response.status})`);
    //         }
    //         const data = await response.json();
    //         return data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";
    //     } catch (error) {
    //         console.error("Chat error:", error);
    //         return "Sorry, something went wrong.";
    //     }
    // }

    // Event listeners
    if (chatDom.toggle && chatDom.form) {
        chatDom.toggle.addEventListener("click", openChat);
        chatDom.close.addEventListener("click", closeChat);
        chatDom.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = chatDom.input.value.trim();
            if (!text) return;
            appendMessage("user", text);
            chatDom.input.value = "";
            setTyping(true);

            // 🔗 Trigger N8N in background
            sendToN8N(text);

            // Product-aware logic
            const foundProduct = findProductInMessage(text);
            if (foundProduct) {
                setTyping(false);
                appendMessage("bot", `Certainly! We offer <b>${foundProduct.name}</b>. <a href='${foundProduct.url}' target='_blank'>View product</a><br>Is there anything else I can help you with?`);
                return;
            }

            // Fallback to AI
            const reply = await sendToAI(text);
            setTyping(false);
            appendMessage("bot", reply);
        });
    }

    // Expose for debugging
    window.chatbot = { config: chatbotConfig, openChat, closeChat };
})(window);



