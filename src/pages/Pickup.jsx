import React, { useState } from 'react';

const Pickup = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const locations = [
    {
      id: 'downtown',
      name: 'Downtown Location',
      address: '123 Main Street, Downtown',
      phone: '(555) 123-4567',
      hours: 'Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 8:00 PM'
    },
    {
      id: 'uptown',
      name: 'Uptown Branch',
      address: '456 Oak Avenue, Uptown',
      phone: '(555) 234-5678',
      hours: 'Mon-Sat: 6:30 AM - 10:00 PM, Sun: 7:00 AM - 9:00 PM'
    },
    {
      id: 'westside',
      name: 'Westside Store',
      address: '789 Pine Boulevard, Westside',
      phone: '(555) 345-6789',
      hours: 'Mon-Sun: 7:00 AM - 9:00 PM'
    }
  ];

  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
    '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  const handleSchedulePickup = () => {
    if (selectedLocation && selectedTime) {
      alert(`Pickup scheduled for ${selectedTime} at ${locations.find(loc => loc.id === selectedLocation)?.name}`);
    } else {
      alert('Please select both a location and time for pickup.');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Pickup Locations</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose a convenient location and time to pick up your fresh, delicious meals.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Select Location</h2>
            
            <div className="space-y-4">
              {locations.map(location => (
                <div
                  key={location.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition duration-300 ${
                    selectedLocation === location.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLocation(location.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                      selectedLocation === location.id
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`} />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{location.name}</h3>
                      <p className="text-gray-600 mb-2">📍 {location.address}</p>
                      <p className="text-gray-600 mb-2">📞 {location.phone}</p>
                      <p className="text-sm text-gray-500">🕒 {location.hours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Select Pickup Time</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 text-sm rounded-lg border transition duration-300 ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Summary */}
        {(selectedLocation || selectedTime) && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Pickup Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Selected Location:</h3>
                <p className="text-lg">
                  {selectedLocation 
                    ? locations.find(loc => loc.id === selectedLocation)?.name 
                    : 'No location selected'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Pickup Time:</h3>
                <p className="text-lg">{selectedTime || 'No time selected'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleSchedulePickup}
                disabled={!selectedLocation || !selectedTime}
                className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                  selectedLocation && selectedTime
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Schedule Pickup
              </button>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Pickup Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">📋 What to Bring:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valid ID for verification</li>
                <li>• Order confirmation number</li>
                <li>• Payment method (if not prepaid)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⏰ Pickup Guidelines:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Arrive within 15 minutes of your slot</li>
                <li>• Orders held for 2 hours maximum</li>
                <li>• Call ahead if you're running late</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pickup;