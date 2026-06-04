import { Home, Search, ShoppingCart, User } from 'lucide-react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
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

  // Hide on vendor routes
  if (location.pathname.startsWith('/vendor')) return null

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '#search' },
    { label: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { label: 'Profile', icon: User, path: user ? '/profile' : '/login' }
  ]

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10 z-[50] pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
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
        ))}
      </div>
    </div>
  )
}

export default BottomNav
