import React, { useState, useEffect } from 'react';
import {
  getBoardByChannel,
  createBoard,
  createList,
  addTask,
  moveTask
} from '../../services/graphql/serverService';
import BoardColumn from './BoardColumn';

function BoardView({ channel }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    loadBoard();
  }, [channel]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get existing board
      const response = await getBoardByChannel(channel.id);
      
      if (response.errors) {
        // If board doesn't exist, we might need to create it
        if (response.errors[0].message.includes('not found')) {
          setBoard(null);
        } else {
          throw new Error(response.errors[0].message);
        }
      } else {
        setBoard(response.data.getBoardByChannel);
      }
    } catch (err) {
      setError('Failed to load board: ' + err.message);
      console.error('Error loading board:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    try {
      const response = await createBoard(channel.id);
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Reload the board
      await loadBoard();
    } catch (err) {
      setError('Failed to create board: ' + err.message);
      console.error('Error creating board:', err);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    try {
      const response = await createList(board.id, newListName.trim());
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Reload the board
      await loadBoard();
      setNewListName('');
      setShowAddList(false);
    } catch (err) {
      setError('Failed to create list: ' + err.message);
      console.error('Error creating list:', err);
    }
  };

  const handleAddTask = async (listId, taskTitle) => {
    if (!taskTitle.trim()) return;
    
    try {
      const response = await addTask(listId, taskTitle.trim());
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Reload the board
      await loadBoard();
    } catch (err) {
      setError('Failed to add task: ' + err.message);
      console.error('Error adding task:', err);
    }
  };

  const handleMoveTask = async (taskId, fromListId, toListId) => {
    if (fromListId === toListId) return;
    
    try {
      const response = await moveTask(taskId, toListId);
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      // Reload the board
      await loadBoard();
    } catch (err) {
      setError('Failed to move task: ' + err.message);
      console.error('Error moving task:', err);
    }
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
        </div>
      </div>
    );
  }

  // If no board exists, show option to create one
  if (!board) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-xl font-bold mb-2">No Board Found</h3>
          <p className="text-gray-400 mb-6">
            This channel doesn't have a board yet.
          </p>
          <button
            onClick={handleCreateBoard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
          >
            Create Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Board Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📋 {board.channelId.name} Board</h2>
          <button
            onClick={() => setShowAddList(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
          >
            Add List
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-600 text-white text-sm">
          {error}
        </div>
      )}
      
      {/* Board Content */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex space-x-4 h-full min-w-max">
          {board.lists.map((list) => (
            <BoardColumn
              key={list.id}
              list={list}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
            />
          ))}
          
          {/* Add List Form */}
          {showAddList && (
            <div className="w-72 bg-gray-700 rounded-lg p-3 flex-shrink-0">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateList}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                >
                  Add List
                </button>
                <button
                  onClick={() => {
                    setShowAddList(false);
                    setNewListName('');
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Add List Button */}
          {!showAddList && (
            <button
              onClick={() => setShowAddList(true)}
              className="w-72 bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex-shrink-0 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              <span className="mr-2">+</span>
              <span>Add another list</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoardView;