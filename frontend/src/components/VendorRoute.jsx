import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function VendorRoute({ children }) {
  const { isAuthenticated, isLoading, user, vendor } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow admin access
  if (user?.role === 'admin') {
    return children;
  }

  // Check if user is vendor with approved status
  if (user?.role !== 'vendor' || !vendor || vendor.status !== 'approved') {
    return <Navigate to="/become-vendor" replace />;
  }

  return children;
}
