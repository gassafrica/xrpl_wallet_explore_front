// app.config.js
export default ({ config }) => {
  // Use a different URL for different environments if needed
  // For now, we'll keep it simple
  const API_URL = 'http://192.168.43.247:8000/api';

  return {
    ...config,
    extra: {
      apiUrl: API_URL,
    },
  };
};