'use client';

import { useState } from 'react';
import { Users, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';

export default function GroupsPage() {
  const [groups] = useState([
    {
      id: 1,
      name: 'Web Developers Community',
      description: 'A group for web developers to share knowledge and experiences.',
      members: 1250,
      posts: 324,
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      recentMembers: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ]
    },
    {
      id: 2,
      name: 'UI/UX Design Hub',
      description: 'Share and discuss UI/UX design trends, tools, and best practices.',
      members: 856,
      posts: 198,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      recentMembers: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ]
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button>Create Group</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map(group => (
          <Card key={group.id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4">{group.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500">{group.members} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500">{group.posts} posts</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.recentMembers.map((avatar, index) => (
                    <Avatar key={index} className="border-2 border-white">
                      <img src={avatar} alt="Member" className="object-cover h-10 w-10 rounded-full" />
                    </Avatar>
                  ))}
                </div>
                <Button>Join Group</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}