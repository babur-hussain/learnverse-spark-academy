import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { useParams } from 'react-router-dom';

const products = [
  { id: 1, name: 'Notebook A5', img: '/public/images/materials.png', price: 120, oldPrice: 150, description: 'A high-quality A5 notebook for all your writing needs. 200 pages, ruled, durable cover.' },
  { id: 2, name: 'Calculator FX-991', img: '/public/images/computer.png', price: 950, oldPrice: 1200, description: 'Scientific calculator with 552 functions, perfect for students and professionals.' },
  { id: 3, name: 'Ballpoint Pens (Pack of 10)', img: '/public/images/books.png', price: 60, oldPrice: 80, description: 'Smooth writing ballpoint pens. Pack of 10 assorted colors.' },
  { id: 4, name: 'Sticky Notes', img: '/public/images/materials.png', price: 40, oldPrice: 50, description: 'Colorful sticky notes for reminders and organization. 100 sheets.' },
];

const Product = () => {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-2 pb-24 pt-[72px] w-full max-w-lg mx-auto">
        {product ? (
          <>
            <img src={product.img} alt={product.name} className="w-40 h-40 object-contain rounded-2xl shadow mb-4 bg-white" />
            <div className="text-2xl font-bold text-gray-800 mb-2 text-center">{product.name}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-learn-purple font-bold text-xl">₹{product.price}</span>
              <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
            </div>
            <div className="text-gray-600 text-center mb-4">{product.description}</div>
            <div className="flex gap-3 w-full justify-center">
              <button className="bg-learn-purple text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition">Add to Cart</button>
              <button className="bg-white border border-learn-purple text-learn-purple px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-50 transition">Wishlist</button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 text-lg py-16">Product not found.</div>
        )}
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Product; 