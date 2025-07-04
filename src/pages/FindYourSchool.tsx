import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Users, Phone, Mail, Filter, X } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { supabase } from '@/lib/supabase';

interface School {
  id: number;
  sr_no?: string;
  block?: string;
  school_udise_code?: string;
  school_name?: string;
  sankul_aeo_code?: string;
  board_type?: string;
  board_code?: string;
  school_category_details?: string;
  school_management_group_details?: string;
  school_medium?: string;
  tehsil?: string;
  jsk?: string;
  village_ward?: string;
  habitation?: string;
  pincode?: string;
  assembly_vidhansabha?: string;
  school_incharge_unique_id?: string;
  school_incharge_name?: string;
  school_incharge_designation?: string;
  school_incharge_mobile_no?: string;
  school_incharge_email_id?: string;
}

const FindYourSchool = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .limit(100); // Limit for performance
      
      if (error) throw error;
      
      setSchools(data || []);
      setFilteredSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = schools.filter(school => {
      const matchesSearch = searchQuery === '' || 
        school.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.village_ward?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.tehsil?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.block?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBoard = selectedBoard === '' || school.board_type === selectedBoard;
      const matchesMedium = selectedMedium === '' || school.school_medium === selectedMedium;
      
      return matchesSearch && matchesBoard && matchesMedium;
    });
    
    setFilteredSchools(filtered);
  }, [searchQuery, selectedBoard, selectedMedium, schools]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBoard('');
    setSelectedMedium('');
  };

  const uniqueBoards = [...new Set(schools.map(s => s.board_type).filter(Boolean))];
  const uniqueMediums = [...new Set(schools.map(s => s.school_medium).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your School</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover schools in your area with detailed information about facilities, contact details, and more.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search schools, areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Boards</option>
              {uniqueBoards.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
            
            <select
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Mediums</option>
              {uniqueMediums.map(medium => (
                <option key={medium} value={medium}>{medium}</option>
              ))}
            </select>
            
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredSchools.length} of {schools.length} schools
            </p>
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {school.school_name || 'School Name Not Available'}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {school.board_type && (
                    <Badge variant="secondary">{school.board_type}</Badge>
                  )}
                  {school.school_medium && (
                    <Badge variant="outline">{school.school_medium}</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    {[school.village_ward, school.tehsil, school.block].filter(Boolean).join(', ')}
                    {school.pincode && <span className="ml-1">- {school.pincode}</span>}
                  </div>
                </div>
                
                {school.school_category_details && (
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm text-gray-600">{school.school_category_details}</div>
                  </div>
                )}
                
                {school.school_incharge_name && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      {school.school_incharge_name}
                      {school.school_incharge_designation && (
                        <span className="text-gray-500"> ({school.school_incharge_designation})</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-100">
                  {school.school_incharge_mobile_no && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Phone className="h-3 w-3" />
                      <span>{school.school_incharge_mobile_no}</span>
                    </div>
                  )}
                  {school.school_incharge_email_id && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{school.school_incharge_email_id}</span>
                    </div>
                  )}
                </div>
                
                {school.school_udise_code && (
                  <div className="text-xs text-gray-400 pt-2 border-t">
                    UDISE Code: {school.school_udise_code}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No schools found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindYourSchool;
