'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    marketingEmails: true,
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
    api?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear API errors and success message when user makes changes
    if (errors.api) {
      setErrors(prev => ({
        ...prev,
        api: undefined,
      }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      acceptTerms?: string;
    } = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Clear previous errors and success messages
    setErrors({});
    setSuccessMessage('');
    setIsLoading(true);

    // Prepare request payload
    const requestPayload = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    console.log('🚀 Starting signup request...');
    console.log('📦 Request Payload:', requestPayload);
    
    try {
      const response = await api.post('/v1/auth/register', requestPayload);
      
      console.log('✅ Registration successful!');
      console.log('📨 Response status:', response.status);
      console.log('📄 Response data:', response.data);
      
      // Handle successful registration (201)
      if (response.status === 201) {
        setSuccessMessage('Registration completed successfully! Redirecting to login...');
        
        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        console.error('📨 Error status:', status);
        console.error('📄 Error data:', data);
        
        switch (status) {
          case 400:
            // Invalid request payload
            setErrors({
              api: data?.message || 'Invalid request. Please check your input and try again.'
            });
            break;
            
          case 409:
            // Email already registered
            if (data?.message?.toLowerCase().includes('email')) {
              setErrors({
                email: 'This email is already registered. Please use a different email or try logging in.'
              });
            } else if (data?.message?.toLowerCase().includes('username')) {
              setErrors({
                username: 'This username is already taken. Please choose a different username.'
              });
            } else {
              setErrors({
                api: 'Account already exists. Please use different credentials.'
              });
            }
            break;
            
          case 500:
            // Registration failed (server error)
            setErrors({
              api: 'Registration failed due to a server error. Please try again later.'
            });
            break;
            
          default:
            // Handle other error codes
            setErrors({
              api: data?.message || `Registration failed with error code ${status}. Please try again.`
            });
        }
      } else if (error.request) {
        // Network error - no response received
        console.error('📡 Network error:', error.request);
        setErrors({
          api: 'Network error. Please check your internet connection and try again.'
        });
      } else {
        // Request setup error
        console.error('⚠️ Request setup error:', error.message);
        setErrors({
          api: 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      console.log('🏁 Request completed');
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Setup',
      description: 'Get started in less than 60 seconds with instant setup',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description:
        'Your data is protected with military-grade encryption and security',
    },
    {
      icon: Database,
      title: 'Intelligent Storage',
      description:
        'Smart deduplication saves up to 95% storage with zero duplicate files',
    },
  ];

  const benefits = [
    '10GB free storage to get started',
    'Advanced search and filtering',
    'Secure file sharing with analytics',
    'Real-time collaboration tools',
    'Enterprise-grade security',
    '24/7 customer support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#6e73fa]/5 to-[#5e5e5e]/5 blur-3xl"></div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-zinc-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">File Vault</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                Already have an account?
              </span>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative flex min-h-[calc(100vh-64px)]">
        {/* Left Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-400">
                Join thousands of users who trust File Vault
              </p>
            </div>

            {/* Registration Form */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl text-white">
                  Create Account
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your details to create your secure account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-900/50 border border-green-700 rounded-lg p-3">
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {successMessage}
                      </div>
                    </div>
                  )}

                  {/* API Error Message */}
                  {errors.api && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                      <div className="flex items-center text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.api}
                      </div>
                    </div>
                  )}

                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="johndoe123"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa] ${
                          errors.username
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.username && (
                      <div className="flex items-center text-red-400 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.username}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      3+ characters, letters, numbers, and underscores only
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa] ${
                          errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center text-red-400 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa] ${
                          errors.password
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center text-red-400 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Must contain uppercase, lowercase, and number (8+ characters)
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa] ${
                          errors.confirmPassword
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center text-red-400 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* Terms and Marketing */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-800 text-[#6e73fa] focus:ring-[#6e73fa] focus:ring-offset-0"
                        disabled={isLoading}
                      />
                      <div className="text-sm text-gray-400">
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          className="text-[#6e73fa] hover:text-[#5e5e5e] transition-colors"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="text-[#6e73fa] hover:text-[#5e5e5e] transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </div>
                    </label>
                    {errors.acceptTerms && (
                      <div className="flex items-center text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.acceptTerms}
                      </div>
                    )}

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={formData.marketingEmails}
                        onChange={handleInputChange}
                        className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-800 text-[#6e73fa] focus:ring-[#6e73fa] focus:ring-offset-0"
                        disabled={isLoading}
                      />
                      <div className="text-sm text-gray-400">
                        Send me product updates and marketing emails
                      </div>
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="p-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] hover:from-[#5e5e5e] hover:to-[#6e73fa] text-white h-12 font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-[#6e73fa]/25"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#6e73fa] hover:text-[#5e5e5e] transition-colors font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits & Features (Hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 backdrop-blur-sm border-l border-zinc-800">
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Choose File Vault?
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Join thousands of professionals who trust File Vault for secure,
                intelligent file management.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="bg-gradient-to-r from-[#6e73fa]/10 to-[#5e5e5e]/10 border border-[#6e73fa]/20 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                What You Get
              </h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-300 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badge */}
            <div className="pt-4">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Protected by enterprise-grade security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
