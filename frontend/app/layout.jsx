import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import { Toaster } from '../components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SocialConnect',
  description: 'Connect with friends and share your moments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto px-4 pt-16">
          {children}
        </main>
        <Toaster position="top-right"/>
      </body>
    </html>
  );
}
