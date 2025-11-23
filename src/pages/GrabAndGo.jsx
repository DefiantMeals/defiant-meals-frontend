import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://defiant-meals-backend.onrender.com';

const GrabAndGo = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [imageErrors, setImageErrors] = useState({});

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

  // Handle image load error
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Get cart item count
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

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
      // Format cart items to match backend expectations
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
      
      // Redirect directly to Stripe checkout URL
      window.location.href = url;

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to proceed to checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            🥗 Grab & Go
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quick, convenient meals ready when you are. Browse our refrigerated selection, 
            pick your favorites, and pay instantly!
          </p>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 transition-all duration-300 z-50 flex items-center justify-center w-16 h-16 hover:scale-110 active:scale-95"
        >
          <div className="relative">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </div>
        </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Loading available items...</p>
          </div>
        )}

        {/* Menu Items Grid */}
        {!loading && menuItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-xl text-gray-500">No items available at the moment.</p>
            <p className="text-gray-400 mt-2">Please check back soon!</p>
          </div>
        )}

        {!loading && menuItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => {
              const showImage = item.imageUrl && !imageErrors[item._id];
              
              return (
                <div 
                  key={item._id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-300"
                >
                  {/* Image */}
                  {showImage ? (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        onError={() => handleImageError(item._id)}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <span className="text-green-600 text-lg font-medium">🍽️ Fresh Meal</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                      <span className="text-2xl font-bold text-green-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    {/* Nutritional Info */}
                    {(item.protein || item.carbs || item.fats || item.calories) && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          {item.protein && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Protein</div>
                              <div className="font-semibold text-blue-600">{item.protein}</div>
                            </div>
                          )}
                          {item.carbs && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Carbs</div>
                              <div className="font-semibold text-green-600">{item.carbs}</div>
                            </div>
                          )}
                          {item.fats && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Fats</div>
                              <div className="font-semibold text-orange-600">{item.fats}</div>
                            </div>
                          )}
                        </div>
                        {item.calories && (
                          <div className="text-center mt-2 text-sm text-gray-600">
                            {item.calories} cal
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stock Indicator */}
                    <div className="mb-4">
                      {item.inventory > 0 ? (
                        <span className="inline-flex items-center text-sm text-green-600 font-medium">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item.inventory} available
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-red-600 font-medium">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.inventory <= 0}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        item.inventory > 0
                          ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95 hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {item.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Cart Header */}
              <div className="bg-green-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-xl text-gray-500">Your cart is empty</p>
                    <p className="text-gray-400 mt-2">Add some delicious meals to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item._id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="font-bold text-lg min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-gray-800">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="border-t p-6 bg-gray-50">
                  {/* Email Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (for order confirmation) *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold text-gray-700">Total:</span>
                    <span className="text-3xl font-bold text-green-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || !customerEmail}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    You'll be redirected to secure checkout
                  </p>
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