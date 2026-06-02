import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Bell,
  Menu,
  Store,
  User,
  MapPin,
  Compass,
  Save,
  TrendingUp,
  ShoppingBag,
  Package,
  LogOut,
  X,
  ChevronDown
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
import toast from 'react-hot-toast'

const VendorSettings = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fields State
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [deliveryRange, setDeliveryRange] = useState('5') // in km

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await vendorService.getProfile()
        if (profile) {
          setShopName(profile.shopName || user?.shopName || '')
          setOwnerName(profile.ownerName || user?.ownerName || '')
          setEmail(profile.email || user?.email || '')
          setLatitude(profile.latitude || '')
          setLongitude(profile.longitude || '')
          setDeliveryRange(profile.orderAcceptanceRange || profile.deliveryRange || '5')
        }
      } catch (err) {
        toast.error('Failed to load shop settings')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/vendor/login')
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!shopName || !ownerName || !email) {
      toast.error('Please enter all mandatory merchant credentials')
      return
    }

    const payload = {
      shopName,
      ownerName,
      email,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      orderAcceptanceRange: parseFloat(deliveryRange) || 5
    }

    try {
      await vendorService.updateSettings(payload)
      
      // Update global context user state & localstorage
      const updatedUser = { ...user, ...payload }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('Merchant configurations saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings configurations')
    }
  }

  // Quick action to fetch current GPS coordinates
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    toast.loading('Fetching GPS coordinates...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss()
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        toast.success('GPS coordinates retrieved successfully!')
      },
      (error) => {
        toast.dismiss()
        toast.error('Unable to retrieve location. Please check browser permissions.')
      }
    )
  }

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" />, active: true }
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
        <span className="font-extrabold text-base tracking-tight text-purple-650">Shop Configurations</span>
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
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shop Configurations</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Fine-tune your shop information, location geo-coordinates, and delivery zones.</p>
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

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-purple-600/30 border-t-purple-650 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-400">Loading configurations profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 md:p-8 shadow-sm space-y-8">
            
            {/* General Merchant Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-650">
                <Store className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-950 dark:text-white">Store Identity</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Shop Name</label>
                  <input 
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Owner / Contact Name</label>
                  <input 
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Store Email</label>
                <input 
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Delivery zone geolocation credentials */}
            <div className="space-y-4 border-t border-gray-50 dark:border-gray-800 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-650">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-950 dark:text-white">Delivery Location Zone</h3>
                </div>
                
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-55 hover:bg-purple-100 text-[#6C4CF1] rounded-full text-[10px] font-extrabold uppercase transition-all shadow-sm border-none cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" /> GPS Coordinates
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Latitude Coordinates</label>
                  <input 
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 28.6139"
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Longitude Coordinates</label>
                  <input 
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 77.2090"
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Delivery Range (KM)</label>
                  <input 
                    type="number"
                    value={deliveryRange}
                    onChange={(e) => setDeliveryRange(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons actions */}
            <div className="border-t border-gray-50 dark:border-gray-800 pt-6 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] border-none cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Configuration Settings
              </button>
            </div>

          </form>
        )}

      </main>

    </div>
  )
}

export default VendorSettings
