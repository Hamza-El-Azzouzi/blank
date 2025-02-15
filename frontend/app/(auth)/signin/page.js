'use client';
import { useState } from 'react';
import Link from 'next/link';
import Toast from '@/app/components/Toast';
import { useRouter } from 'next/navigation';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [toasts, setToasts] = useState([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
        showToast('success', 'Success! Operation completed.');
        router.push("/");
      }).catch((error) => {
        setError(error.message)
      })
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
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Password</label>
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
            <button type="submit" className="step-button button-next">
              Sign In
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