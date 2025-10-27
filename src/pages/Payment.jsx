import React, { useState } from 'react';

// ============================================
// STRIPE INTEGRATION - COMMENTED OUT
// UNCOMMENT THESE IMPORTS WHEN STRIPE KEYS ARE ADDED
// ============================================
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// ============================================
// ADD TO FRONTEND .env FILE WHEN READY:
// REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
// ============================================
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ============================================
// STRIPE CARD ELEMENT STYLES (UNCOMMENT WHEN READY)
// ============================================
// const CARD_ELEMENT_OPTIONS = {
//   style: {
//     base: {
//       color: '#32325d',
//       fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
//       fontSmoothing: 'antialiased',
//       fontSize: '16px',
//       '::placeholder': {
//         color: '#aab7c4'
//       }
//     },
//     invalid: {
//       color: '#fa755a',
//       iconColor: '#fa755a'
//     }
//   }
// };

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

  // ============================================
  // UNCOMMENT THESE WHEN STRIPE IS READY
  // ============================================
  // const stripe = useStripe();
  // const elements = useElements();
  // const [stripeError, setStripeError] = useState(null);

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

    try {
      // ============================================
      // STRIPE PAYMENT PROCESSING (UNCOMMENT WHEN READY)
      // ============================================
      // if (paymentMethod === 'card') {
      //   if (!stripe || !elements) {
      //     alert('Stripe is not loaded yet. Please try again.');
      //     setIsProcessing(false);
      //     return;
      //   }
      //
      //   // Create payment intent on backend
      //   const paymentIntentResponse = await fetch('https://defiant-meals-backend.onrender.com/api/payments/create-intent', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       amount: Math.round(orderData.total * 100), // Amount in cents
      //       customerEmail: orderData.customer.email,
      //       customerName: orderData.customer.name
      //     })
      //   });
      //
      //   const { clientSecret, error: intentError } = await paymentIntentResponse.json();
      //
      //   if (intentError) {
      //     throw new Error(intentError);
      //   }
      //
      //   // Confirm payment with Stripe
      //   const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      //     payment_method: {
      //       card: elements.getElement(CardElement),
      //       billing_details: {
      //         name: orderData.customer.name,
      //         email: orderData.customer.email,
      //         phone: orderData.customer.phone
      //       }
      //     }
      //   });
      //
      //   if (stripeError) {
      //     throw new Error(stripeError.message);
      //   }
      //
      //   // Payment successful, add payment ID to order
      //   orderData.stripePaymentId = paymentIntent.id;
      // }

      // Simulate payment processing for now (REMOVE THIS when Stripe is active)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Submit complete order
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
        throw new Error('Order submission failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
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
                {/* ============================================
                    UNCOMMENT THIS BUTTON WHEN STRIPE IS READY
                    ============================================ */}
                {/* <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-3 rounded-lg border-2 transition duration-300 ${
                    paymentMethod === 'card' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  💳 Credit/Debit Card
                </button> */}
                
                {/* TEMPORARY: Disabled card button until Stripe is ready */}
                <button
                  disabled
                  className="flex-1 p-3 rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  title="Card payments coming soon"
                >
                  💳 Credit/Debit Card (Coming Soon)
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

            {/* ============================================
                STRIPE CARD ELEMENT (UNCOMMENT WHEN READY)
                REPLACE THE FAKE FORM BELOW WITH THIS
                ============================================ */}
            {/* {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information *
                  </label>
                  <div className="border border-gray-300 rounded-md p-3">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  {stripeError && (
                    <p className="text-red-600 text-sm mt-2">{stripeError}</p>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    🔒 Your payment is secure and encrypted with Stripe
                  </p>
                </div>
              </div>
            )} */}

            {/* TEMPORARY FAKE CARD FORM - DELETE THIS SECTION WHEN STRIPE IS ACTIVE */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-semibold">
                    ⚠️ Card payments not yet configured
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please use "Pay on Pickup" option for now.
                  </p>
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
                <p><strong>Location:</strong> 1904 Elm St, Eudora KS 66025</p>
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
                disabled={isProcessing || paymentMethod === 'card'}
                className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                  isProcessing || paymentMethod === 'card'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isProcessing ? 'Processing...' : 
                 paymentMethod === 'card' ? 'Card Payments Coming Soon' :
                 'Confirm Order'}
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

// ============================================
// WHEN READY TO ACTIVATE STRIPE:
// 1. Install Stripe packages:
//    npm install @stripe/stripe-js @stripe/react-stripe-js
//
// 2. Wrap Payment component in App.jsx with:
//    <Elements stripe={stripePromise}>
//      <Payment ... />
//    </Elements>
//
// 3. Uncomment all sections marked with comments
// 4. Delete the "TEMPORARY FAKE CARD FORM" section
// 5. Add REACT_APP_STRIPE_PUBLISHABLE_KEY to .env
// 6. Backend needs Stripe secret key in environment
// ============================================