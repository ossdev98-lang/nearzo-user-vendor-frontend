import React, { useState, useEffect } from 'react'
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
import { vendorService } from '../../services/vendorService'
import VendorNotificationBell from '../../components/vendor/VendorNotificationBell'

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // UI States
  const [isStoreOpen, setIsStoreOpen] = useState(user?.workMode !== false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/vendor/login')
  }

  const toggleStoreStatus = async () => {
    const newStatus = !isStoreOpen
    const loadingToast = toast.loading('Updating store status...')
    try {
      await vendorAuthService.toggleWorkMode(newStatus)
      setIsStoreOpen(newStatus)

      // Update local storage and React AppContext user state
      const updatedUser = { ...user, workMode: newStatus }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast.success(`Store status updated to: ${newStatus ? 'Open 🟢' : 'Closed 🔴'}`, { id: loadingToast })
    } catch (err) {
      toast.error(err.message || 'Failed to update store status', { id: loadingToast })
    }
  }

  const [stats, setStats] = useState({
    todaySales: '₹0',
    ordersCount: '0',
    itemsSold: '0',
    storeViews: '0',
    totalSales: '₹0',
    salesChange: '+0%',
    ordersChange: '+0%',
    itemsChange: '+0%',
    viewsChange: '+0%'
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [orderCounters, setOrderCounters] = useState({
    completed: 0,
    processing: 0,
    packed: 0,
    cancelled: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, ordersList] = await Promise.all([
          vendorService.getOrderStats().catch(err => {
            console.error('Error fetching order stats:', err)
            return null
          }),
          vendorService.getDashboardOrders().catch(err => {
            console.error('Error fetching dashboard orders list:', err)
            return []
          })
        ])

        // Parse orders list
        let rawOrdersArray = []
        let pendingOrdersArr = []
        let confirmedOrdersArr = []
        let processingOrdersArr = []
        let deliveredOrdersArr = []
        let cancelledOrdersArr = []

        if (ordersList && Array.isArray(ordersList)) {
          rawOrdersArray = ordersList
        } else if (ordersList) {
          pendingOrdersArr = ordersList.pendingOrders || []
          confirmedOrdersArr = ordersList.confirmedOrders || []
          processingOrdersArr = ordersList.processingOrders || []
          deliveredOrdersArr = ordersList.deliveredOrders || []
          cancelledOrdersArr = ordersList.cancelledOrders || []

          // Add state/status names if they don't exist
          pendingOrdersArr.forEach(o => { o.status = o.status || 'Pending'; o.type = 'processing' })
          confirmedOrdersArr.forEach(o => { o.status = o.status || 'Confirmed'; o.type = 'packed' })
          processingOrdersArr.forEach(o => { o.status = o.status || 'Processing'; o.type = 'processing' })
          deliveredOrdersArr.forEach(o => { o.status = o.status || 'Delivered'; o.type = 'completed' })
          cancelledOrdersArr.forEach(o => { o.status = o.status || 'Cancelled'; o.type = 'cancelled' })

          rawOrdersArray = [
            ...pendingOrdersArr,
            ...confirmedOrdersArr,
            ...processingOrdersArr,
            ...deliveredOrdersArr,
            ...cancelledOrdersArr
          ]
        }

        if (rawOrdersArray && Array.isArray(rawOrdersArray)) {
          const formattedOrders = rawOrdersArray.map(o => {
            const cleanPrice = (priceVal) => {
              if (typeof priceVal === 'number') return `₹${priceVal}`
              if (!priceVal) return '₹0'
              return priceVal.startsWith('₹') ? priceVal : `₹${priceVal}`
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
                return new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
              return 'N/A'
            }

            return {
              id: o.id || o.orderId || `#ORD${o._id || o.id || 'N/A'}`,
              time: getOrderTime(),
              customer: getCustomerName(),
              price: cleanPrice(o.price || o.totalAmount || o.total),
              status: o.status || 'Processing',
              type: (o.status || o.type || 'processing').toLowerCase()
            }
          })

          setRecentOrders(formattedOrders.slice(0, 4))
        }

        // Helper to check object properties
        const getProp = (obj, keys, defaultVal) => {
          if (!obj) return defaultVal
          for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null) return obj[key]
          }
          return defaultVal
        }

        let statsObj = statsData
        if (statsData && statsData.data) {
          statsObj = statsData.data
        } else if (statsData && statsData.stats) {
          statsObj = statsData.stats
        }

        const formatPrice = (val) => {
          if (typeof val === 'number') return `₹${val.toLocaleString('en-IN')}`
          if (!val) return '₹0'
          return String(val).startsWith('₹') ? val : `₹${val}`
        }

        // Exact keys: totalOrders, deliveredOrders, pendingOrders, cancelledOrders, processingOrders, shopViews, totalSales, todaySales
        const todaySalesVal = getProp(statsObj, ['todaySales', 'today_sales'], 0)
        const totalSalesVal = getProp(statsObj, ['totalSales', 'total_sales'], 0)
        const ordersCountVal = getProp(statsObj, ['totalOrders', 'ordersCount'], 0)
        const itemsSoldVal = getProp(statsObj, ['itemsSold', 'items_sold'], 0)
        const storeViewsVal = getProp(statsObj, ['shopViews', 'storeViews', 'store_views', 'views'], 0)

        // Parse status counts from countsObj
        const countsObj = ordersList?.counts || {}
        const pendingCount = pendingOrdersArr.length || countsObj.pending || 0
        const confirmedCount = confirmedOrdersArr.length || countsObj.confirmed || 0
        const processingCount = processingOrdersArr.length || countsObj.processing || 0
        const deliveredCount = deliveredOrdersArr.length || countsObj.delivered || 0
        const cancelledCount = cancelledOrdersArr.length || countsObj.cancelled || 0

        // Parse status counts from statsData (if available there)
        let completed = getProp(statsObj, ['deliveredOrders', 'completed', 'completedOrders'], 0)
        let processing = getProp(statsObj, ['processingOrders', 'processing', 'processingOrders'], 0)
        let pending = getProp(statsObj, ['pendingOrders', 'pending', 'pendingOrders'], 0)
        let cancelled = getProp(statsObj, ['cancelledOrders', 'cancelled', 'cancelledOrders'], 0)
        let packed = getProp(statsObj, ['packedOrders', 'packed'], 0)

        // Fallback calculations from actual orders if stats endpoint returned zeros or is empty
        let computedItemsSold = 0
        let computedCompleted = 0
        let computedProcessing = 0
        let computedPacked = 0
        let computedCancelled = 0
        let computedTodaySales = 0
        let computedTotalSales = 0

        if (rawOrdersArray && Array.isArray(rawOrdersArray)) {
          rawOrdersArray.forEach(o => {
            if (o.items && Array.isArray(o.items)) {
              o.items.forEach(item => {
                computedItemsSold += Number(item.quantity) || 1
              })
            } else {
              computedItemsSold += 1
            }

            const status = (o.status || '').toLowerCase()
            const type = (o.type || '').toLowerCase()
            const isCompleted = status === 'completed' || type === 'completed' || status === 'delivered' || type === 'delivered'
            const isProcessing = status === 'processing' || type === 'processing' || status === 'pending' || type === 'pending'
            const isPacked = status === 'packed' || type === 'packed' || status === 'confirmed' || type === 'confirmed'
            const isCancelled = status === 'cancelled' || type === 'cancelled'

            if (isCompleted) computedCompleted++
            else if (isProcessing) computedProcessing++
            else if (isPacked) computedPacked++
            else if (isCancelled) computedCancelled++

            const priceNum = Number(String(o.price || o.totalAmount || o.total || 0).replace(/[^0-9.]/g, '')) || 0
            computedTotalSales += priceNum

            const isToday = o.createdAt ? new Date(o.createdAt).toDateString() === new Date().toDateString() : true
            if (isToday && isCompleted) {
              computedTodaySales += priceNum
            }
          })
        }

        const finalTodaySales = todaySalesVal || computedTodaySales
        const finalTotalSales = totalSalesVal || computedTotalSales
        const finalOrdersCount = ordersCountVal || ordersList?.totalOrders || (rawOrdersArray ? rawOrdersArray.length : 0)
        const finalItemsSold = itemsSoldVal || computedItemsSold
        const finalStoreViews = storeViewsVal || 0

        const finalCompleted = completed || deliveredCount || computedCompleted
        const finalProcessing = (processing || 0) + (pending || 0) || (processingCount + pendingCount) || computedProcessing
        const finalPacked = packed || confirmedCount || computedPacked
        const finalCancelled = cancelled || cancelledCount || computedCancelled

        setOrderCounters({
          completed: finalCompleted,
          processing: finalProcessing,
          packed: finalPacked,
          cancelled: finalCancelled
        })

        setStats({
          todaySales: formatPrice(finalTodaySales),
          ordersCount: String(finalOrdersCount),
          itemsSold: String(finalItemsSold),
          storeViews: String(finalStoreViews),
          totalSales: formatPrice(finalTotalSales),
          salesChange: getProp(statsObj, ['salesChange', 'sales_change'], '+0%'),
          ordersChange: getProp(statsObj, ['ordersChange', 'orders_change'], '+0%'),
          itemsChange: getProp(statsObj, ['itemsChange', 'items_change'], '+0%'),
          viewsChange: getProp(statsObj, ['viewsChange', 'views_change'], '+0%')
        })
      } catch (err) {
        console.error('Error in fetchDashboardData:', err)
      }
    }

    fetchDashboardData()
  }, [])

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" />, active: true },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-50/30 via-[#FAF9FF] to-[#FAF9FF] dark:from-purple-950/10 dark:via-gray-950 dark:to-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">

      {/* 1. Mobile Top Bar (md:hidden) */}
      <header className="md:hidden w-full h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100/20 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-10 h-10 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center justify-center transition-colors border-none bg-transparent"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <img src={logo} alt="Nearzo Logo" className="h-9 object-contain dark:filter dark:invert" />
        </Link>
        <VendorNotificationBell />
      </header>

      {/* 2. Sidebar for Desktop & Mobile Overlay Drawer */}
      <AnimatePresence>
        {(isMobileSidebarOpen || true) && (
          <motion.aside
            className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-purple-100/10 dark:border-gray-850 z-50 flex flex-col shrink-0 
              ${isMobileSidebarOpen ? 'block' : 'hidden md:flex'}`}
            initial={isMobileSidebarOpen ? { x: -260 } : false}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Logo & Close drawer for Mobile */}
            <div className="p-6 pb-6 flex items-center justify-between border-b border-purple-50/10 dark:border-gray-800">
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
            <nav className="p-4 space-y-1.5 flex-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm group
                    ${link.active
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/10 text-[#6C4CF1] shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:translate-x-1 duration-250'}`}
                >
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${link.active ? 'text-[#6C4CF1]' : 'text-gray-400'}`}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 rounded-2xl font-bold transition-all text-left mt-6 border-none bg-transparent cursor-pointer text-sm hover:translate-x-1 duration-250"
              >
                <LogOut className="w-5 h-5 text-red-400" /> <span>Logout</span>
              </button>
            </nav>

            {/* Bottom User Info Block */}
            <div className="p-4 border-t border-purple-50/10 dark:border-gray-800 bg-[#FAF9FF]/80 dark:bg-gray-950/40">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 bg-purple-100/60 dark:bg-purple-950/30 rounded-xl flex items-center justify-center shrink-0 border border-purple-100/20">
                  <Store className="w-5 h-5 text-[#6C4CF1]" />
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
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Top greeting bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100/10 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3.5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              Welcome back, <span className="bg-gradient-to-r from-[#6C4CF1] to-[#8C6CF5] bg-clip-text text-transparent">{user?.ownerName || 'Partner'}</span>!
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Here is what's happening with your store today.</span>

              {/* Store Status Switch Toggle */}
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-800 px-4 py-2 rounded-2xl shadow-sm">
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Store Status: <span className={isStoreOpen ? 'text-[#00B074]' : 'text-red-500'}>{isStoreOpen ? 'Open' : 'Closed'}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleStoreStatus}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none relative flex items-center cursor-pointer border-none ${isStoreOpen ? 'bg-[#00B074]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                >
                  <motion.div
                    layout
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: isStoreOpen ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Right Hand Toolbar actions */}
          <div className="hidden sm:flex items-center gap-3">
            <VendorNotificationBell />

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-purple-100/15 dark:border-gray-800 rounded-2xl hover:bg-gray-50 shadow-sm transition-all cursor-pointer border-none"
              >
                <div className="w-7 h-7 rounded-xl bg-purple-100/60 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-[#6C4CF1]" />
                </div>
                <span className="text-xs font-black text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{user?.shopName || 'Partner'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-13 w-48 bg-white dark:bg-gray-800 border border-purple-100/10 dark:border-gray-750 rounded-2xl shadow-xl p-2 z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider text-left border-none bg-transparent cursor-pointer"
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
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-tr from-[#6C4CF1] via-[#5B3BE8] to-[#4C2CD7] p-6 text-white shadow-xl shadow-purple-600/20 flex flex-col justify-between min-h-[230px] hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between z-10">
              <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Today's Store Sales</span>
              <button
                onClick={() => navigate('/vendor/orders')}
                className="text-[10px] font-black uppercase tracking-wider text-white bg-white/15 hover:bg-white/25 backdrop-blur-md px-4 py-2 rounded-full transition-all flex items-center gap-1 border border-white/10 cursor-pointer"
              >
                <span>Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-6 flex items-baseline gap-2 z-10">
              <span className="text-4xl font-black tracking-tight">{stats.todaySales}</span>
              <span className="inline-flex items-center gap-0.5 bg-white/15 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/5">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> {stats.salesChange}
              </span>
            </div>

            {/* Bezier Trend Line Graphic */}
            <div className="mt-6 h-14 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow-desktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
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
                <circle cx="100" cy="5" r="2.5" fill="#ffffff" stroke="#6C4CF1" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Stats Grid cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Orders', val: stats.ordersCount, grow: stats.ordersChange, icon: <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-100/50 dark:bg-purple-950/40 border-purple-200/20' },
              { label: 'Items Sold', val: stats.itemsSold, grow: stats.itemsChange, icon: <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-100/50 dark:bg-emerald-950/40 border-emerald-200/20' },
              { label: 'Store Views', val: stats.storeViews, grow: stats.viewsChange, icon: <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-100/50 dark:bg-amber-950/40 border-amber-200/20' },
              { label: 'Total Sales', val: stats.totalSales, grow: stats.salesChange, icon: <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-100/50 dark:bg-blue-950/40 border-blue-200/20' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-purple-100/10 dark:border-gray-800/80 rounded-3xl p-5 flex flex-col justify-between items-start shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} border flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight block">{stat.val}</span>
                  <span className="text-[10px] font-black text-gray-400 mt-1 block uppercase tracking-wider">{stat.label}</span>
                </div>
                <span className="text-xs font-black text-[#00B074] mt-3 flex items-center gap-0.5 bg-[#00B074]/10 px-2 py-0.5 rounded-full">
                  ↗ {stat.grow}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Order Status Counters + Quick Actions circular grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Order Status Counters Panel */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-purple-100/10 dark:border-gray-800/80 rounded-[32px] p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Order Status Summary</h3>
              <button
                onClick={() => navigate('/vendor/orders')}
                className="text-xs font-black text-[#6C4CF1] hover:text-[#5B3BE8] bg-transparent border-none cursor-pointer uppercase tracking-wider"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { count: String(orderCounters.completed), status: 'Completed', icon: <ClipboardList className="w-5 h-5 text-[#00B074]" />, bg: 'bg-[#EAFBF3]', border: 'border-[#00B074]/15' },
                { count: String(orderCounters.processing), status: 'Processing', icon: <Clock className="w-5 h-5 text-[#0088FF]" />, bg: 'bg-[#E5F3FF]', border: 'border-[#0088FF]/15' },
                { count: String(orderCounters.packed), status: 'Packed', icon: <Package className="w-5 h-5 text-[#FF8A00]" />, bg: 'bg-[#FFF3E5]', border: 'border-[#FF8A00]/15' },
                { count: String(orderCounters.cancelled), status: 'Cancelled', icon: <XCircle className="w-5 h-5 text-[#FF4D4D]" />, bg: 'bg-[#FFEBEB]', border: 'border-[#FF4D4D]/15' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${item.border} ${item.bg}/30 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] transition-all`}>
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shadow-inner`}>
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-1">{item.count}</span>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-purple-100/10 dark:border-gray-800/80 rounded-[32px] p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
              {[
                { label: 'Add Product', icon: <PlusCircle className="w-5 h-5 text-[#6C4CF1]" />, bg: 'bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200/10', action: () => navigate('/vendor/master-products') },
                { label: 'Inventory', icon: <Package className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-100/50 dark:bg-emerald-950/40 border border-emerald-200/10', action: () => navigate('/vendor/products') },
                { label: 'Orders', icon: <ShoppingBag className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100/50 dark:bg-blue-950/40 border border-blue-200/10', action: () => navigate('/vendor/orders') },
                { label: 'Settings', icon: <Settings className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-100/50 dark:bg-amber-950/40 border border-amber-200/10', action: () => navigate('/vendor/settings') }
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={act.action}
                  className="flex flex-col items-center gap-2 focus:outline-none bg-transparent border-none cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${act.bg} flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm shrink-0`}>
                    {act.icon}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-[#6C4CF1] uppercase tracking-wider text-center leading-tight line-clamp-1">{act.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Row 3: Recent Inbound Orders Table */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-purple-100/10 dark:border-gray-800/80 rounded-[32px] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Recent Inbound Orders</h3>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="text-xs font-black text-[#6C4CF1] hover:text-[#5B3BE8] bg-transparent border-none cursor-pointer uppercase tracking-wider"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-100/5 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Order Price</th>
                  <th className="py-3.5 px-4 text-center">Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-purple-50/5 dark:border-gray-800/40 hover:bg-purple-50/20 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4.5 px-4 font-black text-xs text-[#6C4CF1]">{order.id}</td>
                    <td className="py-4.5 px-4 text-xs font-bold text-gray-400">{order.time}</td>
                    <td className="py-4.5 px-4 text-xs font-bold text-gray-850 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-[10px] font-black text-[#6C4CF1] border border-purple-100/10">
                          {String(order.customer || 'C').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span>{order.customer}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-4 text-xs font-black text-gray-900 dark:text-white">{order.price}</td>
                    <td className="py-4.5 px-4 text-center">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full
                        ${order.type === 'completed'
                          ? 'bg-[#EAFBF3] text-[#00B074] border border-[#00B074]/15'
                          : order.type === 'processing'
                            ? 'bg-[#E5F3FF] text-[#0088FF] border border-[#0088FF]/15'
                            : 'bg-[#FFF3E5] text-[#FF8A00] border border-[#FF8A00]/15'}`}
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

