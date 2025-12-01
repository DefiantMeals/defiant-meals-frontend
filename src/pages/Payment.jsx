import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = ({ cart, customerInfo, pickupDetails, setCurrentPage, clearCart }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate total from cart (prices already include tax from Menu.jsx)
  const calculateTotal = () => {
    const total = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    return total;
  };

  const totalAmount = calculateTotal();

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

  // Validation check for customer info and pickup details
  useEffect(() => {
    console.log('🔍 Payment page loaded with data:');
    console.log('Cart:', cart);
    console.log('Customer Info:', customerInfo);
    console.log('Pickup Details:', pickupDetails);
    console.log('Total Amount (tax already included in cart prices):', totalAmount);

    // Verify we have all required data before creating checkout session
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      console.error('❌ Missing customer info, redirecting to Order page');
      setError('Please complete your customer information');
      setLoading(false);
      setTimeout(() => setCurrentPage('order'), 2000);
      return;
    }

    if (!pickupDetails?.date || !pickupDetails?.time) {
      console.error('❌ Missing pickup details, redirecting to Pickup page');
      setError('Please select a pickup date and time');
      setLoading(false);
      setTimeout(() => setCurrentPage('pickup'), 2000);
      return;
    }

    // All data is valid, create checkout session
    createCheckoutSession();
  }, []);

  const createCheckoutSession = async () => {
    try {
      setLoading(true);
      
      console.log('📤 Creating checkout session with data:');
      console.log('Cart:', cart);
      console.log('Customer Info:', customerInfo);
      console.log('Pickup Details:', pickupDetails);
      console.log('Total Amount (tax already included):', totalAmount);

      const response = await fetch('https://defiant-meals-backend.onrender.com/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart,
          customerInfo,
          pickupDetails,
          totalAmount, // Cart prices already include tax
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data.clientSecret);
      setClientSecret(data.clientSecret);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
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

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-amber-600">${totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 italic">Tax included in prices</p>
              </div>

              <div className="border-t pt-4 mt-4 space-y-2 text-sm text-gray-600">
                <p><strong>Name:</strong> {customerInfo?.name || 'Not provided'}</p>
                <p><strong>Email:</strong> {customerInfo?.email || 'Not provided'}</p>
                <p><strong>Phone:</strong> {customerInfo?.phone || 'Not provided'}</p>
                <p><strong>Pickup:</strong> {pickupDetails?.displayDate || pickupDetails?.date || 'Not selected'} at {pickupDetails?.time || 'Not selected'}</p>
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
                    onClick={() => setCurrentPage('order')}
                    className="mt-2 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Go Back
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