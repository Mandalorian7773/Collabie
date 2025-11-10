import { api } from './authService';

const callService = {
  async startCall(callData) {
    try {
      const response = await api.post('/api/calls/start', callData);
      
      if (response.data.success) {
        return { 
          success: true, 
          call: response.data.call,
          message: response.data.message
        };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Start call error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to start call'
      };
    }
  },

  async joinCall(callId) {
    try {
      const response = await api.post(`/api/calls/join/${callId}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          call: response.data.call,
          message: response.data.message
        };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Join call error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to join call'
      };
    }
  },

  async leaveCall(callId) {
    try {
      const response = await api.post(`/api/calls/leave/${callId}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message
        };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Leave call error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to leave call'
      };
    }
  },

  async endCall(callId) {
    try {
      const response = await api.post(`/api/calls/end/${callId}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message
        };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('End call error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to end call'
      };
    }
  },

  async getCallDetails(callId) {
    try {
      const response = await api.get(`/api/calls/details/${callId}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          call: response.data.call
        };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Get call details error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get call details'
      };
    }
  },

  async updateCallSettings(callId, settings) {
    try {
      const response = await api.post(`/api/calls/settings/${callId}`, { settings });
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message
        };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Update call settings error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update call settings'
      };
    }
  }
};

export default callService;