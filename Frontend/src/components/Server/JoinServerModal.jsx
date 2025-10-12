import React, { useState } from 'react';
import { getServerByInviteCode } from '../../services/graphql/serverService';

function JoinServerModal({ onClose, onJoin }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [error, setError] = useState('');

  const validateInviteCode = async () => {
    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }
    
    try {
      setValidating(true);
      setError('');
      
      const response = await getServerByInviteCode(inviteCode.trim());
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      setServerInfo(response.data.getServerByInviteCode);
    } catch (err) {
      setError('Invalid invite code');
      setServerInfo(null);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }
    
    if (!serverInfo) {
      setError('Please validate the invite code first');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await onJoin(inviteCode.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Join Server</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Invite Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setServerInfo(null);
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter invite code"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={validateInviteCode}
                  disabled={validating || !inviteCode.trim()}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors disabled:opacity-50"
                >
                  {validating ? 'Validating...' : 'Validate'}
                </button>
              </div>
              
              {serverInfo && (
                <div className="mt-3 p-3 bg-gray-700 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Server:</span> {serverInfo.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Owner:</span> {serverInfo.owner.username}
                  </p>
                </div>
              )}
              
              {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50"
                disabled={loading || !serverInfo}
              >
                {loading ? 'Joining...' : 'Join Server'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinServerModal;