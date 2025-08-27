import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <div className="space-x-3">
          <Link to="/admin-notification" className="underline">Go to Notifications</Link>
          <Link to="/admin" className="underline">Go to Admin</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import ComingSoon from '@/components/ErrorPage';

export default ComingSoon;
