"use client"
import React from 'react';
import { FiMail, FiCalendar, FiUser } from 'react-icons/fi';

const ProfileAbout = ({ profile }) => {
  const formatDateOfBirth = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-about-container">
      <div className="profile-personal-info">
        {profile.nickname && (
          <span>
            <FiUser />
            <span className="profile-data">{profile.nickname}</span>
          </span>
        )}

        {profile.email && (
          <span>
            <FiMail />
            <a href={`mailto:${profile.email}`} className="profile-data email">
              {profile.email}
            </a>
          </span>
        )}

        {profile.date_of_birth && (
          <span>
            <FiCalendar />
            <span className="profile-data">
              {formatDateOfBirth(profile.date_of_birth)}
            </span>
          </span>
        )}
      </div>

      {profile.about && (
        <div className="profile-about-section">
          <h3 className="about-heading">About</h3>
          <p className="about-text">{profile.about}</p>
        </div>
      )}

      {!profile.nickname && !profile.email && !profile.date_of_birth && !profile.about && (
        <div className="no-about-info">
          No profile information to display
        </div>
      )}
    </div>
  );
};

export default ProfileAbout;