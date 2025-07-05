import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>{user ? 'Edit User' : 'Add User'}</h2>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Avatar URL (Optional)</label>
            <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} />
          </div>
          <div className="user-card-actions">
            <button type="submit" className="btn">Save</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;