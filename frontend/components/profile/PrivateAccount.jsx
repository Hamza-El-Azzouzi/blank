'use client';
import { FaUserLock } from "react-icons/fa6";

export default function PrivateAccount() {
  return (
    <div className="user-private">
      <div>
        <FaUserLock className="user-private-icon" />
        <h3>This account is private</h3>
        <p>Follow to see more</p>
      </div>
    </div>
  );
}
