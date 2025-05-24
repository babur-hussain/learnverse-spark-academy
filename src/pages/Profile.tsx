
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/contexts/AuthContext';
import { GamificationStats } from '@/components/Profile/GamificationStats';

const Profile = () => {
  const { role, isTeacher, isAdmin } = useUserRole();
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <p className="mb-2"><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p className="mb-4"><strong>User Role:</strong> {role || 'Unknown'}</p>
            
            {isTeacher && (
              <div className="p-3 bg-blue-100 text-blue-800 rounded">
                You have teacher privileges!
              </div>
            )}
            
            {isAdmin && (
              <div className="mt-3 p-3 bg-purple-100 text-purple-800 rounded">
                You have admin privileges!
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Achievements</h2>
          <GamificationStats />
        </div>
      </div>
    </div>
  );
};

export default Profile;
