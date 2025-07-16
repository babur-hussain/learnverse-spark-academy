import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/Layout/MainLayout';

interface School {
  id: number;
  block: string;
  school_udise_code: string;
  school_name: string;
  sanch_bao_code: string;
  board_type: string;
  board_code: string;
  school_category_details: string;
  school_management_group_details: string;
  school_medium: string;
  tehsil: string;
  isr: string;
  village_ward: string;
  habitation: string;
  pincode: string;
  assembly: string;
  assembly_vidhansabha: string;
  school_category: string;
  school_management: string;
  jsk: string;
  sankul_aeo_code: string;
  school_status: string;
  school_type: string;
  udise_code: string;
  urban_rural: string;
  school_incharge_unique_id: string;
  school_incharge_name: string;
  school_incharge_designation: string;
  school_incharge_mobile_no: string;
  school_incharge_email_id: string;
}

const FindYourSchool: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('schools').select('*');
      if (error) {
        setError('Failed to load schools.');
      } else {
        setSchools(data || []);
      }
      setLoading(false);
      setTimeout(() => setShowTable(true), 200); // Animate table fade-in
    };
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter((school) => {
    const searchLower = search.toLowerCase();
    return (
      school.school_name?.toLowerCase().includes(searchLower) ||
      school.block?.toLowerCase().includes(searchLower) ||
      school.village_ward?.toLowerCase().includes(searchLower) ||
      school.school_udise_code?.toLowerCase().includes(searchLower) ||
      school.pincode?.toLowerCase().includes(searchLower) ||
      school.school_incharge_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <MainLayout>
      <div className="relative min-h-screen flex flex-col items-center justify-start overflow-x-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10 animate-gradient-move bg-gradient-to-br from-blue-200 via-white to-blue-300 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900">
          {/* Subtle floating shapes */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-100 dark:bg-blue-900 rounded-full opacity-30 blur-2xl animate-float-slow" />
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-purple-100 dark:bg-blue-800 rounded-full opacity-20 blur-3xl animate-float-slower" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-100 dark:bg-blue-700 rounded-full opacity-10 blur-2xl animate-float" />
        </div>
        {/* Header */}
        <header className="w-full flex justify-center mb-8 animate-fade-in z-20 relative">
          <div className="bg-blue-700 rounded-3xl shadow-2xl border-4 border-white px-10 py-10 max-w-3xl w-full flex flex-col items-center" style={{zIndex: 20}}>
            <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2 text-center">Find Your School</h1>
            <p className="text-lg text-white text-center max-w-2xl">Browse and search for your school from our comprehensive directory. Use the search bar below to quickly find your school by name, block, village, UDISE code, pincode, or incharge name.</p>
          </div>
        </header>
        {/* Search Bar with Glassmorphism and Icon */}
        <div className="flex justify-center mb-8 px-4 w-full animate-fade-in delay-200">
          <div className="relative w-full max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-200 pointer-events-none">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by school name, block, village, UDISE code, pincode, or incharge name..."
              className="w-full px-12 py-4 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white/60 dark:bg-gray-800/60 text-blue-900 dark:text-blue-100 placeholder:text-blue-400 dark:placeholder:text-blue-300 backdrop-blur-md transition-all duration-300"
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
            />
          </div>
        </div>
        {/* Table */}
        <div className={`flex-1 w-full px-2 pb-8 overflow-auto transition-opacity duration-700 ${showTable ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
          <div className="rounded-xl shadow-2xl border border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-900/80 overflow-auto" style={{ maxHeight: '70vh' }}>
            <div style={{ minWidth: '1200px', overflow: 'auto' }}>
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 sticky top-0 z-10">
                    <th className="px-3 py-2">Block</th>
                    <th className="px-3 py-2">UDISE Code</th>
                    <th className="px-3 py-2">School Name</th>
                    <th className="px-3 py-2">Sanch/BAO Code</th>
                    <th className="px-3 py-2">Board Type</th>
                    <th className="px-3 py-2">Board Code</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Management Group</th>
                    <th className="px-3 py-2">Medium</th>
                    <th className="px-3 py-2">Tehsil</th>
                    <th className="px-3 py-2">ISR</th>
                    <th className="px-3 py-2">Village/Ward</th>
                    <th className="px-3 py-2">Habitation</th>
                    <th className="px-3 py-2">Pincode</th>
                    <th className="px-3 py-2">Assembly</th>
                    <th className="px-3 py-2">Incharge Unique ID</th>
                    <th className="px-3 py-2">Incharge Name</th>
                    <th className="px-3 py-2">Incharge Designation</th>
                    <th className="px-3 py-2">Incharge Mobile</th>
                    <th className="px-3 py-2">Incharge Email</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={20} className="text-center py-8 text-lg">Loading schools...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={20} className="text-center text-red-500 py-8">{error}</td></tr>
                  ) : filteredSchools.length === 0 ? (
                    <tr><td colSpan={20} className="text-center py-8 text-blue-700 dark:text-blue-200">No schools found.</td></tr>
                  ) : (
                    filteredSchools.map((school) => (
                      <tr key={school.id} className="border-t border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition">
                        <td className="px-3 py-2 whitespace-nowrap">{school.block}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_udise_code}</td>
                        <td className="px-3 py-2 font-semibold whitespace-nowrap">{school.school_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.sanch_bao_code}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.board_type}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.board_code}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_category_details}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_management_group_details}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_medium}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.tehsil}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.isr}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.village_ward}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.habitation}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.pincode}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.assembly}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_incharge_unique_id}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_incharge_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_incharge_designation}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_incharge_mobile_no}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{school.school_incharge_email_id}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Animations CSS */}
        <style>{`
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-move {
            background-size: 200% 200%;
            animation: gradient-move 12s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          .animate-float { animation: float 7s ease-in-out infinite; }
          .animate-float-slow { animation: float 12s ease-in-out infinite; }
          .animate-float-slower { animation: float 18s ease-in-out infinite; }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default FindYourSchool; 