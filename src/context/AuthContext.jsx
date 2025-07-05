import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (email, password, users) => {
    const defaultPassword = "password123";
    const user = users.find(u => u.email === email);

    if (user && password === defaultPassword) {
      setIsLoggedIn(true);
      return true;
    }
    
    setIsLoggedIn(false);
    return false; 
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};