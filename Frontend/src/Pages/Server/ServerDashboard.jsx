import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getServers, createServer, joinServer } from '../../services/graphql/serverService';
import ServerList from '../../components/Server/ServerList';
import CreateServerModal from '../../components/Server/CreateServerModal';
import JoinServerModal from '../../components/Server/JoinServerModal';

function ServerDashboard() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const response = await getServers();
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      setServers(response.data.getUserServers);
      setError(null);
    } catch (err) {
      setError('Failed to load servers: ' + err.message);
      console.error('Error fetching servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServer = async (serverName) => {
    try {
      const response = await createServer(serverName);
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Refresh the server list
      await fetchServers();
      setShowCreateModal(false);
      
      // Navigate to the new server
      const newServer = response.data.createServer;
      navigate(`/server/${newServer.id}`);
    } catch (err) {
      setError('Failed to create server: ' + err.message);
      console.error('Error creating server:', err);
    }
  };

  const handleJoinServer = async (inviteCode) => {
    try {
      const response = await joinServer(inviteCode);
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Refresh the server list
      await fetchServers();
      setShowJoinModal(false);
      
      // Navigate to the joined server
      const joinedServer = response.data.joinServer;
      navigate(`/server/${joinedServer.id}`);
    } catch (err) {
      setError('Failed to join server: ' + err.message);
      console.error('Error joining server:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Servers</h1>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 transition-colors"
          >
            Create Server
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            Join Server
          </button>
        </div>
        
        {error && (
          <div className="mx-4 mb-4 p-2 bg-red-600 text-white text-sm rounded">
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <ServerList 
            servers={servers} 
            onServerSelect={(serverId) => navigate(`/server/${serverId}`)} 
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to Collabie Servers</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            Select a server from the sidebar or create a new one to get started.
          </p>
          <div className="flex flex-col items-center space-y-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time collaboration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Team communication</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Project management</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showCreateModal && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateServer}
        />
      )}
      
      {showJoinModal && (
        <JoinServerModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinServer}
        />
      )}
    </div>
  );
}

export default ServerDashboard;