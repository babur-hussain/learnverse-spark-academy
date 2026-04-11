import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
  selectedClass?: any;
  setSelectedClass?: any;
  selectedCollege?: any;
  setSelectedCollege?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  selectedClass,
  setSelectedClass,
  selectedCollege,
  setSelectedCollege
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar 
        selectedClass={selectedClass} 
        setSelectedClass={setSelectedClass} 
        selectedCollege={selectedCollege} 
        setSelectedCollege={setSelectedCollege} 
      />
      
      <main className="flex-1 main-content max-w-6xl mx-auto px-4 py-10 mt-32 pb-10">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
