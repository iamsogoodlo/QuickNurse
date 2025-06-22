import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HeartIcon } from '@heroicons/react/24/solid'; // Using a solid HeartIcon

const Navbar: React.FC = () => {
  const { isAuthenticated, userType, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold text-teal-600 hover:text-teal-700 transition-colors">
          <HeartIcon className="h-8 w-8 mr-2 text-teal-500" />
          QuickNurse
        </Link>
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              {userType === 'patient' && (
                <>
                  <Link to="/patient/dashboard" className="text-gray-700 hover:text-teal-600">Patient Dashboard</Link>
                  <Link to="/patient/settings" className="text-gray-700 hover:text-teal-600 ml-4">Personal Settings</Link>
                </>
              )}
              {userType === 'nurse' && (
                <>
                  <Link to="/nurse/dashboard" className="text-gray-700 hover:text-teal-600">Nurse Dashboard</Link>
                  <Link to="/nurse/settings" className="text-gray-700 hover:text-teal-600 ml-4">Personal Settings</Link>
                </>
              )}
              <span className="text-gray-600 text-sm">Hi, {user?.first_name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-gray-700 hover:text-teal-600">Login / Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
