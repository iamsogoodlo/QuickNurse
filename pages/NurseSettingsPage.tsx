import React, { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { updateNurseProfile } from '../services/nurseService';
import { NurseProfile } from '../types';

const NurseSettingsPage: React.FC = () => {
  const { user, token } = useAuth();
  const nurse = user as NurseProfile | null;

  const [formData, setFormData] = useState({
    first_name: nurse?.first_name || '',
    last_name: nurse?.last_name || '',
    phone: nurse?.phone || '',
    email: nurse?.email || '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await updateNurseProfile(formData, token);
    if (res.success && res.data) {
      setMessage('Profile updated successfully');
      localStorage.setItem('user', JSON.stringify({ ...(nurse || {}), ...res.data }));
    } else {
      setMessage('Failed to update profile');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Personal Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="first_name"
          name="first_name"
          label="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <Input
          id="last_name"
          name="last_name"
          label="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          id="phone"
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default NurseSettingsPage;
