'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription } from './ui/dialog';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { BASE_URL } from '../config';
import axios from 'axios';
import { toast } from 'sonner';

export default function UpdateInfoDialog({ user, onClose, setProfile }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isChanged) return;

    axios.put(`${BASE_URL}/user-upadte-info`, formData)
      .then(res => {
        const data = res.data;
        if (data.message === "success") {
          setProfile(formData);
          toast.success(data.message)
          onClose()
        } else {
          toast.error(data.message)
        }
      })
      .catch(err => {
        console.error('Error updating user info:', err);
        toast.error(err)
      })
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogDescription>Update Profile</DialogDescription>
      <DialogContent className="sm:max-w-[425px] p-6">
        <h3 className="font-semibold text-lg border-b pb-1">Update Profile</h3>
        <div className="flex flex-col items-center  ">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Avatar className="h-24 w-24 rounded-full object-cover">
              <img src={formData.avatar || '/default-avatar.jpg'} alt="Avatar" />
            </Avatar>
          </label>
          <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
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
            <Textarea className="resize-none" name="about" id="about" value={formData.about} onChange={handleChange} placeholder="About You" />
          </div>

          <div>
            <label htmlFor="date_of_birth" className="block text-sm text-gray-500 mb-1 ml-2">Date of Birth</label>
            <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth?.split('T')[0]} onChange={handleChange} />
          </div>

          <div className="">
            <label className="block text-sm text-gray-500 mb-1 ml-2">Profile Privacy</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <Input type="radio" value="true" checked={formData.is_public === true} onChange={() => setFormData({ ...formData, is_public: true })} />
                <span>Public</span>
              </label>
              <label className="flex items-center space-x-2">
                <Input type="radio" value="false" checked={formData.is_public === false} onChange={() => setFormData({ ...formData, is_public: false })} />
                <span>Private</span>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {formData.is_public === true
                ? 'Your profile will be visible to everyone'
                : 'Only approved followers can see your profile'}
            </p>
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
