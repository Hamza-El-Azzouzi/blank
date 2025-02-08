'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';

export default function ChatDialog({ contact, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: contact.id,
      content: 'Hey, how are you?',
      timestamp: '2:30 PM',
    },
    {
      id: 2,
      sender: 'me',
      content: 'I\'m good! How about you?',
      timestamp: '2:31 PM',
    },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now(),
          sender: 'me',
          content: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar>
            <img src={contact.avatar} alt={contact.name} className="h-10 w-10 rounded-full" />
          </Avatar>
          <div>
            <h3 className="font-semibold">{contact.name}</h3>
            <span className="text-sm text-green-500">Active now</span>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}