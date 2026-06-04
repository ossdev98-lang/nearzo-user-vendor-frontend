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
  X,
  PlusCircle,
  Play,
  Pause,
  Volume2,
  Eye,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  User
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
import VendorNotificationBell from '../../components/vendor/VendorNotificationBell'
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
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [tabLoading, setTabLoading] = useState(false)

  // Voice note playback states
  const [playingAudioId, setPlayingAudioId] = useState(null)
  const [currentAudio, setCurrentAudio] = useState(null)

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
      }
    }
  }, [currentAudio])

  const handleToggleVoicePlayback = (orderId, voiceInstruction) => {
    if (!voiceInstruction) return

    // Fallback if dummy_audio is provided
    const audioUrl = voiceInstruction === 'dummy_audio'
      ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      : voiceInstruction

    if (playingAudioId === orderId && currentAudio) {
      currentAudio.pause()
      setPlayingAudioId(null)
      setCurrentAudio(null)
    } else {
      // Pause any currently playing audio
      if (currentAudio) {
        currentAudio.pause()
      }

      try {
        const audio = new Audio(audioUrl)
        audio.play()
        setPlayingAudioId(orderId)
        setCurrentAudio(audio)

        audio.onended = () => {
          setPlayingAudioId(null)
          setCurrentAudio(null)
        }
      } catch (err) {
        console.error('Audio playback failed', err)
        toast.error('Could not play back audio note')
      }
    }
  }

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const data = await vendorService.getOrders()
      let rawOrdersArray = []
      if (data) {
        if (Array.isArray(data)) {
          rawOrdersArray = data
        } else if (data.orders && Array.isArray(data.orders)) {
          rawOrdersArray = data.orders
        } else if (data.data && Array.isArray(data.data)) {
          rawOrdersArray = data.data
        } else {
          const pending = Array.isArray(data.pendingOrders) ? data.pendingOrders : []
          const confirmed = Array.isArray(data.confirmedOrders) ? data.confirmedOrders : []
          const processing = Array.isArray(data.processingOrders) ? data.processingOrders : []
          const delivered = Array.isArray(data.deliveredOrders) ? data.deliveredOrders : []
          const cancelled = Array.isArray(data.cancelledOrders) ? data.cancelledOrders : []
          
          rawOrdersArray = [
            ...pending,
            ...confirmed,
            ...processing,
            ...delivered,
            ...cancelled
          ]
        }
      }

      const formattedOrders = rawOrdersArray.map(o => {
        const cleanPrice = (priceVal) => {
          if (typeof priceVal === 'number') return `₹${priceVal}`
          if (!priceVal) return '₹0'
          return String(priceVal).startsWith('₹') ? priceVal : `₹${priceVal}`
        }

        const getCustomerName = () => {
          if (o.customer) {
            if (typeof o.customer === 'string') return o.customer
            if (typeof o.customer === 'object') {
              return o.customer.name || o.customer.fullName || `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || 'Customer'
            }
          }
          if (o.user?.name) return o.user.name
          if (o.user && typeof o.user === 'object') {
            return o.user.name || o.user.fullName || 'Customer'
          }
          return 'Customer'
        }

        const getOrderTime = () => {
          if (o.time) return o.time
          if (o.createdAt) {
            return new Date(o.createdAt).toLocaleDateString() + ' ' + new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          return 'N/A'
        }

        const rawStatus = (o.status || 'pending').toLowerCase()
        let mappedType = 'new'
        if (rawStatus === 'pending') {
          mappedType = 'new'
        } else if (rawStatus === 'confirmed') {
          mappedType = 'confirmed'
        } else if (rawStatus === 'processing') {
          mappedType = 'processing'
        } else if (rawStatus === 'delivered' || rawStatus === 'completed') {
          mappedType = 'completed'
        } else if (rawStatus === 'cancelled') {
          mappedType = 'cancelled'
        }

        return {
          id: o.orderNumber || o.id || o.orderId || `#ORD${o._id || o.id || 'N/A'}`,
          rawId: o.id || o._id,
          time: getOrderTime(),
          customer: getCustomerName(),
          phone: o.customer?.phone || o.user?.phone || '',
          email: o.customer?.email || o.user?.email || '',
          price: cleanPrice(o.total || o.totalPrice || o.price),
          subtotal: cleanPrice(o.subtotal || o.total || 0),
          status: o.status || 'pending',
          type: mappedType,
          notes: o.notes || '',
          voiceInstruction: o.audioNote || o.voiceInstruction || '',
          paymentMethod: (o.paymentMethod || o.payment_method || 'N/A').toUpperCase(),
          paymentStatus: o.paymentStatus || o.payment_status || 'pending',
          city: o.city || '',
          state: o.state || '',
          address: o.address || '',
          pincode: o.pincode || '',
          items: Array.isArray(o.OrderItems) ? o.OrderItems : (Array.isArray(o.items) ? o.items : [])
        }
      })

      setOrders(formattedOrders)
    } catch (err) {
      console.error('Failed to load orders:', err)
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
      
      // Update local state immediately
      let mappedType = 'new'
      if (newStatus === 'confirmed') {
        mappedType = 'confirmed'
      } else if (newStatus === 'processing') {
        mappedType = 'processing'
      } else if (newStatus === 'delivered' || newStatus === 'completed') {
        mappedType = 'completed'
      } else if (newStatus === 'cancelled') {
        mappedType = 'cancelled'
      }

      setOrders(prev => prev.map(o => o.rawId === orderId || o.id === orderId ? { 
        ...o, 
        status: newStatus, 
        type: mappedType 
      } : o))
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const getAvailableTransitions = (currentStatus) => {
    const status = String(currentStatus).toLowerCase()
    if (status === 'pending') {
      return [
        { label: 'Confirm', value: 'confirmed' },
        { label: 'Cancel', value: 'cancelled' }
      ]
    }
    if (status === 'confirmed') {
      return [
        { label: 'Process', value: 'processing' },
        { label: 'Cancel', value: 'cancelled' }
      ]
    }
    if (status === 'processing') {
      return [
        { label: 'Deliver', value: 'delivered' },
        { label: 'Cancel', value: 'cancelled' }
      ]
    }
    return []
  }

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.type === statusFilter
    return matchesStatus
  })

  // Summary counts
  const totalCount = orders.length
  const newCount = orders.filter(o => o.type === 'new').length
  const confirmedCount = orders.filter(o => o.type === 'confirmed').length
  const processingCount = orders.filter(o => o.type === 'processing').length
  const completedCount = orders.filter(o => o.type === 'completed').length
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
        <VendorNotificationBell />
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
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Manage Orders</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Track and process your customer orders smoothly.</p>
          </div>

          {/* Desktop Right Hand Toolbar actions */}
          <div className="hidden sm:flex items-center gap-3">
            <VendorNotificationBell />
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

        {/* Premium Horizontal Tabs */}
        <div className="flex items-center overflow-x-auto gap-2 pb-3 scrollbar-none">
          {[
            { id: 'all', count: totalCount, label: 'All Orders' },
            { id: 'new', count: newCount, label: 'New' },
            { id: 'confirmed', count: confirmedCount, label: 'Confirmed' },
            { id: 'processing', count: processingCount, label: 'Processing' },
            { id: 'completed', count: completedCount, label: 'Delivered' },
            { id: 'cancelled', count: cancelledCount, label: 'Cancelled' }
          ].map((tab) => {
            const isActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === statusFilter) return
                  setTabLoading(true)
                  setTimeout(() => {
                    setStatusFilter(tab.id)
                    setTabLoading(false)
                  }, 350)
                }}
                className={`px-5 py-3 rounded-2xl font-extrabold text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border cursor-pointer
                  ${isActive
                    ? 'bg-[#6C4CF1] text-white border-[#6C4CF1] shadow-lg shadow-purple-500/20'
                    : 'bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:text-gray-400 border-gray-100 dark:border-gray-800'}`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400'}`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>



        {/* Orders List Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm min-h-[300px] relative">
          {tabLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-[32px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-purple-100 dark:border-purple-950/30" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6C4CF1] animate-spin" />
              </div>
              <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Loading orders...</p>
            </div>
          ) : loading ? (
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
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                        <td className="py-4 px-4 font-black text-xs text-gray-900 dark:text-white">{order.id}</td>
                        <td className="py-4 px-4 text-xs font-bold text-gray-800 dark:text-gray-300">{order.customer}</td>
                        <td className="py-4 px-4 text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase
                            ${order.paymentMethod === 'COD' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20' : 'bg-green-50 text-green-600 dark:bg-green-950/20'}`}>
                            <CreditCard className="w-2.5 h-2.5" />{order.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {order.city || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-black text-gray-900 dark:text-white">{order.price}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full
                            ${order.type === 'completed' ? 'bg-green-50 text-green-600 dark:bg-green-950/20'
                              : order.type === 'processing' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                              : order.type === 'confirmed' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                              : order.type === 'new' ? 'bg-purple-50 text-[#6C4CF1] dark:bg-purple-950/20'
                              : 'bg-red-50 text-red-600 dark:bg-red-950/20'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#6C4CF1] hover:border-[#6C4CF1] bg-white dark:bg-gray-900 transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {getAvailableTransitions(order.status).length === 0 ? (
                              <span className="text-[10px] font-bold text-gray-400">Done</span>
                            ) : (
                              getAvailableTransitions(order.status).map((transition) => (
                                <button
                                  key={transition.value}
                                  disabled={updatingId === order.rawId || updatingId === order.id}
                                  onClick={() => handleUpdateStatus(order.rawId || order.id, transition.value)}
                                  className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase border border-gray-200 dark:border-gray-700 text-[#6C4CF1] bg-white hover:bg-purple-50 dark:bg-gray-900 dark:hover:bg-purple-950/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                  {transition.label}
                                </button>
                              ))
                            )}
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
                  const isConfirmed = order.type === 'confirmed';
                  return (
                    <div
                      key={idx}
                      className="bg-gray-50/40 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4 shadow-sm hover:border-purple-250 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 
                            ${isCompleted ? 'bg-green-100 text-green-600' : isProcessing ? 'bg-blue-100 text-blue-600' : isConfirmed ? 'bg-orange-100 text-orange-655' : order.type === 'new' ? 'bg-purple-100 text-[#6C4CF1]' : 'bg-red-100 text-red-600'}`}
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
                                : isConfirmed
                                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                                  : order.type === 'new'
                                    ? 'bg-purple-50 text-[#6C4CF1] dark:bg-purple-950/20'
                                    : 'bg-red-50 text-red-600 dark:bg-red-950/20'}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {(order.notes || order.voiceInstruction) && (
                        <div className="bg-purple-50/5 dark:bg-purple-950/5 border border-purple-100/5 dark:border-gray-800 rounded-xl p-2.5 space-y-1.5 text-[10px]">
                          {order.notes && (
                            <div className="text-gray-450 dark:text-gray-400 font-medium">
                              <span className="font-extrabold text-gray-500 mr-1 uppercase">Note:</span> {order.notes}
                            </div>
                          )}
                          {order.voiceInstruction && (
                            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-purple-50/5">
                              <span className="font-bold text-gray-500 uppercase">Voice Instruction:</span>
                              <button
                                onClick={() => handleToggleVoicePlayback(order.id, order.voiceInstruction)}
                                className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase flex items-center gap-1 cursor-pointer border transition-all ${playingAudioId === order.id
                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20'
                                    : 'bg-purple-50 text-[#6C4CF1] border-purple-100/10 dark:bg-purple-900/10'
                                  }`}
                              >
                                {playingAudioId === order.id ? (
                                  <>
                                    <Pause className="w-2 h-2 fill-red-600" /> Playing
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-2 h-2 fill-[#6C4CF1] ml-0.5" /> Listen
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="border-t border-gray-100/50 dark:border-gray-800 pt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Customer: <strong className="text-gray-700 dark:text-gray-300">{order.customer}</strong></span>
                        <div className="flex items-center gap-1">
                          {getAvailableTransitions(order.status).length === 0 ? (
                            <span className="text-[9px] font-bold text-gray-400">No Action</span>
                          ) : (
                            getAvailableTransitions(order.status).map((transition) => (
                              <button
                                key={transition.value}
                                disabled={updatingId === order.rawId || updatingId === order.id}
                                onClick={() => handleUpdateStatus(order.rawId || order.id, transition.value)}
                                className="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase border border-gray-150 dark:border-gray-700 text-[#6C4CF1] bg-white dark:bg-gray-900 hover:bg-purple-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {transition.label}
                              </button>
                            ))
                          )}
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="font-black text-sm text-gray-900 dark:text-white">Order Details</h2>
                  <p className="text-[11px] font-bold text-[#6C4CF1] mt-0.5">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Customer Info */}
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-purple-600 mb-3">Customer Info</p>
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.customer}</span>
                  </div>
                  {selectedOrder.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOrder.phone}</span>
                    </div>
                  )}
                  {selectedOrder.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOrder.email}</span>
                    </div>
                  )}
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Payment</p>
                    <span className={`text-[11px] font-extrabold ${ selectedOrder.paymentMethod === 'COD' ? 'text-yellow-600' : 'text-green-600'}`}>{selectedOrder.paymentMethod}</span>
                    <p className="text-[9px] text-gray-400 mt-0.5 capitalize">{selectedOrder.paymentStatus}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Amount</p>
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-white">{selectedOrder.price}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Status</p>
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-white capitalize">{selectedOrder.status}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Time</p>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{selectedOrder.time}</span>
                  </div>
                </div>

                {/* Address */}
                {selectedOrder.address && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-2">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#6C4CF1] shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{selectedOrder.address}</p>
                    </div>
                    {selectedOrder.pincode && <p className="text-[10px] text-gray-400 mt-1 ml-5">PIN: {selectedOrder.pincode}</p>}
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-wider text-yellow-600 mb-1">Order Note</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Items */}
                {selectedOrder.items?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Order Items ({selectedOrder.items.length})</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{item.productName || item.name || `Item #${i+1}`}</p>
                            <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-xs font-black text-[#6C4CF1]">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Note */}
                {selectedOrder.voiceInstruction && (
                  <button
                    onClick={() => handleToggleVoicePlayback(selectedOrder.id, selectedOrder.voiceInstruction)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-extrabold text-xs uppercase border transition-all cursor-pointer ${ playingAudioId === selectedOrder.id ? 'bg-red-50 text-red-600 border-red-200' : 'bg-purple-50 text-[#6C4CF1] border-purple-100'}`}
                  >
                    {playingAudioId === selectedOrder.id ? <><Pause className="w-3.5 h-3.5" /> Stop Playing</> : <><Play className="w-3.5 h-3.5" /> Play Voice Note</>}
                  </button>
                )}

                {/* Quick Actions */}
                {getAvailableTransitions(selectedOrder.status).length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {getAvailableTransitions(selectedOrder.status).map((transition) => (
                      <button
                        key={transition.value}
                        disabled={updatingId === selectedOrder.rawId}
                        onClick={() => { handleUpdateStatus(selectedOrder.rawId || selectedOrder.id, transition.value); setSelectedOrder(null) }}
                        className="flex-1 py-2.5 rounded-2xl text-xs font-extrabold uppercase bg-[#6C4CF1] text-white hover:bg-purple-700 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {transition.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default VendorOrders
