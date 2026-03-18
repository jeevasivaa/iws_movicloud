import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const loginAsMockUser = useCallback((role) => {
    const mockUsers = {
      admin: { name: 'Priya Nair', email: 'admin@vsa.com', role: 'admin' },
      operations: { name: 'Alex Thompson', email: 'operations@vsa.com', role: 'operations' },
      finance: { name: 'Liam Carter', email: 'finance@vsa.com', role: 'finance' },
      client: { name: 'Bistro Group', email: 'contact@bistro.com', role: 'client' },
    };
    const userData = mockUsers[role] || mockUsers.client;
    login(userData, 'mock-jwt-token');
  }, [login]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    loginAsMockUser
  }), [user, token, login, logout, loginAsMockUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
