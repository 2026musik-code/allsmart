document.addEventListener('DOMContentLoaded', () => {
    const apiKeyScreen = document.getElementById('api-key-screen');
    const chatScreen = document.getElementById('chat-screen');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    let groqApiKey = localStorage.getItem('groqApiKey');

    if (groqApiKey) {
        apiKeyScreen.style.display = 'none';
        chatScreen.style.display = 'flex';
    }

    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            groqApiKey = apiKey;
            localStorage.setItem('groqApiKey', apiKey);
            apiKeyScreen.style.display = 'none';
            chatScreen.style.display = 'flex';
        } else {
            alert('Masukkan API Key yang valid.');
        }
    });

    const addMessage = (content, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                    apiKey: groqApiKey
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Terjadi kesalahan pada API Groq.');
            }

            const data = await response.json();
            const botMessage = data.choices[0]?.message?.content;

            if (botMessage) {
                addMessage(botMessage, 'bot');
            }

        } catch (error) {
            console.error('Error:', error);
            addMessage(`Error: ${error.message}`, 'bot');
        }
    };

    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});
