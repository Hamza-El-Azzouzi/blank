'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BASE_URL } from '../config';
import axios from 'axios';

export default function UpdateInfoDialog({ user, onClose }) {
  const [isChanged, setIsChanged] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    nickname: user.nickname || '',
    email: user.email || '',
    about: user.about || '',
    date_of_birth: user.date_of_birth || '',
    avatar: user.avatar || '',
    is_public: user.is_public || true,
  });

  useEffect(() => {
    const hasChanged = Object.keys(formData).some((key) => formData[key].trim() !== (user[key] || '').trim());
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isChanged) return;
    console.log(formData);

    axios.put(`${BASE_URL}/user-upadte-info`, { formData })
      .then(res => {
        const data = res.data;
        console.log(data);
        
      })
      .catch(err => {
        console.error('Error updating user info:', err);
      })
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <h3 className="font-semibold text-lg border-b pb-1">Update Profile</h3>
        <div className="flex flex-col items-center mb-1 ">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Avatar className="h-24 w-24 rounded-full object-cover">
              <img src={formData.avatar || '/default-avatar.png'} alt="Avatar" />
            </Avatar>
          </label>
          <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="first_name" className="block text-sm text-gray-500 mb-1 ml-2">First Name</label>
            <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm text-gray-500 mb-1 ml-2">Last Name</label>
            <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm text-gray-500 mb-1 ml-2">Nickname</label>
            <Input id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Nickname" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-500 mb-1 ml-2">Email</label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          </div>

          <div>
            <label htmlFor="about" className="block text-sm text-gray-500 mb-1 ml-2">About You</label>
            <Input id="about" name="about" value={formData.about} onChange={handleChange} placeholder="About You" />
          </div>

          <div>
            <label htmlFor="date_of_birth" className="block text-sm text-gray-500 mb-1 ml-2">Date of Birth</label>
            <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth?.split('T')[0]} onChange={handleChange} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_public" name="is_public" checked={formData.is_public} onChange={handleChange} />
            <label htmlFor="is_public" className="text-sm">Make profile public</label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
            <Button type="submit" disabled={!isChanged}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
