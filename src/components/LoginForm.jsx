import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('byron.fields@reqres.in');
  const [password, setPassword] = useState('password123');
  
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setError('');

    if (!onLogin(email, password)) {
      setError('Invalid email or password.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h1>The HQ</h1>
      <h2>User Manager Login</h2>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="error-message">{error}</div>
      
      <button type="submit" className="btn">Login</button>
    </form>
  );
};

export default LoginForm;