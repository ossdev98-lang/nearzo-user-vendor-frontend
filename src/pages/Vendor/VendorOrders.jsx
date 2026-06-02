import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Package,
  XCircle,
  Menu,
  Filter,
  CheckCircle2,
  TrendingUp,
  Settings,
  LogOut,
  Store,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
import toast from 'react-hot-toast'

const VendorOrders = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const data = await vendorService.getOrders()
      setOrders(data || [])
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/vendor/login')
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await vendorService.updateOrderStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, type: newStatus.toLowerCase() } : o))
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.type === statusFilter
    return matchesSearch && matchesStatus
  })

  // Summary counts
  const totalCount = orders.length
  const completedCount = orders.filter(o => o.type === 'completed').length
  const processingCount = orders.filter(o => o.type === 'processing').length
  const packedCount = orders.filter(o => o.type === 'packed').length
  const cancelledCount = orders.filter(o => o.type === 'cancelled').length

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" />, active: true },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">
      
      {/* 1. Mobile Header */}
      <header className="md:hidden w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors border-none bg-transparent"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-extrabold text-base tracking-tight text-purple-650">Inbound Orders</span>
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

      {/* 3. Main content */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Manage Orders</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Track and process your customer orders smoothly.</p>
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

        {/* Status Tab Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { id: 'all', count: totalCount, label: 'All Orders', icon: <ShoppingBag className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 dark:bg-purple-950/20' },
            { id: 'completed', count: completedCount, label: 'Completed', icon: <CheckCircle2 className="w-5 h-5 text-[#00B074]" />, bg: 'bg-[#EAFBF3] dark:bg-green-950/20' },
            { id: 'processing', count: processingCount, label: 'Processing', icon: <Clock className="w-5 h-5 text-[#0088FF]" />, bg: 'bg-[#E5F3FF] dark:bg-blue-950/20' },
            { id: 'packed', count: packedCount, label: 'Packed', icon: <Package className="w-5 h-5 text-[#FF8A00]" />, bg: 'bg-[#FFF3E5] dark:bg-orange-950/20' },
            { id: 'cancelled', count: cancelledCount, label: 'Cancelled', icon: <XCircle className="w-5 h-5 text-[#FF4D4D]" />, bg: 'bg-[#FFEBEB] dark:bg-red-950/20' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`p-4 rounded-3xl border text-left transition-all focus:outline-none cursor-pointer flex flex-col justify-between items-start shadow-sm
                ${statusFilter === tab.id 
                  ? 'border-purple-600 dark:border-purple-500 bg-white dark:bg-gray-900 ring-2 ring-purple-600/10' 
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200'}`}
            >
              <div className={`w-9 h-9 rounded-2xl ${tab.bg} flex items-center justify-center mb-4`}>
                {tab.icon}
              </div>
              <div>
                <span className="text-[22px] font-black text-gray-900 dark:text-white leading-none block">{tab.count}</span>
                <span className="text-[10px] font-bold text-gray-400 mt-1.5 block uppercase tracking-wider">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Search and Filters Action Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Client Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtering {filteredOrders.length} of {totalCount}
            </span>
          </div>
        </div>

        {/* Orders List Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-purple-600/30 border-t-purple-650 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-400">Fetching live orders catalog...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-24 text-center text-gray-400 max-w-sm mx-auto">
              <ShoppingBag className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white uppercase tracking-tight">No Orders Match Filters</h3>
              <p className="text-xs text-gray-400 mt-2">
                We couldn't find any inbound orders that match the selected parameters. Try clearing your search parameters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table Grid */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Ordered Time</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4 text-center">Preparation Stage</th>
                      <th className="py-3 px-4 text-right">Quick Change Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                        <td className="py-4 px-4 font-black text-xs text-gray-955 dark:text-white">{order.id}</td>
                        <td className="py-4 px-4 text-xs font-bold text-gray-850 dark:text-gray-300">{order.customer}</td>
                        <td className="py-4 px-4 text-xs text-gray-500">{order.time}</td>
                        <td className="py-4 px-4 text-xs font-black text-gray-955 dark:text-white">{order.price}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full
                            ${order.type === 'completed' 
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20' 
                              : order.type === 'processing' 
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' 
                                : order.type === 'packed'
                                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                                  : 'bg-red-50 text-red-600 dark:bg-red-950/20'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right relative">
                          <div className="flex items-center justify-end gap-1.5">
                            {['Processing', 'Packed', 'Completed'].map((st) => (
                              <button
                                key={st}
                                disabled={updatingId === order.id || order.status === st}
                                onClick={() => handleUpdateStatus(order.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                                  ${order.status === st 
                                    ? 'bg-purple-600 text-white border-purple-650 shadow-sm' 
                                    : 'bg-white hover:bg-gray-50 border-gray-150 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-350'}`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View card layout */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map((order, idx) => {
                  const isCompleted = order.type === 'completed';
                  const isProcessing = order.type === 'processing';
                  const isPacked = order.type === 'packed';
                  return (
                    <div 
                      key={idx}
                      className="bg-gray-50/40 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4 shadow-sm hover:border-purple-250 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 
                            ${isCompleted ? 'bg-green-100 text-green-600' : isProcessing ? 'bg-blue-100 text-blue-600' : isPacked ? 'bg-orange-100 text-orange-655' : 'bg-red-100 text-red-600'}`}
                          >
                            <ShoppingBag className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 dark:text-white block">{order.id}</span>
                            <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">{order.time}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-xs text-gray-900 dark:text-white block">{order.price}</span>
                          <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1
                            ${isCompleted 
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20' 
                              : isProcessing 
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' 
                                : isPacked
                                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                                  : 'bg-red-55 text-red-600 dark:bg-red-950/20'}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100/50 dark:border-gray-800 pt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Customer: <strong className="text-gray-700 dark:text-gray-300">{order.customer}</strong></span>
                        <div className="flex items-center gap-1">
                          {['Processing', 'Packed', 'Completed'].map((st) => (
                            <button
                              key={st}
                              disabled={updatingId === order.id || order.status === st}
                              onClick={() => handleUpdateStatus(order.id, st)}
                              className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase border transition-all cursor-pointer
                                ${order.status === st 
                                  ? 'bg-purple-600 text-white border-purple-650' 
                                  : 'bg-white hover:bg-gray-50 border-gray-150 text-gray-605 dark:bg-gray-800 dark:border-gray-700'}`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

      </main>

    </div>
  )
}

export default VendorOrders
