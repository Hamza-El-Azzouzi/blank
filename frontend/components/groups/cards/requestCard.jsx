// components/groups/eventCard.jsx
"use client"
import React from 'react';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import './eventCard.css';

const RequestCard = ({ request, onResponseChange }) => {
    console.log(request)
    const handleResponse = (response) => {
        onResponseChange(request.id, response);
    };

    return (
        <div className="event-card">
            <div className="event-info">
                <h3>{request.title}</h3>
            </div>
            <div className="event-response-buttons">
                <button
                    className={`response-button`}
                    onClick={() => handleResponse('going')}
                >
                    Accepte
                </button>
                <button
                    className={`response-button`}
                    onClick={() => handleResponse('not-going')}
                >
                    Decline
                </button>
            </div>
        </div>
    );
};

export default RequestCard;