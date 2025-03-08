import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { FiHome, FiBell, FiUsers, FiUser, FiLogOut } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';
import './sidebar.css';
import * as cookies from '@/lib/cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchBlob } from '@/lib/fetch_blob';
import Toast from '../toast/Toast';
const NavSidebar = () => {
  const cookieValue = cookies.GetCookie("sessionId");
  const router = useRouter()
  const [profilePath, setProfilePath] = useState('#');
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchResultsRef = useRef(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message) => {
    const newToast = { id: Date.now(), type, message };
    setToasts((prevToasts) => [...prevToasts, newToast]);
};
const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
};
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

  const debouncedSearch = useCallback((query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, []);

  const performSearch = async (query, pageNum = 1) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/searchusers?q=${query}&page=${pageNum}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${cookieValue}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data.users)) {
        const users = await Promise.all(data.data.users.map(async (user) => {
          user.avatar = user.avatar
            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
            : '/default-avatar.jpg';
          return user;
        }));

        setSearchResults(prev => {
          if (pageNum === 1) {
            return users;
          }
          return [...prev, ...users];
        });
        
        setHasMore(data.data.hasMore);
        setPage(pageNum);
      } else {
        if (pageNum === 1) {
          setSearchResults([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      showToast('error', "An Error Occure, Try Later!!");
      if (pageNum === 1) {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!searchResultsRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = searchResultsRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      performSearch(searchQuery, page + 1);
    }
  }, [isLoading, hasMore, searchQuery, page]);

  useEffect(() => {
    const currentRef = searchResultsRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPage(1); 
    if (query.length < 1) {
      setSearchResults([]);
      setHasMore(true);
      return;
    }
    debouncedSearch(query);
  };

  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <BiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        {searchQuery && (
          <div className="search-results" ref={searchResultsRef}>
            {isLoading && searchResults.length === 0 ? (
              <div className="search-result-item">Loading...</div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((user) => (
                  <Link
                    key={user.user_id}
                    href={`/profile/${user.user_id}`}
                    className="search-result-item"
                    onClick={() => setSearchQuery('')}
                  >
                    <div className="search-result-avatar">
                      <Image
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                        width={32}
                        height={32}
                      />
                    </div>
                    <span>{user.first_name} {user.last_name}</span>
                  </Link>
                ))}
                {isLoading && <div className="search-result-item loading">Loading more...</div>}
              </>
            ) : (
              <div className="search-result-item">No results found</div>
            )}
          </div>
        )}
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
      {
    toasts.map((toast) => (
        <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
        />
    ))
}
    </>
  );
};

export default NavSidebar;