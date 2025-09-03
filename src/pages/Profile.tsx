import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { 
  ArrowLeft, 
  Settings, 
  Camera, 
  Edit, 
  Heart, 
  Download, 
  Globe, 
  MapPin, 
  Play, 
  Monitor, 
  Trash2, 
  Clock, 
  LogOut,
  Lock
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { role } = useUserRole();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.first_name || 'Sabrina',
    lastName: user?.user_metadata?.last_name || 'Aryan',
    username: user?.user_metadata?.username || '@Sabrina',
    email: user?.email || 'SabrinaAry208@gmailcom',
    phone: '+234 904 6470',
    birth: '',
    gender: ''
  });

  // Check if we're in a Capacitor app
  const isCapacitorApp = Capacitor.isNativePlatform();
  
  console.log('Profile page - Capacitor Native:', isCapacitorApp);
  console.log('Profile page - User:', user);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    setIsEditMode(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If not in Capacitor app, show web profile
  if (!isCapacitorApp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Web Profile - Use mobile app for full features
          </h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Please sign in to view your profile
            </h1>
          </div>
        </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-red-600 via-purple-600 to-pink-500 pt-12 pb-8">
          {/* Status bar spacer */}
          <div className="h-6"></div>
          
          {/* Back button */}
          <button
            onClick={() => setIsEditMode(false)}
            className="absolute top-16 left-4 text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Profile picture */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white overflow-hidden">
                <img
                  src={user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Edit className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Edit Profile title */}
          <h1 className="text-2xl font-bold text-white text-center">Edit Profile</h1>
        </div>

        {/* Form section */}
        <div className="bg-white rounded-t-3xl -mt-4 px-6 py-8 min-h-screen">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <Input
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex">
                <Select>
                  <SelectTrigger className="w-24 rounded-r-none">
                    <SelectValue placeholder="+234" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+234">+234</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={profileData.phone.split(' ')[1] || ''}
                  onChange={(e) => handleInputChange('phone', '+234 ' + e.target.value)}
                  className="flex-1 rounded-l-none"
                  placeholder="904 6470"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1990-01-01">1990-01-01</SelectItem>
                  <SelectItem value="1991-01-01">1991-01-01</SelectItem>
                  <SelectItem value="1992-01-01">1992-01-01</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => navigate('/change-password')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </Button>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsEditMode(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main profile view - matches the image exactly
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status bar spacer */}
      <div className="h-6"></div>

      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => navigate('/settings')}
          className="text-gray-600"
        >
          <Settings className="h-6 w-6" />
        </button>
            </div>

      {/* Profile information */}
      <div className="bg-white mx-4 mt-4 rounded-2xl p-6">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {user?.user_metadata?.first_name || 'Sabrina'} {user?.user_metadata?.last_name || 'Aryan'}
          </h2>
          <p className="text-gray-600 mb-4">{user?.email || 'SabrinaAry208@gmailcom'}</p>
          
          <Button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Navigation options */}
      <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-gray-900">Favourites</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-500" />
              <span className="text-gray-900">Downloads</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <div className="h-px bg-gray-100"></div>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-green-500" />
              <span className="text-gray-900">Languages</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-purple-500" />
              <span className="text-gray-900">Location</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-orange-500" />
              <span className="text-gray-900">Subscription</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-indigo-500" />
              <span className="text-gray-900">Display</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <div className="h-px bg-gray-100"></div>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900">Clear Cache</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900">Clear History</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-red-500" />
              <span className="text-red-500">Log Out</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-red-400 rotate-180" />
          </button>
        </div>
      </div>

      {/* App version */}
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">App Version 2.3</p>
      </div>
    </div>
  );
};

export default Profile;
