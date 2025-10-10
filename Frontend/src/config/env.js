// Environment configuration
const config = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://collabie.onrender.com',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'https://collabie.onrender.com',
    
    // App Configuration
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Collabie',
    
    // Environment
    NODE_ENV: import.meta.env.MODE || 'development',
};

export default config;