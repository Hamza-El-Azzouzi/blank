import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GetCookie } from '@/lib/cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const session = GetCookie("sessionId")
    useEffect(() => {
        validateSession();
    }, []);

    const validateSession = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ "name": "sessionId", "value": session }),
                credentials: 'include'
            });

            //   if (!response.ok) {
            //     throw new Error('Session invalid');
            //   }

            const data = await response.json();
            setIsAuthenticated(data.data !== null);

            if (data.data === null && !['/signin', '/signup'].includes(router.pathname)) {
                router.push('/signin');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setIsAuthenticated(false);
            if (!['/signin', '/signup'].includes(router.pathname)) {
                router.push('/signin');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, validateSession }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);