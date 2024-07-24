import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm'

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function addMessage(sender, message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${sender}: ${message}`;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage('You', message);
        userInput.value = '';
        try {
            const response = await axios.post('http://localhost:63342/chat', { message });
            console.log(response.data);
            addMessage('AI', response.data.response);
        } catch (error) {
            console.error('Error:', error);
            addMessage('System', 'An error occurred. Please try again.');
        }
    }
}

sendButton.addEventListener('click', function () {
    console.log('SendButton');
    sendMessage();
});

