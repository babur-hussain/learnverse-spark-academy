import React from 'react';
import { Card, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { ArrowRight, Star, BookOpen, Palette, Calculator, Globe, Music, Heart } from 'lucide-react';
import useIsMobile from '@/hooks/use-mobile';

const KidsContentSection = () => {
  const isMobile = useIsMobile();

  const kidsCategories = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Early Reading",
      description: "Fun phonics, sight words, and interactive stories for young readers",
      badge: "Most Popular",
      badgeColor: "bg-orange-500",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-900/20"
    },
    {
      icon: <Calculator className="h-8 w-8 text-green-600" />,
      title: "Math Adventures",
      description: "Counting, shapes, and basic math through games and activities",
      badge: "New",
      badgeColor: "bg-emerald-500",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-900/20"
    },
    {
      icon: <Palette className="h-8 w-8 text-purple-600" />,
      title: "Creative Arts",
      description: "Drawing, painting, and craft projects to spark imagination",
      badge: "Premium",
      badgeColor: "bg-purple-500",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-900/20"
    },
    {
      icon: <Globe className="h-8 w-8 text-yellow-600" />,
      title: "Science Explorer",
      description: "Simple experiments and nature discovery for curious minds",
      badge: "Featured",
      badgeColor: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      darkBgColor: "dark:bg-yellow-900/20"
    },
    {
      icon: <Music className="h-8 w-8 text-pink-600" />,
      title: "Music & Movement",
      description: "Rhythm, songs, and dance to develop coordination",
      badge: "Popular",
      badgeColor: "bg-pink-500",
      bgColor: "bg-pink-50",
      darkBgColor: "dark:bg-pink-900/20"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Social Skills",
      description: "Emotional learning and friendship building activities",
      badge: "Essential",
      badgeColor: "bg-red-500",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-900/20"
    }
  ];

  const featuredCourses = [
    { title: "Colors & Shapes", image: "/images/materials.png", bg: "bg-pink-100", darkBg: "dark:bg-pink-900/30" },
    { title: "Early Phonics", image: "/images/books.png", bg: "bg-purple-100", darkBg: "dark:bg-purple-900/30" },
    { title: "Numbers & Counting", image: "/images/computer.png", bg: "bg-blue-100", darkBg: "dark:bg-blue-900/30" },
    { title: "Creative Crafts", image: "/images/materials.png", bg: "bg-orange-100", darkBg: "dark:bg-orange-900/30" },
    { title: "Story Time", image: "/images/books.png", bg: "bg-emerald-100", darkBg: "dark:bg-emerald-900/30" },
    { title: "Mini Experiments", image: "/images/programming.png", bg: "bg-indigo-100", darkBg: "dark:bg-indigo-900/30" }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-orange-600 text-sm font-medium">Kids Learning</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Our <span className="text-blue-600 dark:text-blue-400">Kids Categories</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Discover engaging educational content designed specifically for young learners. 
            Our interactive courses make learning fun and memorable for children of all ages.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
            All Kids Courses →
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {kidsCategories.map((category, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:-translate-y-2 hover:scale-105"
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: 'fade-in 0.8s ease-out forwards'
              }}
            >
              <CardContent className="p-6">
                <div className={`${category.bgColor} ${category.darkBgColor} rounded-full p-4 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                
                <Badge className={`${category.badgeColor} text-white shadow-lg mb-3 text-xs`}>
                  {category.badge}
                </Badge>
                
                <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>
                
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group-hover:translate-x-1 transition-all duration-300"
                >
                  Explore Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Courses Section - Tile layout */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
            <div>
              <div className="flex items-center mb-3">
                <Star className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-orange-600 text-sm font-medium">Kids Categories</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Featured Kids Categories
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-xl">
                Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
              </p>
              <div className="mt-6">
                <Button className="bg-indigo-700 hover:bg-indigo-800 text-white px-6">
                  All Kids Categories <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <div key={index} className="group">
                <div className={`rounded-xl overflow-hidden ${course.bg} ${course.darkBg} h-48 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg`}>
                  <img src={course.image} alt={course.title} className="h-40 object-contain" />
                </div>
                <div className="text-center mt-4">
                  <h4 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">
                    {course.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KidsContentSection;
