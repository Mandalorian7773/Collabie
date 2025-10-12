import React from 'react';

function ChannelList({ channels, activeChannel, onChannelSelect }) {
  // Group channels by type
  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.type]) {
      acc[channel.type] = [];
    }
    acc[channel.type].push(channel);
    return acc;
  }, {});

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return '#';
      case 'board': return '📋';
      case 'voice': return '🎤';
      default: return '#';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'text': return 'Text Channels';
      case 'board': return 'Boards';
      case 'voice': return 'Voice Channels';
      default: return 'Channels';
    }
  };

  return (
    <div className="p-2">
      {Object.keys(groupedChannels).map((type) => (
        <div key={type} className="mb-4">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>{getTypeLabel(type)}</span>
          </h3>
          <ul className="mt-1">
            {groupedChannels[type].map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full text-left p-2 rounded flex items-center space-x-2 transition-colors ${
                    activeChannel?.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{getTypeIcon(type)}</span>
                  <span className="truncate">{channel.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ChannelList;