import React from 'react';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import MainLayout from '@/components/Layout/MainLayout';
// Reuse the web notifications manager; alias @shared points to src/
// so this import works in app builds too
import NotificationsManager from '@shared/web/components/Admin/Notifications/NotificationsManager';

const AdminNotificationsPage = () => {
  return (
    <AuthGuard>
      <AdminRoleGuard>
        <MainLayout>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Send push notifications to Android and iOS users</p>
          </div>
          <NotificationsManager />
        </MainLayout>
      </AdminRoleGuard>
    </AuthGuard>
  );
};

export default AdminNotificationsPage;


