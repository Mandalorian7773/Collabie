const serverResolvers = {
  Query: {
    // Server Queries
    getUserServers: async (_, __, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const servers = await models.Server.findByUserId(user._id);
        return servers;
      } catch (error) {
        throw new Error('Failed to fetch servers');
      }
    },
    
    getServerById: async (_, { serverId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findById(serverId)
          .populate('owner', 'username email avatar role')
          .populate('members.userId', 'username email avatar role lastActive');
        
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is a member of the server
        const isMember = server.members.some(member => 
          member.userId._id.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to view this server');
        }
        
        return server;
      } catch (error) {
        throw new Error('Failed to fetch server');
      }
    },
    
    getServerByInviteCode: async (_, { inviteCode }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findByInviteCode(inviteCode)
          .populate('owner', 'username email avatar role')
          .populate('members.userId', 'username email avatar role');
        
        if (!server) {
          throw new Error('Invalid invite code');
        }
        
        return server;
      } catch (error) {
        throw new Error('Failed to fetch server by invite code');
      }
    },
    
    // Channel Queries
    getChannelsByServer: async (_, { serverId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        // First verify user has access to the server
        const server = await models.Server.findById(serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to view channels');
        }
        
        const channels = await models.Channel.findByServerId(serverId);
        return channels;
      } catch (error) {
        throw new Error('Failed to fetch channels');
      }
    },
    
    // Board Queries
    getBoardByChannel: async (_, { channelId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        // First verify user has access to the channel
        const channel = await models.Channel.findById(channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        // Verify user has access to the server
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to view board');
        }
        
        const board = await models.Board.findByChannelId(channelId);
        if (board) {
          // Populate the channelId field to ensure channel data is available
          await board.populate('channelId');
        }
        return board;
      } catch (error) {
        throw new Error('Failed to fetch board');
      }
    }
  },
  
  Mutation: {
    // Server Mutations
    createServer: async (_, { name }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = new models.Server({
          name,
          owner: user._id
        });
        
        await server.save();
        
        // Populate the server with owner and members data
        await server.populate('owner', 'username email avatar role');
        await server.populate('members.userId', 'username email avatar role');
        
        return server;
      } catch (error) {
        throw new Error('Failed to create server');
      }
    },
    
    generateInviteCode: async (_, { serverId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findById(serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is the owner or admin
        const member = server.members.find(m => 
          m.userId.toString() === user._id.toString()
        );
        
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
          throw new Error('Not authorized to generate invite code');
        }
        
        await server.generateInviteCode();
        return server.inviteCode;
      } catch (error) {
        throw new Error('Failed to generate invite code');
      }
    },
    
    joinServer: async (_, { inviteCode }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findByInviteCode(inviteCode);
        if (!server) {
          throw new Error('Invalid invite code');
        }
        
        // Check if user is already a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (isMember) {
          throw new Error('Already a member of this server');
        }
        
        // Add user as a member
        await server.addMember(user._id, 'member');
        
        // Populate the server with owner and members data
        await server.populate('owner', 'username email avatar role');
        await server.populate('members.userId', 'username email avatar role');
        
        return server;
      } catch (error) {
        throw new Error('Failed to join server');
      }
    },
    
    updateMemberRole: async (_, { serverId, userId, role }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findById(serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is the owner or admin
        const requestingMember = server.members.find(m => 
          m.userId.toString() === user._id.toString()
        );
        
        if (!requestingMember || (requestingMember.role !== 'owner' && requestingMember.role !== 'admin')) {
          throw new Error('Not authorized to update member roles');
        }
        
        // Check if target user is a member
        const targetMember = server.members.find(m => 
          m.userId.toString() === userId.toString()
        );
        
        if (!targetMember) {
          throw new Error('User is not a member of this server');
        }
        
        // Prevent removing owner role from the actual owner
        if (targetMember.role === 'owner' && server.owner.toString() === userId.toString()) {
          throw new Error('Cannot change the role of the server owner');
        }
        
        await server.updateMemberRole(userId, role);
        return true;
      } catch (error) {
        throw new Error('Failed to update member role');
      }
    },
    
    sendServerInvite: async (_, { serverId, email }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findById(serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is the owner or admin
        const member = server.members.find(m => 
          m.userId.toString() === user._id.toString()
        );
        
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
          throw new Error('Not authorized to send invites');
        }
        
        // In a real implementation, you would send an email here
        // For now, we'll just return true to indicate success
        console.log(`Invite sent to ${email} for server ${server.name} with code ${server.inviteCode}`);
        return true;
      } catch (error) {
        throw new Error('Failed to send server invite');
      }
    },
    
    leaveServer: async (_, { serverId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findById(serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is the owner
        if (server.owner.toString() === user._id.toString()) {
          throw new Error('Server owner cannot leave the server');
        }
        
        // Check if user is a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not a member of this server');
        }
        
        await server.removeMember(user._id);
        return true;
      } catch (error) {
        throw new Error('Failed to leave server');
      }
    },
    
    // Channel Mutations
    createChannel: async (_, { serverId, name, type }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const server = await models.Server.findById(serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is the owner or admin
        const member = server.members.find(m => 
          m.userId.toString() === user._id.toString()
        );
        
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
          throw new Error('Not authorized to create channels');
        }
        
        const channel = new models.Channel({
          name,
          type,
          serverId
        });
        
        await channel.save();
        return channel;
      } catch (error) {
        throw new Error('Failed to create channel');
      }
    },
    
    deleteChannel: async (_, { channelId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const channel = await models.Channel.findById(channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is the owner or admin
        const member = server.members.find(m => 
          m.userId.toString() === user._id.toString()
        );
        
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
          throw new Error('Not authorized to delete channels');
        }
        
        await models.Channel.findByIdAndDelete(channelId);
        return true;
      } catch (error) {
        throw new Error('Failed to delete channel');
      }
    },
    
    // Board Mutations
    createBoard: async (_, { channelId }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const channel = await models.Channel.findById(channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        // Verify it's a board channel
        if (channel.type !== 'board') {
          throw new Error('Can only create boards for board channels');
        }
        
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to create board');
        }
        
        // Check if board already exists for this channel
        const existingBoard = await models.Board.findByChannelId(channelId);
        if (existingBoard) {
          throw new Error('Board already exists for this channel');
        }
        
        const board = new models.Board({
          channelId
        });
        
        await board.save();
        
        // Populate the channelId field to ensure channel data is available
        await board.populate('channelId');
        
        return board;
      } catch (error) {
        throw new Error('Failed to create board');
      }
    },
    
    createList: async (_, { boardId, title }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const board = await models.Board.findById(boardId);
        if (!board) {
          throw new Error('Board not found');
        }
        
        const channel = await models.Channel.findById(board.channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to create list');
        }
        
        await board.createList(title);
        return board.lists[board.lists.length - 1];
      } catch (error) {
        throw new Error('Failed to create list');
      }
    },
    
    addTask: async (_, { listId, title }, { user, models }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        // Find the board that contains this list
        const board = await models.Board.findOne({ 'lists._id': listId });
        if (!board) {
          throw new Error('Board not found');
        }
        
        const channel = await models.Channel.findById(board.channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to add task');
        }
        
        await board.addTask(listId, { title });
        
        // Find the updated task to return
        const updatedBoard = await models.Board.findById(board._id);
        const list = updatedBoard.lists.id(listId);
        const task = list.tasks[list.tasks.length - 1];
        
        return task;
      } catch (error) {
        throw new Error('Failed to add task');
      }
    },
    
    updateTask: async (_, { taskId, updates }, { user, models, pubsub }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        // Find the board that contains this task
        const board = await models.Board.findOne({ 'lists.tasks._id': taskId });
        if (!board) {
          throw new Error('Board not found');
        }
        
        const channel = await models.Channel.findById(board.channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to update task');
        }
        
        // Find the list and task
        let listId;
        for (const list of board.lists) {
          const task = list.tasks.id(taskId);
          if (task) {
            listId = list._id;
            break;
          }
        }
        
        if (!listId) {
          throw new Error('Task not found');
        }
        
        await board.updateTask(listId, taskId, updates);
        
        // Find the updated task to return
        const updatedBoard = await models.Board.findById(board._id);
        let updatedTask;
        for (const list of updatedBoard.lists) {
          const task = list.tasks.id(taskId);
          if (task) {
            updatedTask = task;
            break;
          }
        }
        
        // Publish the update to subscribers
        pubsub.publish('TASK_UPDATED', { taskUpdated: updatedTask });
        
        return updatedTask;
      } catch (error) {
        throw new Error('Failed to update task');
      }
    },
    
    moveTask: async (_, { taskId, toListId }, { user, models, pubsub }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      try {
        // Find the board that contains this task
        const board = await models.Board.findOne({ 'lists.tasks._id': taskId });
        if (!board) {
          throw new Error('Board not found');
        }
        
        const channel = await models.Channel.findById(board.channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }
        
        const server = await models.Server.findById(channel.serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Check if user is a member
        const isMember = server.members.some(member => 
          member.userId.toString() === user._id.toString()
        );
        
        if (!isMember) {
          throw new Error('Not authorized to move task');
        }
        
        // Find the source list
        let fromListId;
        for (const list of board.lists) {
          const task = list.tasks.id(taskId);
          if (task) {
            fromListId = list._id;
            break;
          }
        }
        
        if (!fromListId) {
          throw new Error('Task not found');
        }
        
        await board.moveTask(fromListId, taskId, toListId);
        
        // Find the moved task to return
        const updatedBoard = await models.Board.findById(board._id);
        let movedTask;
        for (const list of updatedBoard.lists) {
          const task = list.tasks.id(taskId);
          if (task) {
            movedTask = task;
            break;
          }
        }
        
        // Publish the move to subscribers
        pubsub.publish('TASK_MOVED', { taskMoved: movedTask });
        
        return true;
      } catch (error) {
        throw new Error('Failed to move task');
      }
    }
  },
  
  Subscription: {
    taskAdded: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['TASK_ADDED'])
    },
    taskUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['TASK_UPDATED'])
    },
    taskMoved: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['TASK_MOVED'])
    }
  },
  
  Server: {
    members: (server) => {
      return server.members.map(member => ({
        userId: member.userId,
        role: member.role
      }));
    },
    channels: async (server, _, { models }) => {
      try {
        const channels = await models.Channel.findByServerId(server._id);
        // Ensure all channels have proper string IDs
        return channels.map(channel => ({
          ...channel.toObject ? channel.toObject() : channel,
          id: channel._id.toString(),
          serverId: channel.serverId ? {
            ...(channel.serverId.toObject ? channel.serverId.toObject() : channel.serverId),
            id: channel.serverId._id ? channel.serverId._id.toString() : channel.serverId.toString()
          } : channel.serverId
        }));
      } catch (error) {
        return [];
      }
    }
  },
  
  ServerMember: {
    userId: async (member, _, { models }) => {
      // If userId is already populated, return it
      if (typeof member.userId !== 'string') {
        // If it's an ObjectId, convert it to a proper user object
        if (member.userId && typeof member.userId === 'object' && member.userId._id) {
          return {
            ...member.userId.toObject ? member.userId.toObject() : member.userId,
            id: member.userId._id.toString()
          };
        }
        // If it's just an ObjectId, fetch the user
        try {
          const user = await models.User.findById(member.userId);
          if (user) {
            return {
              ...user.toObject(),
              id: user._id.toString()
            };
          }
        } catch (error) {
          return null;
        }
      }
      return member.userId;
    }
  },
  
  Channel: {
    serverId: async (channel, _, { models }) => {
      // If serverId is already populated, return it
      if (typeof channel.serverId !== 'string') {
        // If it's an ObjectId, convert it to a proper server object
        if (channel.serverId && typeof channel.serverId === 'object' && channel.serverId._id) {
          return {
            ...channel.serverId.toObject ? channel.serverId.toObject() : channel.serverId,
            id: channel.serverId._id.toString()
          };
        }
        // If it's just an ObjectId, fetch the server
        try {
          const server = await models.Server.findById(channel.serverId);
          if (server) {
            return {
              ...server.toObject(),
              id: server._id.toString()
            };
          }
        } catch (error) {
          return null;
        }
      }
      return channel.serverId;
    }
  },
  
  Board: {
    channelId: async (board, _, { models }) => {
      // If channelId is already populated, return it
      if (typeof board.channelId !== 'string') {
        // If it's an ObjectId, convert it to a proper channel object
        if (board.channelId && typeof board.channelId === 'object' && board.channelId._id) {
          return {
            ...board.channelId.toObject ? board.channelId.toObject() : board.channelId,
            id: board.channelId._id.toString()
          };
        }
        // If it's just an ObjectId, fetch the channel
        try {
          const channel = await models.Channel.findById(board.channelId);
          if (channel) {
            return {
              ...channel.toObject(),
              id: channel._id.toString()
            };
          }
        } catch (error) {
          return null;
        }
      }
      return board.channelId;
    }
  },
  
  Task: {
    assignedTo: async (task, _, { models }) => {
      if (!task.assignedTo) return null;
      
      // If assignedTo is already populated, return it
      if (typeof task.assignedTo !== 'string') {
        // If it's an ObjectId, convert it to a proper user object
        if (task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo._id) {
          return {
            ...task.assignedTo.toObject ? task.assignedTo.toObject() : task.assignedTo,
            id: task.assignedTo._id.toString()
          };
        }
        // If it's just an ObjectId, fetch the user
        try {
          const user = await models.User.findById(task.assignedTo);
          if (user) {
            return {
              ...user.toObject(),
              id: user._id.toString()
            };
          }
        } catch (error) {
          return null;
        }
      }
      return task.assignedTo;
    },
    comments: (task) => {
      return task.comments || [];
    }
  },
  
  Comment: {
    user: async (comment, _, { models }) => {
      // If user is already populated, return it
      if (typeof comment.user !== 'string') {
        // If it's an ObjectId, convert it to a proper user object
        if (comment.user && typeof comment.user === 'object' && comment.user._id) {
          return {
            ...comment.user.toObject ? comment.user.toObject() : comment.user,
            id: comment.user._id.toString()
          };
        }
        // If it's just an ObjectId, fetch the user
        try {
          const user = await models.User.findById(comment.user);
          if (user) {
            return {
              ...user.toObject(),
              id: user._id.toString()
            };
          }
        } catch (error) {
          return null;
        }
      }
      return comment.user;
    }
  }
};

export default serverResolvers;