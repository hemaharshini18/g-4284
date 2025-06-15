import React, { useState } from 'react';
import { sendChatMessage } from '../services/api';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = { text: inputValue, sender: 'user' };
      setMessages([...messages, userMessage]);
      try {
        const response = await sendChatMessage({ message: inputValue });
        const botMessage = { text: response.data.response, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { text: 'Sorry, something went wrong.', sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
      setInputValue('');
    }
  };

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? 'X' : 'Chat'}</span>
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">HR Chatbot</div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
