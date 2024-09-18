import React, { useState } from 'react';
import { useWebSocket } from './WebSocketContext';

const WebSocketConsumerComponent = () => {
  const { messages, sendMessage } = useWebSocket();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div>
      <h2>WebSocket Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
};

export default WebSocketConsumerComponent;
