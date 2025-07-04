import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';

const cartItems = [
  { id: 1, name: 'Notebook A5', img: '/public/images/materials.png', price: 120, qty: 2 },
  { id: 2, name: 'Calculator FX-991', img: '/public/images/computer.png', price: 950, qty: 1 },
];

const Cart = () => {
  const isMobile = useIsMobile();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-2 pb-24 pt-[72px] w-full max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cart</h1>
        <div className="w-full space-y-4 mb-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center bg-white rounded-xl shadow p-3">
              <img src={item.img} alt={item.name} className="w-16 h-16 object-contain rounded-lg border border-gray-100 mr-3" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="text-learn-purple font-bold">₹{item.price}</div>
                <div className="flex items-center gap-2 mt-1">
                  <button className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <span>{item.qty}</span>
                  <button className="px-2 py-1 bg-gray-200 rounded">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex justify-between items-center font-bold text-lg mb-4">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <button className="w-full bg-learn-purple text-white py-3 rounded-xl font-semibold shadow hover:bg-purple-700 transition">Checkout</button>
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Cart; 