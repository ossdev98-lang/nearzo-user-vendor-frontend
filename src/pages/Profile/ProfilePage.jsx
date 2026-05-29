import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { authService } from '../../services/authService'
import { userService } from '../../services/userService'
import { useNavigate, useParams } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Edit3, Camera,
  ShoppingBag, Heart, CreditCard, Settings, LogOut, ChevronRight,
  Package, CheckCircle, Bell, Shield, X, Navigation, Lock, Trash2
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
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const { tabId } = useParams()
  const tabQuery = tabId || 'personal'
  
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(tabQuery)
  const [pushEnabled, setPushEnabled] = useState(true)

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
  const [isLocating, setIsLocating] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [addressDetails, setAddressDetails] = useState({
    city: '', state: '', pincode: '', latitude: null, longitude: null
  })
  const [addresses, setAddresses] = useState([])
  const [editingAddressId, setEditingAddressId] = useState(null)
  
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
        city: addressDetails.city || 'Indore',
        state: addressDetails.state || 'MP',
        pincode: addressDetails.pincode || '452005',
        latitude: addressDetails.latitude || 22.7004,
        longitude: addressDetails.longitude || 75.8358,
        addressType: type
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
                                    {addr.addressType === 'office' ? 'Work' : addr.addressType || 'Home'}
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
                    </div>
                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Dummy Order 1 */}
                      <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">Delivered on 12 May 2026</h4>
                              <p className="text-xs text-gray-500">Order ID: #NZ-8923482</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-purple-600">₹450.00</p>
                            <p className="text-xs text-gray-500">3 Items</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toast('Order details coming soon!', { icon: '📦' })}
                            className="px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-600/10 text-sm font-bold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-600/20 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => toast.success('Items added to cart!')}
                            className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
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
                          onClick={() => {
                            setPushEnabled(!pushEnabled)
                            toast.success(pushEnabled ? 'Push notifications disabled' : 'Push notifications enabled')
                          }}
                          className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${pushEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ${pushEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
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
                    {['Home', 'Work'].map((label) => (
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
    </div>
  )
}

export default ProfilePage
