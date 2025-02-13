'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignUp() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nickname: '',
        aboutMe: '',
        accountType: 'public'
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your sign-up logic here
        console.log('Sign up:', { ...formData, avatar });
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>Create Your Account</h1>
                    <p>Join our community in just a few steps</p>
                </div>

                <div className="steps-progress">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`step-item ${step === currentStep ? 'active' : ''
                                } ${step < currentStep ? 'completed' : ''}`}
                        >
                            <div className="step-number">
                                {step < currentStep ? '✓' : step}
                            </div>
                            <div className="step-label">
                                {step === 1 && 'Account'}
                                {step === 2 && 'Profile'}
                                {step === 3 && 'Privacy'}
                                {step === 4 && 'About'}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Account Information */}
                    <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Choose a strong password"
                            />
                        </div>
                    </div>

                    {/* Step 2: Basic Profile */}
                    <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="John"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Step 3: Privacy Settings */}
                    <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
                        <div className="privacy-toggle">
                            <div className="privacy-option">
                                <input
                                    type="radio"
                                    id="public"
                                    name="accountType"
                                    value="public"
                                    checked={formData.accountType === 'public'}
                                    onChange={handleChange}
                                />
                                <label htmlFor="public">
                                    <div className="privacy-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="2" y1="12" x2="22" y2="12"></line>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                        </svg>
                                    </div>
                                    <p className="privacy-title">Public Account</p>
                                    <p className="privacy-description">Your profile and posts will be visible to everyone</p>
                                </label>
                            </div>

                            <div className="privacy-option">
                                <input
                                    type="radio"
                                    id="private"
                                    name="accountType"
                                    value="private"
                                    checked={formData.accountType === 'private'}
                                    onChange={handleChange}
                                />
                                <label htmlFor="private">
                                    <div className="privacy-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <p className="privacy-title">Private Account</p>
                                    <p className="privacy-description">Only approved followers can see your content</p>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Additional Information */}
                    <div className={`form-step ${currentStep === 4 ? 'active' : ''}`}>
                        <div className="form-group form-full">
                            <div
                                className="image-upload"
                                onClick={() => document.getElementById('avatar').click()}
                            >
                                <div
                                    className="image-preview"
                                    
                                    style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {backgroundImage:`url(./default-avatar.jpg)`}}
                                />
                               
                                <label>
                                    {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                                    <span className="optional-label">(Optional)</span>
                                </label>
                                <input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="nickname">
                                Nickname
                                <span className="optional-label">(Optional)</span>
                            </label>
                            <input
                                id="nickname"
                                name="nickname"
                                type="text"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="How should we call you?"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="aboutMe">
                                About Me
                                <span className="optional-label">(Optional)</span>
                            </label>
                            <textarea
                                id="aboutMe"
                                name="aboutMe"
                                value={formData.aboutMe}
                                onChange={handleChange}
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="step-buttons">
                        {currentStep > 1 && (
                            <button type="button" className="step-button button-back" onClick={prevStep}>
                                Back
                            </button>
                        )}
                        {currentStep < 4 ? (
                            <button type="button" className="step-button button-next" onClick={nextStep}>
                                Next
                            </button>
                        ) : (
                            <button type="submit" className="step-button button-next">
                                Create Account
                            </button>
                        )}
                    </div>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link href="/signin">Sign in</Link>
                </div>
            </div>
        </div>
    );
}