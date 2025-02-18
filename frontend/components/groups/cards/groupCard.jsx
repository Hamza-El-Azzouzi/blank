"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import "./groupCard.css";

const GroupCard = ({ group, onJoinClick }) => {
  const [isDisabled, setIsDisabled] = useState(group.IsPending || group.IsJoined || group.IsOwner);

  const handleJoinClick = (e) => {
    e.preventDefault();
    setIsDisabled(true);
    onJoinClick(group.GroupeId);
  };

  return (
    <Link href={`/groups/${group.GroupeId}`} className="group-card">
      <div className="group-info">
        <h3>{group.Name}</h3>
        <p>{group.Description}</p>
        <div className="group-stats">
          <span className="member-count">
            <FiUsers /> {group.Member_count} members
          </span>
          <button
            onClick={handleJoinClick}
            className={`join-button ${group.IsJoined ? "joined" : ""}`}
            disabled={isDisabled}
          >
            {group.IsOwner ? "Joined" : group.IsJoined
              ? "Joined"
              : isDisabled
              ? "Pending"
              : "Join"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
