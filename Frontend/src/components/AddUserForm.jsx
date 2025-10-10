import { useState } from 'react';
import friendService from '../services/friendService';

function AddUserForm({ onUserAdded, onError }) {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username.trim()) {
            onError('Username is required');
            return;
        }

        if (username.length < 3) {
            onError('Username must be at least 3 characters long');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            onError('Username can only contain letters, numbers, and underscores');
            return;
        }

        setIsLoading(true);

        try {
            const result = await friendService.sendFriendRequest(username);
            
            if (result.success) {
                onUserAdded(result.friendRequest);
                setUsername('');
                setSuggestions([]);
            } else {
                onError(result.error || 'Failed to send friend request');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to send friend request';
            onError(errorMessage);
            console.error('Send friend request error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsernameChange = async (e) => {
        const value = e.target.value;
        setUsername(value);

        if (value.length >= 2) {
            try {
                // We'll need to create a search endpoint for users
                // For now, we'll just clear suggestions
                setSuggestions([]);
                setShowSuggestions(false);
            } catch (error) {
                console.error('Search error:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (suggestedUsername) => {
        setUsername(suggestedUsername);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="p-4 border-b border-zinc-700 bg-zinc-900">
            <h3 className="text-lg font-semibold text-white mb-3">Add Friend</h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={handleUsernameChange}
                        onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0) {
                                setShowSuggestions(true);
                            }
                        }}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-600">
                                Suggested friends (click to add):
                            </div>
                            {suggestions.map((user) => (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() => selectSuggestion(user.username)}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-white flex items-center space-x-2"
                                >
                                    <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center text-xs">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.username}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        user.isOnline ? 'bg-green-600' : 'bg-gray-600'
                                    }`}>
                                        {user.isOnline ? 'online' : 'offline'}
                                    </span>
                                    <span className="text-xs text-yellow-400 ml-auto">
                                        Add as friend
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading || !username.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Sending Request...
                        </span>
                    ) : (
                        'Send Friend Request'
                    )}
                </button>
            </form>
            
            <p className="text-xs text-zinc-400 mt-2">
                Username can only contain letters, numbers, and underscores (3-20 characters)
            </p>
            <p className="text-xs text-zinc-500 mt-1">
                Send a friend request to connect with other users
            </p>
        </div>
    );
}

export default AddUserForm;