import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  MapPin,
  ChevronDown,
  Store,
  Settings,
  LogOut,
  Bell,
  Package,
} from 'lucide-react'
import logo from '../../assets/nearzo-logo.png'
import dummyUserImage from '../../assets/images/dummyUserImage.jpg'
import dummyProduct from '../../assets/images/dummyProduct.jpg'
import dummyBanner from '../../assets/images/dummy-banner.jpg'
import { authService } from '../../services/authService'
import { searchService } from '../../services/searchService'

const getAvatarUrl = (avatar) => {
  if (!avatar) return dummyUserImage;
  if (avatar.startsWith('http')) return avatar;
  const baseUrl = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com/';
  return `${baseUrl.replace(/\/$/, '')}/${avatar.replace(/^\//, '')}`;
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [searchType, setSearchType] = useState('products')
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false)
  const [manualLocation, setManualLocation] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [applying, setApplying] = useState(false)
  const { cartCount, searchQuery, setSearchQuery, setIsCartOpen, user, setUser, updateCoordinates, isMobileSearchOpen, setIsMobileSearchOpen, primaryLocation, secondaryLocation, updateLocation } = useApp()
  const navigate = useNavigate()

  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order Confirmed',
      body: 'Your order #NZ-8395 has been successfully confirmed by the vendor!',
      time: '10 mins ago',
      unread: true
    },
    {
      id: 2,
      type: 'order',
      title: 'Order Dispatched',
      body: 'Great news! Your recent order #NZ-5498 has been dispatched and is on its way.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'promo',
      title: 'Weekend Special Offer',
      body: 'Exclusive: Get 20% off on fresh organic fruits this weekend! Use code FRUIT20.',
      time: '1 day ago',
      unread: false
    }
  ])

  const unreadCount = notificationsList.filter(n => n.unread).length

  const handleMarkAllRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const handleNotificationClick = (id) => {
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true)
        setShowSuggestions(true)
        try {
          const data = await searchService.search(searchQuery, searchType)
          if (data && Array.isArray(data.results)) {
            setSuggestions(data.results)
          } else {
            setSuggestions([])
          }
        } catch (error) {
          console.error('Search error:', error)
          setSuggestions([])
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, searchType])

  const handleSuggestionClick = (item) => {
    setSearchQuery('')
    setShowSuggestions(false)
    if (searchType === 'products') {
      navigate(`/product/${item.id}`)
    } else {
      navigate(`/shop/${item.id}`)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setLoginDropdownOpen(false)
    navigate('/')
  }

  const fetchLocation = () => {
    setDetecting(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            updateCoordinates(latitude, longitude)
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await res.json()
            if (data && data.address) {
              const primary = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.town || data.address.city || 'Location Found'
              updateLocation(primary, data.display_name || 'Details not available')
              setLocationModalOpen(false)
            }
          } catch (error) {
            console.error('Error fetching location details:', error)
          } finally {
            setDetecting(false)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setDetecting(false)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    } else {
      setDetecting(false)
    }
  }

  useEffect(() => {
    if (primaryLocation === 'Delivering to') {
      fetchLocation()
    }
  }, [])

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault()
    if (manualLocation.trim()) {
      setApplying(true)
      try {
        const query = encodeURIComponent(manualLocation.trim())
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        const data = await res.json()

        if (data && data.length > 0) {
          const { lat, lon, display_name, name } = data[0]
          updateCoordinates(parseFloat(lat), parseFloat(lon))

          const parts = display_name.split(', ')
          const primary = name || parts[0]
          const secondary = parts.length > 1 ? parts.slice(1).join(', ') : 'Custom Location'
          updateLocation(primary, secondary)
          setLocationModalOpen(false)
          setManualLocation('')
        } else {
          alert('Location not found. Please try another city or area.')
        }
      } catch (error) {
        console.error('Error finding manual location:', error)
        alert('Could not search location right now.')
      } finally {
        setApplying(false)
      }
    }
  }

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '#categories' },
    { label: 'Products', path: '#products' },
    { label: 'Offers', path: '#offers' },
    { label: 'About', path: '#about' },
  ]

  const searchBarContent = (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative w-full flex items-center bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all duration-300"
    >
      {/* Search Type Selector */}
      <div className="relative h-full flex items-center border-r border-gray-200 dark:border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors bg-transparent outline-none rounded-l-xl"
        >
          {searchType === 'products' ? 'Products' : 'Shops'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${searchTypeDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {searchTypeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSearchTypeDropdownOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-900 rounded-xl p-1.5 z-50 shadow-2xl border border-gray-100 dark:border-white/10"
              >
                <button
                  onClick={() => { setSearchType('products'); setSearchTypeDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${searchType === 'products' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  Products
                </button>
                <button
                  onClick={() => { setSearchType('shops'); setSearchTypeDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${searchType === 'shops' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  Shops
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
      <input
        type="text"
        placeholder={searchType === 'products' ? "Search fresh groceries..." : "Search local shops..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => { if (searchQuery.trim().length >= 2) setShowSuggestions(true) }}
        className="ml-2 bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full py-2.5 pr-4"
      />

      {/* Suggestions Dropdown Container */}
      <AnimatePresence>
        {showSuggestions && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowSuggestions(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-40 max-h-[380px] overflow-y-auto"
            >
              {searchLoading ? (
                <div className="flex items-center justify-center gap-3 py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold tracking-wide">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-2 divide-y divide-gray-50 dark:divide-white/5">
                  {suggestions.map((item) => {
                    const isProduct = searchType === 'products'
                    const name = isProduct
                      ? (item.name || item.Product?.name || 'Product')
                      : (item.shopName || item.name || 'Store')

                    const imagePath = isProduct
                      ? (item.primaryImage || item.Product?.primaryImage || item.image)
                      : (item.logo || item.banner || item.image)

                    const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
                    const imageUrl = imagePath
                      ? (imagePath.startsWith('http') ? imagePath : `${baseUrlForImage}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`)
                      : (isProduct ? dummyProduct : dummyBanner)

                    const categoryName = isProduct
                      ? (item.categoryName || item.Product?.categoryName || 'Groceries')
                      : (item.ShopCategory?.shopCategoryName || item.shopCategoryName || 'Store')

                    const shopName = isProduct
                      ? (item.shopName || item.Vendor?.shopName || item.shop?.shopName || '')
                      : ''

                    const price = isProduct
                      ? (item.discountPrice || item.price || item.Product?.price)
                      : null

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        className="flex items-center gap-4 p-3 hover:bg-purple-50/50 dark:hover:bg-purple-500/10 cursor-pointer transition-colors rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800">
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = isProduct ? dummyProduct : dummyBanner;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold truncate mt-0.5">
                            {categoryName} {shopName && `• ${shopName}`} {price !== null && `• ₹${price}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm font-bold">No results found</p>
                  <p className="text-xs mt-1">Try searching with a different keyword</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )

  const locationSelectorContent = (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setLocationModalOpen(!locationModalOpen)}
        className="flex items-center justify-between gap-1.5 cursor-pointer px-3 sm:px-2 py-2 md:py-1 group bg-gray-100 md:bg-transparent dark:bg-white/5 md:dark:bg-transparent rounded-xl md:rounded-none border md:border-none border-gray-200 dark:border-white/10"
      >
        <div className="flex flex-col max-w-[180px] md:max-w-[120px] lg:max-w-[140px]">
          <span className="text-[13px] sm:text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight truncate group-hover:text-primary transition-colors">{primaryLocation}</span>
          <span className="text-[10px] sm:text-[12px] text-gray-500 font-medium truncate">{secondaryLocation}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform duration-300 ${locationModalOpen ? 'rotate-180' : ''}`} />
      </motion.div>

      {/* Location Dropdown */}
      <AnimatePresence>
        {locationModalOpen && (
          <>
            {/* Invisible overlay to close dropdown when clicking outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setLocationModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:mt-3 md:-left-14 sm:w-[360px] md:w-[300px] bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 z-50 shadow-2xl border border-gray-100 dark:border-white/10"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Choose your location</h3>

              <button
                onClick={fetchLocation}
                disabled={detecting}
                className="w-full flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 p-3 rounded-xl font-semibold mb-4 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-70 text-sm"
              >
                <MapPin className="w-4 h-4" />
                {detecting ? 'Detecting location...' : 'Detect my current location'}
              </button>

              <div className="relative flex items-center py-2 mb-4">
                <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">OR</span>
                <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
              </div>

              <form onSubmit={handleManualLocationSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your city or area"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="flex-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 dark:text-white text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={applying}
                  className="bg-purple-600 text-white px-5 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm disabled:opacity-70 flex items-center justify-center min-w-[75px]"
                >
                  {applying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Apply'
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || mobileOpen
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-white md:bg-transparent'
          }`}
      >
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3 md:gap-6">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center cursor-pointer shrink-0"
            >
              <img src={logo} alt="Nearzo Logo" className="h-8 sm:h-12 object-contain" />
            </motion.div>

            {/* Desktop Location Selector */}
            <div className="hidden md:block relative shrink-0">
              {locationSelectorContent}
            </div>

            {/* Mobile Header Location Selector */}
            <div className="md:hidden flex-grow max-w-[260px] sm:max-w-xs relative shrink-0">
              {locationSelectorContent}
            </div>

            {/* Desktop-only Search Bar */}
            <div className="hidden md:block flex-1 w-full max-w-3xl">
              {searchBarContent}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* Notifications (Mobile & Desktop) */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-500/10 dark:hover:border-purple-500/30 transition-all duration-300"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40">
                      {unreadCount}
                    </span>
                  )}
                </motion.button>

                {/* Notifications Dropdown / Bottom Sheet */}
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      {/* Backdrop for closing */}
                      <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity"
                        onClick={() => setShowNotifications(false)}
                      />

                      {/* Desktop Dropdown (md:block hidden) */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="hidden md:block absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        style={{ right: '0px' }}
                      >
                        <div className="p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-purple-600" />
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-transparent border-none outline-none cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                          {notificationsList.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                              No notifications yet
                            </div>
                          ) : (
                            notificationsList.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id)}
                                className={`p-3 rounded-2xl transition-all cursor-pointer flex gap-3 ${
                                  notif.unread
                                    ? 'bg-purple-50/50 dark:bg-purple-500/5 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                                    : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                                  {notif.type === 'order' ? <Package className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                      {notif.title}
                                    </span>
                                    {notif.unread && (
                                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal text-left">
                                    {notif.body}
                                  </p>
                                  <span className="text-[9px] text-gray-400 mt-2 block font-medium text-left">
                                    {notif.time}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>

                      {/* Mobile Bottom Sheet (md:hidden) */}
                      <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[32px] border-t border-gray-100 dark:border-white/5 z-50 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
                      >
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto my-3 shrink-0" />

                        <div className="px-6 pb-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-600" />
                            <span className="font-extrabold text-base text-gray-900 dark:text-white">Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs font-bold text-purple-600 bg-transparent border-none outline-none cursor-pointer"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto custom-scrollbar p-4 space-y-2 flex-1">
                          {notificationsList.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                              No notifications yet
                            </div>
                          ) : (
                            notificationsList.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id)}
                                className={`p-4 rounded-2xl transition-all flex gap-3 text-left ${
                                  notif.unread
                                    ? 'bg-purple-50/50 dark:bg-purple-500/5'
                                    : 'bg-gray-50/30 dark:bg-white/5'
                                }`}
                              >
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                                  {notif.type === 'order' ? <Package className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                                      {notif.title}
                                    </span>
                                    {notif.unread && (
                                      <span className="w-2 h-2 bg-purple-600 rounded-full shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    {notif.body}
                                  </p>
                                  <span className="text-[9px] text-gray-400 mt-2 block font-bold">
                                    {notif.time}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              {!user && (
                <button
                  className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}

              {/* Cart (Desktop Only) */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="hidden md:flex relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-primary-10 hover:border-primary transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Auth / Profile Dropdown */}
              <div className="relative hidden md:block">
                {user ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 dark:border-white/10">
                        <img
                          src={getAvatarUrl(user.avatar)}
                          alt={user.name}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = dummyUserImage }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                        {user.name}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {loginDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setLoginDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl p-2 z-50 shadow-2xl border border-gray-100 dark:border-white/10"
                          >
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <button
                              onClick={() => { setLoginDropdownOpen(false); navigate('/profile') }}
                              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                            >
                              <User className="w-4 h-4 text-gray-500" />
                              My Profile
                            </button>
                            <button
                              onClick={() => { setLoginDropdownOpen(false); navigate('/settings') }}
                              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                            >
                              <Settings className="w-4 h-4 text-gray-500" />
                              Settings
                            </button>
                            <button
                              onClick={handleLogout}
                              className="w-full mt-1 text-left px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium text-red-600 dark:text-red-400 transition-colors flex items-center gap-2"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      Login
                      <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-300 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {loginDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setLoginDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-gray-900 rounded-2xl p-2 z-50 shadow-2xl border border-gray-100 dark:border-white/10"
                          >
                            <button
                              onClick={() => { setLoginDropdownOpen(false); navigate('/login?role=user') }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                            >
                              <User className="w-4 h-4 text-primary" />
                              Login as User
                            </button>
                            <button
                              onClick={() => { setLoginDropdownOpen(false); navigate('/vendor/login') }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                            >
                              <Store className="w-4 h-4 text-orange-500" />
                              Login as Vendor
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Search Fullscreen Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
              <button
                onClick={() => { setIsMobileSearchOpen(false); setSearchQuery('') }}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>

              {/* Enhanced Search Input */}
              <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all duration-300">
                {/* Search Type Selector (Inline mini) */}
                <div className="relative h-full flex items-center border-r border-gray-200 dark:border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 bg-transparent outline-none rounded-l-xl"
                  >
                    {searchType === 'products' ? 'Products' : 'Shops'}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${searchTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {searchTypeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setSearchTypeDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-1 w-28 bg-white dark:bg-gray-900 rounded-xl p-1 z-50 shadow-xl border border-gray-100 dark:border-white/10"
                        >
                          <button
                            onClick={() => { setSearchType('products'); setSearchTypeDropdownOpen(false) }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${searchType === 'products' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                            Products
                          </button>
                          <button
                            onClick={() => { setSearchType('shops'); setSearchTypeDropdownOpen(false) }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${searchType === 'shops' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                            Shops
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <Search className="w-4 h-4 text-gray-400 ml-2.5 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchType === 'products' ? "Search fresh groceries..." : "Search local shops..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full py-2 pr-3"
                />
              </div>
            </div>

            {/* Suggestions / Results area */}
            <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 pb-safe">
              {searchQuery.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                  <Search className="w-12 h-12 stroke-[1.5] mb-3 text-purple-400" />
                  <p className="text-sm font-bold">What are you looking for?</p>
                  <p className="text-xs text-gray-400 mt-1">Search fresh groceries, store name, or categories</p>
                </div>
              ) : searchLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-sm font-semibold">Searching the market...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5 overflow-hidden">
                  {suggestions.map((item) => {
                    const isProduct = searchType === 'products'
                    const name = isProduct
                      ? (item.name || item.Product?.name || 'Product')
                      : (item.shopName || item.name || 'Store')

                    const imagePath = isProduct
                      ? (item.primaryImage || item.Product?.primaryImage || item.image)
                      : (item.logo || item.banner || item.image)

                    const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
                    const imageUrl = imagePath
                      ? (imagePath.startsWith('http') ? imagePath : `${baseUrlForImage}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`)
                      : (isProduct ? dummyProduct : dummyBanner)

                    const categoryName = isProduct
                      ? (item.categoryName || item.Product?.categoryName || 'Groceries')
                      : (item.ShopCategory?.shopCategoryName || item.shopCategoryName || 'Store')

                    const shopName = isProduct
                      ? (item.shopName || item.Vendor?.shopName || item.shop?.shopName || '')
                      : ''

                    const price = isProduct
                      ? (item.discountPrice || item.price || item.Product?.price)
                      : null

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setIsMobileSearchOpen(false)
                          handleSuggestionClick(item)
                        }}
                        className="flex items-center gap-4 p-3.5 hover:bg-purple-50/50 dark:hover:bg-purple-500/10 cursor-pointer transition-colors active:bg-gray-50 dark:active:bg-white/5"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800">
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = isProduct ? dummyProduct : dummyBanner;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold truncate mt-1">
                            {categoryName} {shopName && `• ${shopName}`} {price !== null && `• ₹${price}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                  <p className="text-sm font-bold">No matches found</p>
                  <p className="text-xs mt-1">Check spelling or search for another keyword</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col shadow-2xl border-l border-gray-200 dark:border-white/10"
            >
              <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800 dark:text-white">Account</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                {!user ? (
                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={() => { setMobileOpen(false); navigate('/login?role=user') }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white btn-primary shadow-md"
                    >
                      <User className="w-4 h-4" />
                      Login as User
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate('/vendor/login') }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 transition-colors"
                    >
                      <Store className="w-4 h-4" />
                      Login as Vendor
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-2">Welcome, {user.name}!</p>
                    <p className="text-sm">Manage your profile from the bottom navigation.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar