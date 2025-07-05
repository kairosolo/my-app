import React, { useEffect, useRef, useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import UserList from './components/UserList';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isLoggedIn, login, logout } = useContext(AuthContext);
  const usersRef = useRef([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://reqres.in/api/users?page=1&per_page=12', {
          headers: {
            'x-api-key': 'reqres-free-v1'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        usersRef.current = json.data;
        setUpdateTrigger(prev => prev + 1); // Trigger a re-render
      } catch (error) {
        console.error("Failed to fetch users:", error);
        usersRef.current = []; // Fallback to empty array on error
        setUpdateTrigger(prev => prev + 1);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = (email, password) => {
    return login(email, password, usersRef.current);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </header>
      <main>
        <UserList 
          usersRef={usersRef} 
          onDataChange={() => setUpdateTrigger(prev => prev + 1)} 
        />
      </main>
    </div>
  );
};

export default App;