'use client';

import Link from 'next/link';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Users, Calendar } from 'lucide-react';

export default function ProfileSidebar({ className }) {
  return (
    <aside className={className}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
              alt="Current user"
              className="object-cover"
            />
          </Avatar>
          <div>
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-sm text-gray-500">View your profile</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link href="/friends" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Friends</span>
          </Link>
          <Link href="/groups" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Groups</span>
          </Link>
          <Link href="/events" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Events</span>
          </Link>
        </nav>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Your shortcuts</h4>
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="h-5 w-5 mr-3" />
              Web Developers Group
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="h-5 w-5 mr-3" />
              Tech Meetup
            </Button>
          </nav>
        </div>
      </div>
    </aside>
  );
}