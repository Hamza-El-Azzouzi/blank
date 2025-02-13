'use client';

import { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function Post({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = {
      id: comments.length + 1,
      user: 'Current User',
      content: newComment,
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <Card className="w-full">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <img src={post.user.avatar} alt={post.user.name} className="object-cover" />
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.user.name}</h3>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <p className="mt-3">{post.content}</p>
        
        {post.image && (
          <div className="mt-3">
            <img
              src={post.image}
              alt="Post content"
              className="rounded-lg w-full object-cover max-h-96"
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length}</span>
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt={comment.user}
                    className="object-cover"
                  />
                </Avatar>
                <div className="flex-1 bg-gray-100 rounded-lg p-2">
                  <p className="font-semibold text-sm">{comment.user}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            <form onSubmit={handleComment} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Post</Button>
            </form>
          </div>
        )}
      </div>
    </Card>
  );
}