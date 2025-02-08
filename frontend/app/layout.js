import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'SocialConnect',
  description: 'Connect with friends and share your moments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
      <Navbar />
        <main className="container mx-auto px-4 pt-16">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}