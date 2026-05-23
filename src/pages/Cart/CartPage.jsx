import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { Link, useNavigate } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import Button from '../../components/ui/Button'

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal, clearCart } = useApp()
  const navigate = useNavigate()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-24 pb-16"
      >
        <div className="container flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Looks like you haven't added anything yet. Let's fix that!
          </p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
            >
              Start Shopping
            </motion.button>
          </Link>
        </div>
      </motion.div>
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal < 500 ? 40 : 0
  const tax = subtotal * 0.05
  const total = subtotal + deliveryFee + tax

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950"
    >
      <div className="container">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Shopping Cart ({cartCount} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=100&h=100&fit=crop`
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.unit}</p>
                    <p className="text-sm font-bold text-green-600 dark:text-emerald-400 mt-1">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-700 dark:text-white">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tax (5%)</span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-extrabold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
              >
                Proceed to Checkout
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearCart}
                className="w-full mt-3 py-2.5 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors font-medium"
              >
                Clear Cart
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage