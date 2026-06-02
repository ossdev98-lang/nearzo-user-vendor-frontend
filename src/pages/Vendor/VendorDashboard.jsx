import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Bell,
  Eye,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  XCircle,
  PlusCircle,
  Tag,
  Megaphone,
  Menu,
  X,
  Wallet
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorAuthService } from '../../services/vendorAuthService'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // UI States
  const [isStoreOpen, setIsStoreOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/vendor/login')
  }

  const toggleStoreStatus = () => {
    setIsStoreOpen(!isStoreOpen)
    toast.success(`Store status updated to: ${!isStoreOpen ? 'Open 🟢' : 'Closed 🔴'}`)
  }

  const recentOrdersList = [
    { id: '#ORD12345', time: '10:30 AM', customer: 'Amit Kumar', price: '₹1,250', status: 'Completed', type: 'completed' },
    { id: '#ORD12344', time: '10:05 AM', customer: 'Neha Singh', price: '₹890', status: 'Processing', type: 'processing' },
    { id: '#ORD12343', time: '09:45 AM', customer: 'Ravi Patel', price: '₹645', status: 'Packed', type: 'packed' },
    { id: '#ORD12342', time: '09:20 AM', customer: 'Priya Sharma', price: '₹1,150', status: 'Completed', type: 'completed' }
  ]

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" />, active: true },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">
      
      {/* 1. Mobile Top Bar (md:hidden) */}
      <header className="md:hidden w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors border-none bg-transparent"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <Link to="/">
          <img src={logo} alt="Nearzo Logo" className="h-9 object-contain dark:filter dark:invert" />
        </Link>
        <button className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors relative border-none bg-transparent">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>
      </header>

      {/* 2. Sidebar for Desktop & Mobile Overlay Drawer */}
      <AnimatePresence>
        {(isMobileSidebarOpen || true) && (
          <motion.aside
            className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col shrink-0 
              ${isMobileSidebarOpen ? 'block' : 'hidden md:flex'}`}
            initial={isMobileSidebarOpen ? { x: -260 } : false}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Logo & Close drawer for Mobile */}
            <div className="p-6 pb-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
              <Link to="/" className="inline-block hover:scale-105 transition-transform mx-auto md:mx-0">
                <img src={logo} alt="Nearzo Logo" className="h-12 object-contain dark:filter dark:invert" />
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-4 space-y-1 flex-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
                    ${link.active
                      ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {link.icon} <span>{link.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl font-bold transition-all text-left mt-4 border-none bg-transparent cursor-pointer text-sm"
              >
                <LogOut className="w-5 h-5" /> <span>Logout</span>
              </button>
            </nav>

            {/* Bottom User Info Block */}
            <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-gray-900 dark:text-white line-clamp-1 text-sm">{user?.shopName || 'Sharma General Store'}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Dashboard</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 3. Main Content Container */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Top greeting bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-purple-600 dark:text-purple-400">{user?.ownerName || 'Partner'}</span>!
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Here is what's happening with your store today.</span>
              
              {/* Store Status Toggle */}
              <button 
                onClick={toggleStoreStatus}
                className="flex items-center gap-1.5 focus:outline-none group px-3 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm cursor-pointer"
              >
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isStoreOpen ? 'bg-[#00B074]' : 'bg-red-500'}`} />
                <span className="text-xs font-extrabold text-gray-500 group-hover:text-gray-700 transition-colors">
                  Store is <span className={isStoreOpen ? 'text-[#00B074]' : 'text-red-500'}>{isStoreOpen ? 'Open' : 'Closed'}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Desktop Right Hand Toolbar actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button className="w-11 h-11 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors relative shadow-sm cursor-pointer border-none bg-transparent">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 shadow-sm transition-all cursor-pointer border-none"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs font-bold truncate max-w-[120px]">{user?.shopName || 'Partner'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-750 rounded-2xl shadow-xl p-2 z-50"
                  >
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider text-left border-none bg-transparent cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sales Trend curves block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales Gradient Card with curve */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#6C4CF1] to-[#4F35C4] p-6 text-white shadow-xl shadow-purple-600/10 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs font-extrabold uppercase tracking-widest">Today's Sales</span>
              <button 
                onClick={() => navigate('/vendor/orders')}
                className="text-[10px] font-black uppercase tracking-wider text-white/90 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full transition-colors flex items-center gap-1 border-none cursor-pointer"
              >
                <span>View Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">₹18,760</span>
              <span className="inline-flex items-center gap-0.5 bg-[#EAFBF3] text-[#00B074] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                <TrendingUp className="w-3 h-3" /> 12.5% vs yesterday
              </span>
            </div>

            {/* Bezier Trend Line Graphic */}
            <div className="mt-6 h-14 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow-desktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 20 C 15 15, 30 18, 45 8 C 60 0, 75 14, 90 2 C 95 0, 100 5, 100 5 L 100 20 Z"
                  fill="url(#glow-desktop)"
                />
                <path
                  d="M0 20 C 15 15, 30 18, 45 8 C 60 0, 75 14, 90 2 C 95 0, 100 5, 100 5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="5" r="2.5" fill="#ffffff" stroke="#6C4CF1" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Stats Grid cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Orders', val: '32', grow: '14.3%', icon: <ShoppingBag className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 dark:bg-purple-950/30' },
              { label: 'Items Sold', val: '98', grow: '8.7%', icon: <Package className="w-5 h-5 text-green-600" />, bg: 'bg-green-50 dark:bg-green-950/30' },
              { label: 'Store Views', val: '512', grow: '9.3%', icon: <Eye className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50 dark:bg-orange-950/30' },
              { label: 'Total Sales', val: '₹18,760', grow: '12.5%', icon: <TrendingUp className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 dark:bg-blue-950/30' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between items-start shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight block">{stat.val}</span>
                  <span className="text-xs font-bold text-gray-400 mt-1 block uppercase tracking-wider">{stat.label}</span>
                </div>
                <span className="text-xs font-black text-[#00B074] mt-3 flex items-center gap-0.5">
                  ↗ {stat.grow}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Order Status Counters + Quick Actions circular grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Order Status Counters Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Order Status Summary</h3>
              <button 
                onClick={() => navigate('/vendor/orders')}
                className="text-xs font-bold text-[#6C4CF1] hover:underline bg-transparent border-none cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { count: '18', status: 'Completed', icon: <ClipboardList className="w-5 h-5 text-[#00B074]" />, bg: 'bg-[#EAFBF3]', border: 'border-[#EAFBF3]' },
                { count: '8', status: 'Processing', icon: <Clock className="w-5 h-5 text-[#0088FF]" />, bg: 'bg-[#E5F3FF]', border: 'border-[#E5F3FF]' },
                { count: '4', status: 'Packed', icon: <Package className="w-5 h-5 text-[#FF8A00]" />, bg: 'bg-[#FFF3E5]', border: 'border-[#FFF3E5]' },
                { count: '2', status: 'Cancelled', icon: <XCircle className="w-5 h-5 text-[#FF4D4D]" />, bg: 'bg-[#FFEBEB]', border: 'border-[#FFEBEB]' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${item.border} ${item.bg}/30 flex flex-col items-center justify-center gap-2`}>
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{item.count}</span>
                  <span className="text-xs font-bold text-gray-500 tracking-wide">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Quick Shortcuts</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-4">
              {[
                { label: 'Add Product', icon: <PlusCircle className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100/60', action: () => navigate('/vendor/products') },
                { label: 'Inventory', icon: <Package className="w-5 h-5 text-green-600" />, bg: 'bg-green-100/60', action: () => navigate('/vendor/products') },
                { label: 'Create Offer', icon: <Tag className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-100/60', action: () => toast.success('Discount options loaded!') },
                { label: 'Promote', icon: <Megaphone className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100/60', action: () => toast.success('Opening Ad manager...') },
                { label: 'Payments', icon: <Wallet className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-100/60', action: () => toast.success('Fetching balance history...') }
              ].map((act, idx) => (
                <button 
                  key={idx} 
                  onClick={act.action}
                  className="flex flex-col items-center gap-1.5 focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl ${act.bg} flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-sm shrink-0`}>
                    {act.icon}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 text-center leading-tight line-clamp-1">{act.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Row 3: Recent Inbound Orders Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Recent Inbound Orders</h3>
            <button 
              onClick={() => navigate('/vendor/orders')}
              className="text-xs font-bold text-[#6C4CF1] hover:underline bg-transparent border-none cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Order Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersList.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-xs text-gray-955 dark:text-white">{order.id}</td>
                    <td className="py-4 px-4 text-xs text-gray-500">{order.time}</td>
                    <td className="py-4 px-4 text-xs font-bold text-gray-800 dark:text-gray-300">{order.customer}</td>
                    <td className="py-4 px-4 text-xs font-black text-gray-955 dark:text-white">{order.price}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full
                        ${order.type === 'completed' 
                          ? 'bg-green-50 text-green-600 dark:bg-green-950/20' 
                          : order.type === 'processing' 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' 
                            : 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  )
}

export default VendorDashboard
