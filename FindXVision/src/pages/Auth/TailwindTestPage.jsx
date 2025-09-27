import React from 'react';
import LoginComponent from '../../components/Auth/Tailwind/LoginComponent';
import SignupComponent from '../../components/Auth/Tailwind/SignupComponent';

const TailwindTestPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Tailwind Auth Components Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center">Login Component</h2>
          <LoginComponent />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center">Signup Component</h2>
          <SignupComponent />
        </div>
      </div>
    </div>
  );
};

export default TailwindTestPage;