// components/groups/eventCard.jsx
"use client"
import React from 'react';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import './eventCard.css';

const RequestCard = ({ request, onResponseChange }) => {

    const handleResponse = (response,userId) => {
        onResponseChange(request.GroupId, response,userId);
    };

    return (
        <div className="event-card">
            <div className="event-info">
                <h3>{request.Last_Name} {request.First_Name}</h3>
            </div>
            <div className="event-response-buttons">
                <button
                    className={`response-button`}
                    onClick={() => handleResponse('accepted',request.UserId)}
                >
                    Accepte
                </button>
                <button
                    className={`response-button`}
                    onClick={() => handleResponse('declined',request.UserId)}
                >
                    Decline
                </button>
            </div>
        </div>
    );
};

export default RequestCard;