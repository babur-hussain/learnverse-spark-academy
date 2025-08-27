
import React from 'react';
import { Button } from '@/components/UI/button';
import { Shield, Info } from 'lucide-react';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/contexts/AuthContext';

interface AdminLoginInfoProps {
  onUseAdminCredentials: () => void;
}

const AdminLoginInfo: React.FC<AdminLoginInfoProps> = ({ onUseAdminCredentials }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-purple-600" />
        <h3 className="font-medium">Admin Access</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        Use these credentials to access admin features:
      </p>
      
      <div className="bg-white p-3 rounded border border-gray-200 mb-3 text-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-500">Email:</span>
          <code className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{ADMIN_EMAIL}</code>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Password:</span>
          <code className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{ADMIN_PASSWORD}</code>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center gap-2"
        onClick={onUseAdminCredentials}
      >
        <Info className="h-4 w-4" />
        <span>Use Admin Credentials</span>
      </Button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Note: In a production environment, admin credentials would be securely managed.
      </p>
    </div>
  );
};

export default AdminLoginInfo;
