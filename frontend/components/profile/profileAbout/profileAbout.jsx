"use client"

const ProfileAbout = ({ profile }) => {
  return (
    <div className="profile-about-container">
      <div className="profile-personal-info">
        {profile.nickname && (
          <span>
            Nickname: <span className="profile-data">{profile.nickname}</span>
          </span>
        )}
        {profile.email && (
          <span>
            Email:
            <a href={`mailto:${profile.email}`} className="profile-data email">
              {profile.email}
            </a>
          </span>
        )}
        {profile.date_of_birth && (
          <div className="profile-birthdate">
            Born on <span className="profile-data">{new Date(profile.date_of_birth)?.toLocaleDateString()}</span>
          </div>
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
