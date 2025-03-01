'use client';

import { useState, useEffect } from 'react';
import { validateForm } from '@/lib/validateUserInfo';

export default function UpdateInfoDialog({ user, onClose, setProfile, cookieValue }) {
  const [isChanged, setIsChanged] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    nickname: user.nickname || '',
    email: user.email || '',
    about: user.about || '',
    date_of_birth: user.date_of_birth || '',
    avatar: user.avatar || '',
    is_public: user.is_public,
  });

  useEffect(() => {
    const hasChanged = Object.keys(formData).some((key) => formData[key] !== (user[key] || ''));
    setIsChanged(hasChanged);
  }, [formData, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChanged) return;
    formData.date_of_birth = formData.date_of_birth?.split('T')[0];
    if (formData?.avatar?.includes("default-avatar")) formData.avatar = null

    const validation = validateForm(formData);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}/api/user-update-info`, {
        method: 'PUT',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookieValue}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.message === 'success') {
        if (!formData.avatar) formData.avatar = '/default-avatar.jpg'
        formData.followers = user.followers;
        formData.following = user.following;
        formData.is_owner = user.is_owner;

        setProfile(formData);
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="profile-dialog-content">
        <label htmlFor="avatar-upload" className="avatar-container">
          <img src={formData.avatar || '/default-avatar.jpg'} alt="Avatar" className="avatar-update" />
        </label>
        <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} />

        <form onSubmit={handleSubmit}>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" />
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Nickname" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          <textarea name="about" value={formData.about} onChange={handleChange} placeholder="About You"></textarea>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth ? new Date(formData.date_of_birth)?.toISOString().split('T')[0] : new Date()?.toISOString().split('T')[0]}
            onChange={handleChange}
          />
          <div>
            <label>
              <input type="radio" value="true" checked={formData.is_public === true} onChange={() => setFormData({ ...formData, is_public: true })} />
              Public
            </label>
            <label>
              <input type="radio" value="false" checked={formData.is_public === false} onChange={() => setFormData({ ...formData, is_public: false })} />
              Private
            </label>
          </div>
          <p>{formData.is_public ? 'Your profile will be visible to everyone' : 'Only approved followers can see your profile'}</p>
          <div className='form-action'>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!isChanged}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
