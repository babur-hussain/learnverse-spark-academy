import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';

const cartItems = [
  { id: 1, name: 'Notebook A5', img: '/public/images/materials.png', price: 120, qty: 2 },
  { id: 2, name: 'Calculator FX-991', img: '/public/images/computer.png', price: 950, qty: 1 },
];
const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

const Checkout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-2 pb-24 pt-[72px] w-full max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
        <div className="w-full bg-white rounded-xl shadow p-4 mb-4">
          <div className="font-semibold mb-2">Shipping Address</div>
          <div className="text-gray-700 text-sm mb-1">123 Main Street, City, Country</div>
          <div className="text-gray-400 text-xs">+91 9876543210</div>
        </div>
        <div className="w-full bg-white rounded-xl shadow p-4 mb-4">
          <div className="font-semibold mb-2">Order Summary</div>
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center mb-2">
              <img src={item.img} alt={item.name} className="w-10 h-10 object-contain rounded-lg border border-gray-100 mr-2" />
              <div className="flex-1 text-sm">{item.name} x{item.qty}</div>
              <div className="text-learn-purple font-bold">₹{item.price * item.qty}</div>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
        <div className="w-full bg-white rounded-xl shadow p-4 mb-4">
          <div className="font-semibold mb-2">Payment Method</div>
          <select className="w-full border rounded px-3 py-2">
            <option>Cash on Delivery</option>
            <option>Credit/Debit Card</option>
            <option>UPI</option>
          </select>
        </div>
        <button className="w-full bg-learn-purple text-white py-3 rounded-xl font-semibold shadow hover:bg-purple-700 transition">Place Order</button>
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Checkout; 