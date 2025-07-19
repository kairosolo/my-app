// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Archives from './pages/Archives';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Header /> 
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/archives" element={<Archives />} /> 
        </Routes>
      </main>
    </div>
  );
}

export default App;