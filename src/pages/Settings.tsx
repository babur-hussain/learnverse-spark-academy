import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/Layout/AuthGuard';
import Navbar from '@/components/Layout/Navbar';
import { usePlatform } from '@/contexts/PlatformContext';
import MobileFooter from '@/components/Layout/MobileFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Bell, Shield, Moon } from 'lucide-react';
import { Switch } from '@/components/UI/switch';
import { Label } from '@/components/UI/label';

const Settings = () => {
  const { user } = useAuth();
  const { platform } = usePlatform();

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              {platform.isMobile && (
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and information</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    These settings allow you to customize your account preferences.
                  </p>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-notifs">Email notifications</Label>
                    </div>
                    <Switch id="email-notifs" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="push-notifs">Push notifications</Label>
                    </div>
                    <Switch id="push-notifs" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="profile-visibility">Profile visibility</Label>
                    </div>
                    <Switch id="profile-visibility" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Manage display preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="dark-mode">Dark mode</Label>
                    </div>
                    <Switch id="dark-mode" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Mobile-specific settings */}
            {platform.isMobile && (
              <TabsContent value="mobile">
                <Card>
                  <CardHeader>
                    <CardTitle>Mobile Settings</CardTitle>
                    <CardDescription>Platform-specific mobile features and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📱</span>
                        <Label htmlFor="mobile-optimization">Mobile optimization</Label>
                      </div>
                      <Switch id="mobile-optimization" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔔</span>
                        <Label htmlFor="mobile-notifications">Mobile notifications</Label>
                      </div>
                      <Switch id="mobile-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💾</span>
                        <Label htmlFor="offline-mode">Offline mode</Label>
                      </div>
                      <Switch id="offline-mode" />
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {platform.isIOS ? '🍎 iOS Optimized' : '🤖 Android Optimized'} - 
                        Your device is configured for optimal performance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </main>
        
        {platform.isMobile ? (
          <MobileFooter />
        ) : (
          <footer className="py-8 bg-gray-100">
            <div className="mx-auto px-4 text-center">
              <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
            </div>
          </footer>
        )}
      </div>
    </AuthGuard>
  );
};

export default Settings;
