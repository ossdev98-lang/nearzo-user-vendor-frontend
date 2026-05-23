import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useApp()
  const navigate = useNavigate()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Your Cart</h2>
                  <p className="text-sm text-gray-500 mt-1">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cart is empty</h3>
                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto mt-1">Looks like you haven't added anything yet.</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="flex gap-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3 rounded-2xl shadow-sm"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-black/20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=100&h=100&fit=crop' }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{item.unit}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-extrabold text-green-600 dark:text-emerald-400">
                            {formatCurrency(item.price)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 rounded-lg p-1 border border-gray-200 dark:border-white/5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:text-purple-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:text-purple-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/25"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
