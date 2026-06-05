import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bell, Menu, Store, User, MapPin, Compass, Save, TrendingUp, ShoppingBag, Package, LogOut, X, ChevronDown, Moon, Sun, Tag, Phone, Mail, Camera, Clock } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logoImg from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
import { categoryService } from '../../services/categoryService'
import toast from 'react-hot-toast'
import VendorNotificationBell from '../../components/vendor/VendorNotificationBell'

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com';
  return `${baseUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
}

const VendorSettings = () => {
  const navigate = useNavigate()
  const { setUser, isDarkMode, toggleDarkMode } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  // Dynamic Shop Categories
  const [categories, setCategories] = useState([])
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

  // Profile fields
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [shopCategoryId, setShopCategoryId] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [deliveryRange, setDeliveryRange] = useState('5')

  // New Fields
  const [logo, setLogo] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [banner, setBanner] = useState('')
  const [bannerFile, setBannerFile] = useState(null)
  const [openingTime, setOpeningTime] = useState('')
  const [closingTime, setClosingTime] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')

  // Notification toggle
  const [allowNotification, setAllowNotification] = useState(true)

  // Order Settings fields
  const [orderAcceptanceRange, setOrderAcceptanceRange] = useState('5')
  const [deliveryChargePerKm, setDeliveryChargePerKm] = useState('30')
  const [freeDeliveryKm, setFreeDeliveryKm] = useState('1')
  const [savingOrderSettings, setSavingOrderSettings] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        let cats = []
        try {
          const catRes = await categoryService.getShopCategories()
          if (catRes && catRes.success && Array.isArray(catRes.shopCategories)) {
            cats = catRes.shopCategories
            setCategories(cats)
          }
        } catch (err) {
          console.error('Error fetching categories:', err)
        }

        const profileRes = await vendorService.getProfile()
        if (profileRes) {
          const profile = profileRes.vendor || profileRes.profile || profileRes.data || profileRes
          setShopName(profile.shopName || '')
          setOwnerName(profile.ownerName || '')
          setEmail(profile.email || '')
          setPhone(profile.phone || '')
          setLatitude(profile.latitude || '')
          setLongitude(profile.longitude || '')
          setDeliveryRange(profile.orderAcceptanceRange || '5')

          const formatTimeForInput = (t) => {
            if (!t) return ''
            const parts = t.split(':')
            if (parts.length >= 2) {
              return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
            }
            return t
          }
          setLogo(profile.logo || '')
          setBanner(profile.banner || '')
          setOpeningTime(formatTimeForInput(profile.openingTime))
          setClosingTime(formatTimeForInput(profile.closingTime))
          setCity(profile.city || '')
          setState(profile.state || '')
          setPincode(profile.pincode || '')
          setAllowNotification(profile.allowNotification !== undefined ? profile.allowNotification : true)
          setOrderAcceptanceRange(profile.orderAcceptanceRange !== undefined ? profile.orderAcceptanceRange : '5')
          setDeliveryChargePerKm(profile.delivery_charge_per_km !== undefined ? profile.delivery_charge_per_km : '30')
          setFreeDeliveryKm(profile.freeDeliveryKm !== undefined ? profile.freeDeliveryKm : '1')

          if (profile.shopCategoryId) {
            setShopCategoryId(profile.shopCategoryId)
          } else if (profile.shopCategory) {
            const matched = cats.find(c => c.shopCategoryName?.toLowerCase() === profile.shopCategory?.toLowerCase())
            if (matched) {
              setShopCategoryId(matched.id)
            }
          }
        }
      } catch (err) {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleToggleNotification = async () => {
    const newValue = !allowNotification
    setAllowNotification(newValue)
    try {
      await vendorService.updateNotificationToggle(newValue)
      toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled')
    } catch (err) {
      setAllowNotification(!newValue)
      toast.error('Failed to update notification settings')
    }
  }

  const handleSaveOrderSettings = async (e) => {
    e.preventDefault()
    setSavingOrderSettings(true)
    try {
      const payload = {
        orderAcceptanceRange: parseFloat(orderAcceptanceRange) || 0,
        delivery_charge_per_km: parseFloat(deliveryChargePerKm) || 0,
        freeDeliveryKm: parseFloat(freeDeliveryKm) || 0
      }
      await vendorService.updateOrderSettings(payload)
      const updatedUser = {
        ...user,
        orderAcceptanceRange: payload.orderAcceptanceRange,
        delivery_charge_per_km: payload.delivery_charge_per_km,
        freeDeliveryKm: payload.freeDeliveryKm
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Order settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save order settings')
    } finally {
      setSavingOrderSettings(false)
    }
  }

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    navigate('/vendor/login')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!shopName || !ownerName) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('shopName', shopName)
      formDataToSend.append('ownerName', ownerName)
      formDataToSend.append('phone', phone)
      if (openingTime) {
        const formattedOpening = openingTime.split(':').length === 2 ? `${openingTime}:00` : openingTime
        formDataToSend.append('openingTime', formattedOpening)
      }
      if (closingTime) {
        const formattedClosing = closingTime.split(':').length === 2 ? `${closingTime}:00` : closingTime
        formDataToSend.append('closingTime', formattedClosing)
      }
      formDataToSend.append('city', city)
      formDataToSend.append('state', state)
      formDataToSend.append('pincode', pincode)
      if (shopCategoryId) {
        formDataToSend.append('shopCategoryId', shopCategoryId)
      }
      formDataToSend.append('latitude', parseFloat(latitude) || 0)
      formDataToSend.append('longitude', parseFloat(longitude) || 0)
      formDataToSend.append('orderAcceptanceRange', parseFloat(deliveryRange) || 5)

      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }
      if (bannerFile) {
        formDataToSend.append('banner', bannerFile)
      }

      const res = await vendorService.updateSettings(formDataToSend)
      const updatedUser = res.vendor || res.profile || res.data || {
        ...user,
        shopName,
        ownerName,
        phone,
        latitude,
        longitude,
        orderAcceptanceRange: deliveryRange,
        logo: logoFile ? URL.createObjectURL(logoFile) : logo,
        banner: bannerFile ? URL.createObjectURL(bannerFile) : banner
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const fetchGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    const id = toast.loading('Fetching GPS...')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLatitude(p.coords.latitude.toFixed(6))
        setLongitude(p.coords.longitude.toFixed(6))
        toast.success('GPS fetched!', { id })
      },
      () => toast.error('Location denied', { id })
    )
  }

  const tabs = [
    { id: 'profile', label: 'Shop Profile', icon: Store },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'order-settings', label: 'Order Settings', icon: ShoppingBag },
    { id: 'theme', label: 'Appearance', icon: Moon },
  ]

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" />, active: true }
  ]

  const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-800 dark:text-white placeholder-gray-400"
  const labelCls = "text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1"

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : getImageUrl(logo)
  const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : getImageUrl(banner)

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">

      {/* Mobile Header */}
      <header className="md:hidden w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
        <button onClick={() => setIsMobileSidebarOpen(true)} className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer">
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-extrabold text-base tracking-tight text-purple-600">Settings</span>
        <VendorNotificationBell />
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileSidebarOpen || true) && (
          <motion.aside
            className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col shrink-0 ${isMobileSidebarOpen ? 'block' : 'hidden md:flex'}`}
            initial={isMobileSidebarOpen ? { x: -260 } : false}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
              <Link to="/" className="inline-block hover:scale-105 transition-transform mx-auto md:mx-0">
                <img src={logoImg} alt="Nearzo" className="h-12 object-contain dark:filter dark:invert" />
              </Link>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center border-none bg-transparent cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <nav className="p-4 space-y-1 flex-1">
              {navLinks.map((link, idx) => (
                <Link key={idx} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${link.active ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
                  {link.icon} <span>{link.label}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl font-bold transition-all text-left mt-4 border-none bg-transparent cursor-pointer text-sm">
                <LogOut className="w-5 h-5" /> <span>Logout</span>
              </button>
            </nav>
            <div className="p-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-gray-900 dark:text-white line-clamp-1 text-sm">{user?.shopName || 'My Shop'}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />}

      {/* Main Content */}
      {/* <div>
        <h1 className="text-center text-3xl font-bold text-purple-600">Settings Page</h1>
      </div> */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 w-full">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your shop profile and preferences</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <VendorNotificationBell />
              <div className="relative">
                <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Store className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-bold truncate max-w-[120px]">{user?.shopName || 'Partner'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 5 }} className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-2 z-50">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider text-left border-none bg-transparent cursor-pointer">
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Sidebar Tabs */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm">
                {/* Avatar */}
                <div className="p-4 text-center border-b border-gray-100 dark:border-gray-800 mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-md">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{shopName || 'My Shop'}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{email || ''}</p>
                </div>

                {tabs.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all text-sm font-bold cursor-pointer border-none ${isActive ? 'bg-[#6C4CF1] text-white shadow-md shadow-purple-600/25' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                    {loading ? (
                      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm">
                        <div className="w-10 h-10 border-4 border-purple-100 border-t-[#6C4CF1] rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-semibold">Loading profile...</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-6">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <div>
                            <h2 className="font-black text-lg text-gray-900 dark:text-white">Shop Profile</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Update your shop details, photos and preferences</p>
                          </div>
                          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#6C4CF1] hover:bg-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer border-none shadow-md shadow-purple-600/20">
                            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>

                        {/* Banner & Logo section */}
                        <div className="px-6 relative">
                          <div className="h-44 w-full rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative border border-gray-150 dark:border-gray-850">
                            {bannerPreview ? (
                              <img src={bannerPreview} alt="Shop Banner" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Camera className="w-8 h-8" />
                                <span className="text-xs font-bold uppercase tracking-wider">No Shop Cover Banner</span>
                              </div>
                            )}

                            <label className="absolute right-4 bottom-4 p-2.5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl hover:scale-105 transition-transform shadow-md cursor-pointer flex items-center justify-center">
                              <Camera className="w-4 h-4 text-purple-600" />
                              <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setBannerFile(e.target.files[0]) }} />
                            </label>
                          </div>

                          <div className="absolute -bottom-10 left-12 h-20 w-20 rounded-2xl bg-white dark:bg-gray-950 p-1 shadow-lg border border-gray-100 dark:border-gray-800">
                            <div className="h-full w-full rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden relative group">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Store className="w-6 h-6" />
                                </div>
                              )}

                              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <Camera className="w-4 h-4 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setLogoFile(e.target.files[0]) }} />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Spacer for Absolute Avatar */}
                        <div className="h-10" />

                        <div className="px-6 pb-6 space-y-8">

                          {/* Store Info */}
                          <div>
                            <p className="text-[10px] font-black text-[#6C4CF1] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-2"><Store className="w-3.5 h-3.5" /> Store Information</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div><label className={labelCls}>Shop Name *</label><input value={shopName} onChange={e => setShopName(e.target.value)} className={inputCls} placeholder="e.g. Sharma General Store" /></div>
                              <div><label className={labelCls}>Owner Name *</label><input value={ownerName} onChange={e => setOwnerName(e.target.value)} className={inputCls} placeholder="e.g. Ramesh Sharma" /></div>
                              <div><label className={labelCls}>Email</label><input value={email} disabled className={inputCls + ' opacity-50 cursor-not-allowed'} /></div>
                              <div><label className={labelCls}>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" /></div>
                            </div>
                          </div>

                          {/* Operations Details */}
                          <div>
                            <p className="text-[10px] font-black text-[#6C4CF1] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-2"><Clock className="w-3.5 h-3.5" /> Shop Hours</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className={labelCls}>Opening Time</label>
                                <input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Closing Time</label>
                                <input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className={inputCls} />
                              </div>
                            </div>
                          </div>

                          {/* Shop Category */}
                          {categories.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black text-[#6C4CF1] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-2"><Tag className="w-3.5 h-3.5" /> Shop Category</p>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-semibold flex items-center justify-between text-gray-800 dark:text-white"
                                >
                                  <span>
                                    {categories.find(cat => String(cat.id) === String(shopCategoryId))?.shopCategoryName || 'Select Category'}
                                  </span>
                                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                  {isCategoryDropdownOpen && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)} />
                                      <motion.ul
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto list-none p-2 space-y-1"
                                      >
                                        {categories.map(cat => {
                                          const isSelected = String(shopCategoryId) === String(cat.id)
                                          return (
                                            <li key={cat.id}>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setShopCategoryId(cat.id)
                                                  setIsCategoryDropdownOpen(false)
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-between border-none bg-transparent cursor-pointer ${isSelected
                                                    ? 'bg-purple-50 dark:bg-purple-950/20 text-[#6C4CF1]'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                  }`}
                                              >
                                                <span>{cat.shopCategoryName}</span>
                                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CF1]" />}
                                              </button>
                                            </li>
                                          )
                                        })}
                                      </motion.ul>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}

                          {/* Address Info */}
                          <div>
                            <p className="text-[10px] font-black text-[#6C4CF1] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-2"><MapPin className="w-3.5 h-3.5" /> Shop Address & Location</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                              <div><label className={labelCls}>City</label><input value={city} onChange={e => setCity(e.target.value)} className={inputCls} placeholder="City name" /></div>
                              <div><label className={labelCls}>State</label><input value={state} onChange={e => setState(e.target.value)} className={inputCls} placeholder="State name" /></div>
                              <div><label className={labelCls}>Pincode</label><input value={pincode} onChange={e => setPincode(e.target.value)} className={inputCls} placeholder="6-digit PIN" /></div>
                            </div>
                          </div>

                        </div>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* Notifications Tab (Commented Out) */}
                {/*
                activeTab === 'notifications' && (
                  <motion.div key="notifications" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-lg text-gray-900 dark:text-white">Notifications</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Control which alerts you receive</p>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">Allow Notifications</p>
                            <p className="text-xs text-gray-400 mt-0.5">Receive real-time order alerts and updates</p>
                          </div>
                          <button onClick={handleToggleNotification} className={`relative w-12 h-6 rounded-full transition-all cursor-pointer border-none ${allowNotification ? 'bg-[#6C4CF1]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${allowNotification ? 'left-6' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
                */}

                {/* Order Settings Tab */}
                {activeTab === 'order-settings' && (
                  <motion.div key="order-settings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                    <form onSubmit={handleSaveOrderSettings} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                          <h2 className="font-black text-lg text-gray-900 dark:text-white">Order Settings</h2>
                          <p className="text-xs text-gray-400 mt-0.5">Configure acceptance range and delivery fees</p>
                        </div>
                        <button type="submit" disabled={savingOrderSettings} className="flex items-center gap-2 px-5 py-2.5 bg-[#6C4CF1] hover:bg-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer border-none shadow-md shadow-purple-600/20">
                          <Save className="w-3.5 h-3.5" /> {savingOrderSettings ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className={labelCls}>Order Acceptance Range (KM)</label>
                            <input
                              type="number"
                              value={orderAcceptanceRange}
                              onChange={e => setOrderAcceptanceRange(e.target.value)}
                              className={inputCls}
                              placeholder="e.g. 5"
                              required
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Delivery Charge Per KM (₹)</label>
                            <input
                              type="number"
                              value={deliveryChargePerKm}
                              onChange={e => setDeliveryChargePerKm(e.target.value)}
                              className={inputCls}
                              placeholder="e.g. 30"
                              required
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Free Delivery Range (KM)</label>
                            <input
                              type="number"
                              value={freeDeliveryKm}
                              onChange={e => setFreeDeliveryKm(e.target.value)}
                              className={inputCls}
                              placeholder="e.g. 1"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Theme Tab */}
                {activeTab === 'theme' && (
                  <motion.div key="theme" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-lg text-gray-900 dark:text-white">Appearance</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Choose your preferred theme</p>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Light Mode', icon: Sun, dark: false, desc: 'Clean and bright interface' },
                            { label: 'Dark Mode', icon: Moon, dark: true, desc: 'Easy on the eyes at night' },
                          ].map(({ label, icon: Icon, dark, desc }) => (
                            <button key={label} onClick={() => { if (isDarkMode !== dark) toggleDarkMode() }} className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${isDarkMode === dark ? 'border-[#6C4CF1] bg-purple-50 dark:bg-purple-950/20' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${isDarkMode === dark ? 'bg-[#6C4CF1]' : 'bg-white dark:bg-gray-700'}`}>
                                <Icon className={`w-5 h-5 ${isDarkMode === dark ? 'text-white' : 'text-gray-400'}`} />
                              </div>
                              <p className="font-extrabold text-sm text-gray-900 dark:text-white">{label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                              {isDarkMode === dark && <span className="mt-2 inline-block px-2 py-0.5 bg-[#6C4CF1] text-white text-[9px] font-black uppercase rounded-full">Active</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default VendorSettings
