import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Pickup from './pages/Pickup';
import Payment from './pages/Payment';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import GrabAndGo from './pages/GrabAndGo';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Initialize state from sessionStorage or defaults
  const [cartItems, setCartItems] = useState(() => {
    const saved = sessionStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orderData, setOrderData] = useState(() => {
    const saved = sessionStorage.getItem('orderData');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [customerInfo, setCustomerInfo] = useState(() => {
    const saved = sessionStorage.getItem('customerInfo');
    return saved ? JSON.parse(saved) : { name: '', email: '', phone: '' };
  });

  const [pickupDetails, setPickupDetails] = useState(() => {
    const saved = sessionStorage.getItem('pickupDetails');
    return saved ? JSON.parse(saved) : { date: '', time: '' };
  });

  // Save cartItems to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save orderData to sessionStorage whenever it changes
  useEffect(() => {
    if (orderData) {
      sessionStorage.setItem('orderData', JSON.stringify(orderData));
    } else {
      sessionStorage.removeItem('orderData');
    }
  }, [orderData]);

  // Save customerInfo to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('customerInfo', JSON.stringify(customerInfo));
  }, [customerInfo]);

  // Save pickupDetails to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('pickupDetails', JSON.stringify(pickupDetails));
  }, [pickupDetails]);

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('cartItems');
  };

  const clearOrderData = () => {
    setOrderData(null);
    setCustomerInfo({ name: '', email: '', phone: '' });
    setPickupDetails({ date: '', time: '' });
    setCartItems([]);
    // Clear sessionStorage
    sessionStorage.removeItem('orderData');
    sessionStorage.removeItem('customerInfo');
    sessionStorage.removeItem('pickupDetails');
    sessionStorage.removeItem('cartItems');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'menu':
        return <Menu 
          handleAddToCart={handleAddToCart}
          cartItems={cartItems}
          updateCartItemQuantity={handleUpdateQuantity}
          removeFromCart={handleRemoveFromCart}
        />;
      case 'order':
        return <Order 
          cartItems={cartItems}
          handleUpdateQuantity={handleUpdateQuantity}
          handleRemoveFromCart={handleRemoveFromCart}
          setCurrentPage={setCurrentPage}
          setOrderData={setOrderData}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
        />;
      case 'pickup':
        return <Pickup 
          orderData={orderData}
          setCurrentPage={setCurrentPage}
          setOrderData={setOrderData}
          setPickupDetails={setPickupDetails}
        />;
      case 'payment':
        return (
          <Elements stripe={stripePromise}>
            <Payment 
              cart={cartItems}
              customerInfo={customerInfo}
              pickupDetails={pickupDetails}
              setCurrentPage={setCurrentPage}
              clearCart={clearCart}
            />
          </Elements>
        );
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Grab and Go - Standalone route with NO navbar/footer */}
        <Route path="/grab-and-go" element={<GrabAndGo />} />
        
        {/* All other routes - Use existing page state system */}
        <Route 
          path="/*" 
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
              <main className="flex-grow">
                {renderPage()}
              </main>
              <Footer setCurrentPage={setCurrentPage} />
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;