'use client';

import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// export const metadata = {
//   title: "Social Network",
//   description: "Connect with friends and share your moments",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <div className="container">
              {children}
            </div>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
