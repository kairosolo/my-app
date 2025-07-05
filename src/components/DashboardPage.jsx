import React from 'react';
import UserList from './UserList';

const DashboardPage = ({ usersRef, onDataChange, onLogout }) => {
  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </header>
      <main>
        <UserList usersRef={usersRef} onDataChange={onDataChange} />
      </main>
    </div>
  );
};

export default DashboardPage;