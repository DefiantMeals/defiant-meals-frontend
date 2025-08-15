import React, { useState } from 'react';

const Pickup = () => {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Single location information
  const location = {
    name: 'Defiant Meals',
    address: '123 Main Street, Phnom Penh',
    phone: '(855) 123-4567',
    hours: 'Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 8:00 PM'
  };

  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
    '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  const handleSchedulePickup = () => {
    if (selectedDate && selectedTime) {
      alert(`Pickup scheduled for ${selectedDate} at ${selectedTime} from ${location.name}`);
    } else {
      alert('Please select both a date and time for pickup.');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Pickup</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Schedule a convenient time to pick up your fresh, delicious meals from our location.
        </p>

        <div className="max-w-4xl mx-auto">
          {/* Location Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Our Location</h2>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">{location.name}</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center">
                      <span className="text-lg mr-2">📍</span>
                      {location.address}
                    </p>
                    <p className="flex items-center">
                      <span className="text-lg mr-2">📞</span>
                      {location.phone}
                    </p>
                    <p className="flex items-center">
                      <span className="text-lg mr-2">🕒</span>
                      {location.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Schedule Your Pickup</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Pickup Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Pickup Time
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm rounded-lg border transition duration-300 ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
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
          {(selectedDate || selectedTime) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Pickup Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Location:</h3>
                    <p className="text-lg">{location.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Date:</h3>
                    <p className="text-lg">{selectedDate || 'Not selected'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Time:</h3>
                    <p className="text-lg">{selectedTime || 'Not selected'}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleSchedulePickup}
                    disabled={!selectedDate || !selectedTime}
                    className={`w-full py-3 rounded-lg font-semibold text-lg transition duration-300 ${
                      selectedDate && selectedTime
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedDate && selectedTime 
                      ? 'Confirm Pickup Schedule' 
                      : 'Please select date and time'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pickup Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-blue-900">📋 What to Bring:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Valid ID for verification</li>
                  <li>• Order confirmation number</li>
                  <li>• Payment method (if not prepaid)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-blue-900">⏰ Pickup Guidelines:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Arrive within 15 minutes of your slot</li>
                  <li>• Orders held for 2 hours maximum</li>
                  <li>• Call ahead if you're running late</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pickup;