import React from 'react';

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Defiant Meals</h3>
            <p className="text-gray-300">
              Your ultimate meal planning companion for healthy, delicious eating.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('menu')}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Menu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('order')}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Order
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('pickup')}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Pickup
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📞 913 585 5126</li>
              <li>📧 defiantmeals@gmail.com</li>
              <li>📍 1904 Elm St, Eudora KS 66025</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">Facebook</a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">Instagram</a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">Twitter</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Defiant Meals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;