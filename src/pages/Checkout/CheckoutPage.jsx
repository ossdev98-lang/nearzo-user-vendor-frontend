import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ChevronLeft, MapPin, CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, user, setIsCartOpen } = useApp()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!')
      return
    }
    const toastId = toast.loading('Placing your order...')
    setTimeout(() => {
      toast.success('Order placed successfully! 🎉', { id: toastId })
      clearCart()
      navigate('/profile')
    }, 1500)
  }

  const deliveryFee = cartTotal > 500 ? 0 : 40
  const finalTotal = cartTotal + deliveryFee

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors">Start Shopping</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[140px] md:pt-[100px] pb-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-colors text-gray-700 dark:text-gray-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Delivery Address
                </h2>
                <button onClick={() => navigate('/profile')} className="text-sm font-bold text-purple-600 hover:underline">
                  Change
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-900 dark:text-white text-base">{user?.name || 'Guest User'}</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Home</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {user?.address || '123 Main Street, Near City Center, Indore, Madhya Pradesh, 452001'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Phone: {user?.phone || '+91 9876543210'}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-purple-200'}`}>
                  <div className="flex items-center gap-4">
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-base font-bold ${paymentMethod === 'cod' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay when order arrives</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-purple-200'}`}>
                  <div className="flex items-center gap-4">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-base font-bold ${paymentMethod === 'online' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Pay Online</p>
                      <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, NetBanking</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                    {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-28">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Order Summary</h2>
                <button onClick={() => { setIsCartOpen(true); navigate(-1) }} className="text-sm font-bold text-purple-600 hover:underline">Edit Cart</button>
              </div>
              
              <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 p-1.5 shrink-0 border border-gray-100 dark:border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0 ml-2 pt-0.5">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-dashed border-gray-200 dark:border-gray-800 pt-5 mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Item Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 mb-5">
                <span className="font-bold text-gray-900 dark:text-white text-base">To Pay</span>
                <span className="text-2xl font-extrabold text-purple-600">₹{finalTotal}</span>
              </div>

              <div className="flex items-center gap-2 justify-center text-xs text-gray-500 mb-5">
                <ShieldCheck className="w-4 h-4 text-green-500" /> 100% Safe & Secure Payments
              </div>

              <button 
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-base font-bold transition-all shadow-md shadow-purple-600/20"
              >
                Place Order
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
