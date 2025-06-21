
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registerPatient } from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import { US_STATES } from '../../constants';
import Select from '../common/Select';
import { ApiError } from '../../types';

interface PatientRegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  "address.street"?: string;
  "address.city"?: string;
  "address.state"?: string;
  "address.zip_code"?: string;
  general?: string;
}

const PatientRegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: {
      street: '',
      city: '',
      state: US_STATES[0],
      zip_code: '',
    }
  });
  const [errors, setErrors] = useState<PatientRegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for the field being changed
    if (errors[name as keyof PatientRegisterErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const scrollToFirstError = (currentErrors: PatientRegisterErrors) => {
    const fieldOrder: (keyof PatientRegisterErrors)[] = [
      'first_name', 'last_name', 'email', 'password', 'confirmPassword', 'phone', 'date_of_birth',
      'address.street', 'address.city', 'address.state', 'address.zip_code'
    ];
    for (const field of fieldOrder) {
      if (currentErrors[field]) {
        const element = document.getElementById(field); // ID should match field name
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
          break;
        }
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PatientRegisterErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters long.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (!formData.address.street.trim()) newErrors["address.street"] = "Street address is required.";
    if (!formData.address.city.trim()) newErrors["address.city"] = "City is required.";
    if (!formData.address.zip_code.trim()) newErrors["address.zip_code"] = "Zip code is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({}); // Clear previous general errors

    const submissionData = {
        ...formData,
        address: { 
            street: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            zip_code: formData.address.zip_code,
        }
    };
    const { confirmPassword, ...apiData } = submissionData;

    const response = await registerPatient(apiData);
    setIsLoading(false);
    if (response.success && response.token && response.patient) {
      login({token: response.token, patient: response.patient}, 'patient');
      navigate('/patient/dashboard');
    } else {
      const apiErrorMessage = (response.error as ApiError)?.message || 'Registration failed. Please try again.';
      setErrors({ general: apiErrorMessage });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      {errors.general && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm mb-4">{errors.general}</div>}
      
      <p className="text-md font-semibold text-gray-800">Personal Information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        <Input id="first_name" label="First Name" name="first_name" required isRequired value={formData.first_name} onChange={handleChange} error={errors.first_name} />
        <Input id="last_name" label="Last Name" name="last_name" required isRequired value={formData.last_name} onChange={handleChange} error={errors.last_name} />
      </div>
      <Input id="email" label="Email" type="email" name="email" required isRequired value={formData.email} onChange={handleChange} error={errors.email} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        <Input id="password" label="Password (min. 6 characters)" type="password" name="password" required isRequired value={formData.password} onChange={handleChange} error={errors.password} />
        <Input id="confirmPassword" label="Confirm Password" type="password" name="confirmPassword" required isRequired value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        <Input id="phone" label="Phone Number" type="tel" name="phone" required isRequired value={formData.phone} onChange={handleChange} error={errors.phone} />
        <Input id="date_of_birth" label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} containerClassName="mb-0 md:mb-4" />
      </div>
      
      <p className="text-md font-semibold text-gray-800 pt-4">Your Address</p>
       <p className="text-xs text-gray-500 mb-2">This address will be used to find nurses near you.</p>
      <Input id="address.street" label="Street Address" name="address.street" required isRequired value={formData.address.street} onChange={handleChange} error={errors["address.street"]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0">
        <Input id="address.city" label="City" name="address.city" required isRequired value={formData.address.city} onChange={handleChange} error={errors["address.city"]} />
        <Select
            id="address.state"
            label="State"
            name="address.state"
            required
            isRequired
            value={formData.address.state}
            onChange={handleChange}
            options={US_STATES.map(s => ({ value: s, label: s }))}
            error={errors["address.state"]}
        />
        <Input id="address.zip_code" label="Zip Code" name="address.zip_code" required isRequired value={formData.address.zip_code} onChange={handleChange} error={errors["address.zip_code"]} />
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="mt-6">
        Register as Patient
      </Button>
    </form>
  );
};

export default PatientRegisterForm;