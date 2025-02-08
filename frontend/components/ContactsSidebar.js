'use client';

import { useState } from 'react';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import ChatDialog from './ChatDialog';

const MOCK_CONTACTS = [
  {
    id: 1,
    name: 'Sarah Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    online: true,
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    online: true,
  },
  // Add more mock contacts
];

export default function ContactsSidebar({ className }) {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <aside className={`${className} space-y-4`}>
      <h2 className="font-semibold text-gray-600 mb-4">Contacts</h2>
      <div className="space-y-2">
        {MOCK_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <img src={contact.avatar} alt={contact.name} className="h-8 w-8 rounded-full" />
                </Avatar>
                {contact.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
              <span className="font-medium">{contact.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedContact(contact)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {selectedContact && (
        <ChatDialog
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </aside>
  );
}