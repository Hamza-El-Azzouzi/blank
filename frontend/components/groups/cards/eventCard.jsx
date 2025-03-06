"use client"
import React from 'react';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import './eventCard.css';

const EventCard = ({ event, onResponseChange }) => {
    const handleResponse = (response) => {
        onResponseChange(event.event_id, response);
    };

    return (
        <div className="event-card">
            <div className="event-info">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                    <span className="event-date">
                        <FiCalendar /> {event.date} at {event.time}
                    </span>
                    <span className="event-attendees">
                        <FiUsers /> {event.going_count} attending
                    </span>
                </div>
            </div>
            {new Date(`${event.date} ${event.time}`).getTime() > new Date().getTime() && (
                <div className="event-response-buttons">
                    <button
                        className={`response-button ${event.is_going ? 'going' : ''}`}
                        onClick={() => handleResponse('going')}
                    >
                        Going
                    </button>
                    <button
                        className={`response-button`}
                        onClick={() => handleResponse('not-going')}
                    >
                        Not Going
                    </button>
                </div>
            )}
            {/* <div className="event-response-buttons">
                <button
                    className={`response-button ${event.is_going ? 'going' : ''}`}
                    onClick={() => handleResponse('going')}
                >
                    Going
                </button>
                <button
                    className={`response-button`}
                    onClick={() => handleResponse('not-going')}
                >
                    Not Going
                </button>
            </div> */}
        </div>
    );
};

export default EventCard;