// components/sidebars/navSidebar.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiBell, FiUsers, FiUser, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';
import './sidebar.css';
import * as cookies from '@/lib/cookie';
import { useRouter } from 'next/navigation';

const NavSidebar = () => {
  const router = useRouter()
  const [cookieValue, setCookieValue] = useState(null);
  const [profilePath, setProfilePath] = useState('#');

  useEffect(() => {
    setCookieValue(cookies.GetCookie("sessionId"));
  }, [cookieValue]);

  useEffect(() => {
    if (cookieValue) {
      getProfilePath();
    }
  }, [cookieValue]);

  const handleLogOut = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/logout`, {
      method: "GET",
      credentials: "include",
      headers: { 'Authorization': `Bearer ${cookieValue}` }

    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => { throw error; });
        }
        return response.json();
      })
      .then(() => {
        cookies.DeleteCookie("sessionId")
      }).catch(() => {
        router.push("/");
      })
  }

  const getProfilePath = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          name: "token",
          value: cookieValue
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user ID');
      }

      setProfilePath(`/profile/${data.data}`);
    } catch (error) {
      console.error('Error fetching profile path:', error);
    }
  };

  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <BiSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <nav className="nav-menu">
        <ul>
          <li className="nav-item">
            <Link href="/" className="nav-link">
              <FiHome className="nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/groups" className="nav-link">
              <FiUsers className="nav-icon" />
              <span>Groups</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/notifications" className="nav-link">
              <FiBell className="nav-icon" />
              <span>Notifications</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/messages" className="nav-link">
              <FiMessageSquare className="nav-icon" />
              <span>Messages</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href={profilePath} className="nav-link" >
              <FiUser className="nav-icon" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="nav-footer">
        <Link href="/signin" onClick={handleLogOut} className="nav-link logout">
          <FiLogOut className="nav-icon" />
          <span>Log out</span>
        </Link>
      </div>
    </>
  );
};

export default NavSidebar;