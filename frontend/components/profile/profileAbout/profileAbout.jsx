"use client"

import { MdOutlineMail } from "react-icons/md";

const ProfileAbout = ({ profile }) => {
  return (
    <div className="profile-about-container">
      <div className="profile-personal-info">
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="profile-email-link">
            <MdOutlineMail className="email-icon" /> {profile.email}
          </a>
        )}
        {profile.date_of_birth && (
          <p className="profile-birthdate">
            Born on {new Date(profile.date_of_birth)?.toLocaleDateString()}
          </p>
        )}
      </div>
      {profile.about && (
        <div className="profile-about-section">
          <h3 className="about-heading">About</h3>
          <p className="about-text">{profile.about}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileAbout;