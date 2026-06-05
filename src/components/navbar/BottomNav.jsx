import { useState } from 'react'
import { Home, Search, ShoppingCart, User, Store, X } from 'lucide-react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import dummyUserImage from '../../assets/images/dummyUserImage.jpg'

const getAvatarUrl = (avatar) => {
  if (!avatar) return dummyUserImage;
  if (avatar.startsWith('http')) return avatar;
  const baseUrl = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com/';
  return `${baseUrl.replace(/\/$/, '')}/${avatar.replace(/^\//, '')}`;
}

const BottomNav = () => {
  const { cartCount, setIsCartOpen, user, setIsMobileSearchOpen } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Hide on vendor routes
  if (location.pathname.startsWith('/vendor')) return null

  const isLoggedIn = !!user && !!localStorage.getItem('token')

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '#search' },
    { label: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { label: 'Profile', icon: User, path: isLoggedIn ? '/profile' : '#' }
  ]

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10 z-[50] pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isProfilePopup = item.label === 'Profile' && !isLoggedIn;

            if (isProfilePopup) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="relative flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 dark:text-gray-400 border-none bg-transparent cursor-pointer"
                >
                  <div className="relative">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => 
                  `relative flex flex-col items-center justify-center w-full h-full gap-1 ${
                    isActive && item.path !== '#search' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                  }`
                }
                onClick={(e) => {
                  if (item.label === 'Cart') {
                    e.preventDefault()
                    setIsCartOpen(true)
                  } else if (item.path === '#search') {
                    e.preventDefault()
                    setIsMobileSearchOpen(true)
                  }
                }}
              >
                <div className="relative">
                  {item.label === 'Profile' && user ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-white/10">
                      <img 
                        src={getAvatarUrl(user.avatar)} 
                        alt={user.name} 
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = dummyUserImage }}
                      />
                    </div>
                  ) : (
                    <item.icon className="w-6 h-6" />
                  )}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Login Options Bottom Sheet Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100]"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[32px] p-6 pb-8 border-t border-gray-100 dark:border-white/5 shadow-2xl z-[101] flex flex-col"
            >
              {/* Grab handle */}
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-5" />

              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Login to Nearzo</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Select your account type to proceed</p>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Customer Login Card */}
                <button
                  onClick={() => {
                    setShowLoginModal(false)
                    navigate('/login?role=user')
                  }}
                  className="flex flex-col items-center justify-center p-6 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/20 hover:border-purple-500 dark:border-purple-900/30 dark:hover:border-purple-500/50 rounded-2xl transition-all duration-300 group hover:shadow-md cursor-pointer text-center bg-transparent"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Customer</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1">Order Groceries</span>
                </button>

                {/* Vendor Login Card */}
                <button
                  onClick={() => {
                    setShowLoginModal(false)
                    navigate('/vendor/login')
                  }}
                  className="flex flex-col items-center justify-center p-6 bg-orange-50/30 dark:bg-orange-950/10 border border-orange-100/10 hover:border-orange-500 dark:border-orange-900/20 dark:hover:border-orange-500/40 rounded-2xl transition-all duration-300 group hover:shadow-md cursor-pointer text-center bg-transparent"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100/80 dark:bg-orange-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Store className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Vendor</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1">Manage Shop</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default BottomNav
