import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueDate: {
        type: Date
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [taskSchema]
}, {
    timestamps: true
});

const boardSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true,
        unique: true
    },
    lists: [listSchema]
}, {
    timestamps: true
});

// Index for faster queries
boardSchema.index({ channelId: 1 });

// Method to create a new list
boardSchema.methods.createList = function(title) {
    const newList = {
        _id: new mongoose.Types.ObjectId(),
        title,
        tasks: []
    };
    
    this.lists.push(newList);
    return this.save();
};

// Method to add a task to a list
boardSchema.methods.addTask = function(listId, taskData) {
    const list = this.lists.id(listId);
    if (!list) {
        throw new Error('List not found');
    }
    
    const newTask = {
        _id: new mongoose.Types.ObjectId(),
        ...taskData
    };
    
    list.tasks.push(newTask);
    return this.save();
};

// Method to update a task
boardSchema.methods.updateTask = function(listId, taskId, updates) {
    const list = this.lists.id(listId);
    if (!list) {
        throw new Error('List not found');
    }
    
    const task = list.tasks.id(taskId);
    if (!task) {
        throw new Error('Task not found');
    }
    
    Object.assign(task, updates);
    return this.save();
};

// Method to move a task to another list
boardSchema.methods.moveTask = function(fromListId, taskId, toListId) {
    const fromList = this.lists.id(fromListId);
    if (!fromList) {
        throw new Error('Source list not found');
    }
    
    const task = fromList.tasks.id(taskId);
    if (!task) {
        throw new Error('Task not found');
    }
    
    const toList = this.lists.id(toListId);
    if (!toList) {
        throw new Error('Destination list not found');
    }
    
    // Remove task from source list
    fromList.tasks.pull(taskId);
    
    // Add task to destination list
    toList.tasks.push(task);
    
    return this.save();
};

// Static method to find board by channel ID
boardSchema.statics.findByChannelId = function(channelId) {
    return this.findOne({ channelId });
};

const Board = mongoose.model('Board', boardSchema);

export default Board;