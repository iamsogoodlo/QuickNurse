
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginPatient } from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import { ApiError } from '../../types';

const PatientLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const response = await loginPatient({ email, password });
    setIsLoading(false);
    if (response.success && response.token && response.patient) {
      login({ token: response.token, patient: response.patient }, 'patient');
      navigate('/patient/dashboard');
    } else {
      setError((response.error as ApiError)?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
      <Input
        label="Email address"
        id="patient-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        id="patient-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        Sign in as Patient
      </Button>
    </form>
  );
};

export default PatientLoginForm;
