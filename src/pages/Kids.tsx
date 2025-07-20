import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Baby, Star, Heart, Sparkles, Play, BookOpen, Music, Gamepad2, Palette, Users, Volume2, Download } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import MainLayout from '@/components/Layout/MainLayout';

const Kids = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infants' | 'preschool'>('infants');

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

  const infantsContent = [
    {
      title: 'Colorful Notes & Flashcards',
      description: 'Simple, image-rich educational flashcards with alphabets, shapes, and animals',
      icon: BookOpen,
      color: 'from-pink-400 to-rose-400',
      items: ['Baby Alphabets', 'Animal Sounds', 'Color Recognition', 'Shape Learning']
    },
    {
      title: 'Baby Videos',
      description: 'Short, engaging visual content with music and baby rhymes',
      icon: Play,
      color: 'from-purple-400 to-pink-400',
      items: ['Lullaby Videos', 'Motion Learning', 'Gentle Animations', 'Sensory Stimulation']
    },
    {
      title: 'Baby Rhymes & Poems',
      description: 'Classic and modern baby rhymes with audio and animated visuals',
      icon: Music,
      color: 'from-indigo-400 to-purple-400',
      items: ['Nursery Rhymes', 'Bedtime Songs', 'Action Songs', 'Sound Play']
    },
    {
      title: 'Mini Baby Games',
      description: 'Simple touch-interactive games for sensory development',
      icon: Gamepad2,
      color: 'from-teal-400 to-cyan-400',
      items: ['Pop Balloons', 'Color Touch', 'Sound Matching', 'Gentle Puzzles']
    }
  ];

  const preschoolContent = [
    {
      title: 'Interactive Learning Notes',
      description: 'Illustrated notes and worksheets for foundational learning',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      items: ['ABC Learning', 'Number Recognition', 'Daily Life Themes', 'Basic Literacy']
    },
    {
      title: 'Educational Videos',
      description: 'Fun videos mixing entertainment with foundational learning',
      icon: Play,
      color: 'from-green-500 to-teal-500',
      items: ['Phonics Fun', 'Counting Games', 'Story Time', 'Science Basics']
    },
    {
      title: 'Poems & Sing-Alongs',
      description: 'Animated poems with read-along features and karaoke subtitles',
      icon: Music,
      color: 'from-orange-500 to-red-500',
      items: ['Action Rhymes', 'Learning Songs', 'Story Poems', 'Sing-Along Fun']
    },
    {
      title: 'Fun Learning Games',
      description: 'Engaging educational games for memory and problem-solving',
      icon: Gamepad2,
      color: 'from-purple-500 to-pink-500',
      items: ['Memory Games', 'Puzzle Play', 'Matching Pairs', 'Logic Games']
    }
  ];

  const currentContent = selectedAgeGroup === 'infants' ? infantsContent : preschoolContent;
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
              {currentContent.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${section.color} mb-4`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">{section.title}</h3>
                        <p className="text-gray-600 mb-4">{section.description}</p>
                        <div className="space-y-2 mb-6">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"></div>
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 transition-opacity text-white border-0 shadow-lg`}
                          size={selectedAgeGroup === 'infants' ? 'lg' : 'default'}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Kids;