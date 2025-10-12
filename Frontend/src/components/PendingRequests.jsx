import { useState, useEffect } from 'react';
import friendService from '../services/friendService';

function PendingRequests({ onError, onRequestsUpdate }) {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const result = await friendService.getPendingRequests();
            
            if (result.success) {
                setPendingRequests(result.pendingRequests);
                if (onRequestsUpdate) {
                    onRequestsUpdate(result.pendingRequests.length);
                }
            } else {
                onError(result.error || 'Failed to fetch pending requests');
            }
        } catch (error) {
            console.error('Fetch pending requests error:', error);
            onError('Failed to fetch pending requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            setProcessing(prev => ({ ...prev, [requestId]: 'accept' }));
            
            const result = await friendService.acceptFriendRequest(requestId);
            
            if (result.success) {
                // Remove the accepted request from the list
                setPendingRequests(prev => prev.filter(req => req._id !== requestId));
                if (onRequestsUpdate) {
                    onRequestsUpdate(pendingRequests.length - 1);
                }
            } else {
                onError(result.error || 'Failed to accept friend request');
            }
        } catch (error) {
            console.error('Accept friend request error:', error);
            onError('Failed to accept friend request');
        } finally {
            setProcessing(prev => {
                const newProcessing = { ...prev };
                delete newProcessing[requestId];
                return newProcessing;
            });
        }
    };

    const handleDecline = async (requestId) => {
        try {
            setProcessing(prev => ({ ...prev, [requestId]: 'decline' }));
            
            const result = await friendService.declineFriendRequest(requestId);
            
            if (result.success) {
                // Remove the declined request from the list
                setPendingRequests(prev => prev.filter(req => req._id !== requestId));
                if (onRequestsUpdate) {
                    onRequestsUpdate(pendingRequests.length - 1);
                }
            } else {
                onError(result.error || 'Failed to decline friend request');
            }
        } catch (error) {
            console.error('Decline friend request error:', error);
            onError('Failed to decline friend request');
        } finally {
            setProcessing(prev => {
                const newProcessing = { ...prev };
                delete newProcessing[requestId];
                return newProcessing;
            });
        }
    };

    if (loading) {
        return (
            <div className="p-4 border-b border-zinc-700 bg-zinc-900">
                <h3 className="text-lg font-semibold text-white mb-3">Pending Requests</h3>
                <div className="text-center py-4 text-zinc-400">
                    <div className="animate-spin w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading pending requests...
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-b border-zinc-700 bg-zinc-900">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Pending Requests</h3>
                {pendingRequests.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {pendingRequests.length}
                    </span>
                )}
            </div>
            
            {pendingRequests.length === 0 ? (
                <p className="text-zinc-400 text-sm py-2">No pending friend requests</p>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {pendingRequests.map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    {request.requester.avatar ? (
                                        <img 
                                            src={request.requester.avatar} 
                                            alt={request.requester.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {request.requester.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                                        request.requester.isOnline ? 'bg-green-500' : 'bg-gray-500'
                                    }`}></div>
                                </div>
                                <div>
                                    <p className="font-medium text-white">{request.requester.username}</p>
                                    <p className="text-xs text-zinc-400">
                                        Sent {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAccept(request._id)}
                                    disabled={processing[request._id] === 'accept' || processing[request._id] === 'decline'}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing[request._id] === 'accept' ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                                            Accepting...
                                        </div>
                                    ) : (
                                        'Accept'
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDecline(request._id)}
                                    disabled={processing[request._id] === 'accept' || processing[request._id] === 'decline'}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing[request._id] === 'decline' ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                                            Declining...
                                        </div>
                                    ) : (
                                        'Decline'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PendingRequests;