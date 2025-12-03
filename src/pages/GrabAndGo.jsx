import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://defiant-meals-backend.onrender.com';

const GrabAndGo = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  // Fetch Grab & Go menu items
  useEffect(() => {
    fetchGrabAndGoMenu();
  }, []);

  const fetchGrabAndGoMenu = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grab-and-go/menu`);
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching Grab & Go menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get cart quantity for an item
  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(item => item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Update item quantity (add/remove)
  const updateQuantity = (item, change) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + change;

    if (newQty <= 0) {
      // Remove from cart
      setCart(cart.filter(cartItem => cartItem._id !== item._id));
    } else if (!existingItem) {
      // Add new item with tax calculation
      const taxRate = item.isFood === false ? 0.095 : 0.03;
      const taxAmount = item.price * taxRate;
      const priceWithTax = item.price + taxAmount;
      
      setCart([...cart, { 
        ...item, 
        basePrice: item.price,
        price: priceWithTax,
        quantity: 1 
      }]);
    } else {
      // Update existing quantity
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: newQty }
          : cartItem
      ));
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  // Calculate cart total (prices already include tax)
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Get cart item count
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Format macros inline
  const formatMacros = (item) => {
    const parts = [];
    if (item.protein) parts.push(`${parseInt(item.protein)}P`);
    if (item.carbs) parts.push(`${parseInt(item.carbs)}C`);
    if (item.fats) parts.push(`${parseInt(item.fats)}F`);
    if (item.calories) parts.push(`${parseInt(item.calories)}cal`);
    return parts.join(' | ');
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Please enter a valid email address to receive your order confirmation.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const formattedItems = cart.map(item => ({
        menuItemId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await fetch(`${API_BASE_URL}/api/grab-and-go/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: formattedItems,
          customerEmail: customerEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to proceed to checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // Filter to only show in-stock items
  const availableItems = menuItems.filter(item => item.inventory > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-6 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🥗 Grab & Go
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Quick meals ready when you are!
          </p>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 transition-all duration-300 z-50 flex items-center justify-center w-14 h-14 hover:scale-110 active:scale-95"
        >
          <div className="relative">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </div>
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        )}

        {/* No Items Available */}
        {!loading && availableItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-lg text-gray-500">No items available right now.</p>
            <p className="text-gray-400 mt-2">Check back soon!</p>
          </div>
        )}

        {/* Menu Items - Horizontal Bars */}
        {!loading && availableItems.length > 0 && (
          <div className="space-y-3">
            {availableItems.map(item => {
              const qty = getCartQuantity(item._id);
              const macros = formatMacros(item);
              
              return (
                <div 
                  key={item._id} 
                  className="bg-green-600 hover:bg-green-700 rounded-xl shadow-lg overflow-hidden transition-all duration-200 active:scale-[0.99]"
                >
                  <div className="flex items-center p-2 md:p-3">
                    {/* Thumbnail - Hard Left */}
                    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-green-500 mr-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white text-2xl">🍽️</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Name + Macros Container */}
                    <div className="flex-1 min-w-0 mr-2 flex flex-col md:flex-row md:items-center">
                      {/* Item Name */}
                      <div className="flex-shrink-0 md:mr-2">
                        <h3 className="text-white font-bold text-sm md:text-base truncate">
                          {item.name}
                        </h3>
                      </div>

                      {/* Macros */}
                      {macros && (
                        <div className="flex-1 min-w-0">
                          <p className="text-green-100 text-xs md:text-sm whitespace-nowrap">
                            {macros}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-white font-bold text-sm md:text-base mr-3">
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex-shrink-0 flex items-center bg-white rounded-full px-1.5 py-1">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all active:scale-90 ${
                          qty === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        disabled={qty === 0}
                      >
                        -
                      </button>
                      <span className="text-gray-800 font-bold min-w-[24px] md:min-w-[28px] text-center text-sm md:text-base">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white font-bold text-sm transition-all active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
            <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
              {/* Cart Header */}
              <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item._id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            className="w-7 h-7 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="w-7 h-7 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[60px]">
                          <p className="font-bold text-gray-800 text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t p-4 bg-gray-50">
                  {/* Email Input */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email (for confirmation) *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-2">Tax included</p>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || !customerEmail}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-base transition-all duration-300 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrabAndGo;