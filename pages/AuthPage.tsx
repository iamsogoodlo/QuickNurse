
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PatientLoginForm from '../components/auth/PatientLoginForm';
import PatientRegisterForm from '../components/auth/PatientRegisterForm';
import NurseLoginForm from '../components/auth/NurseLoginForm';
import NurseRegisterForm from '../components/auth/NurseRegisterForm';
import TestLoginPanel from '../components/auth/TestLoginPanel';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'register';
type UserRole = 'patient' | 'nurse';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('patient');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (userType === 'patient') navigate('/patient/dashboard');
      else if (userType === 'nurse') navigate('/nurse/dashboard');
    }
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const formType = params.get('form');
    if (formType === 'patientLogin') { setRole('patient'); setMode('login'); }
    else if (formType === 'patientRegister') { setRole('patient'); setMode('register'); }
    else if (formType === 'nurseLogin') { setRole('nurse'); setMode('login'); }
    else if (formType === 'nurseRegister') { setRole('nurse'); setMode('register'); }
  }, [location.search]);


  const renderForm = () => {
    if (role === 'patient') {
      return mode === 'login' ? <PatientLoginForm /> : <PatientRegisterForm />;
    } else {
      return mode === 'login' ? <NurseLoginForm /> : <NurseRegisterForm />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'Sign in' : 'Create an account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your QuickNurse {role} account
          </p>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setRole('patient')}
            className={`flex-1 py-3 text-sm font-medium text-center focus:outline-none ${role === 'patient' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I'm a Patient
          </button>
          <button
            onClick={() => setRole('nurse')}
            className={`flex-1 py-3 text-sm font-medium text-center focus:outline-none ${role === 'nurse' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I'm a Nurse
          </button>
        </div>

        {renderForm()}

        <div className="text-sm text-center">
          {mode === 'login' ? (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="font-medium text-teal-600 hover:text-teal-500">
                Sign up as a {role}
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-medium text-teal-600 hover:text-teal-500">
                Sign in as a {role}
              </button>
            </p>
          )}
        </div>
      </div>
      <TestLoginPanel />
    </div>
  );
};

export default AuthPage;
