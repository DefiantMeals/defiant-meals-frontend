import React, { useState, useEffect } from 'react';

const Pickup = ({ orderData, setCurrentPage, setOrderData }) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [orderingDeadline, setOrderingDeadline] = useState(null);
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
          console.error('Failed to fetch schedule');
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Generate available pickup dates (Saturdays and Mondays, 8+ days away)
  useEffect(() => {
    const generateAvailableDates = () => {
      const dates = [];
      const today = new Date();
      
      // Start checking from 8 days from now
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 8);
      
      // Generate next 8 weeks of Saturdays and Mondays
      for (let i = 0; i < 60; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        
        const dayOfWeek = checkDate.getDay();
        
        // 0 = Sunday, 1 = Monday, 6 = Saturday
        if (dayOfWeek === 1 || dayOfWeek === 6) {
          dates.push({
            date: checkDate.toISOString().split('T')[0],
            displayDate: checkDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            }),
            dayName: checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
          });
        }
      }
      
      setAvailableDates(dates);
    };

    generateAvailableDates();
  }, []);

  // Generate time slots based on selected date and schedule
  useEffect(() => {
    if (!selectedDate || !schedule) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDateObj = availableDates.find(d => d.date === selectedDate);
    if (!selectedDateObj) return;

    const dayName = selectedDateObj.dayName;
    const daySchedule = schedule[dayName];

    if (!daySchedule || !daySchedule.open) {
      setAvailableTimeSlots([]);
      return;
    }

    const slots = [];

    // Helper function to generate slots between start and end time
    const generateSlots = (startTime, endTime) => {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const current = new Date(start);

      const tempSlots = [];
      while (current < end) {
        tempSlots.push(current.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));
        current.setMinutes(current.getMinutes() + 30);
      }
      return tempSlots;
    };

    // Generate morning slots
    if (daySchedule.morningStart && daySchedule.morningEnd) {
      const morningSlots = generateSlots(daySchedule.morningStart, daySchedule.morningEnd);
      slots.push(...morningSlots);
    }

    // Generate evening slots (if different from morning)
    if (daySchedule.eveningStart && daySchedule.eveningEnd) {
      const eveningSlots = generateSlots(daySchedule.eveningStart, daySchedule.eveningEnd);
      // Only add evening slots if they're different from morning
      eveningSlots.forEach(slot => {
        if (!slots.includes(slot)) {
          slots.push(slot);
        }
      });
    }

    setAvailableTimeSlots(slots);
    setSelectedTime(''); // Reset time when date changes
  }, [selectedDate, schedule, availableDates]);

  // Calculate ordering deadline when date is selected
  useEffect(() => {
    if (selectedDate) {
      const pickupDate = new Date(selectedDate);
      const deadline = new Date(pickupDate);
      deadline.setDate(pickupDate.getDate() - 8);
      deadline.setHours(12, 0, 0, 0);
      setOrderingDeadline(deadline);
    } else {
      setOrderingDeadline(null);
    }
  }, [selectedDate]);

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
    address: '1904 Elm St, Eudora KS 66025',
    phone: '913 585 5126',
    hours: scheduleLoading ? 'Loading...' : 'Mon: 07:00-18:00, Sat: 08:00-12:00'
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
        <h1 className="text-4xl font-bold text-center mb-4">Pickup Schedule</h1>
        
        {/* 8-Day Advance Notice */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-semibold">
                  Orders must be placed at least 8 days in advance
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Choose from available Saturdays and Mondays below
                </p>
              </div>
            </div>
          </div>
        </div>

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
                      Choose Pickup Date (Saturdays & Mondays Only)
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">Select a date...</option>
                      {availableDates.map((dateObj) => (
                        <option key={dateObj.date} value={dateObj.date}>
                          {dateObj.displayDate}
                        </option>
                      ))}
                    </select>
                    
                    {selectedDate && orderingDeadline && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                        <p className="text-blue-800">
                          <span className="font-semibold">Order by:</span> {orderingDeadline.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
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
                    ) : scheduleLoading ? (
                      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500">Loading available times...</p>
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500">No pickup times available for this date</p>
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
                        <p className="text-lg">{selectedDate ? availableDates.find(d => d.date === selectedDate)?.displayDate : 'Not selected'}</p>
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
                      <li>• A healthy appetite!</li>
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