import React, { useState } from 'react';

const Navbar = ({ setCurrentPage, currentPage }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navItems = [
    { id: 'home', name: 'Home' },
    { id: 'menu', name: 'Menu' },
    { id: 'order', name: 'Order' },
    { id: 'pickup', name: 'Pickup' },
    { id: 'contact', name: 'Contact' }
  ];

  const handleAdminClick = () => {
    setShowLoginModal(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://defiant-meals-backend.onrender.com/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the token for future requests
        localStorage.setItem('adminToken', data.token);
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
        setCurrentPage('admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <>
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
            
            {/* Admin button - now shows login popup */}
            <button
              onClick={handleAdminClick}
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-100 p-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition duration-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;