import './App.css';
import { BrowserRouter, Route, NavLink, Routes, Navigate } from 'react-router-dom';
import React, { useState } from 'react';

import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Article from './pages/Article';
import FormArticle from './pages/FormArticle';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <nav>
          <h1>My Articles</h1>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          
          {user && <NavLink to="/new">New Article</NavLink>}
          
          {/* Guest links */}
          {!user && <NavLink to="/login">Login</NavLink>}
          {!user && <NavLink to="/register">Register</NavLink>}
          
          {/* User-specific links and greeting */}
          {user && (
            <>
              <span className="user-greeting">Hello, {user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/articles/:urlId" element={<Article user={user} />} />

          <Route 
            path="/new" 
            element={user ? <FormArticle user={user} /> : <Navigate to="/login" />}
          />
          
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" />}
          />
          <Route 
            path="/register" 
            element={!user ? <Register onRegister={setUser} /> : <Navigate to="/" />}
          />

          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;