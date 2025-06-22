
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  userType: 'patient' | 'nurse';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType: requiredUserType }) => {
  const { isAuthenticated, userType: currentUserType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (currentUserType !== requiredUserType) {
    // If wrong user type, redirect to their own dashboard or landing
    const redirectTo = currentUserType === 'patient' ? '/patient/dashboard' : currentUserType === 'nurse' ? '/nurse/dashboard' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
