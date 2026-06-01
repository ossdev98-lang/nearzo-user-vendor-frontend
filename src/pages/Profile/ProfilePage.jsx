import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { authService } from '../../services/authService'
import { userService } from '../../services/userService'
import { orderService } from '../../services/orderService'
import { useNavigate, useParams } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Edit3, Camera,
  ShoppingBag, Heart, CreditCard, Settings, LogOut, ChevronRight,
  Package, CheckCircle, Bell, Shield, X, Navigation, Lock, Trash2, Moon
} from 'lucide-react'
import toast from 'react-hot-toast'
import dummyUserImage from '../../assets/images/dummyUserImage.jpg'
import API from '../../services/api'

const getAvatarUrl = (avatar) => {
  if (!avatar) return dummyUserImage;
  if (avatar.startsWith('http')) return avatar;
  const baseUrl = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com/';
  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${avatar.replace(/^\//, '')}`;
  console.log('Generated Avatar URL:', fullUrl);
  return fullUrl;
}

const ProfilePage = () => {
  const { user, setUser, updateCoordinates, updateLocation, coordinates, isDarkMode, toggleDarkMode } = useApp()
  const navigate = useNavigate()
  const { tabId } = useParams()
  const tabQuery = tabId || 'personal'

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(tabQuery)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [orderFilter, setOrderFilter] = useState('30days')

  useEffect(() => {
    if (tabQuery !== activeTab) {
      setActiveTab(tabQuery)
    }
  }, [tabQuery])

  const handleTabChange = (newTabId) => {
    setActiveTab(newTabId)
    window.history.pushState(null, '', `/profile/${newTabId}`)
  }

  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/')
      const currentTab = pathParts.length > 2 ? pathParts[2] : 'personal'
      setActiveTab(currentTab)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [addressLabel, setAddressLabel] = useState('Home')
  const [otherAddressName, setOtherAddressName] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [addressDetails, setAddressDetails] = useState({
    city: '', state: '', pincode: '', latitude: null, longitude: null
  })
  const [addresses, setAddresses] = useState([])
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [showFormFields, setShowFormFields] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const mapRef = useRef(null)
  const leafletMapInstanceRef = useRef(null)
  const markerInstanceRef = useRef(null)
  const [mapSearchQuery, setMapSearchQuery] = useState('')
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)

  const handleSearchLocation = async () => {
    if (!mapSearchQuery.trim()) return
    setIsSearchingLocation(true)
    const toastId = toast.loading('Searching for location...')
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`)
      const results = await response.json()
      if (results && results.length > 0) {
        const firstResult = results[0]
        const lat = parseFloat(firstResult.lat)
        const lon = parseFloat(firstResult.lon)

        if (leafletMapInstanceRef.current && markerInstanceRef.current) {
          leafletMapInstanceRef.current.setView([lat, lon], 15)
          markerInstanceRef.current.setLatLng([lat, lon])
        }

        setNewAddress(firstResult.display_name)
        
        const reverseResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        const reverseData = await reverseResponse.json()
        
        setAddressDetails({
          city: reverseData.address?.city || reverseData.address?.town || reverseData.address?.county || '',
          state: reverseData.address?.state || '',
          pincode: reverseData.address?.postcode || '',
          latitude: lat,
          longitude: lon
        })

        updateCoordinates(lat, lon)
        toast.success('Location found!', { id: toastId })
      } else {
        toast.error('Location not found. Please try a different query.', { id: toastId })
      }
    } catch (err) {
      console.error('Failed to search location:', err)
      toast.error('Failed to search location. Please try again.', { id: toastId })
    } finally {
      setIsSearchingLocation(false)
    }
  }

  useEffect(() => {
    if (!isMapOpen) {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove()
        leafletMapInstanceRef.current = null
        markerInstanceRef.current = null
      }
      return
    }

    const loadLeafletAndInitMap = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      if (!mapRef.current) return

      const defaultLat = addressDetails.latitude || coordinates?.latitude || 22.760287481529783
      const defaultLng = addressDetails.longitude || coordinates?.longitude || 75.90990165620354

      const L = window.L
      
      // Clear any existing map on the element before initializing
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove()
      }

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 15)
      leafletMapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)

      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      L.Marker.prototype.options.icon = DefaultIcon

      const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)
      markerInstanceRef.current = marker

      const handleLocationSelect = async (lat, lng) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          const data = await response.json()
          if (data && data.display_name) {
            setNewAddress(data.display_name)
            setAddressDetails({
              city: data.address?.city || data.address?.town || data.address?.county || '',
              state: data.address?.state || '',
              pincode: data.address?.postcode || '',
              latitude: lat,
              longitude: lng
            })
            updateCoordinates(lat, lng)
          }
        } catch (err) {
          console.error('Failed to reverse-geocode map position:', err)
        }
      }

      marker.on('dragend', () => {
        const position = marker.getLatLng()
        handleLocationSelect(position.lat, position.lng)
      })

      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        handleLocationSelect(lat, lng)
      })

      setTimeout(() => {
        map.invalidateSize()
      }, 200)
    }

    loadLeafletAndInitMap()

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove()
        leafletMapInstanceRef.current = null
        markerInstanceRef.current = null
      }
    }
  }, [isMapOpen])

  // Address Delete States
  const [addressToDelete, setAddressToDelete] = useState(null)
  const [isDeletingAddress, setIsDeletingAddress] = useState(false)

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const avatarInputRef = useRef(null)

  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    const toastId = toast.loading('Detecting your location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await response.json()
          if (data && data.display_name) {
            setNewAddress(data.display_name)
            setAddressDetails({
              city: data.address?.city || data.address?.town || data.address?.county || '',
              state: data.address?.state || '',
              pincode: data.address?.postcode || '',
              latitude: latitude,
              longitude: longitude
            })
            // Update active session coordinates in AppContext and sync to backend
            updateCoordinates(latitude, longitude)
            setShowFormFields(true)
            toast.success('Location fetched successfully!', { id: toastId })
          }
        } catch (err) {
          toast.error('Failed to get address from location', { id: toastId })
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        toast.error('Permission denied or failed to fetch location', { id: toastId })
        setIsLocating(false)
      }
    )
  }

  const handleSaveAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Please enter an address')
      return
    }

    setIsSavingAddress(true)
    const toastId = toast.loading('Saving address...')

    try {
      let type = 'home'
      if (addressLabel === 'Work') type = 'office'
      else if (addressLabel === 'Other') type = 'other'

      const payload = {
        address: newAddress,
        city: addressDetails.city || '',
        state: addressDetails.state || '',
        pincode: addressDetails.pincode || '',
        latitude: localStorage.getItem('user_latitude') || '',
        longitude: localStorage.getItem('user_longitude') || '',
        addressType: type
      }

      if (type === 'other') {
        payload.otherAddress = otherAddressName || 'Other'
      }

      if (editingAddressId) {
        await userService.updateAddress(editingAddressId, payload)
      } else {
        await userService.addAddress(payload)
      }

      // Refetch addresses
      try {
        const data = await userService.getAddresses()
        if (data && data.addresses) setAddresses(data.addresses)
        else if (Array.isArray(data)) setAddresses(data)
      } catch (err) {
        console.error('Failed to refetch addresses:', err)
      }

      toast.success(editingAddressId ? 'Address updated successfully!' : 'Address saved successfully!', { id: toastId })
      setShowAddressModal(false)
      setNewAddress('')
      setAddressDetails({ city: '', state: '', pincode: '', latitude: null, longitude: null })
      setEditingAddressId(null)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to save address', { id: toastId })
    } finally {
      setIsSavingAddress(false)
    }
  }

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return

    setIsDeletingAddress(true)
    const toastId = toast.loading('Deleting address...')
    try {
      await userService.deleteAddress(addressToDelete)

      // Refetch addresses
      const data = await userService.getAddresses()
      if (data && data.addresses) setAddresses(data.addresses)
      else if (Array.isArray(data)) setAddresses(data)
      else setAddresses([])

      toast.success('Address deleted successfully!', { id: toastId })
      setAddressToDelete(null)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to delete address', { id: toastId })
    } finally {
      setIsDeletingAddress(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all password fields')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsChangingPassword(true)
    const toastId = toast.loading('Changing password...')
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword)
      toast.success('Password changed successfully!', { id: toastId })
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to change password', { id: toastId })
    } finally {
      setIsChangingPassword(false)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile()
        const data = response.user || response.data || response
        setProfileData(data)

        if (data && (!user || user.name !== data.name)) {
          setUser({ ...user, ...data })
          localStorage.setItem('user', JSON.stringify({ ...user, ...data }))
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    const fetchAddresses = async () => {
      try {
        const data = await userService.getAddresses()
        if (data && data.addresses) {
          setAddresses(data.addresses)
        } else if (Array.isArray(data)) {
          setAddresses(data)
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
      }
    }

    fetchProfile()
    fetchAddresses()
  }, [])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await orderService.getMyOrders()
      let allOrders = []
      if (data) {
        if (Array.isArray(data.pendingOrders)) allOrders = allOrders.concat(data.pendingOrders)
        if (Array.isArray(data.confirmedOrders)) allOrders = allOrders.concat(data.confirmedOrders)
        if (Array.isArray(data.processingOrders)) allOrders = allOrders.concat(data.processingOrders)
        if (Array.isArray(data.deliveredOrders)) allOrders = allOrders.concat(data.deliveredOrders)
        if (Array.isArray(data.cancelledOrders)) allOrders = allOrders.concat(data.cancelledOrders)

        if (allOrders.length === 0) {
          if (data.orders && Array.isArray(data.orders)) allOrders = data.orders
          else if (Array.isArray(data)) allOrders = data
          else if (data.data && Array.isArray(data.data)) allOrders = data.data
        }
      }
      allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      setOrders(allOrders)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    const toastId = toast.loading('Uploading photo...')
    try {
      const response = await authService.updateProfile(formData)
      const newUserData = response.user || response
      setProfileData(newUserData)
      if (user) {
        setUser({ ...user, ...newUserData })
        localStorage.setItem('user', JSON.stringify({ ...user, ...newUserData }))
      }
      toast.success('Photo updated successfully!', { id: toastId })
    } catch (error) {
      toast.error('Failed to update photo', { id: toastId })
    }
  }

  const handleSaveProfile = async () => {
    if (!editProfileForm.name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    const toastId = toast.loading('Saving profile...')
    setIsSavingProfile(true)
    try {
      const response = await authService.updateProfile(editProfileForm)
      const newUserData = response.user || response
      setProfileData(newUserData)
      if (user) {
        setUser({ ...user, ...newUserData })
        localStorage.setItem('user', JSON.stringify({ ...user, ...newUserData }))
      }
      setIsEditingProfile(false)
      toast.success('Profile updated successfully!', { id: toastId })
    } catch (error) {
      toast.error(error.message || 'Failed to update profile', { id: toastId })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const startEditingProfile = () => {
    setEditProfileForm({
      name: profileData?.name || '',
      phone: profileData?.phone || ''
    })
    setIsEditingProfile(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-purple-400 animate-spin-reverse"></div>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 max-w-md">{error || "We couldn't load your profile data."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
        >
          Try Again
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Account</h1>
          <p className="text-gray-500 mt-1">Manage your profile, orders, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden sticky top-28"
            >
              {/* Profile Overview (Sidebar Header) */}
              <div className="p-6 text-center border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-900">
                <div className="relative inline-block mb-4 group cursor-pointer">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-600 to-purple-400">
                    <img
                      src={getAvatarUrl(profileData.avatar)}
                      alt={profileData.name}
                      crossOrigin="anonymous"
                      className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900"
                      onError={(e) => { e.target.src = dummyUserImage }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{profileData.name}</h2>
              </div>

              {/* Navigation Menu */}
              <div className="p-3">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-1 transition-all duration-300 ${isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-purple-600 dark:hover:text-purple-400'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="font-semibold text-sm">{tab.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                    </button>
                  )
                })}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden">

                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Review and update your personal details.</p>
                      </div>

                      {isEditingProfile ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            disabled={isSavingProfile}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-70"
                          >
                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={startEditingProfile}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-white rounded-xl text-sm font-bold transition-all shrink-0"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Detail Item */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Full Name
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editProfileForm.name}
                              onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                              className="w-full p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-500/30 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              placeholder="Enter your name"
                            />
                          ) : (
                            <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-sm font-semibold text-gray-900 dark:text-white">
                              {profileData.name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email Address
                          </label>
                          <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-sm font-semibold text-gray-400 dark:text-gray-500 truncate cursor-not-allowed" title="Email cannot be changed">
                            {profileData.email}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> Phone Number
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editProfileForm.phone}
                              onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                              className="w-full p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-500/30 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-sm font-semibold text-gray-900 dark:text-white">
                              {profileData.phone || 'Not provided'}
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your delivery addresses for quick checkout.</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingAddressId(null)
                          setNewAddress('')
                          setAddressLabel('Home')
                          setAddressDetails({ city: '', state: '', pincode: '', latitude: null, longitude: null })
                          setShowFormFields(false)
                          setShowAddressModal(true)
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all shrink-0"
                      >
                        <MapPin className="w-4 h-4" />
                        Add New Address
                      </button>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4">
                      {addresses.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No address added yet. Please click "Add New Address" to set up a delivery location.
                        </p>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr.id} className="bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-2xl p-5 border border-purple-600/30 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                    {addr.addressType === 'office' ? 'Work' : addr.addressType === 'other' ? (addr.otherAddress || 'Other') : addr.addressType || 'Home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-600 text-[10px] font-bold uppercase">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      localStorage.setItem('selectedAddressId', addr.id)

                                      // Dynamically update coordinates
                                      if (addr.latitude && addr.longitude) {
                                        updateCoordinates(parseFloat(addr.latitude), parseFloat(addr.longitude))
                                      }

                                      // Dynamically update primary and secondary location text in header
                                      const label = addr.addressType === 'office' ? 'Work' : addr.addressType === 'other' ? (addr.otherAddress || 'Other') : addr.addressType || 'Home'
                                      const addressShort = addr.address?.length > 30 ? addr.address.substring(0, 30) + '...' : addr.address
                                      updateLocation(label, addressShort || addr.city || 'Your area')

                                      toast.success('Address selected for delivery')
                                      navigate('/checkout')
                                    }}
                                    className="text-sm font-bold text-green-600 hover:text-green-700"
                                  >
                                    Select
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAddressId(addr.id)
                                      setNewAddress(addr.address || '')
                                      setAddressLabel(addr.addressType === 'office' ? 'Work' : 'Home')
                                      setAddressDetails({
                                        city: addr.city || '',
                                        state: addr.state || '',
                                        pincode: addr.pincode || '',
                                        latitude: addr.latitude || null,
                                        longitude: addr.longitude || null
                                      })
                                      setShowFormFields(true)
                                      setShowAddressModal(true)
                                    }}
                                    className="text-sm font-bold text-purple-600 hover:text-purple-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setAddressToDelete(addr.id)}
                                    className="text-sm font-bold text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    title="Delete Address"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-2">
                                {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                        <p className="text-sm text-gray-500 mt-1">Track, return, or buy things again.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Filter:</label>
                        <select
                          value={orderFilter}
                          onChange={(e) => setOrderFilter(e.target.value)}
                          className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-600 transition-all cursor-pointer"
                        >
                          <option value="30days">Last 30 Days</option>
                          <option value="6months">Last 6 Months</option>
                          <option value="1year">Last 1 Year</option>
                          <option value="all">All Orders</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 space-y-6">
                      {loadingOrders ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-10 h-10 rounded-full border-t-2 border-purple-600 animate-spin mb-3"></div>
                          <p className="text-sm text-gray-500">Loading your orders...</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No orders yet</h3>
                          <p className="text-sm text-gray-500 max-w-sm mb-6">Looks like you haven't placed an order yet. Start exploring our shops today!</p>
                          <button
                            onClick={() => navigate('/')}
                            className="px-5 py-2.5 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white text-sm font-bold rounded-xl transition-all shadow-md"
                          >
                            Start Shopping
                          </button>
                        </div>
                      ) : orders.filter((order) => {
                        if (orderFilter === 'all') return true
                        const orderDate = new Date(order.createdAt || order.date || Date.now())
                        const now = new Date()
                        const diffTime = Math.abs(now - orderDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        if (orderFilter === '30days') return diffDays <= 30
                        if (orderFilter === '6months') return diffDays <= 180
                        if (orderFilter === '1year') return diffDays <= 365
                        return true
                      }).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No orders in this period</h3>
                          <p className="text-sm text-gray-500 max-w-sm mb-6">Try selecting a different filter range to see your older orders.</p>
                        </div>
                      ) : (
                        orders.filter((order) => {
                          if (orderFilter === 'all') return true
                          const orderDate = new Date(order.createdAt || order.date || Date.now())
                          const now = new Date()
                          const diffTime = Math.abs(now - orderDate)
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          if (orderFilter === '30days') return diffDays <= 30
                          if (orderFilter === '6months') return diffDays <= 180
                          if (orderFilter === '1year') return diffDays <= 365
                          return true
                        }).map((order) => {
                          const orderId = order.id || order._id || ''
                          const displayId = order.orderNumber || (orderId ? `#NZ-${orderId.toString().substring(orderId.toString().length - 8).toUpperCase()}` : '#NZ-ORDER')
                          const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                          const status = order.status || 'Pending'
                          const total = order.total || order.totalAmount || order.grandTotal || 0
                          const orderItems = order.OrderItems || order.items || []
                          const itemsCount = orderItems.length

                          return (
                            <div key={orderId} className="border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:shadow-md transition-shadow">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.toLowerCase() === 'delivered'
                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600'
                                    : status.toLowerCase() === 'cancelled'
                                      ? 'bg-red-100 dark:bg-red-500/10 text-red-600'
                                      : 'bg-purple-100 dark:bg-purple-500/10 text-purple-600'
                                    }`}>
                                    <Package className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                      Order on {orderDate}
                                    </h4>
                                    <p className="text-xs text-gray-500">Order ID: {displayId}</p>
                                  </div>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="text-lg font-bold text-purple-600">₹{total}</p>
                                  <p className="text-xs text-gray-500">{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}</p>
                                </div>
                              </div>
                              <div className="border-t border-b border-gray-50 dark:border-white/5 py-3 my-3 space-y-1.5">
                                {orderItems.map((item, i) => {
                                  const name = item.productName || item.name || 'Product'
                                  const qty = item.quantity || 1
                                  const unit = item.unit || item.variant || ''
                                  const price = item.price || 0
                                  return (
                                    <div key={i} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                      <span>
                                        {name} {unit && `(${unit})`} <span className="font-bold">x {qty}</span>
                                      </span>
                                      <span className="font-bold text-gray-800 dark:text-gray-200">₹{price * qty}</span>
                                    </div>
                                  )
                                })}
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                  View Details
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                  status.toLowerCase() === 'delivered'
                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                    : status.toLowerCase() === 'cancelled'
                                      ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                      : status.toLowerCase() === 'confirmed'
                                        ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                                        : status.toLowerCase() === 'processing'
                                          ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                          : 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                                }`}>
                                  {status}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-white/5">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">Manage your app preferences and security.</p>
                    </div>
                    <div className="p-6 sm:p-8 space-y-6">

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Push Notifications</h4>
                            <p className="text-xs text-gray-500">Receive order updates and offers</p>
                          </div>
                        </div>
                        <div
                          onClick={async () => {
                            const newStatus = !pushEnabled
                            setPushEnabled(newStatus)
                            const toastId = toast.loading('Updating notification settings...')
                            try {
                              await authService.allowNotification(newStatus)
                              toast.success(newStatus ? 'Push notifications enabled' : 'Push notifications disabled', { id: toastId })
                            } catch (err) {
                              setPushEnabled(!newStatus)
                              toast.error('Failed to update notification settings', { id: toastId })
                            }
                          }}
                          className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${pushEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ${pushEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                            <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Dark Theme</h4>
                            <p className="text-xs text-gray-500">Toggle dark mode interface</p>
                          </div>
                        </div>
                        <div
                          onClick={toggleDarkMode}
                          className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${isDarkMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ${isDarkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                        </div>
                      </div>

                      {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                            <p className="text-xs text-gray-500">Secure your account with OTP</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toast.success('Setup email sent to your registered email.')}
                          className="text-sm font-bold text-purple-600 hover:underline"
                        >
                          Enable
                        </button>
                      </div> */}

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Change Password</h4>
                            <p className="text-xs text-gray-500">Update your account password</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="text-sm font-bold text-purple-600 hover:underline"
                        >
                          Change
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false)
                    setEditingAddressId(null)
                    setIsMapOpen(false)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-600/10 dark:hover:bg-purple-600/20 text-purple-600 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {isLocating ? (
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                  {isLocating ? 'Detecting Location...' : 'Use Current Location'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMapOpen(!isMapOpen)
                    setShowFormFields(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-600/10 dark:hover:bg-purple-600/20 text-purple-600 rounded-xl font-bold transition-colors shadow-sm"
                >
                  <MapPin className="w-5 h-5" />
                  {isMapOpen ? 'Close Map' : 'Use Another Location (Select on Map)'}
                </button>

                {isMapOpen && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search for an address/area..."
                        value={mapSearchQuery}
                        onChange={(e) => setMapSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSearchLocation()
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSearchLocation}
                        disabled={isSearchingLocation}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                      >
                        {isSearchingLocation ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Search'
                        )}
                      </button>
                    </div>

                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Drag marker or click on map to select location</label>
                    <div ref={mapRef} className="w-full h-60 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm" style={{ zIndex: 1 }} />
                  </div>
                )}

                {!showFormFields && !editingAddressId ? null : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Complete Address</label>
                      <textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter your full address (House No, Building, Street, Area)"
                        className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white min-h-[100px] resize-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">City</label>
                        <input
                          type="text"
                          value={addressDetails.city}
                          onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                          placeholder="e.g. Indore"
                          className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">State</label>
                        <input
                          type="text"
                          value={addressDetails.state}
                          onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                          placeholder="e.g. MP"
                          className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pincode</label>
                      <input
                        type="text"
                        value={addressDetails.pincode}
                        onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                        placeholder="e.g. 452005"
                        className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Save As</label>
                      <div className="flex gap-3">
                        {['Home', 'Work', 'Other'].map((label) => (
                          <button
                            key={label}
                            onClick={() => setAddressLabel(label)}
                            className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${addressLabel === label
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {addressLabel === 'Other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 overflow-hidden"
                        >
                          <input
                            type="text"
                            value={otherAddressName}
                            onChange={(e) => setOtherAddressName(e.target.value)}
                            placeholder="e.g. Friend's House, Gym"
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                          />
                        </motion.div>
                      )}
                    </div>

                    <button
                      onClick={handleSaveAddress}
                      disabled={isSavingAddress}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-purple-600/20 mt-4 disabled:opacity-70 flex justify-center items-center"
                    >
                      {isSavingAddress ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        editingAddressId ? 'Update Address' : 'Save Address'
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {addressToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Address?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this address? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAddressToDelete(null)}
                    disabled={isDeletingAddress}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-white rounded-xl font-bold transition-colors disabled:opacity-70"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAddress}
                    disabled={isDeletingAddress}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {isDeletingAddress ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-purple-600/20 mt-2 disabled:opacity-70 flex justify-center items-center"
                >
                  {isChangingPassword ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order Details
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedOrderDetails.orderNumber || `#NZ-${selectedOrderDetails.id}`}</p>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-5 text-sm">
                {/* Shop / Vendor Info */}
                {selectedOrderDetails.Vendor && (
                  <div className="bg-purple-500/5 dark:bg-purple-500/10 rounded-2xl p-4 border border-purple-500/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 font-bold shrink-0">
                      {selectedOrderDetails.Vendor.shopName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{selectedOrderDetails.Vendor.shopName}</h4>
                      <p className="text-xs text-gray-500">Contact: {selectedOrderDetails.Vendor.phone}</p>
                    </div>
                  </div>
                )}

                {/* Order Status & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3.5 border border-gray-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold block mb-1">Status</span>
                    <span className="font-bold capitalize text-gray-900 dark:text-white">{selectedOrderDetails.status}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3.5 border border-gray-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold block mb-1">Payment Method</span>
                    <span className="font-bold uppercase text-gray-900 dark:text-white">{selectedOrderDetails.paymentMethod || 'COD'}</span>
                  </div>
                </div>

                {/* Address Details */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold block mb-1">Delivery Address</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedOrderDetails.address}, {selectedOrderDetails.city}, {selectedOrderDetails.state} - {selectedOrderDetails.pincode}
                  </p>
                  {selectedOrderDetails.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                      <strong>Note:</strong> {selectedOrderDetails.notes}
                    </p>
                  )}
                </div>

                {/* Items List */}
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold block mb-2">Items Order Summary</span>
                  <div className="space-y-3 bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                    {(selectedOrderDetails.OrderItems || selectedOrderDetails.items || []).map((item, i) => {
                      const name = item.productName || item.name || 'Product'
                      const qty = item.quantity || 1
                      const unit = item.unit || item.variant || ''
                      const price = item.price || 0
                      return (
                        <div key={i} className="flex justify-between items-center text-xs py-1 text-gray-600 dark:text-gray-300 font-medium">
                          <span>
                            {name} {unit && `(${unit})`} <span className="font-black ml-1">x {qty}</span>
                          </span>
                          <span className="font-black text-gray-950 dark:text-white">₹{price * qty}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{selectedOrderDetails.subtotal || (Number(selectedOrderDetails.total) - Number(selectedOrderDetails.deliveryCharge || 0))}</span>
                  </div>
                  {Number(selectedOrderDetails.discount || 0) > 0 && (
                    <div className="flex justify-between text-xs text-green-500">
                      <span>Discount</span>
                      <span>-₹{selectedOrderDetails.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrderDetails.deliveryCharge || 0}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-white/10 my-2 pt-2 flex justify-between text-sm font-black text-gray-900 dark:text-white">
                    <span>Total Paid</span>
                    <span className="text-purple-600 dark:text-purple-400">₹{selectedOrderDetails.total}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfilePage
