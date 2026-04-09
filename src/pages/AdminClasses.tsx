import React from 'react';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import MainLayout from '@/components/Layout/MainLayout';
import ClassesManager from '@/components/Admin/ClassesManager';

const AdminClassesPage = () => (
  <AuthGuard>
    <AdminRoleGuard>
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Class Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add, edit, and delete school classes. Changes are live for all users.</p>
        </div>
        <ClassesManager />
      </MainLayout>
    </AdminRoleGuard>
  </AuthGuard>
);

export default AdminClassesPage; 