import React from 'react';
import LoginForm from './LoginForm';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-container">
      <LoginForm onLogin={onLogin} />
    </div>
  );
};

export default LoginPage;