
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registerNurse } from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import CheckboxGroup from '../common/CheckboxGroup';
import { LICENSE_TYPE_OPTIONS, NURSE_SPECIALTY_OPTIONS, NURSE_CERTIFICATION_OPTIONS, US_STATES } from '../../constants';
import { LicenseType, NurseSpecialty, NurseCertification, ApiError } from '../../types';

interface NurseRegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  service_address_street?: string;
  service_address_city?: string;
  service_address_state?: string;
  service_address_zip_code?: string;
  license_number?: string;
  license_state?: string;
  license_type?: string;
  years_experience?: string;
  hourly_rate?: string;
  specialties?: string; 
  certifications?: string;
  general?: string;
}


const NurseRegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    service_address_street: '',
    service_address_city: '',
    service_address_state: US_STATES[0],
    service_address_zip_code: '',
    license_number: '',
    license_state: US_STATES[0],
    license_type: LICENSE_TYPE_OPTIONS[0] as LicenseType,
    years_experience: '0',
    specialties: [] as NurseSpecialty[],
    certifications: [] as NurseCertification[],
    hourly_rate: '25',
  });
  const [errors, setErrors] = useState<NurseRegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof NurseRegisterErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const handleMultiSelectChange = (field: 'specialties' | 'certifications', value: string) => {
    setFormData(prev => {
      const currentSelection = prev[field] as string[];
      const newSelection = currentSelection.includes(value)
        ? currentSelection.filter(item => item !== value)
        : [...currentSelection, value];
      return { ...prev, [field]: newSelection };
    });
    if (errors[field]) {
         setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };
  
  const scrollToFirstError = (currentErrors: NurseRegisterErrors, stepFieldOrder: (keyof NurseRegisterErrors)[]) => {
    for (const field of stepFieldOrder) {
      if (currentErrors[field]) {
        const element = document.getElementById(field);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
          break;
        }
      }
    }
    window.scrollTo(0,0); 
  };

  const validateStep1 = (): boolean => {
    const newErrors: NurseRegisterErrors = {};
    const step1ErrorOrder: (keyof NurseRegisterErrors)[] = [
      'first_name', 'last_name', 'email', 'password', 'confirmPassword', 'phone', 
      'service_address_street', 'service_address_city', 'service_address_state', 'service_address_zip_code'
    ];

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters long.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (!formData.service_address_street.trim()) newErrors.service_address_street = "Service street address is required.";
    if (!formData.service_address_city.trim()) newErrors.service_address_city = "Service city is required.";
    if (!formData.service_address_zip_code.trim()) newErrors.service_address_zip_code = "Service zip code is required.";
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors, step1ErrorOrder);
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: NurseRegisterErrors = {};
     const step2ErrorOrder: (keyof NurseRegisterErrors)[] = [
      'license_number', 'license_state', 'license_type', 'years_experience', 'hourly_rate'
    ];
    if (!formData.license_number.trim()) newErrors.license_number = "License number is required.";
    if (!formData.license_state.trim()) newErrors.license_state = "License state is required.";
    if (!formData.license_type.trim()) newErrors.license_type = "License type is required.";
    if (parseInt(formData.years_experience, 10) < 0 || formData.years_experience === '') newErrors.years_experience = "Years of experience is required and must be 0 or more.";
    if (parseFloat(formData.hourly_rate) <= 0 || formData.hourly_rate === '') newErrors.hourly_rate = "Hourly rate is required and must be greater than 0.";
    else if (parseFloat(formData.hourly_rate) < 25) newErrors.hourly_rate = "Hourly rate must be at least $25.";

    setErrors(newErrors);
     if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors, step2ErrorOrder);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setErrors({}); 
      setCurrentStep(2);
      window.scrollTo(0, 0); 
    }
  };

  const prevStep = () => {
    setErrors({}); 
    setCurrentStep(1);
    window.scrollTo(0, 0); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
        nextStep();
        return;
    }

    if (!validateStep2()) {
        return;
    }
    
    setIsLoading(true);
    setErrors({}); 

    const apiDataPayload = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      license_number: formData.license_number,
      license_state: formData.license_state,
      license_type: formData.license_type,
      years_experience: parseInt(formData.years_experience, 10),
      specialties: formData.specialties,
      certifications: formData.certifications,
      hourly_rate: parseFloat(formData.hourly_rate),
      address: { // This is the primary service address
        street: formData.service_address_street,
        city: formData.service_address_city,
        state: formData.service_address_state,
        zip_code: formData.service_address_zip_code,
      }
    };
    
    const response = await registerNurse(apiDataPayload);
    setIsLoading(false);
    if (response.success && response.token && response.nurse) {
      login({token: response.token, nurse: response.nurse}, 'nurse');
      navigate('/nurse/dashboard');
    } else {
      const apiErrorMessage = (response.error as ApiError)?.message || 'Registration failed. Please try again.';
      setErrors({ general: apiErrorMessage });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {errors.general && <div className="p-3 my-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{errors.general}</div>}
      
      <div className="mb-6 p-3 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-teal-600">
          Step {currentStep} of 2: {currentStep === 1 ? "Personal & Service Address" : "Qualifications & Professional Details"}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${currentStep === 1 ? '50%' : '100%'}` }}></div>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <p className="text-md font-semibold text-gray-800">Personal Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
            <Input id="first_name" label="First Name" name="first_name" required isRequired value={formData.first_name} onChange={handleChange} error={errors.first_name} />
            <Input id="last_name" label="Last Name" name="last_name" required isRequired value={formData.last_name} onChange={handleChange} error={errors.last_name} />
          </div>
          <Input id="email" label="Email" type="email" name="email" required isRequired value={formData.email} onChange={handleChange} error={errors.email} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
            <Input id="password" label="Password (min. 6 characters)" type="password" name="password" required isRequired value={formData.password} onChange={handleChange} error={errors.password} />
            <Input id="confirmPassword" label="Confirm Password" type="password" name="confirmPassword" required isRequired value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword}/>
          </div>
          <Input id="phone" label="Phone Number" type="tel" name="phone" required isRequired value={formData.phone} onChange={handleChange} error={errors.phone}/>

          <p className="text-md font-semibold text-gray-800 pt-4">Primary Service Address</p>
          <p className="text-xs text-gray-500 mb-2">This address will be used to determine your service area and for geocoding your location by the system.</p>
          <Input id="service_address_street" label="Street Address" name="service_address_street" required isRequired value={formData.service_address_street} onChange={handleChange} error={errors.service_address_street}/>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0">
            <Input id="service_address_city" label="City" name="service_address_city" required isRequired value={formData.service_address_city} onChange={handleChange} error={errors.service_address_city} />
            <Select
                id="service_address_state"
                label="State"
                name="service_address_state"
                required
                isRequired
                value={formData.service_address_state}
                onChange={handleChange}
                options={US_STATES.map(s => ({ value: s, label: s }))}
                error={errors.service_address_state}
            />
            <Input id="service_address_zip_code" label="Zip Code" name="service_address_zip_code" required isRequired value={formData.service_address_zip_code} onChange={handleChange} error={errors.service_address_zip_code}/>
          </div>
          
          <Button type="button" onClick={nextStep} variant="primary" fullWidth className="mt-6">
            Next Page
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <p className="text-md font-semibold text-gray-800">Licensing & Experience</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
            <Input id="license_number" label="License Number" name="license_number" required isRequired value={formData.license_number} onChange={handleChange} error={errors.license_number}/>
            <Select
                id="license_state"
                label="License State"
                name="license_state"
                required
                isRequired
                value={formData.license_state}
                onChange={handleChange}
                options={US_STATES.map(s => ({ value: s, label: s }))}
                error={errors.license_state}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
            <Select
                id="license_type"
                label="License Type"
                name="license_type"
                required
                isRequired
                value={formData.license_type}
                onChange={handleChange}
                options={LICENSE_TYPE_OPTIONS.map(lt => ({ value: lt, label: lt }))}
                error={errors.license_type}
            />
            <Input id="years_experience" label="Years of Experience" type="number" name="years_experience" required isRequired value={formData.years_experience} onChange={handleChange} min="0" error={errors.years_experience}/>
          </div>
          <Input id="hourly_rate" label="Default Hourly Rate ($)" type="number" name="hourly_rate" required isRequired value={formData.hourly_rate} onChange={handleChange} min="25" max="150" step="0.01" error={errors.hourly_rate}/>

          <CheckboxGroup
            label="Specialties (select all that apply)"
            name="specialties"
            options={NURSE_SPECIALTY_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
            selectedValues={formData.specialties}
            onChange={(value) => handleMultiSelectChange('specialties', value as NurseSpecialty)}
            error={errors.specialties}
          />
          <CheckboxGroup
            label="Certifications (select all that apply)"
            name="certifications"
            options={NURSE_CERTIFICATION_OPTIONS.map(c => ({ value: c, label: c }))}
            selectedValues={formData.certifications}
            onChange={(value) => handleMultiSelectChange('certifications', value as NurseCertification)}
            error={errors.certifications}
          />
          
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <Button type="button" onClick={prevStep} variant="secondary" className="w-full md:w-auto">
              Previous Page
            </Button>
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="w-full md:flex-1">
              Complete Registration
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default NurseRegisterForm;
