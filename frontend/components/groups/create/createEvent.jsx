// components/events/createEvent.jsx
"use client"
import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock } from 'react-icons/fi';
import './createEvent.css';

const CreateEvent = ({ onClose, onSubmit }) => {
    const [error,setError] = useState("")
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
    });

    const handleSubmit = (e) => {
        setError("");
        e.preventDefault();
        if (eventData.title.length < 3 || eventData.title.length > 50) {
            setError('Event title must be between 3 and 50 characters')
            return;
        }

        if (eventData.description.length < 10 || eventData.description.length > 500) {
            setError('Event description must be between 10 and 500 characters')
            return;
        }
        if (!eventData.date.match(/^\d{4}-\d{2}-\d{2}$/) || !eventData.time.match(/^\d{2}:\d{2}$/)) {
            setError('Invalid date or time format');
            return;
        }
        const selectedDate = new Date(`${eventData.date} ${eventData.time}`);
        const now = new Date();
        if (selectedDate <= now) {
            setError('Event date and time must be in the future')
            return;
        }
        onSubmit(eventData);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="create-event-overlay">
            <div className="create-event-container">
                <div className="create-event-header">
                    <h2>Create Event</h2>
                    <button onClick={onClose} className="close-button">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="create-event-form">
                    <div className="form-group">
                        <input type="text" name="title" placeholder="Event Title"
                            value={eventData.title} onChange={handleChange} className="event-input" required />
                    </div>

                    <div className="form-group">
                        <textarea name="description" placeholder="Event Description" value={eventData.description}
                            onChange={handleChange} className="event-textarea" required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <div className="input-with-icon">
                                <FiCalendar className="input-icon" />
                                <input 
                                    type="date" 
                                    name="date" 
                                    value={eventData.date} 
                                    onChange={handleChange} 
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                    className="event-input" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <FiClock className="input-icon" />
                                <input type="time" name="time" value={eventData.time} onChange={handleChange} className="event-input" required />
                            </div>
                        </div>
                    </div>
                    {error && <div className="error-message">*{error}</div>}
                    <div className="create-event-footer">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="create-button" disabled={!eventData.title || !eventData.description || !eventData.date || !eventData.time}>
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;