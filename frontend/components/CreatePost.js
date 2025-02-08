'use client';

import { useState } from 'react';
import { Image, Lock, Globe, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function CreatePost({ onPost }) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onPost({
        id: Date.now(),
        user: {
          id: 1,
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        },
        content,
        image: image,
        likes: 0,
        comments: 0,
        timestamp: 'Just now',
        privacy,
      });
      setContent('');
      setImage(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
            alt="Profile"
            className="h-10 w-10 rounded-full"
          />
        </Avatar>
        <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
      </div>

      {image && (
        <div className="relative mb-4">
          <img src={image} alt="Post preview" className="rounded-lg max-h-96 w-full object-cover" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setImage(null)}
          >
            Remove
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => document.getElementById('image-upload').click()}>
            <Image className="h-5 w-5 mr-2" />
            Photo
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImage(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={privacy} onValueChange={setPrivacy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public
                </div>
              </SelectItem>
              <SelectItem value="friends">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Friends
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}