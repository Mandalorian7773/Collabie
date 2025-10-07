import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import messageService from '../services/messageService';
import socket from '../../socket.js';
import AddUserForm from '../components/AddUserForm';
import Chat from "./Chat";

function Dashboard() {
    const [showChat, setShowChat] = useState(false);
    const [activeUser, setActiveUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasLoadedConversations, setHasLoadedConversations] = useState(false);
    const { user: currentUser, logout } = useAuth();
    
    useEffect(() => {
        if (!hasLoadedConversations) {
            fetchConversations();
        }
    }, [hasLoadedConversations]);

    useEffect(() => {
        if (!currentUser) return;

        console.log('[DASHBOARD] Setting up Dashboard socket listeners');
        
        const handleNewMessage = (messageData) => {
            console.log('[DASHBOARD] New message received in Dashboard:', messageData);
            fetchConversations();
        };
        
        const handleReadStatusUpdate = (data) => {
            console.log('[DASHBOARD] Read status updated in Dashboard:', data);
            fetchConversations();
        };
        
        socket.on('receiveMessage', handleNewMessage);
        socket.on('messagesMarkedAsRead', handleReadStatusUpdate);
        
        return () => {
            console.log('[DASHBOARD] Cleaning up Dashboard socket listeners');
            socket.off('receiveMessage', handleNewMessage);
            socket.off('messagesMarkedAsRead', handleReadStatusUpdate);
        };
    }, [currentUser]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await authService.getConversations();
            
            if (result.success) {
                const transformedConversations = result.conversations.map(conv => ({
                    _id: conv._id,
                    name: conv.username,
                    email: conv.email,
                    avatar: conv.avatar,
                    role: conv.role,
                    status: conv.isOnline ? 'online' : 'offline',
                    lastActive: conv.lastActive,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount
                }));
                setConversations(transformedConversations);
                setHasLoadedConversations(true);
            } else {
                setError(result.error || 'Failed to load conversations');
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Too many requests. Please wait a moment and try again.');
            } else {
                setError('Failed to load conversations');
            }
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setActiveUser(user);
        setShowChat(true);
        clearMessage();
        
        setTimeout(() => {
            fetchConversations();
        }, 1000);
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleUserAdded = (newUser) => {
        setMessage({ type: 'success', text: `User "${newUser.username}" added successfully! You can now start chatting.` });
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleError = (errorMessage) => {
        setMessage({ type: 'error', text: errorMessage });
        
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const clearMessage = () => {
        setMessage({ type: '', text: '' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex h-[calc(100vh-3rem)] bg-black text-white">
            <div className="w-80 border-r border-zinc-700 flex flex-col bg-zinc-900">
                <div className="p-4 border-b border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                    {currentUser?.username?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold">{currentUser?.username || 'User'}</h3>
                                <p className="text-sm text-zinc-400">{currentUser?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-zinc-400 hover:text-red-400 transition-colors p-2 rounded"
                            title="Logout"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <AddUserForm 
                    onUserAdded={handleUserAdded}
                    onError={handleError}
                />

                {message.text && (
                    <div className={`mx-4 mb-2 p-2 rounded text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="p-4 border-b border-zinc-700">
                    <h2 className="font-bold text-lg text-white">Direct Messages</h2>
                    {loading ? (
                        <p className="text-sm text-zinc-400 mt-1">Loading conversations...</p>
                    ) : error ? (
                        <p className="text-sm text-red-400 mt-1">{error}</p>
                    ) : (
                        <p className="text-sm text-zinc-400 mt-1">
                            {conversations.length === 0 
                                ? 'No conversations yet' 
                                : `${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`
                            }
                        </p>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-zinc-400">
                            <div className="animate-spin w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                            Loading conversations...
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-400">
                            <p>{error}</p>
                            <button 
                                onClick={() => fetchConversations()} 
                                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                                Try again
                            </button>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-zinc-400">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">Chat</span>
                                </div>
                                <p className="font-medium">No conversations yet</p>
                                <p className="text-xs mt-1">Add a user above to start your first conversation</p>
                            </div>
                        </div>
                    ) : (
                        <ul className="p-2">
                            {conversations.map((conv) => (
                                <li 
                                    key={conv._id} 
                                    onClick={() => handleUserSelect(conv)}
                                    className={`p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
                                        activeUser?._id === conv._id
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            {conv.avatar ? (
                                                <img 
                                                    src={conv.avatar} 
                                                    alt={conv.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium">
                                                        {conv.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                                                getStatusColor(conv.status)
                                            }`}></div>
                                            {conv.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">
                                                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium truncate">{conv.name}</p>
                                                {conv.lastMessage && (
                                                    <span className="text-xs text-zinc-500">
                                                        {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.lastMessage ? (
                                                <p className="text-xs text-zinc-400 truncate mt-1">
                                                    {conv.lastMessage.fromMe ? 'You: ' : ''}
                                                    {conv.lastMessage.content}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-zinc-400 capitalize">{conv.status}</p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>Collabie Chat</span>
                        <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Connected</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                {showChat && activeUser ? (
                    <Chat 
                        currentUser={currentUser}
                        activeUser={activeUser}
                    />
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center bg-zinc-800">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">Chat</span>
                            </div>
                            <h1 className="font-bold text-3xl mb-4">Welcome to Collabie Chat</h1>
                            <p className="text-zinc-400 text-lg mb-8 max-w-md">
                                Select a user from the sidebar to start a conversation
                            </p>
                            <div className="flex items-center justify-center space-x-4 text-sm text-zinc-500">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Real-time messaging</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Instant delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;