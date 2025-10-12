import React from 'react';

function ServerList({ servers, onServerSelect }) {
  if (!servers || servers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>No servers yet</p>
        <p className="text-sm mt-2">Create or join a server to get started</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Your Servers
      </h2>
      <ul className="mt-1">
        {servers.map((server) => (
          <li key={server.id}>
            <button
              onClick={() => onServerSelect(server.id)}
              className="w-full text-left p-2 rounded hover:bg-gray-700 flex items-center space-x-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="font-bold text-sm">
                  {server.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="truncate">{server.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServerList;