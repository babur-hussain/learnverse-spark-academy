
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Switch } from '@/components/UI/switch';
import { Textarea } from '@/components/UI/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Database, 
  Globe,
  Palette,
  Key,
  HardDrive,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminSystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "Spark Academy",
    siteDescription: "Your journey to academic success starts here",
    enableRegistration: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    maintenanceMode: false,
    autoBackups: true,
    sessionTimeout: 30,
    maxFileSize: 10,
    defaultTheme: "light"
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to your backend
    toast({
      title: "Settings saved",
      description: "System settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic information about your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTheme">Default Theme</Label>
                  <Select
                    value={settings.defaultTheme}
                    onValueChange={(value) => handleSettingChange('defaultTheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform behavior and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => handleSettingChange('enableRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('enableEmailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications to users</p>
                </div>
                <Switch
                  checked={settings.enableSMSNotifications}
                  onCheckedChange={(checked) => handleSettingChange('enableSMSNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Policy</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <Label className="text-sm">Minimum 8 characters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <Label className="text-sm">Require uppercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <Label className="text-sm">Require numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <Label className="text-sm">Require special characters</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage API keys and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input type="password" placeholder="sk-..." />
                </div>
                <div className="space-y-2">
                  <Label>Razorpay Key ID</Label>
                  <Input type="password" placeholder="rzp_..." />
                </div>
                <div className="space-y-2">
                  <Label>Firebase Config</Label>
                  <Textarea placeholder="Firebase configuration JSON" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure SMTP settings for email delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Username</Label>
                <Input placeholder="your-email@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <Input type="password" placeholder="your-app-password" />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input placeholder="noreply@sparkacademy.com" />
              </div>
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input placeholder="Spark Academy" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>Configure automated backups and data recovery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Enable daily automated backups</p>
                </div>
                <Switch
                  checked={settings.autoBackups}
                  onCheckedChange={(checked) => handleSettingChange('autoBackups', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Retention Period</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Create Backup Now</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Settings
                </CardTitle>
                <CardDescription>Advanced database configuration and optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Connection Pool Size</Label>
                  <Input type="number" defaultValue="20" />
                </div>
                <div className="space-y-2">
                  <Label>Query Timeout (seconds)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <Button variant="outline">Test Database Connection</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Monitoring
                </CardTitle>
                <CardDescription>Monitor system performance and resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">CPU Usage</Label>
                    <div className="text-2xl font-bold">23%</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Memory Usage</Label>
                    <div className="text-2xl font-bold">45%</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Disk Usage</Label>
                    <div className="text-2xl font-bold">67%</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Network I/O</Label>
                    <div className="text-2xl font-bold">12 MB/s</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
