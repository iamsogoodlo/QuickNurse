
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginNurse } from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import { ApiError } from '../../types';

const NurseLoginForm: React.FC = () => {
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
    const response = await loginNurse({ email, password });
    setIsLoading(false);
    if (response.success && response.token && response.nurse) {
      login({ token: response.token, nurse: response.nurse }, 'nurse');
      navigate('/nurse/dashboard');
    } else {
      setError((response.error as ApiError)?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
      <Input
        label="Email address"
        id="nurse-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        id="nurse-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        Sign in as Nurse
      </Button>
    </form>
  );
};

export default NurseLoginForm;
