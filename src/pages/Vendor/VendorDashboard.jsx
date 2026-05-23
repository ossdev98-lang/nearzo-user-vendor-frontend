import React from 'react'
import { motion } from 'framer-motion'
import { Store, Package, ShoppingBag, Settings, LogOut, TrendingUp, Users } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorAuthService } from '../../services/vendorAuthService'
import { useApp } from '../../context/AppContext'

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    navigate('/vendor/login')
  }

  const statCards = [
    { title: 'Total Sales', value: '₹45,231', icon: <TrendingUp className="w-6 h-6 text-green-500" />, bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Total Orders', value: '152', icon: <ShoppingBag className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Total Products', value: '84', icon: <Package className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Customers', value: '43', icon: <Users className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50 dark:bg-purple-900/20' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col">
        {/* Logo Area */}
        <div className="p-6 pb-6 flex justify-center border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-14 object-contain dark:filter dark:invert" />
          </Link>
        </div>


        
        <nav className="p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-xl font-bold transition-colors">
            <TrendingUp className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
            <ShoppingBag className="w-5 h-5" /> Orders
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
            <Package className="w-5 h-5" /> Products
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </a>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-colors text-left"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-800">
          {/* Shop Info */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm">{user?.shopName || 'Partner Store'}</h2>
              <p className="text-xs text-gray-500">Vendor Dashboard</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="text-purple-600 dark:text-purple-400">{user?.ownerName || 'Partner'}</span>!
          </h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders Placeholder */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
            <button className="text-sm text-purple-600 font-bold hover:underline">View All</button>
          </div>
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p>No recent orders found.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VendorDashboard
