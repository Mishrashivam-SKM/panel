// File: /js/chatbot.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get all necessary DOM elements
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatBody = document.getElementById('chat-body');
    const chatOptionsContainer = document.getElementById('chat-options');

    // Check if chatbot elements exist on the page before proceeding
    if (!chatIcon || !chatWindow || !closeChatBtn || !chatBody || !chatOptionsContainer) {
        return;
    }

    // 2. Define the pre-written answers for our simulation
    const responses = {
        delivery: "We offer free, insured shipping on all orders within India. Most orders are delivered within 5-7 business days. You will receive a tracking link once your order is shipped.",
        returns: "We have a 30-Day Money Back policy. If you are not satisfied with your product, you can return it for a full refund or exchange within 30 days. Please ensure the item is in its original condition with all certificates.",
        contact: "You can reach our customer care team at 1800-419-0066 or email us at support@bluestone.com. We are available from 9 AM to 9 PM."
    };

    // 3. Function to toggle the chat window's visibility
    const toggleChatWindow = () => {
        chatWindow.classList.toggle('open');
        chatIcon.classList.toggle('hidden');
    };

    // 4. Function to add a message to the chat body
    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.innerHTML = `<p>${text}</p>`;
        chatBody.appendChild(messageElement);
        // Scroll to the bottom of the chat
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // 5. Handle clicks on the pre-defined question buttons
    chatOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('chat-option-btn')) {
            const questionKey = e.target.dataset.question;
            const userQuestion = e.target.textContent;

            // Display the user's chosen question
            addMessage(userQuestion, 'user');
            
            // Temporarily hide the options while the bot "thinks"
            chatOptionsContainer.style.display = 'none';

            // Simulate bot thinking and then provide the answer
            setTimeout(() => {
                const botResponse = responses[questionKey];
                addMessage(botResponse, 'bot');

                // --- THE FIX IS HERE ---
                // After the bot responds, show the options again.
                // We add another small delay so it feels natural.
                setTimeout(() => {
                    chatOptionsContainer.style.display = 'flex';
                    // Scroll to the bottom again to make sure options are visible
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 500); // 0.5-second delay before showing options again

            }, 800); // 0.8-second delay for the main response
        }
    });

    // 6. Attach event listeners to open and close the chat
    chatIcon.addEventListener('click', toggleChatWindow);
    closeChatBtn.addEventListener('click', toggleChatWindow);
});