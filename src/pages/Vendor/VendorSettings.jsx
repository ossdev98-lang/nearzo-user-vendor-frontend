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

          setLogo(profile.logo || '')
          setBanner(profile.banner || '')
          setOpeningTime(profile.openingTime || '')
          setClosingTime(profile.closingTime || '')
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
      formDataToSend.append('openingTime', openingTime)
      formDataToSend.append('closingTime', closingTime)
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
      <div>
        <h1 className="text-center text-3xl font-bold text-purple-600">Settings Page</h1>
      </div>

    </div>
  )
}

export default VendorSettings
