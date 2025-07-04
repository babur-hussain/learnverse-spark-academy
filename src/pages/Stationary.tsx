import React, { useRef, useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { BookOpen, Calendar, ClipboardList, Calculator, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { icon: <Calculator size={28} />, label: 'Calculator' },
  { icon: <ClipboardList size={28} />, label: 'Office Stationery' },
  { icon: <BookOpen size={28} />, label: 'Note Book' },
  { icon: <Calendar size={28} />, label: 'Calendar' },
  { icon: <PenTool size={28} />, label: 'Pens' },
];

const topCategories = [
  { img: '/public/images/materials.png', label: 'Note Books' },
  { img: '/public/images/books.png', label: 'Office Supplies' },
  { img: '/public/images/materials.png', label: 'School Stationery' },
  { img: '/public/images/computer.png', label: 'Art Supplies' },
];

const offerImages = [
  '/public/images/books.png',
  '/public/images/materials.png',
  '/public/images/computer.png',
];

const products = [
  { id: 1, name: 'Notebook A5', img: '/public/images/materials.png', price: 120, oldPrice: 150 },
  { id: 2, name: 'Calculator FX-991', img: '/public/images/computer.png', price: 950, oldPrice: 1200 },
  { id: 3, name: 'Ballpoint Pens (Pack of 10)', img: '/public/images/books.png', price: 60, oldPrice: 80 },
  { id: 4, name: 'Sticky Notes', img: '/public/images/materials.png', price: 40, oldPrice: 50 },
];

const Stationary = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-2 pb-24 pt-4 w-full max-w-lg mx-auto pt-[72px]">
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center text-center mb-6">
          <img src="/public/images/materials.png" alt="Stationary" className="w-28 h-28 rounded-full shadow-lg mb-3 bg-white object-contain" />
          <h1 className="text-2xl font-bold text-learn-purple mb-1">Stationary App</h1>
          <p className="text-gray-500 mb-2 text-sm max-w-xs mx-auto">Shop the best stationery and office supplies for students and professionals. Fast delivery, great prices!</p>
        </div>

        {/* Search Bar */}
        <div className="w-full flex items-center mb-4 mt-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 shadow-sm focus:ring-2 focus:ring-learn-purple focus:outline-none bg-white text-gray-700"
          />
        </div>

        {/* Category Bar */}
        <div className="w-full overflow-x-auto scrollbar-hide mb-5">
          <div className="flex gap-4 min-w-max px-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[80px]">
                <div className="bg-learn-purple/10 text-learn-purple rounded-full p-3 mb-1 shadow-md">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Card */}
        <div className="w-full bg-gradient-to-r from-purple-400 via-purple-300 to-blue-300 rounded-2xl shadow-lg p-4 flex items-center mb-6 relative overflow-hidden">
          <img src="/public/images/books.png" alt="Promo" className="w-16 h-16 rounded-lg object-contain mr-4 bg-white shadow" />
          <div>
            <div className="text-white font-bold text-lg mb-1">School Stationery 20% off</div>
            <button className="bg-white text-learn-purple font-semibold px-4 py-1 rounded-lg shadow hover:bg-purple-50 transition">Buy Now</button>
          </div>
        </div>

        {/* Top Categories - now horizontally scrollable */}
        <div className="w-full mb-2 mt-2">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Top Categories</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-1 pb-2">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center bg-white rounded-full shadow p-3 min-w-[100px] max-w-[100px]">
                <img src={cat.img} alt={cat.label} className="w-16 h-16 rounded-full object-contain mb-2 border border-purple-100" />
                <span className="text-sm font-medium text-gray-700 text-center">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offers Poster Carousel */}
        <div className="w-full mt-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Offers</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-1 pb-2">
            {offerImages.map((img, idx) => (
              <img key={idx} src={img} alt={`Offer ${idx+1}`} className="rounded-2xl shadow-lg w-64 h-32 object-cover flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Product Listing */}
        <div className="w-full mt-2">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Products</h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-2xl shadow p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer">
                <img src={product.img} alt={product.name} className="w-20 h-20 object-contain mb-2 rounded-lg border border-gray-100" />
                <div className="text-sm font-semibold text-gray-800 mb-1 text-center">{product.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-learn-purple font-bold text-base">₹{product.price}</span>
                  <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                </div>
                <button className="bg-learn-purple text-white px-3 py-1 rounded-lg text-xs font-medium shadow hover:bg-purple-700 transition">Add to Cart</button>
              </Link>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-2 text-center text-gray-400 py-8">No products found.</div>
            )}
          </div>
        </div>
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Stationary; 