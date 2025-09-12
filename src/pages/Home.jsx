import React from 'react';

const Home = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/Defiant_Meals_Logo.png" 
              alt="Defiant Meals Logo" 
              className="w-16 h-16 md:w-20 md:h-20 mr-4"
            />
            <h1 className="text-5xl font-bold">Welcome to Defiant Meals</h1>
            <img 
              src="/Defiant_Meals_Logo.png" 
              alt="Defiant Meals Logo" 
              className="w-16 h-16 md:w-20 md:h-20 ml-4"
            />
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your ultimate meal planning companion. Discover delicious recipes, plan your meals, 
            and make healthy eating simple and enjoyable.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => setCurrentPage('menu')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Defiant Meals?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-3">Fresh Ingredients</h3>
              <p className="text-gray-600">
                We source only the freshest, highest-quality ingredients for all our meals.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Quick & Easy</h3>
              <p className="text-gray-600">
                Simple meal planning and ordering process that saves you time and effort.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-xl font-semibold mb-3">Healthy Options</h3>
              <p className="text-gray-600">
                Nutritious meals designed to support your health and wellness goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers who trust Defiant Meals</p>
          <button 
            onClick={() => setCurrentPage('menu')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
          >
            Explore Our Menu
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;