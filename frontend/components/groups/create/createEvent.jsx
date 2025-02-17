// components/events/createEvent.jsx
"use client"
import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock } from 'react-icons/fi';
import './createEvent.css';

const CreateEvent = ({ onClose, onSubmit }) => {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        privacy: 'Public'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
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
                                <input type="date" name="date" value={eventData.date} onChange={handleChange} className="event-input" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <FiClock className="input-icon" />
                                <input type="time" name="time" value={eventData.time} onChange={handleChange} className="event-input" required />
                            </div>
                        </div>
                    </div>

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