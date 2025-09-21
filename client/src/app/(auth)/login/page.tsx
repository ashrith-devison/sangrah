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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

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
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle successful login here
      console.log('Login successful:', formData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced encryption and security protocols',
    },
    {
      icon: Database,
      title: 'Secure Storage',
      description: 'Your files are protected with enterprise-grade security',
    },
    {
      icon: CheckCircle,
      title: 'Verified Platform',
      description: 'Trusted by thousands of users worldwide',
    },
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
                Don`&apos;`t have an account?
              </span>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-black hover:bg-zinc-800"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative flex min-h-[calc(100vh-64px)]">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">
                Sign in to access your secure file vault
              </p>
            </div>

            {/* Login Form */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl text-white">Sign In</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
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
                        placeholder="Enter your password"
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
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#6e73fa] focus:ring-[#6e73fa] focus:ring-offset-0"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#6e73fa] hover:text-[#5e5e5e] transition-colors"
                    >
                      Forgot password?
                    </Link>
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
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                New to File Vault?{' '}
                <Link
                  href="/signup"
                  className="text-[#6e73fa] hover:text-[#5e5e5e] transition-colors font-medium"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Features (Hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 backdrop-blur-sm border-l border-zinc-800">
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Secure File Management
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Experience enterprise-grade security with intelligent
                deduplication and advanced search capabilities.
              </p>
            </div>

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

            <div className="pt-8">
              <div className="bg-gradient-to-r from-[#6e73fa]/10 to-[#5e5e5e]/10 border border-[#6e73fa]/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Trusted Platform
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Join thousands of users who trust File Vault with their
                  important documents and files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
