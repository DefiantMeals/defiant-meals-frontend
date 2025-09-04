import React, { useState } from 'react';

const Payment = ({ orderData, setCurrentPage, handleRemoveFromCart }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processPayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Submit complete order with payment info
      const completeOrder = {
        ...orderData,
        pickupDate: orderData.pickupDate,
        pickupTime: orderData.pickupTime,
        paymentMethod: paymentMethod,
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      };

      const response = await fetch('https://defiant-meals-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeOrder)
      });

      if (response.ok) {
        setOrderComplete(true);
        // Clear cart after successful order
        if (orderData.items && handleRemoveFromCart) {
          orderData.items.forEach(item => handleRemoveFromCart(item.id));
        }
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-green-50 rounded-lg p-12 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">Order Confirmed!</h2>
            <p className="text-lg text-green-700 mb-6">
              Thank you for your order! Your meal will be ready for pickup.
            </p>
            <div className="bg-white rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4">Order Details:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Pickup Date:</strong> {orderData.pickupDate}</p>
                <p><strong>Pickup Time:</strong> {orderData.pickupTime}</p>
                <p><strong>Total:</strong> ${orderData.total.toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentPage('menu')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Order Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Payment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-3 rounded-lg border-2 transition duration-300 ${
                    paymentMethod === 'card' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  💳 Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 p-3 rounded-lg border-2 transition duration-300 ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  💵 Pay on Pickup
                </button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={paymentInfo.cardholderName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentInfo.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash Payment Info */}
            {paymentMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Pay on Pickup</h3>
                <p className="text-sm text-yellow-700">
                  You can pay with cash or card when you arrive to pick up your order.
                  Please have exact change if paying with cash.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            
            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{orderData.customer.name}</p>
                <p>{orderData.customer.email}</p>
                <p>{orderData.customer.phone}</p>
              </div>
            </div>

            {/* Pickup Info */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Pickup Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Date:</strong> {orderData.pickupDate || 'Not selected'}</p>
                <p><strong>Time:</strong> {orderData.pickupTime || 'Not selected'}</p>
                <p><strong>Location:</strong> 123 Main Street, Your City</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
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

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total:</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={processPayment}
                disabled={isProcessing}
                className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isProcessing ? 'Processing Payment...' : 
                 paymentMethod === 'cash' ? 'Confirm Order' : 'Complete Payment'}
              </button>
              
              <button
                onClick={() => setCurrentPage('pickup')}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-300"
              >
                Back to Pickup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;