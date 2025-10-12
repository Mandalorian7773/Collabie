import React, { useState } from 'react';

function TaskCard({ task, listId, onMoveTask }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromListId', listId);
  };

  return (
    <div 
      className="bg-gray-600 rounded p-3 mb-2 cursor-pointer hover:bg-gray-500 transition-colors"
      draggable
      onDragStart={handleDragStart}
      onClick={() => setShowDetails(true)}
    >
      <div className="font-medium text-gray-100 mb-1">{task.title}</div>
      
      {task.description && (
        <div className="text-sm text-gray-300 mb-2 line-clamp-2">
          {task.description}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-400">
        {task.dueDate && (
          <span>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        
        {task.assignedTo && (
          <span className="bg-blue-500 text-white rounded-full px-2 py-1">
            {task.assignedTo.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Task Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{task.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {task.description && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-300">{task.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {task.assignedTo && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Assignee</h3>
                    <p className="text-gray-200">{task.assignedTo.username}</p>
                  </div>
                )}
                
                {task.dueDate && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-400">Due Date</h3>
                    <p className="text-gray-200">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-sm text-gray-400">Created</h3>
                  <p className="text-gray-200">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {task.comments && task.comments.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Comments</h3>
                  <div className="space-y-2">
                    {task.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-700 rounded p-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{comment.user.username}</span>
                          <span className="text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;