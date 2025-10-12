import React, { useState } from 'react';

function CreateServerModal({ onClose, onCreate }) {
  const [serverName, setServerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!serverName.trim()) {
      setError('Server name is required');
      return;
    }
    
    if (serverName.trim().length < 3) {
      setError('Server name must be at least 3 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await onCreate(serverName.trim());
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
            <h2 className="text-xl font-bold">Create Server</h2>
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
                Server Name
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter server name"
                autoFocus
              />
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
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Server'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateServerModal;