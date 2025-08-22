import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Menu = ({ handleAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'All Items', name: 'All Items' },
    { id: 'High Protein', name: 'High Protein' },
    { id: 'Quality Carbs', name: 'Quality Carbs' },
    { id: 'Healthier Options', name: 'Healthier Options' },
    { id: 'Snacks', name: 'Snacks' }
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        const data = await response.json();
        console.log('Menu items from API:', data);
        console.log('Items with imageUrl:', data.filter(item => item.imageUrl));
        setMenuItems(data);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter out disabled items first
  const availableItems = menuItems.filter(item => item.available);

  // Then filter by category
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
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              {/* Image Section */}
              {item.imageUrl && (
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Content Section */}
              <div className="p-6">
                {/* Placeholder for items without images */}
                {!item.imageUrl && (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">🍽️ Delicious Meal</span>
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {item.calories && <span className="mr-4">{item.calories} cal</span>}
                    {item.protein && <span>{item.protein} protein</span>}
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;