'use client';
import { useState } from 'react';
import Link from 'next/link';
import Toast from '@/components/toast/Toast';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [toasts, setToasts] = useState([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const showToast = (type, message) => {
    const newToast = { id: Date.now(), type, message };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { 'content-type': 'application/json' },
      credentials: "include",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => { throw error; });
      }
      return response.json();
    })
      .then(() => {
        showToast('success', 'Login successful! Redirecting...');
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }).catch((error) => {
        setError(error.message)
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="auth-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      <div className="auth-box">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FiMail style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete='username'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              autoComplete='current-password'
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="step-buttons">
            <button
              type="submit"
              className="step-button button-next"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : (
                <>
                  <FiLogIn style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}