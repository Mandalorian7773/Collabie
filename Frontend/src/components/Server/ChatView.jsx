import React, { useState, useEffect, useRef } from 'react';
import socket from '../../../socket.js';

function ChatView({ channel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Simulate loading messages
    const loadMessages = () => {
      // In a real implementation, you would fetch messages for this channel
      setMessages([
        {
          id: '1',
          content: 'Welcome to the channel!',
          sender: { id: 'system', username: 'System' },
          timestamp: new Date(Date.now() - 3600000),
          read: true
        }
      ]);
    };
    
    loadMessages();
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: { id: 'current-user', username: 'You' },
      timestamp: new Date(),
      read: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // In a real implementation, you would emit this to the server
    // socket.emit('sendMessage', { channelId: channel.id, content: input.trim() });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-800"
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">No messages yet. Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender.id === 'current-user';
            return (
              <div
                key={message.id}
                className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="text-xs font-semibold text-gray-300 mb-1">
                      {message.sender.username}
                    </div>
                  )}
                  <div className="break-words">{message.content}</div>
                  <div className="text-xs text-gray-300 mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-300">Someone is typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${channel.name}`}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatView;