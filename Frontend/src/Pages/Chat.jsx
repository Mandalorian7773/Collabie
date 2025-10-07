import React, { useState, useEffect, useRef } from 'react';
import socket from "../../socket.js";
import messageService from '../services/messageService.js';

function Chat({ currentUser, activeUser }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!currentUser || !activeUser) return;

        const fetchChatHistory = async () => {
            setIsLoading(true);
            try {
                const result = await messageService.getMessages(
                    currentUser._id, 
                    activeUser._id, 
                    { markRead: true }
                );
                
                if (result.success) {
                    setMessages(result.messages || []);
                } else {
                    console.error('Failed to fetch messages:', result.error);
                    setMessages([]);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, [currentUser, activeUser]);

    useEffect(() => {
        if (!currentUser) return;

        console.log('[SOCKET] Setting up socket listeners for user:', currentUser._id);
        console.log('[SOCKET] Socket connected?', socket.connected);
        
        socket.emit('join', currentUser._id);
        console.log('[SOCKET] Emitted join event for user:', currentUser._id);

        const handleReceiveMessage = (messageData) => {
            console.log('[SOCKET] Received message via Socket.IO:', messageData);
            setMessages(prev => {
                const messageExists = prev.some(msg => msg._id === messageData._id);
                if (messageExists) {
                    console.log('[SOCKET] Message already exists, skipping');
                    return prev;
                }
                const newMessages = [...prev, messageData];
                
                if (messageData.senderId === activeUser?._id) {
                    console.log('[read] Auto-marking message as read (real-time)');
                    socket.emit('markAsRead', {
                        chatId: messageData.senderId,
                        userId: currentUser._id
                    });
                }
                
                return newMessages;
            });
        };

        const handleMessagesMarkedAsRead = (data) => {
            console.log('[READ] Messages marked as read (real-time):', data);
            setMessages(prev => prev.map(msg => {
                if (msg.senderId === currentUser._id && data.readBy === activeUser?._id) {
                    return { ...msg, read: true };
                }
                return msg;
            }));
        };

        const handleUserTyping = (data) => {
            if (data.userId === activeUser?._id) {
                setTypingUser(data.isTyping ? activeUser : null);
            }
        };

        const handleReadStatusUpdated = (data) => {
            console.log('[read] Read status updated:', data);
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('messagesMarkedAsRead', handleMessagesMarkedAsRead);
        socket.on('userTyping', handleUserTyping);
        socket.on('readStatusUpdated', handleReadStatusUpdated);
        console.log('[SOCKET] Added real-time socket listeners');

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            console.log('[SOCKET] Cleaning up socket listeners');
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messagesMarkedAsRead', handleMessagesMarkedAsRead);
            socket.off('userTyping', handleUserTyping);
            socket.off('readStatusUpdated', handleReadStatusUpdated);
            socket.off('error');
        };
    }, [currentUser, activeUser]);

    useEffect(() => {
        if (!currentUser || !activeUser) return;
        
        console.log('[read] Marking messages as read for conversation with:', activeUser.name);
        socket.emit('markAsRead', {
            chatId: activeUser._id,
            userId: currentUser._id
        });
    }, [currentUser, activeUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || !currentUser || !activeUser) return;

        const messageData = {
            sender: currentUser._id,
            receiver: activeUser._id,
            content: input.trim(),
            messageType: 'text'
        };

        try {
            socket.emit('sendMessage', messageData);

            const result = await messageService.sendMessage({
                chatId: activeUser._id,
                senderId: currentUser._id,
                content: input.trim(),
                messageType: 'text'
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to send message via API');
            }

            console.log('[SUCCESS] Message sent successfully via API');

            setInput("");
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        
        if (!isTyping && input.trim()) {
            setIsTyping(true);
            socket.emit('typing', {
                userId: currentUser._id,
                chatId: activeUser._id,
                isTyping: true
            });
            
            setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing', {
                    userId: currentUser._id,
                    chatId: activeUser._id,
                    isTyping: false
                });
            }, 2000);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    if (!activeUser) {
        return (
            <div className="h-full flex items-center justify-center text-white bg-zinc-800">
                <p className="text-zinc-400 text-lg">Select a user to start chatting</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col text-white bg-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-700 p-4 bg-zinc-900 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                            {activeUser.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{activeUser.name || 'Unknown User'}</h2>
                        <p className="text-sm text-zinc-400">Online</p>
                    </div>
                </div>
                <div className="gap-4 flex">
                    <button className="text-zinc-400 hover:text-white px-3 py-1 rounded">
                        Call
                    </button>
                    <button className="text-zinc-400 hover:text-white px-3 py-1 rounded">
                        Video Call
                    </button>
                </div>
            </div>

            <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-zinc-800 min-h-0"
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-zinc-400">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-zinc-400">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isCurrentUser = message.senderId?._id === currentUser._id || message.senderId === currentUser._id;
                        return (
                            <div
                                key={message._id || index}
                                className={`mb-4 flex flex-col ${
                                    isCurrentUser ? 'items-end' : 'items-start'
                                }`}
                            >
                                <div
                                    className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                                        isCurrentUser
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-700 text-white'
                                    }`}
                                >
                                    <p className="break-words">{message.content}</p>
                                </div>
                                <span className="text-xs text-zinc-400 py-1 px-2">
                                    {formatTime(message.createdAt)}
                                    {isCurrentUser && (
                                        <span className="ml-2">
                                            {message.read ? (
                                                <span className="text-green-400" title="Read">Read</span>
                                            ) : (
                                                <span className="text-zinc-500" title="Delivered">Sent</span>
                                            )}
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })
                )}
                
                {typingUser && (
                    <div className="mb-4 flex items-start">
                        <div className="bg-zinc-700 text-white p-3 rounded-lg max-w-xs">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-zinc-400">{typingUser.name} is typing</span>
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-700 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your message..."
                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-600"
                        disabled={!activeUser}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || !activeUser}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 flex-shrink-0"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;