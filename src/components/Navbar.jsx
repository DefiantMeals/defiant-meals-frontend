import React from 'react';

const Navbar = ({ setCurrentPage, currentPage }) => {
  const navItems = [
    { id: 'home', name: 'Home' },
    { id: 'menu', name: 'Menu' },
    { id: 'order', name: 'Order' },
    { id: 'pickup', name: 'Pickup' },
    { id: 'contact', name: 'Contact' }
  ];

  return (
    <nav className="bg-blue-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <button 
          onClick={() => setCurrentPage('home')}
          className="text-white text-2xl font-bold hover:text-blue-200 transition duration-300"
        >
          Defiant Meals
        </button>
        
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-white px-4 py-2 rounded-lg transition duration-300 ${
                    currentPage === item.id 
                      ? 'bg-blue-700 font-semibold' 
                      : 'hover:bg-blue-500'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Admin button - slightly separated and smaller */}
          <button
            onClick={() => setCurrentPage('admin')}
            className={`text-white px-3 py-1 text-sm rounded transition duration-300 border border-blue-400 ${
              currentPage === 'admin' 
                ? 'bg-blue-700 font-semibold' 
                : 'hover:bg-blue-500'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;