import React, { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import CheckboxGroup from '../components/common/CheckboxGroup';
import { useAuth } from '../hooks/useAuth';
import { updateNurseProfile, uploadNurseDocument } from '../services/nurseService';
import { NurseProfile, NurseCertification, NurseSpecialty } from '../types';
import { NURSE_CERTIFICATION_OPTIONS, NURSE_SPECIALTY_OPTIONS } from '../constants';

const NurseSettingsPage: React.FC = () => {
  const { user, token } = useAuth();
  const nurse = user as NurseProfile | null;

  const [formData, setFormData] = useState({
    first_name: nurse?.first_name || '',
    last_name: nurse?.last_name || '',
    phone: nurse?.phone || '',
    email: nurse?.email || '',
    specialties: nurse?.specialties || [],
    certifications: nurse?.certifications || [],
  });

  const [certFiles, setCertFiles] = useState<Record<string, File | null>>({});

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyToggle = (val: string) => {
    const spec = val as NurseSpecialty;
    setFormData(prev => {
      const list = prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec];
      return { ...prev, specialties: list };
    });
  };

  const handleCertToggle = (val: string) => {
    const cert = val as NurseCertification;
    setFormData(prev => {
      const list = prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert];
      return { ...prev, certifications: list };
    });
  };

  const handleFileChange = (cert: string, file: File | null) => {
    setCertFiles(prev => ({ ...prev, [cert]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await updateNurseProfile(formData, token);
    if (res.success && res.data) {
      // upload certification files
      for (const cert of formData.certifications) {
        const file = certFiles[cert];
        if (file) {
          await uploadNurseDocument(res.data.nurse_id || nurse?.nurse_id || '', cert.toLowerCase() + '_certification', file, token);
        }
      }
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
        <CheckboxGroup
          label="Specialties"
          name="specialties"
          options={NURSE_SPECIALTY_OPTIONS.map(s => ({ value: s, label: s.replace('_', ' ') }))}
          selectedValues={formData.specialties}
          onChange={handleSpecialtyToggle}
        />
        <CheckboxGroup
          label="Certifications"
          name="certifications"
          options={NURSE_CERTIFICATION_OPTIONS.map(c => ({ value: c, label: c }))}
          selectedValues={formData.certifications}
          onChange={handleCertToggle}
        />
        {formData.certifications.map(cert => (
          <div key={cert} className="mt-2">
            <label className="block text-sm font-medium mb-1" htmlFor={`file-${cert}`}>{cert} Certificate</label>
            <input
              id={`file-${cert}`}
              type="file"
              accept="image/*"
              onChange={e => handleFileChange(cert, e.target.files ? e.target.files[0] : null)}
            />
          </div>
        ))}
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default NurseSettingsPage;
