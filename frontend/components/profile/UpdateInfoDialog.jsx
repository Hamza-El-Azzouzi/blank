'use client';

import { useState, useEffect } from 'react';

function sanitizeAvatar(avatar) {
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  const safeUrlPattern = /^http?:\/\/[^\s/$.?#].[^\s]*$/i;
  if (dataUrlPattern.test(avatar) || safeUrlPattern.test(avatar)) {
    return avatar;
 }
 return null;
}
import { validateForm } from '@/lib/validateUserInfo';
import Toast from '../toast/Toast';
export default function UpdateInfoDialog({ user, onClose, setProfile, cookieValue }) {
  const [isChanged, setIsChanged] = useState(false);
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState([]);
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

  const showToast = (type, message) => {
    const newToast = { id: Date.now(), type, message };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  useEffect(() => {
    const hasChanged = Object.keys(formData).some((key) => formData[key] !== (user[key] || ''));
    setIsChanged(hasChanged);
  }, [formData, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFormData(newFormData);

    const validation = validateForm(newFormData);
    setError(validation.isValid ? "" : validation.message);
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
      if (data.status !== 200) {
        throw new Error("An Error Occure, Try Later!!")
      }
      if (!formData.avatar) formData.avatar = '/default-avatar.jpg'
      formData.followers = user.followers;
      formData.following = user.following;
      formData.is_owner = user.is_owner;

      setProfile(formData);
      onClose();
    } catch (error) {
      showToast('error', "An Error Occure, Try Later!!");
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="profile-dialog-content">
        <label htmlFor="avatar-upload" className="avatar-container">
          <img src={sanitizeAvatar(formData.avatar) || '/default-avatar.jpg'} alt="Avatar" className="avatar-update" />
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
          {error && <div className="error-message">{error}</div>}
          <div className='form-action'>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!isChanged}>Save</button>
          </div>
        </form>

      </div>
      {
        toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))
      }
    </div>
  );
}
