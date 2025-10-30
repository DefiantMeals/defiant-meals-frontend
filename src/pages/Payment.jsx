import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = ({ cart, customerInfo, pickupDetails, setCurrentPage, clearCart }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalAmount = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  // Safety check for empty cart
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

  // Create Stripe checkout session when component mounts
  useEffect(() => {
    createCheckoutSession();
  }, []);

  const createCheckoutSession = async () => {
    try {
      setLoading(true);
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

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setLoading(false);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

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

          {/* Stripe Embedded Checkout */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Payment</h2>

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  <p className="mt-4 text-gray-600">Loading secure payment form...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={createCheckoutSession}
                    className="mt-2 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && clientSecret && (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
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