import React, { useState, useEffect } from 'react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/menu`;

const fetchMenuItems = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch menu items');
  return await response.json();
};

const addMenuItem = async (menuItem) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem),
  });
  if (!response.ok) throw new Error('Failed to add menu item');
  return await response.json();
};

const updateMenuItem = async (id, menuItem) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem),
  });
  if (!response.ok) throw new Error('Failed to update menu item');
  return await response.json();
};

const deleteMenuItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete menu item');
  return await response.json();
};

const toggleMenuItemAvailability = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to toggle menu item');
  return await response.json();
};

// Helper function to convert Google Drive sharing URL to direct image URL
const convertGoogleDriveUrl = (url) => {
  if (!url) return '';
  
  // Check if it's a Google Drive sharing URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Return original URL if it's not a Google Drive URL
  return url;
};

const Admin = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '', // Added image URL field
    available: true,
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await fetchMenuItems();
      setMenuItems(items);
      setError(null);
    } catch (err) {
      setError(`Failed to load menu items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const menuItemData = {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl: convertGoogleDriveUrl(formData.imageUrl), // Convert Google Drive URL
      };

      if (editingItem) {
        await updateMenuItem(editingItem._id, menuItemData);
        loadMenuItems(); // Reload to see changes
      } else {
        const newItem = await addMenuItem({
          ...menuItemData,
          createdBy: 'admin',
        });
        setMenuItems((prev) => [...prev, newItem]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError(editingItem ? 'Failed to update item' : 'Failed to add item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      imageUrl: item.imageUrl || '', // Include image URL in edit
      available: item.available,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        setMenuItems((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const updated = await toggleMenuItemAvailability(id);
      setMenuItems((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (err) {
      setError('Failed to toggle availability');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '', // Reset image URL
      available: true,
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Menu Administration
        </h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showAddForm ? 'Cancel' : 'Add New Item'}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                required
                className="p-2 border rounded"
              />
              <input
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                placeholder="Price"
                required
                className="p-2 border rounded"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="p-2 border rounded"
              >
                <option value="">Select a category...</option>
                <option value="High Protein">High Protein</option>
                <option value="Quality Carbs">Quality Carbs</option>
                <option value="Healthier Options">Healthier Options</option>
                <option value="Snacks">Snacks</option>
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                />
                <span>Available</span>
              </label>
              
              {/* New Image URL field */}
              <input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Image URL (paste Google Drive sharing link)"
                className="md:col-span-2 p-2 border rounded"
              />
              
              {/* Image preview */}
              {formData.imageUrl && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview:
                  </label>
                  <img
                    src={convertGoogleDriveUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Description"
                className="md:col-span-2 p-2 border rounded"
              />
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
                {editingItem && (
                  <button
                    onClick={resetForm}
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">Image</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="py-2 px-4">
                  {item.imageUrl ? (
                    <img
                      src={convertGoogleDriveUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </td>
                <td className="py-2 px-4">
                  <strong>{item.name}</strong>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </td>
                <td className="py-2 px-4">{item.category}</td>
                <td className="py-2 px-4">
                  ${parseFloat(item.price).toFixed(2)}
                </td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(item._id)}
                    className="text-yellow-600"
                  >
                    {item.available ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {menuItems.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No menu items yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;