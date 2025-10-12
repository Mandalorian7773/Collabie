import React, { useState } from 'react';
import TaskCard from './TaskCard';

function BoardColumn({ list, onAddTask, onMoveTask }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    onAddTask(list.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromListId = e.dataTransfer.getData('fromListId');
    
    if (taskId && fromListId) {
      onMoveTask(taskId, fromListId, list.id);
    }
  };

  return (
    <div 
      className="w-72 bg-gray-700 rounded-lg p-3 flex-shrink-0 flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-200">{list.title}</h3>
        <span className="text-xs text-gray-400">
          {list.tasks.length} {list.tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      {/* Tasks */}
      <div className="flex-1 overflow-y-auto mb-2">
        {list.tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            listId={list.id}
            onMoveTask={onMoveTask}
          />
        ))}
      </div>
      
      {/* Add Task Form */}
      {showAddTask ? (
        <div className="mt-auto">
          <textarea
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter a title for this task..."
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 resize-none"
            rows="3"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAddTask}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setShowAddTask(false);
                setNewTaskTitle('');
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="mt-auto text-left p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded transition-colors"
        >
          + Add a task
        </button>
      )}
    </div>
  );
}

export default BoardColumn;