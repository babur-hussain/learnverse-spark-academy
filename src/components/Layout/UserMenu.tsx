
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/use-user-role';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/UI/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { User, LogOut, Settings, Shield, Video, GraduationCap, BookOpen, HardDrive } from 'lucide-react';
import AuthDialog from '@/components/Auth/AuthDialog';
import { Button } from '@/components/UI/button';
import { Capacitor } from '@capacitor/core';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Check if we're in a Capacitor app
  const isCapacitorApp = Capacitor.isNativePlatform();
  
  // Get the first letter of the username for the avatar fallback
  const getInitials = () => {
    if (!user) return 'G';
    const username = user.user_metadata?.username || user.email;
    return (username?.charAt(0) || 'U').toUpperCase();
  };

  // Handler for Profile button
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Handler for Settings button
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Handler for Admin button
  const handleAdminClick = () => {
    navigate('/admin');
  };

  // For authenticated users
  const AuthenticatedView = () => {
    // We can safely use the hook here since this component is only rendered conditionally
    const { isAdmin, isTeacher, role } = useUserRole();
    
    const getRoleIcon = () => {
      if (isAdmin) return <Shield className="mr-2 h-4 w-4 text-purple-600" />;
      if (isTeacher) return <GraduationCap className="mr-2 h-4 w-4 text-blue-600" />;
      return <BookOpen className="mr-2 h-4 w-4 text-green-600" />;
    };

    const getRoleLabel = () => {
      if (isAdmin) return "Administrator";
      if (isTeacher) return "Teacher";
      return "Student";
    };

    // Handler for Video Management button
    const handleVideoManagementClick = () => {
      if (isAdmin) {
        navigate('/admin/videos');
      } else if (isTeacher) {
        navigate('/instructor/videos');
      }
    };

    // If in Capacitor app, show simple profile button instead of dropdown
    if (isCapacitorApp) {
      return (
        <button 
          onClick={handleProfileClick}
          className="focus:outline-none flex-shrink-0"
        >
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="text-sm sm:text-base md:text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
        </button>
      );
    }

    // For web, show the full dropdown menu
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none flex-shrink-0">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                <AvatarFallback className="text-sm sm:text-base md:text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[9999]">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.user_metadata?.username || user?.email}</span>
                <span className="text-xs text-muted-foreground flex items-center mt-1">
                  {getRoleIcon()}
                  {getRoleLabel()}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer" 
              onClick={handleProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer" 
              onClick={handleSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer" 
              onClick={() => navigate('/downloaded-pdfs')}
            >
              <HardDrive className="mr-2 h-4 w-4" />
              <span>Downloaded PDFs</span>
            </DropdownMenuItem>
            
            {(isAdmin || isTeacher) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Management</DropdownMenuLabel>
                
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={handleVideoManagementClick}
                >
                  <Video className="mr-2 h-4 w-4" />
                  <span>Video Management</span>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={handleAdminClick}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };

  // Separate component for unauthenticated users
  const UnauthenticatedView = () => (
    <>
      <Button 
        onClick={() => setAuthDialogOpen(true)} 
        className="gradient-primary px-1.5 py-0.5 h-6"
        size="sm"
        style={{ fontSize: '10px' }}
      >
        <User className="h-2.5 w-2.5 mr-0.5" />
        <span>Sign</span>
      </Button>
      
      <AuthDialog 
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
      />
    </>
  );

  // Render either authenticated or unauthenticated view
  return (
    <>
      {user ? <AuthenticatedView /> : <UnauthenticatedView />}
    </>
  );
};

export default UserMenu;
