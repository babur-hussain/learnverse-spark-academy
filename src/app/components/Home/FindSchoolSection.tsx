import React from 'react';
import { useNavigate } from 'react-router-dom';

const FindSchoolSection = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full py-12 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-100">Find your school</h2>
      <p className="mb-6 text-lg text-blue-800 dark:text-blue-200">Search and connect with your school from our growing list of institutions.</p>
      <button
        onClick={() => navigate('/find-your-school')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold text-lg"
      >
        Go to School Finder
      </button>
    </section>
  );
};

export default FindSchoolSection; 