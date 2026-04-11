
import React from 'react';
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
import { User, LogOut, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/UI/button';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return 'G';
    const username = user.user_metadata?.username || user.email;
    return (username?.charAt(0) || 'U').toUpperCase();
  };

  if (!user) {
    return (
      <Button
        onClick={() => navigate('/auth')}
        className="gradient-primary px-3 py-1"
        size="sm"
      >
        <User className="h-4 w-4 mr-1" />
        Sign In
      </Button>
    );
  }

  // Authenticated admin view
  const { isAdmin, isTeacher } = useUserRole();

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

  return (
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
          onClick={() => navigate('/admin')}
        >
          <Shield className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
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
  );
};

export default UserMenu;
