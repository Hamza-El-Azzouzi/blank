'use client';

import "./globals.css";


// export const metadata = {
//   title: "Social Network",
//   description: "Connect with friends and share your moments",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
