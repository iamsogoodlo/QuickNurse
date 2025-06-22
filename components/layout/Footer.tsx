import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 text-center p-6 mt-auto border-t border-gray-200">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} QuickNurse. All rights reserved.</p>
        <p className="text-sm text-gray-500 mt-1">Your Health, On Demand.</p>
      </div>
    </footer>
  );
};

export default Footer;
