import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Pickup from './pages/Pickup';
import Payment from './pages/Payment';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

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

  const clearOrderData = () => {
    setOrderData(null);
    setCustomerInfo({ name: '', email: '', phone: '' });
    setCartItems([]);
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
        />;
      case 'payment':
        return <Payment 
          orderData={orderData}
          setCurrentPage={setCurrentPage}
          handleRemoveFromCart={handleRemoveFromCart}
          clearOrderData={clearOrderData}
        />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;