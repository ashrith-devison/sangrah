'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCog,
  MoreVertical,
  RefreshCw,
  UserPlus,
  Crown,
  User,
  LogIn,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/stores/hooks';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface UsersResponse {
  status: string;
  message: string;
  data: User[];
}

export default function AdminUsersPage() {
  const { setAuthenticatedUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [impersonatingUserId, setImpersonatingUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<UsersResponse>('/v1/admin/users');
      
      if (response.data.status === 'success') {
        setUsers(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        roleFilter === 'admin' ? user.isAdmin : !user.isAdmin
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getLastUpdatedTime = (): string => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const handleImpersonateUser = async (username: string, userId: number) => {
    try {
      setImpersonatingUserId(userId);
      
      const response = await api.post('/v1/admin/generate-token', {
        username: username
      });
      
      if (response.data.status === 'success') {
        const { token, username: impersonatedUsername } = response.data.data;
        const targetUser = users.find(u => u.username === username);
        
        // Create user object for Zustand store
        const impersonatedUser = {
          id: targetUser?.id.toString() || userId.toString(),
          name: impersonatedUsername,
          username: impersonatedUsername || '',
          email: targetUser?.email || '',
          role: 'user' as const, // Always user role when impersonating
          createdAt: targetUser?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Use Zustand's setAuthenticatedUser method for proper state management
        // This ensures loose coupling by:
        // - Properly setting both user and token in the store
        // - Handling localStorage with correct 'auth_token' key
        // - Setting cookies for middleware authentication
        // - Managing all authentication flags consistently
        setAuthenticatedUser(impersonatedUser, token);
        
        // Set success message
        setSuccessMessage(`Successfully logged in as ${impersonatedUsername}`);
        
        // Redirect to user home after a brief delay
        setTimeout(() => {
          router.push('/user/home');
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Failed to generate token');
      }
    } catch (error: any) {
      console.error('Failed to impersonate user:', error);
      setError(error.response?.data?.message || 'Failed to login as user');
    } finally {
      setImpersonatingUserId(null);
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.isAdmin).length;
    const regularUsers = totalUsers - adminUsers;
    const recentUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate >= weekAgo;
    }).length;

    return { totalUsers, adminUsers, regularUsers, recentUsers };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#6e73fa]" />
              <span className="truncate">User Management</span>
            </h1>
            <p className="text-gray-400">
              Manage and monitor all system users
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 md:mt-0">
            {lastUpdated && (
              <span className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
                Updated {getLastUpdatedTime()}
              </span>
            )}
            <Button 
              onClick={fetchUsers}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-black hover:text-black order-1 sm:order-2 w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Administrators</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.adminUsers}</p>
                </div>
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Regular Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.regularUsers}</p>
                </div>
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-400 truncate">New This Week</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.recentUsers}</p>
                </div>
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <Users className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {successMessage && (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400">
                <LogIn className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 order-2 lg:order-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 order-1 lg:order-2">
                <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
                <div className="flex border border-zinc-700 rounded-lg bg-zinc-800 overflow-hidden w-full sm:w-auto">
                  <Button
                    variant={roleFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRoleFilter('all')}
                    className={`rounded-none border-0 text-xs sm:text-sm px-2 sm:px-3 ${
                      roleFilter === 'all' 
                        ? 'bg-[#6e73fa] text-white' 
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    All
                  </Button>
                  <Button
                    variant={roleFilter === 'admin' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRoleFilter('admin')}
                    className={`rounded-none border-0 text-xs sm:text-sm px-2 sm:px-3 ${
                      roleFilter === 'admin' 
                        ? 'bg-[#6e73fa] text-white' 
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    Admins
                  </Button>
                  <Button
                    variant={roleFilter === 'user' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRoleFilter('user')}
                    className={`rounded-none border-0 text-xs sm:text-sm px-2 sm:px-3 ${
                      roleFilter === 'user' 
                        ? 'bg-[#6e73fa] text-white' 
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    Users
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6e73fa]" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Joined</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 animate-pulse">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-700 rounded-full"></div>
                            <div className="h-4 bg-zinc-700 rounded w-24"></div>
                          </div>
                        </td>
                        <td className="p-4"><div className="h-4 bg-zinc-700 rounded w-32"></div></td>
                        <td className="p-4"><div className="h-4 bg-zinc-700 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-zinc-700 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-zinc-700 rounded w-8"></div></td>
                        <td className="p-4"><div className="h-4 bg-zinc-700 rounded w-8"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                <p className="text-gray-400">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No users have been registered yet.'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Joined</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-[#6e73fa] to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.username}</div>
                                <div className="text-xs text-gray-500">{getTimeAgo(user.createdAt)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">{user.email}</div>
                          </td>
                          <td className="p-4">
                            {user.isAdmin ? (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                                <User className="w-3 h-3 mr-1" />
                                User
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-white text-sm">{formatDate(user.createdAt)}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-400 text-sm">#{user.id}</div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                                <DropdownMenuItem 
                                  className="text-white hover:bg-zinc-700 cursor-pointer"
                                  onClick={() => handleImpersonateUser(user.username, user.id)}
                                  disabled={impersonatingUserId === user.id}
                                >
                                  {impersonatingUserId === user.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <LogIn className="w-4 h-4 mr-2" />
                                  )}
                                  Login as User
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-white hover:bg-zinc-700">
                                  <UserCog className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#6e73fa] to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium truncate">{user.username}</h3>
                              {user.isAdmin ? (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs flex-shrink-0">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs flex-shrink-0">
                                  <User className="w-3 h-3 mr-1" />
                                  User
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 truncate">{user.email}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuItem 
                              className="text-white hover:bg-zinc-700 cursor-pointer"
                              onClick={() => handleImpersonateUser(user.username, user.id)}
                              disabled={impersonatingUserId === user.id}
                            >
                              {impersonatingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <LogIn className="w-4 h-4 mr-2" />
                              )}
                              Login as User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-zinc-700">
                              <UserCog className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {!user.isAdmin && (
                              <DropdownMenuItem className="text-white hover:bg-zinc-700">
                                <Crown className="w-4 h-4 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400 text-xs">Joined</div>
                          <div className="text-white">{formatDate(user.createdAt)}</div>
                          <div className="text-gray-500 text-xs">{getTimeAgo(user.createdAt)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">User ID</div>
                          <div className="text-gray-400">#{user.id}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}