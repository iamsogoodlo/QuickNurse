
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { NurseProfile, PatientProfile, AuthResponseData } from '../types';

type UserType = 'nurse' | 'patient' | null;
type UserProfile = NurseProfile | PatientProfile | null;

interface AuthContextType {
  user: UserProfile;
  token: string | null;
  userType: UserType;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthResponseData, type: 'nurse' | 'patient') => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userType, setUserType] = useState<UserType>(localStorage.getItem('userType') as UserType);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType') as UserType;
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUserType && storedUser) {
      setToken(storedToken);
      setUserType(storedUserType);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('user'); // Clear corrupted data
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthResponseData, type: 'nurse' | 'patient') => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', type);
    
    let profileData: UserProfile = null;
    if (type === 'nurse' && data.nurse) {
      profileData = data.nurse as NurseProfile; // Cast, assuming API returns full profile on login or enough for initial state
    } else if (type === 'patient' && data.patient) {
      profileData = data.patient as PatientProfile; // Cast similarly
    }
    
    if (profileData) {
      localStorage.setItem('user', JSON.stringify(profileData));
      setUser(profileData);
    }

    setToken(data.token);
    setUserType(type);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setToken(null);
    setUserType(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        userType, 
        isLoading, 
        isAuthenticated: !!token && !!userType,
        login, 
        logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
