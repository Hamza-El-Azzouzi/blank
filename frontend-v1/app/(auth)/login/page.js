'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await axios.post('http://127.0.0.1:1414/api/login', formData)
            .then(() => {
                toast.success('Login successful!');
                setTimeout(() => {
                    router.replace('/')
                }, 500);
            }).catch((error) => {
                const errorMessage = error.response?.data?.message || 'login failed. Please try again.';
                toast.error(errorMessage);
            }).finally(() => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 400);
            })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to login
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2This branch is 21 commits ahead of main.">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email"
                                placeholder="example@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                        <div className="text-center text-sm">
                            Don't have an account?{'  '}
                            <Link href="/register" className="text-blue-600 hover:underline">
                                Register here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}