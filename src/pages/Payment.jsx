import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = ({ cart, customerInfo, pickupDetails, setCurrentPage, clearCart }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Add this safety check:
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button
          onClick={() => setCurrentPage('menu')}
          className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700"
        >
          Go to Menu
        </button>
      </div>
    );
  }

 

  // Create Stripe checkout session when component mounts and card is selected
  useEffect(() => {
    if (paymentMethod === 'card' && !clientSecret) {
      createCheckoutSession();
    }
  }, [paymentMethod]);

const totalAmount = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  // Create Stripe checkout session when component mounts and card is selected
  useEffect(() => {
    if (paymentMethod === 'card' && !clientSecret) {
      createCheckoutSession();
    }
  }, [paymentMethod]);

  const createCheckoutSession = async () => {
    try {
      const response = await fetch('https://defiant-meals-backend.onrender.com/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart,
          customerInfo,
          pickupDetails,
          totalAmount,
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  const handlePayOnPickup = async () => {
    setIsProcessing(true);

    try {
      const orderData = {
        customerInfo,
        items: cart,
        pickupDetails,
        totalAmount,
        paymentMethod: 'Pay on Pickup',
        paymentStatus: 'Pending'
      };

      const response = await fetch('https://defiant-meals-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderConfirmed(true);
        clearCart();
      } else {
        alert('Failed to process order. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your order, {customerInfo.name}!
          </p>
          <p className="text-gray-600 mb-8">
            Your order will be ready for pickup on {pickupDetails.date} at {pickupDetails.time}.
            A confirmation email has been sent to {customerInfo.email}.
          </p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-amber-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <p><strong>Name:</strong> {customerInfo.name}</p>
                <p><strong>Email:</strong> {customerInfo.email}</p>
                <p><strong>Phone:</strong> {customerInfo.phone}</p>
                <p><strong>Pickup:</strong> {pickupDetails.date} at {pickupDetails.time}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection & Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Payment Method</h2>

              {/* Payment Method Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  Pay with Card
                </button>

                <button
                  onClick={() => setPaymentMethod('pickup')}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === 'pickup'
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Pay on Pickup
                </button>
              </div>

              {/* Stripe Embedded Checkout */}
              {paymentMethod === 'card' && clientSecret && (
                <div className="mb-6">
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              )}

              {/* Pay on Pickup */}
              {paymentMethod === 'pickup' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Pay on Pickup:</strong> You can pay with cash or card when you pick up your order.
                    </p>
                  </div>

                  <button
                    onClick={handlePayOnPickup}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                      isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Order'}
                  </button>
                </div>
              )}

              {/* Back Button */}
              <button
                onClick={() => setCurrentPage('pickup')}
                className="mt-6 text-gray-600 hover:text-gray-900 font-semibold"
              >
                ← Back to Pickup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;