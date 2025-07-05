import React, { useState } from 'react';
import UserCard from './UserCard';
import UserForm from './UserForm';

const UserList = ({ usersRef, onDataChange }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      usersRef.current = usersRef.current.filter(user => user.id !== userId);
      onDataChange(); // Force re-render
    }
  };

  const handleSaveUser = (user) => {
    if (user.id) { // Editing existing user
      usersRef.current = usersRef.current.map(u => (u.id === user.id ? user : u));
    } else { // Adding new user
      const newUser = {
        ...user,
        id: Date.now(), // Generate a unique ID
        avatar: user.avatar || 'https://placehold.co/128' 
      };
      usersRef.current = [...usersRef.current, newUser];
    }
    onDataChange(); // Force re-render
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Users</h2>
        <button onClick={handleAddUser} className="btn">Add User</button>
      </div>

      <div className="user-list">
        {usersRef.current.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default UserList;