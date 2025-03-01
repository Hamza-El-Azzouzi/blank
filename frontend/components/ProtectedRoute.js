import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const publicPaths = ['/signin', '/signup'];
  const isPublicPath = publicPaths.includes(router.pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push('/signin');
    }
    if (!isLoading && isAuthenticated && isPublicPath) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, isPublicPath]);

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Allow access to public paths without authentication
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show protected content only when authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
