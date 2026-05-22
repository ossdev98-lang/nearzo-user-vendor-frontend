import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const BottomNav = () => {
  const { cartCount, setIsCartOpen } = useApp()

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Categories', icon: LayoutGrid, path: '#categories' },
    { label: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { label: 'Profile', icon: User, path: '/login' }
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
                isActive && item.path !== '#categories' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`
            }
            onClick={(e) => {
              if (item.label === 'Cart') {
                e.preventDefault()
                setIsCartOpen(true)
              } else if (item.path === '#categories') {
                e.preventDefault()
                window.scrollTo({ top: 500, behavior: 'smooth' })
              }
            }}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
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
