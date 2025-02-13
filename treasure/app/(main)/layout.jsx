import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SocialConnect',
  description: 'Connect with friends and share your moments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto px-4 pt-16">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
