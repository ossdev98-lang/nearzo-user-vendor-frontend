import { TrendingUp, ShoppingBag, Package, Settings } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const VendorBottomNav = () => {
  const location = useLocation()
  
  // Only render on /vendor routes (excluding auth routes)
  const isVendorRoute = location.pathname.startsWith('/vendor')
  const isAuthRoute = [
    '/vendor/login', 
    '/vendor/register', 
    '/vendor/forgot-password', 
    '/vendor/verify-otp', 
    '/vendor/reset-password'
  ].includes(location.pathname)
  
  if (!isVendorRoute || isAuthRoute) return null

  const navItems = [
    { label: 'Dashboard', icon: TrendingUp, path: '/vendor/dashboard' },
    { label: 'Orders', icon: ShoppingBag, path: '/vendor/orders' },
    { label: 'Products', icon: Package, path: '/vendor/products' },
    { label: 'Settings', icon: Settings, path: '/vendor/settings' }
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
                isActive ? 'text-[#6C4CF1]' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default VendorBottomNav
