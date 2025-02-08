'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Home, Users, MessageCircle, Calendar, Search, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              _blank
            </Link>
            <div className="hidden md:flex ml-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/groups">
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost" size="icon">
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Avatar className="h-8 w-8">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </Avatar>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md hover:bg-gray-100">
              Home
            </Link>
            <Link href="/groups" className="block px-3 py-2 rounded-md hover:bg-gray-100">
              Groups
            </Link>
            <Link href="/events" className="block px-3 py-2 rounded-md hover:bg-gray-100">
              Events
            </Link>
            <Link href="/messages" className="block px-3 py-2 rounded-md hover:bg-gray-100">
              Messages
            </Link>
            <Link href="/notifications" className="block px-3 py-2 rounded-md hover:bg-gray-100">
              Notifications
            </Link>
            <Link href="/profile" className="block px-3 py-2 rounded-md hover:bg-gray-100">
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}