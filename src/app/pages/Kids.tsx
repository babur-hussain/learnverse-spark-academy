import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Baby, Star, Heart, Sparkles, Play, BookOpen, Music, Gamepad2, Palette, Users, Volume2, Download } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/UI/dialog';
import MainLayout from '@/components/Layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KidsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  age_group: 'infants' | 'preschool';
  icon: string;
  color_gradient: string;
  order_index: number;
  is_active: boolean;
}

interface KidsContentItem {
  id: string;
  category_id: string;
  title: string;
  description: string;
  content_type: 'video' | 'flashcard' | 'game' | 'rhyme' | 'story' | 'activity';
  thumbnail_url?: string;
  content_url?: string;
  content_data?: any;
  duration_minutes?: number;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
}

const Kids = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infants' | 'preschool'>('infants');
  const [categories, setCategories] = useState<KidsCategory[]>([]);
  const [contentItems, setContentItems] = useState<KidsContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<KidsCategory | null>(null);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchContentItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kids_content_categories')
        .select('*')
        .eq('is_active', true)
        .order('age_group', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories((data as KidsCategory[]) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('kids_content_items')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContentItems((data as KidsContentItem[]) || []);
    } catch (error) {
      console.error('Error fetching content items:', error);
    }
  };

  const handleCategoryClick = (category: KidsCategory) => {
    setSelectedCategory(category);
    setShowContentDialog(true);
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      BookOpen,
      Play,
      Music,
      Gamepad2,
      Baby,
      Star
    };
    return iconMap[iconName] || BookOpen;
  };

  const ageGroups = [
    {
      id: 'infants' as const,
      title: 'Infants & Toddlers',
      subtitle: 'Ages 0-3 years',
      icon: Baby,
      color: 'from-pink-300 to-purple-300',
      bgColor: 'bg-gradient-to-br from-pink-50 to-purple-50',
      description: 'Gentle learning for your little ones'
    },
    {
      id: 'preschool' as const,
      title: 'Pre-Schoolers',
      subtitle: 'Nursery to KG3',
      icon: Star,
      color: 'from-blue-300 to-green-300',
      bgColor: 'bg-gradient-to-br from-blue-50 to-green-50',
      description: 'Fun adventures in learning'
    }
  ];

  // Filter categories by selected age group
  const currentCategories = categories.filter(cat => cat.age_group === selectedAgeGroup);
  
  // Get content items for selected category
  const getCategoryContent = (categoryId: string) => {
    return contentItems.filter(item => item.category_id === categoryId);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 animate-spin text-purple-500" />
            <p className="text-lg">Loading magical content...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  const currentAgeGroup = ageGroups.find(group => group.id === selectedAgeGroup)!;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative container mx-auto px-4 py-16 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 animate-pulse" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent"
            >
              Kids Learning Zone
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 text-white/90"
            >
              Where learning meets fun and imagination!
            </motion.p>
            <div className="flex justify-center space-x-4">
              <Heart className="h-8 w-8 text-pink-200 animate-bounce" />
              <Star className="h-8 w-8 text-yellow-200 animate-pulse" />
              <Sparkles className="h-8 w-8 text-purple-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Age Group Selector */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {ageGroups.map((group) => {
              const IconComponent = group.icon;
              return (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 transform hover:shadow-2xl ${
                      selectedAgeGroup === group.id
                        ? 'ring-4 ring-primary shadow-xl scale-105'
                        : 'hover:shadow-lg'
                    } ${group.bgColor}`}
                    onClick={() => setSelectedAgeGroup(group.id)}
                  >
                    <CardContent className="p-8 text-center">
                      <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${group.color} mb-4`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-gray-800">{group.title}</h3>
                      <p className="text-lg text-gray-600 mb-2">{group.subtitle}</p>
                      <p className="text-sm text-gray-500">{group.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Content Sections */}
          <motion.div
            key={selectedAgeGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-3xl p-8 ${currentAgeGroup.bgColor}`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                {currentAgeGroup.title} Learning Center
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {selectedAgeGroup === 'infants' 
                  ? 'Gentle, sensory-friendly activities designed for your little one\'s early development'
                  : 'Interactive and engaging content to spark curiosity and build foundational skills'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentCategories.map((category, index) => {
                const IconComponent = getIconComponent(category.icon);
                const contentCount = getCategoryContent(category.id).length;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${category.color_gradient} mb-4`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">{category.name}</h3>
                        <p className="text-gray-600 mb-4">{category.description}</p>
                        <div className="flex items-center justify-between mb-6">
                          <Badge variant="secondary">
                            {contentCount} {contentCount === 1 ? 'item' : 'items'}
                          </Badge>
                          <Badge variant="outline">
                            {category.age_group === 'infants' ? '0-3 years' : 'Nursery-KG3'}
                          </Badge>
                        </div>
                        <Button 
                          className={`w-full bg-gradient-to-r ${category.color_gradient} hover:opacity-90 transition-opacity text-white border-0 shadow-lg`}
                          size={selectedAgeGroup === 'infants' ? 'lg' : 'default'}
                          onClick={() => handleCategoryClick(category)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning ({contentCount})
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Features Bar */}
            <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Volume2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Audio Learning</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Palette className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Visual Arts</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-orange-100">
                    <Download className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Offline Access</span>
                </div>
              </div>
            </div>

            {/* Parental Controls Notice */}
            <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">👨‍👩‍👧‍👦 Parental Controls Available</h3>
              <p className="text-gray-600">
                Monitor your child's progress, set screen time limits, and create a safe learning environment
              </p>
              <Button variant="outline" className="mt-4">
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Content Dialog */}
          <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  {selectedCategory?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {selectedCategory && getCategoryContent(selectedCategory.id).map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {item.thumbnail_url && (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{item.content_type}</Badge>
                        {item.duration_minutes && (
                          <span className="text-xs text-gray-500">
                            {item.duration_minutes} min
                          </span>
                        )}
                      </div>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => {
                          if (item.content_url) {
                            window.open(item.content_url, '_blank');
                          } else {
                            toast.info('Content coming soon!');
                          }
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {item.content_type === 'video' ? 'Watch' : 
                         item.content_type === 'game' ? 'Play' : 
                         item.content_type === 'flashcard' ? 'Study' : 'Start'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {selectedCategory && getCategoryContent(selectedCategory.id).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No content available yet. Check back soon for exciting new activities!</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
};

export default Kids;