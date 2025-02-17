// components/sidebars/navSidebar.jsx
import React,{useState,useEffect} from 'react';
import Link from 'next/link';
import { FiHome, FiBell, FiUsers, FiUser, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';
import './sidebar.css';
import * as cookies from '@/lib/cookie';

import { useRouter } from 'next/navigation';

const NavSidebar = () => {
  const [cookieValue, setCookieValue] = useState(null);
  useEffect(() => {
    setCookieValue(cookies.GetCookie("sessionId"));
}, [cookieValue]);
  const router = useRouter()
  const handleLogOut = () => {

    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/logout`,{
      method :"GET",
      credentials:"include",
      headers :{'Authorization':`Bearer ${cookieValue}`}
      
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => { throw error; });
        }
        return response.json();
      })
      .then(() => {
        cookies.DeleteCookie("sessionId")
        router.push("/signin");
      }).catch(() => {
        router.push("/");
      })
  }

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
            <Link href="/my-profile" className="nav-link">
              <FiUser className="nav-icon" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="nav-footer">
        <button onClick={handleLogOut} className="nav-link logout">
          <FiLogOut className="nav-icon" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );
};

export default NavSidebar;