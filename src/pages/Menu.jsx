import React, { useState } from 'react';

const Menu = ({ handleAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const menuItems = [
    {
      id: 1,
      name: "Grilled Salmon Bowl",
      category: "main",
      price: 16.99,
      description: "Fresh Atlantic salmon with quinoa, roasted vegetables, and lemon herb dressing",
      image: "🐟",
      calories: 450,
      protein: "35g"
    },
    {
      id: 2,
      name: "Mediterranean Chicken Wrap",
      category: "main",
      price: 12.99,
      description: "Grilled chicken, hummus, cucumber, tomatoes, and feta in a whole wheat wrap",
      image: "🌯",
      calories: 380,
      protein: "28g"
    },
    {
      id: 3,
      name: "Quinoa Power Bowl",
      category: "vegetarian",
      price: 14.99,
      description: "Superfood bowl with quinoa, avocado, chickpeas, kale, and tahini dressing",
      image: "🥗",
      calories: 420,
      protein: "18g"
    },
    {
      id: 4,
      name: "Green Goddess Smoothie",
      category: "drinks",
      price: 8.99,
      description: "Spinach, mango, banana, coconut water, and chia seeds",
      image: "🥤",
      calories: 220,
      protein: "8g"
    },
    {
      id: 5,
      name: "Protein Pancakes",
      category: "breakfast",
      price: 11.99,
      description: "High-protein pancakes with berries, Greek yogurt, and maple syrup",
      image: "🥞",
      calories: 350,
      protein: "25g"
    },
    {
      id: 6,
      name: "Acai Energy Bowl",
      category: "breakfast",
      price: 13.99,
      description: "Acai base topped with granola, fresh berries, coconut, and honey",
      image: "🍇",
      calories: 320,
      protein: "12g"
    },
    {
      id: 7,
      name: "Turkey & Avocado Sandwich",
      category: "main",
      price: 10.99,
      description: "Lean turkey, avocado, lettuce, tomato on whole grain bread",
      image: "🥪",
      calories: 340,
      protein: "24g"
    },
    {
      id: 8,
      name: "Chocolate Protein Shake",
      category: "drinks",
      price: 9.99,
      description: "Rich chocolate protein shake with almond butter and banana",
      image: "🍫",
      calories: 280,
      protein: "30g"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'main', name: 'Main Dishes' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'drinks', name: 'Drinks' }
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