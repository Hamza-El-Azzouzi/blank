'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { validateForm } from '@/lib/validateUserInfo';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    nickname: '',
    aboutMe: '',
    avatar: '',
    privacy: 'public'
  });
  const [previewUrl, setPreviewUrl] = useState(null);


  const handleFileChange = (e) => {
    const image = e.target.files[0];
    if (image) {
      if (image.size > 3 * 1024 * 1024) {
        toast.error('image size should be less than 3MB');
        return;
      }

      if (!image.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        const base64 = reader.result
        setFormData({ ...formData, avatar: base64 });
        setPreviewUrl(base64);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(formData);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    if (password.length < 6 || password.length > 50) {
      toast.error("Password must be between 6 and 50 characters long");
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one number");
      return false;
    }

    setIsLoading(true);

    const { confirmPassword, ...dataToSend } = formData;

    await axios.post('http://127.0.0.1:1414/api/register', dataToSend)
      .then(() => {
        toast.success('Registration successful!');
        setTimeout(() => {
          router.replace('/login');
        }, 500);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Registration failed');
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Join our social network and connect with friends
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {previewUrl ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">Upload your profile picture</p>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="How would you like to be called?"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <p className="text-sm text-gray-500">You must be at least 15 years old</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Information</h3>
              <div className="space-y-2">
                <Label htmlFor="aboutMe">About Me (Optional)</Label>
                <textarea
                  id="aboutMe"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Tell us a bit about yourself..."
                  maxLength={"150"}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Profile Privacy</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={formData.privacy === 'public'}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                      className="rounded-full"
                      disabled={isLoading}
                    />
                    <span>Public</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={formData.privacy === 'private'}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                      className="rounded-full"
                    />
                    <span>Private</span>
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  {formData.privacy === 'public'
                    ? 'Your profile will be visible to everyone'
                    : 'Only approved followers can see your profile'}
                </p>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security</h3>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <div className="text-center text-sm">
              Already have an account?{'  '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
