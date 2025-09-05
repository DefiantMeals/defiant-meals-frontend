import React, { useState, useEffect } from 'react';

const Pickup = ({ orderData, setCurrentPage, setOrderData }) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Fetch schedule from backend
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('https://defiant-meals-backend.onrender.com/api/schedule');
        if (response.ok) {
          const data = await response.json();
          setSchedule(data);
        } else {
          console.log('Using fallback schedule');
          // Fallback schedule if API fails
          setSchedule({
            monday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
            tuesday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
            wednesday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
            thursday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
            friday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
            saturday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
            sunday: { open: true, morningStart: '08:00', morningEnd: '20:00', eveningStart: '16:00', eveningEnd: '20:00' }
          });
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        // Use fallback schedule
        setSchedule({
          monday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
          tuesday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
          wednesday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
          thursday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
          friday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
          saturday: { open: true, morningStart: '07:00', morningEnd: '21:00', eveningStart: '16:00', eveningEnd: '21:00' },
          sunday: { open: true, morningStart: '08:00', morningEnd: '20:00', eveningStart: '16:00', eveningEnd: '20:00' }
        });
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Generate time slots based on selected date and schedule
  useEffect(() => {
    if (!selectedDate || !schedule) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDateObj = new Date(selectedDate);
    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = schedule[dayName];

    if (!daySchedule || !daySchedule.open) {
      setAvailableTimeSlots([]);
      return;
    }

    const slots = [];

    // Generate morning slots
    if (daySchedule.morningStart && daySchedule.morningEnd) {
      const morningStart = new Date(`2000-01-01T${daySchedule.morningStart}`);
      const morningEnd = new Date(`2000-01-01T${daySchedule.morningEnd}`);
      const current = new Date(morningStart);

      while (current < morningEnd) {
        slots.push(current.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));
        current.setMinutes(current.getMinutes() + 30);
      }
    }

    // Generate evening slots (if different from morning)
    if (daySchedule.eveningStart && daySchedule.eveningEnd && 
        (daySchedule.eveningStart !== daySchedule.morningStart || daySchedule.eveningEnd !== daySchedule.morningEnd)) {
      const eveningStart = new Date(`2000-01-01T${daySchedule.eveningStart}`);
      const eveningEnd = new Date(`2000-01-01T${daySchedule.eveningEnd}`);
      const current = new Date(eveningStart);

      while (current < eveningEnd) {
        const timeString = current.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        // Avoid duplicates
        if (!slots.includes(timeString)) {
          slots.push(timeString);
        }
        current.setMinutes(current.getMinutes() + 30);
      }
    }

    setAvailableTimeSlots(slots);
    // Reset selected time when date changes
    setSelectedTime('');
  }, [selectedDate, schedule]);

  // Generate display hours for location info
  const getLocationHours = () => {
    if (!schedule) return 'Loading hours...';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openDays = days.filter(day => schedule[day]?.open);
    
    if (openDays.length === 0) return 'Currently closed';
    
    // Group consecutive days with same hours
    const groupedDays = [];
    let currentGroup = null;
    
    openDays.forEach(day => {
      const daySchedule = schedule[day];
      const hours = `${daySchedule.morningStart}-${daySchedule.eveningEnd}`;
      
      if (!currentGroup || currentGroup.hours !== hours) {
        currentGroup = { days: [day], hours: hours };
        groupedDays.push(currentGroup);
      } else {
        currentGroup.days.push(day);
      }
    });
    
    return groupedDays.map(group => {
      const dayNames = group.days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3));
      const dayRange = dayNames.length > 1 ? `${dayNames[0]}-${dayNames[dayNames.length - 1]}` : dayNames[0];
      return `${dayRange}: ${group.hours}`;
    }).join(', ');
  };

  // If no order data, redirect back to menu
  if (!orderData) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-8">No Order Found</h1>
          <p className="text-gray-600 mb-8">Please start by adding items to your cart.</p>
          <button 
            onClick={() => setCurrentPage('menu')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  // Single location information
  const location = {
    name: 'Defiant Meals',
    address: '123 Main Street, Phnom Penh',
    phone: '(855) 123-4567',
    hours: getLocationHours()
  };

  const continueToPayment = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time for pickup.');
      return;
    }

    // Save pickup details to order data
    const updatedOrderData = {
      ...orderData,
      pickupDate: selectedDate,
      pickupTime: selectedTime
    };

    setOrderData(updatedOrderData);
    setCurrentPage('payment');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Pickup Schedule</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Schedule a convenient time to pick up your fresh, delicious meals from our location.
        </p>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                
                {/* Customer Info */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Customer</h3>
                  <div className="text-sm text-gray-600">
                    <p>{orderData.customer.name}</p>
                    <p>{orderData.customer.phone}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-2">
                    {orderData.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pickup Scheduling */}
            <div className="lg:col-span-2">
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
                          {scheduleLoading ? 'Loading hours...' : location.hours}
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
                    {!selectedDate ? (
                      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500">Please select a date first</p>
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500">
                          {scheduleLoading ? 'Loading available times...' : 'No pickup times available for this date'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {availableTimeSlots.map(time => (
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
                    )}
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
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setCurrentPage('order')}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-300"
                      >
                        Back to Order
                      </button>
                      <button
                        onClick={continueToPayment}
                        disabled={!selectedDate || !selectedTime}
                        className={`w-full py-3 rounded-lg font-semibold text-lg transition duration-300 ${
                          selectedDate && selectedTime
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {selectedDate && selectedTime 
                          ? 'Continue to Payment' 
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
      </div>
    </div>
  );
};

export default Pickup;