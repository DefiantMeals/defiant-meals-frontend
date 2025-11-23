import React, { useState } from 'react';

const Order = ({ 
  cartItems, 
  handleUpdateQuantity, 
  handleRemoveFromCart, 
  setCurrentPage, 
  setOrderData,
  customerInfo,      // ✅ RECEIVE FROM APP.JSX
  setCustomerInfo    // ✅ RECEIVE FROM APP.JSX
}) => {
  const [orderError, setOrderError] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Cart prices already include tax - just calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const continueToPickup = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setOrderError('Please fill in all required fields');
      return;
    }

    // Save order data for pickup page
    const orderDetails = {
      customer: customerInfo,
      items: cartItems.map(item => ({
        id: item.id,
        originalId: item.originalId || item.id,
        name: item.name,
        price: item.price,
        basePrice: item.basePrice || item.price,
        quantity: item.quantity,
        selectedFlavor: item.selectedFlavor || null,
        selectedAddons: item.selectedAddons || [],
        customizations: item.customizations || {}
      })),
      customerNotes: customerNotes.trim(),
      total: total // Cart prices already include tax
    };

    setOrderData(orderDetails);
    setCurrentPage('pickup');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
          <div className="bg-gray-50 rounded-lg p-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet. 
              Browse our delicious menu to get started!
            </p>
            <button 
              onClick={() => setCurrentPage('menu')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatCustomizations = (item) => {
    const customizations = [];
    if (item.selectedFlavor && item.selectedFlavor.name) {
      customizations.push(`Flavor: ${item.selectedFlavor.name}`);
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      customizations.push(`Add-ons: ${item.selectedAddons.map(addon => addon.name).join(', ')}`);
    }
    return customizations.join(' | ');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Your Order</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Customer Information</h2>
              
              {orderError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700">{orderError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Customer Notes Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Special Instructions</h2>
              <p className="text-gray-600 text-sm mb-4">
                Any special requests or notes for the kitchen? (allergies, dietary restrictions, etc.)
              </p>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Enter any special instructions for your order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                rows="4"
                maxLength="500"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {customerNotes.length}/500 characters
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Cart Items</h2>
              
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-4 flex-grow">
                      <div className="text-3xl">{item.image || '🍽️'}</div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        {formatCustomizations(item) && (
                          <p className="text-sm text-blue-600 mt-1">{formatCustomizations(item)}</p>
                        )}
                        <div className="flex items-center mt-2">
                          <p className="text-gray-600 text-sm mr-4">${item.price.toFixed(2)} each</p>
                          {item.basePrice && item.basePrice !== item.price && (
                            <p className="text-xs text-gray-500">
                              (Base: ${item.basePrice.toFixed(2)})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-lg font-semibold w-20 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-2">Tax included in prices</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={continueToPickup}
                  className="w-full py-3 rounded-lg font-semibold transition duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Pickup
                </button>
                <button 
                  onClick={() => setCurrentPage('menu')}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-300"
                >
                  Continue Shopping
                </button>
              </div>
              
              {/* Pickup Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Enjoy your selection!</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p></p>
                  <p></p>
                  <p></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;