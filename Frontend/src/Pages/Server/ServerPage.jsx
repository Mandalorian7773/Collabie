import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getServerById,
  getChannelsByServer,
  createChannel
} from '../../services/graphql/serverService';
import ChannelList from '../../components/Server/ChannelList';
import CreateChannelModal from '../../components/Server/CreateChannelModal';
import BoardView from '../../components/Server/BoardView';
import ChatView from '../../components/Server/ChatView';

function ServerPage() {
  const { serverId } = useParams();
  const [server, setServer] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServerData();
  }, [serverId]);

  const fetchServerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch server details
      const serverResponse = await getServerById(serverId);
      if (serverResponse.errors) {
        throw new Error(serverResponse.errors[0].message);
      }
      
      setServer(serverResponse.data.getServerById);
      
      // Fetch channels
      const channelsResponse = await getChannelsByServer(serverId);
      if (channelsResponse.errors) {
        throw new Error(channelsResponse.errors[0].message);
      }
      
      const channelsData = channelsResponse.data.getChannelsByServer;
      setChannels(channelsData);
      
      // Set the first channel as active if none is selected
      if (!activeChannel && channelsData.length > 0) {
        setActiveChannel(channelsData[0]);
      }
    } catch (err) {
      setError('Failed to load server: ' + err.message);
      console.error('Error fetching server data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (channelData) => {
    try {
      const response = await createChannel(
        serverId,
        channelData.name,
        channelData.type
      );
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Refresh channels
      await fetchServerData();
      setShowCreateChannelModal(false);
    } catch (err) {
      setError('Failed to create channel: ' + err.message);
      console.error('Error creating channel:', err);
    }
  };

  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
  };

  const getUserRole = () => {
    if (!server || !user) return 'member';
    
    const member = server.members.find(
      m => m.userId.id === user._id
    );
    
    return member ? member.role : 'member';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Error</p>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/servers')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
          >
            Back to Servers
          </button>
        </div>
      </div>
    );
  }

  const userRole = getUserRole();
  const canManageChannels = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Server Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold truncate">{server?.name}</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChannelList
            channels={channels}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
          />
        </div>
        
        {canManageChannels && (
          <div className="p-2 border-t border-gray-700">
            <button
              onClick={() => setShowCreateChannelModal(true)}
              className="w-full text-left p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center space-x-2 transition-colors"
            >
              <span>+</span>
              <span>Create Channel</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <h2 className="text-lg font-semibold">
                # {activeChannel.name}
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeChannel.type === 'text' && (
                <ChatView channel={activeChannel} />
              )}
              {activeChannel.type === 'board' && (
                <BoardView channel={activeChannel} />
              )}
              {activeChannel.type === 'voice' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Voice Channel</h3>
                    <p className="text-gray-400 mb-4">
                      Voice calling functionality would be implemented here
                    </p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors">
                      Join Voice Channel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">No Channel Selected</h3>
              <p className="text-gray-400">
                Select a channel from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Channel Modal */}
      {showCreateChannelModal && (
        <CreateChannelModal
          onClose={() => setShowCreateChannelModal(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </div>
  );
}

export default ServerPage;