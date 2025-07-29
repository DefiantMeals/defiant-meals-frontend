import React, { useState } from 'react';

const Menu = ({ handleAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Empty menuItems array — ready for your real content
  const menuItems = [];

  // Updated category filters
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'high-protein', name: 'High Protein' },
    { id: 'quality-carbs', name: 'Quality Carbs' },
    { id: 'healthier-options', name: 'Healthier Options' },
    { id: 'snacks', name: 'Snacks' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className="p-6">
                <div className="text-6xl text-center mb-4">{item.image}</div>
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="mr-4">{item.calories} cal</span>
                    <span>{item.protein} protein</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">${item.price}</span>
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
