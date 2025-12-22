import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://defiant-meals-backend.onrender.com';

const Menu = ({ handleAddToCart, cartItems = [], updateCartItemQuantity, removeFromCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedItemOptions, setSelectedItemOptions] = useState({});
  const [showCart, setShowCart] = useState(false);

  // Calculate cart totals from props
  const cartItemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

  // Get count of specific item in cart - match by customizationId to handle flavors correctly
  const getItemCartCount = (itemId) => {
    const options = selectedItemOptions[itemId] || {};
    // Build the same customizationId format used when adding to cart
    const customizationId = `${itemId}_${options.selectedFlavor?.name || 'no-flavor'}_${(options.selectedAddons || []).map(a => a.name).sort().join('_')}`;

    // Look for exact match by customizationId
    const cartItem = cartItems.find(item => item.id === customizationId);
    return cartItem ? cartItem.quantity || 1 : 0;
  };

  // Handle quantity changes - update parent cart state
  const handleQuantityChange = (item, change) => {
    const options = selectedItemOptions[item._id] || {};
    // Build the same customizationId format used when adding to cart
    const customizationId = `${item._id}_${options.selectedFlavor?.name || 'no-flavor'}_${(options.selectedAddons || []).map(a => a.name).sort().join('_')}`;

    const currentCount = getItemCartCount(item._id);
    const newCount = currentCount + change;

    if (newCount <= 0) {
      // Find the cart item to remove by customizationId
      const cartItem = cartItems.find(cartItem => cartItem.id === customizationId);
      if (cartItem) {
        removeFromCart(cartItem.id);
      }
    } else if (currentCount === 0) {
      handleAddToCartWithOptions(item);
    } else {
      // Find the cart item to update by customizationId
      const cartItem = cartItems.find(cartItem => cartItem.id === customizationId);
      if (cartItem) {
        updateCartItemQuantity(cartItem.id, newCount);
      }
    }
  };

  // Handle flavor selection (single select)
  const handleFlavorChange = (itemId, flavor) => {
    setSelectedItemOptions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selectedFlavor: flavor
      }
    }));
  };

  // Handle addon selection (multi-select)
  const handleAddonChange = (itemId, addon, isChecked) => {
    setSelectedItemOptions(prev => {
      const currentAddons = prev[itemId]?.selectedAddons || [];
      const newAddons = isChecked 
        ? [...currentAddons, addon]
        : currentAddons.filter(a => a.name !== addon.name);
      
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          selectedAddons: newAddons
        }
      };
    });
  };

  // Calculate total price including add-ons - with null checks
  const calculateItemPrice = (basePrice, itemId) => {
    const options = selectedItemOptions[itemId] || {};
    let totalPrice = parseFloat(basePrice) || 0;

    // Add flavor price if it has one
    if (options.selectedFlavor && options.selectedFlavor.price) {
      totalPrice += parseFloat(options.selectedFlavor.price) || 0;
    }

    // Add addon prices
    if (options.selectedAddons) {
      totalPrice += options.selectedAddons.reduce((sum, addon) => sum + (parseFloat(addon.price) || 0), 0);
    }

    return totalPrice;
  };

  // Calculate total macros including selected add-ons
  const calculateItemMacros = (item, itemId) => {
    const options = selectedItemOptions[itemId] || {};
    const selectedAddons = options.selectedAddons || [];

    // Parse base values (handle strings like "30g" by extracting number)
    const parseValue = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    let protein = parseValue(item.protein);
    let carbs = parseValue(item.carbs);
    let fats = parseValue(item.fats);
    let calories = parseValue(item.calories);

    // Add selected add-ons' macros
    selectedAddons.forEach(addon => {
      protein += parseValue(addon.protein);
      carbs += parseValue(addon.carbs);
      fats += parseValue(addon.fats);
      calories += parseValue(addon.calories);
    });

    return { protein, carbs, fats, calories, hasAddons: selectedAddons.length > 0 };
  };

  // Enhanced add to cart with options
  const handleAddToCartWithOptions = (item) => {
    const options = selectedItemOptions[item._id] || {};
    let totalPrice = calculateItemPrice(item.price, item._id);
    
    // Calculate tax based on isFood field
    // 3% for food items (isFood === true or undefined/null)
    // 9.5% for non-food items (isFood === false)
    const taxRate = item.isFood === false ? 0.095 : 0.03;
    const taxAmount = totalPrice * taxRate;
    totalPrice = totalPrice + taxAmount; // Add tax to get final price with tax included
    
    // Create a unique identifier for cart items with different customizations
    const customizationId = `${item._id}_${options.selectedFlavor?.name || 'no-flavor'}_${(options.selectedAddons || []).map(a => a.name).sort().join('_')}`;
    
    const cartItem = {
      id: customizationId,
      originalId: item._id,
      name: item.name,
      price: totalPrice, // This is now the tax-inclusive price
      basePrice: parseFloat(item.price) || 0,
      description: item.description,
      category: item.category,
      calories: item.calories,
      protein: item.protein,
      imageUrl: item.imageUrl,
      isFood: item.isFood,
      selectedFlavor: options.selectedFlavor || null,
      selectedAddons: options.selectedAddons || [],
      quantity: 1,
      customizations: {
        flavor: options.selectedFlavor?.name || null,
        addons: (options.selectedAddons || []).map(a => a.name)
      }
    };
    
    handleAddToCart(cartItem);
    
    // Clear selections after adding to cart
    setSelectedItemOptions(prev => ({
      ...prev,
      [item._id]: {}
    }));
  };

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await response.json();
        
        const availableCategories = data
          .filter(cat => cat.available)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        const categoriesWithAll = [
          { id: 'All Items', name: 'All Items' },
          ...availableCategories.map(cat => ({ id: cat.name, name: cat.name }))
        ];
        
        setCategories(categoriesWithAll);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([
          { id: 'All Items', name: 'All Items' },
          { id: 'High Protein', name: 'High Protein' },
          { id: 'Quality Carbs', name: 'Quality Carbs' },
          { id: 'Healthier Options', name: 'Healthier Options' },
          { id: 'Snacks', name: 'Snacks' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const availableItems = menuItems.filter(item => item.available && item.showOnPreOrder !== false);
  const filteredItems = selectedCategory === 'All Items'
    ? availableItems
    : availableItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen py-8"> 
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Our Menu</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Discover our carefully crafted selection of nutritious and delicious meals,
          made with fresh, high-quality ingredients.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categoriesLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {category.name}
              </button>
            ))
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Loading menu items...</p>
          </div>
        )}

        {/* Menu Items Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
            {filteredItems.map(item => {
              const cartCount = getItemCartCount(item._id);
              const itemPrice = calculateItemPrice(item.price, item._id);
              const currentOptions = selectedItemOptions[item._id] || {};
              const macros = calculateItemMacros(item, item._id);
              
              return (
                <div 
                  key={item._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-200"
                >
                  {/* Image Section */}
                  {item.imageUrl && (
                    <div className="relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Content Section */}
                  <div className="p-6">
                    {!item.imageUrl && (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">🍽️ Delicious Meal</span>
                      </div>
                    )}
                    
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>

                    {/* Flavor Options */}
                    {item.flavorOptions && item.flavorOptions.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choose Flavor:
                        </label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={currentOptions.selectedFlavor?.name || ''}
                          onChange={(e) => {
                            const flavor = item.flavorOptions.find(f => f.name === e.target.value);
                            handleFlavorChange(item._id, flavor || null);
                          }}
                        >
                          <option value="">Select flavor...</option>
                          {item.flavorOptions.map(flavor => (
                            <option key={flavor.name} value={flavor.name}>
                              {flavor.name} {flavor.price > 0 && `(+$${(parseFloat(flavor.price) || 0).toFixed(2)})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Add-on Options */}
                    {item.addonOptions && item.addonOptions.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add-ons:
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {item.addonOptions.map(addon => (
                            <label key={addon.name} className="flex items-start p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                checked={(currentOptions.selectedAddons || []).some(a => a.name === addon.name)}
                                onChange={(e) => handleAddonChange(item._id, addon, e.target.checked)}
                              />
                              <div className="ml-2">
                                <span className="text-sm font-medium">
                                  {addon.name} (+${(parseFloat(addon.price) || 0).toFixed(2)})
                                </span>
                                {(addon.protein || addon.carbs || addon.fats || addon.calories) && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {[
                                      addon.protein && <span key="p" className="text-blue-600">{addon.protein} P</span>,
                                      addon.carbs && <span key="c" className="text-green-600">{addon.carbs} C</span>,
                                      addon.fats && <span key="f" className="text-orange-600">{addon.fats} F</span>,
                                      addon.calories && <span key="cal">{addon.calories} cal</span>
                                    ].filter(Boolean).reduce((acc, curr, i) => {
                                      if (i === 0) return [curr];
                                      return [...acc, <span key={`sep-${i}`} className="mx-1">|</span>, curr];
                                    }, [])}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nutritional Information */}
                    <div className={`mb-4 rounded-lg p-3 border ${macros.hasAddons ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      {macros.hasAddons && (
                        <div className="text-xs text-blue-600 font-medium text-center mb-2">
                          Total with add-ons
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {(item.protein || macros.protein > 0) && (
                          <div className="bg-white rounded-md p-2 shadow-sm">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Protein</div>
                            <div className="text-sm font-semibold text-blue-600">{macros.protein}g</div>
                          </div>
                        )}
                        {(item.fats || macros.fats > 0) && (
                          <div className="bg-white rounded-md p-2 shadow-sm">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fats</div>
                            <div className="text-sm font-semibold text-orange-600">{macros.fats}g</div>
                          </div>
                        )}
                        {(item.carbs || macros.carbs > 0) && (
                          <div className="bg-white rounded-md p-2 shadow-sm">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Carbs</div>
                            <div className="text-sm font-semibold text-green-600">{macros.carbs}g</div>
                          </div>
                        )}
                      </div>
                      {((item.calories || macros.calories > 0) || item.servingSize) && (
                        <div className="text-center mt-2 text-sm text-gray-600">
                          {(item.calories || macros.calories > 0) && <span>{macros.calories} calories</span>}
                          {(item.calories || macros.calories > 0) && item.servingSize && <span> | </span>}
                          {item.servingSize && <span>Serving Size: {item.servingSize}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end items-center mb-4">
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          ${itemPrice.toFixed(2)}
                        </span>
                        {itemPrice !== (parseFloat(item.price) || 0) && (
                          <div className="text-sm text-gray-500">
                            Base: ${(parseFloat(item.price) || 0).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button with Always Visible Quantity Controls */}
                    <div className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 active:scale-95 transform">
                      <span>Add to Cart</span>
                      <div className="flex items-center space-x-2 bg-white rounded-full px-2 py-1">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-90 ${
                            cartCount === 0 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          disabled={cartCount === 0}
                        >
                          -
                        </button>
                        <span className="text-gray-800 font-bold min-w-[16px] text-center text-sm">
                          {cartCount}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white font-bold text-sm transition-all active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No items found in this category.</p>
          </div>
        )}

        {/* Floating Cart - Only shows when cart has items */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 transition-all duration-300 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 p-3">
              {/* Cart Icon with Badge */}
              <div className="relative bg-blue-600 rounded-full p-2.5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              </div>

              {/* Price Display */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</span>
                <span className="text-lg font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => setShowCart(true)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => setShowCart(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors active:scale-95"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
            <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
              {/* Cart Header */}
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
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
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <div key={item.id || item._id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                          {item.customizations && (item.customizations.flavor || item.customizations.addons?.length > 0) && (
                            <p className="text-xs text-blue-600 mt-1">
                              {item.customizations.flavor && `${item.customizations.flavor}`}
                              {item.customizations.flavor && item.customizations.addons?.length > 0 && ' + '}
                              {item.customizations.addons?.join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.id || item.originalId, (item.quantity || 1) - 1)}
                            className="w-7 h-7 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm min-w-[20px] text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id || item.originalId, (item.quantity || 1) + 1)}
                            className="w-7 h-7 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[60px]">
                          <p className="font-bold text-gray-800 text-sm">
                            ${(item.price * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id || item.originalId)}
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
              {cartItems.length > 0 && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-3">Tax included</p>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      window.location.href = '/checkout';
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-base transition-all duration-300 active:scale-95"
                  >
                    Proceed to Checkout
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

export default Menu;