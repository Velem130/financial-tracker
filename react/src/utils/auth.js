// src/utils/auth.js

export const authUtils = {
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Set token in localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Remove token from localStorage (logout)
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  // Get user info from localStorage
  getUser: () => {  // This is the correct method name
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Set user info in localStorage
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Remove user info from localStorage
  removeUser: () => {
    localStorage.removeItem('user');
  },
  
  // Set both token and user
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};