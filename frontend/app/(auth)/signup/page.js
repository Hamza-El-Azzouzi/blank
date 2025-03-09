'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as validator from '@/lib/form_validator';
import Toast from '@/components/toast/Toast';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiCalendar, FiInfo, FiUpload } from 'react-icons/fi';

export default function SignUp() {
    const router = useRouter()
    const [toasts, setToasts] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nickname: '',
        aboutMe: '',
        accountType: 'public'
    });

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

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
            if (file.size > 3 * 1024 * 1024) {
                showToast('warning', 'Image size should be less than 3MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast('warning', 'Please upload an image file');
                return;
            }
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result
                setAvatar(base64)
                setFormData({ ...formData, avatar })
                setAvatarPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/register`, {
            method: "POST",
            body: JSON.stringify({ ...formData, avatar }),
            headers: { 'content-type': 'application/json' },
            credentials: "include",
        }).then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw error; });
            }
            return response.json();
        })
            .then(() => {
                showToast('success', 'Registration successful!');
                setTimeout(() => {
                    router.push("/signin");
                }, 1500);
            }).catch((error) => {
                showToast('error', error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const isStepValid = (step) => {
        let isValid = true;
        let errorMessage = "";

        switch (step) {
            case 1:
                if (!validator.validateEmail(formData.email)) {
                    isValid = false;
                    errorMessage = "Invalid Email";
                } else if (!validator.validatePassword(formData.password)) {
                    isValid = false;
                    errorMessage = "Password must contain at least 8 characters, including uppercase, lowercase, number and special character";
                } else if (
                    !validator.validatePasswordConfirmation(
                        formData.password,
                        formData.confirmPassword
                    )
                ) {
                    isValid = false;
                    errorMessage = "Passwords Don't Match";
                }
                break;

            case 2:
                if (!validator.validateFirstName(formData.firstName)) {
                    isValid = false;
                    errorMessage = "First name can only contain letters and must be 1-20 characters";
                } else if (!validator.validateLastName(formData.lastName)) {
                    isValid = false;
                    errorMessage = "Last name can only contain letters and must be 1-20 characters";
                } else if (!validator.validateDateOfBirth(formData.dateOfBirth)) {
                    isValid = false;
                    errorMessage = "You must be at least 16 years old";
                }
                break;

            case 3:
                isValid = true;
                break;

            case 4:
                if (formData.nickname && !validator.validateNickname(formData.nickname)) {
                    isValid = false;
                    errorMessage = "Nickname can only contain letters and must be 1-20 characters";
                } else if (formData.aboutMe && !validator.validateAboutMe(formData.aboutMe)) {
                    isValid = false;
                    errorMessage = "About Me section cannot exceed 150 characters";
                }
                break;

            default:
                isValid = false;
                errorMessage = "Invalid Step";
        }

        return { isValid, errorMessage };
    };

    const nextStep = () => {
        const { isValid, errorMessage } = isStepValid(currentStep);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
            setError("");
        } else {
            setError(errorMessage);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError("");
    };

    return (
        <div className="auth-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}

            <div className="auth-box">
                <div className="auth-header">
                    <h1>Create Your Account</h1>
                    <p>Join our community in just a few steps</p>
                </div>

                <div className="steps-progress">
                    {[1, 2, 3, 4].map((step) => {
                        const { isValid } = isStepValid(step);
                        const stepClass = `step-item ${step === currentStep ? "active" : ""
                            } ${step < currentStep ? (isValid ? "completed" : "fail") : ""
                            } ${step === currentStep && error ? "current-fail" : ""
                            }`;

                        return (
                            <div key={step} className={stepClass}>
                                <div className="step-number">
                                    {step < currentStep
                                        ? "✓"
                                        : step === currentStep && error
                                            ? "✗"
                                            : step}
                                </div>
                                <div className="step-label">
                                    {step === 1 && "Account"}
                                    {step === 2 && "Profile"}
                                    {step === 3 && "Privacy"}
                                    {step === 4 && "About"}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form>
                    <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                        <div className="form-group">
                            <label htmlFor="email">
                                <FiMail style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                Email
                            </label>
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
                            <label htmlFor="password">
                                <FiLock style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                Password
                            </label>
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
                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                <FiLock style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                Password Confirmation
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Retype your password"
                            />
                        </div>
                    </div>

                    <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="firstName">
                                    <FiUser style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                    First Name
                                </label>
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
                                <label htmlFor="lastName">
                                    <FiUser style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                    Last Name
                                </label>
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
                            <label htmlFor="dateOfBirth">
                                <FiCalendar style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                Date of Birth
                            </label>
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

                    <div className={`form-step ${currentStep === 4 ? 'active' : ''}`}>
                        <div className="form-group form-full">
                            <div
                                className="image-upload"
                                onClick={() => document.getElementById('avatar').click()}
                            >
                                <div
                                    className="image-preview"
                                    style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : { backgroundImage: `url(./default-avatar.jpg)` }}
                                />

                                <label>
                                    <FiUpload style={{ marginRight: '6px', fontSize: '0.9rem' }} />
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
                                <FiUser style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
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
                                <FiInfo style={{ display: 'inline', marginRight: '6px', fontSize: '0.9rem' }} />
                                About Me
                                <span className="optional-label">(Optional)</span>
                            </label>
                            <textarea
                                id="aboutMe"
                                name="aboutMe"
                                value={formData.aboutMe}
                                onChange={handleChange}
                                maxLength={150}
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
                            <button
                                type='button'
                                onClick={handleSubmit}
                                className="step-button button-next"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
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