'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

export default function EventsPage() {
 
const [events,setEvents] = useState([
  {
    id: 1,
    title: 'Tech Meetup 2024',
    description: 'Join us for an evening of networking and tech talks!',
    date: 'April 15, 2024',
    time: '6:00 PM',
    location: 'Tech Hub, Downtown',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    organizer: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  },
  {
    id: 2,
    title: 'Web Development Workshop',
    description: 'Learn the latest web development trends and best practices.',
    date: 'April 20, 2024',
    time: '2:00 PM',
    location: 'Digital Learning Center',
    attendees: 30,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    organizer: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  }
]);
  const toggleGoing = (eventId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          going: !event.going,
          attendees: event.going ? event.attendees - 1 : event.attendees + 1
        };
      }
      return event;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button>Create Event</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map(event => (
          <Card key={event.id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <img src={event.organizer.avatar} alt={event.organizer.name}  className="object-cover h-10 w-10 rounded-full" />
                </Avatar>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-500">Organized by {event.organizer.name}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
              
              <Button
                variant={event.going ? "secondary" : "default"}
                onClick={() => toggleGoing(event.id)}
                className="mt-4"
              >
                {event.going ? 'Not Going' : 'Going'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
   
              
         
  );
}