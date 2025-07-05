import React from 'react';

const UserCard = ({ user, onEdit, onDelete }) => {
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="user-card">
      <div className="user-card-avatar">
        <img src={user.avatar} alt={fullName} />
      </div>
      <div className="user-card-name">{fullName}</div>
      <div className="user-card-email">{user.email}</div>
      <div className="user-card-actions">
        <button onClick={() => onEdit(user)} className="btn btn-secondary btn-sm">Edit</button>
        <button onClick={() => onDelete(user.id)} className="btn btn-delete btn-sm">Delete</button>
      </div>
    </div>
  );
};

export default UserCard;