
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { ClockIcon, BanknotesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'; // Using Heroicons

const LandingPage: React.FC = () => {
  // Main page icon - can be a more specific medical icon if available or custom SVG
  const HeroIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props} className={`h-24 w-24 mx-auto mb-6 ${props.className}`}>
      {/* Simplified medical cross / heart beat - more abstract */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );


  const FeatureCard: React.FC<{icon: React.ElementType, title: string, description: string}> = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4">
        <Icon className="w-8 h-8"/>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );

  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <HeroIcon className="text-white"/>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to QuickNurse</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">Connecting you with professional nursing care, right when you need it. Fast, reliable, and compassionate healthcare at your doorstep.</p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/auth?form=patientRegister">
              <Button 
                variant="hero-outline"
                className="px-8 py-3 text-lg w-full sm:w-auto"
              >
                Find a Nurse
              </Button>
            </Link>
            <Link to="/auth?form=nurseRegister">
              <Button 
                variant="hero-outline" 
                className="px-8 py-3 text-lg w-full sm:w-auto"
              >
                Join as a Nurse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose QuickNurse?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ClockIcon}
              title="On-Demand Care"
              description="Get access to registered nurses quickly and easily, whenever you need them."
            />
            <FeatureCard 
              icon={ShieldCheckIcon} 
              title="Verified Professionals"
              description="All nurses on our platform are licensed, vetted, and experienced healthcare providers."
            />
            <FeatureCard 
              icon={BanknotesIcon}
              title="Transparent Pricing"
              description="Clear, upfront pricing with no hidden fees. Know the cost before you book."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          {/* Add content for how it works section here */}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
