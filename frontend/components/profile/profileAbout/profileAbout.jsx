"use client"

import { MdOutlineMail } from "react-icons/md";

const ProfileAbout = ({ profile }) => {
  return (
    <div className="profile-about-container">
      <div className="profile-personal-info">
        {profile.nickname && (
          <span>
            Nickname :<p className="profile-data"> {profile.nickname}</p></span>
        )}
        {profile.email && (
          <span>
            Email :
            <a href={`mailto:${profile.email}`} className="profile-data email"> 
              {profile.email}
            </a>
          </span>
        )}
        {profile.date_of_birth && (
          <p className="profile-birthdate">
            Born on <p className="profile-data">{new Date(profile.date_of_birth)?.toLocaleDateString()}</p>
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