import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bell, Menu, Store, User, MapPin, Compass, Save, TrendingUp, ShoppingBag, Package, LogOut, X, ChevronDown, Moon, Sun, Tag, Phone, Mail, Camera, Clock, ClipboardList, LifeBuoy, Mic, Square, Volume2, Play, Pause, Trash2 } from 'lucide-react'
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
  const [allProductCategories, setAllProductCategories] = useState([])
  const [selectedProductCategoryIds, setSelectedProductCategoryIds] = useState([])
  const [isProdCategoryDropdownOpen, setIsProdCategoryDropdownOpen] = useState(false)

  const handleToggleProductCategory = (catId) => {
    setSelectedProductCategoryIds(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId)
      } else {
        return [...prev, catId]
      }
    })
  }

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
  const [address, setAddress] = useState('')

  // Re-KYC fields
  const [reKyc, setReKyc] = useState(false)
  const [aadharFront, setAadharFront] = useState('')
  const [aadharBack, setAadharBack] = useState('')
  const [aadharFrontFile, setAadharFrontFile] = useState(null)
  const [aadharBackFile, setAadharBackFile] = useState(null)
  const [submittingReKyc, setSubmittingReKyc] = useState(false)
  const [showReKycModal, setShowReKycModal] = useState(false)

  // Notification toggle
  const [allowNotification, setAllowNotification] = useState(true)

  // Order Settings fields
  const [orderAcceptanceRange, setOrderAcceptanceRange] = useState('5')
  const [deliveryChargePerKm, setDeliveryChargePerKm] = useState('30')
  const [freeDeliveryKm, setFreeDeliveryKm] = useState('1')
  const [minOrderValue, setMinOrderValue] = useState('0')
  const [savingOrderSettings, setSavingOrderSettings] = useState(false)

  // Support Ticket States
  const [ticketText, setTicketText] = useState('')
  const [ticketImageFile, setTicketImageFile] = useState(null)
  const [ticketImagePreview, setTicketImagePreview] = useState(null)
  const [ticketAudioFile, setTicketAudioFile] = useState(null)
  const [ticketAudioUrl, setTicketAudioUrl] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const mediaRecorderRef = React.useRef(null)
  const audioChunksRef = React.useRef([])
  const recordingTimerRef = React.useRef(null)

  // Voice playback inside the ticket form
  const [playingTicketAudio, setPlayingTicketAudio] = useState(false)
  const [ticketAudioInstance, setTicketAudioInstance] = useState(null)

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
        console.log("DEBUG_PROFILE:", JSON.stringify(profileRes))
        localStorage.setItem('last_profile_res', JSON.stringify(profileRes))
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
          setAadharFront(profile.aadharFront || '')
          setAadharBack(profile.aadharBack || '')
          setReKyc(profile.reKyc === true || profile.reKyc === 'true')
          setOpeningTime(formatTimeForInput(profile.openingTime))
          setClosingTime(formatTimeForInput(profile.closingTime))
          setCity(profile.city || '')
          setState(profile.state || '')
          setPincode(profile.pincode || '')
          setAddress(profile.address || '')
          setAllowNotification(profile.allowNotification !== undefined ? profile.allowNotification : true)
          setOrderAcceptanceRange(profile.orderAcceptanceRange !== undefined ? profile.orderAcceptanceRange : '5')
          setDeliveryChargePerKm(profile.delivery_charge_per_km !== undefined ? profile.delivery_charge_per_km : '30')
          setFreeDeliveryKm(profile.freeDeliveryKm !== undefined ? profile.freeDeliveryKm : '1')
          setMinOrderValue(
            profile.minimum_free_order_amount !== undefined ? profile.minimum_free_order_amount :
              profile.minOrderValue !== undefined ? profile.minOrderValue :
                profile.minOrderAmount !== undefined ? profile.minOrderAmount :
                  profile.min_order_value !== undefined ? profile.min_order_value : '0'
          )

          if (profile.shopCategoryId) {
            setShopCategoryId(profile.shopCategoryId)
          } else if (profile.shopCategory) {
            const matched = cats.find(c => c.shopCategoryName?.toLowerCase() === profile.shopCategory?.toLowerCase())
            if (matched) {
              setShopCategoryId(matched.id)
            }
          }

          // 1. Fetch all product categories from API first
          let allCats = []
          try {
            const prodCatRes = await categoryService.getProductCategories()
            if (prodCatRes) {
              allCats = prodCatRes.categories || prodCatRes.productCategories || prodCatRes.data || prodCatRes || []
            }
          } catch (prodErr) {
            console.error('Failed to load product categories from API:', prodErr)
          }

          const parsedAll = Array.isArray(allCats) ? allCats : [allCats].filter(Boolean)
          
          const standardizedAll = parsedAll.map(c => {
            if (typeof c === 'string') {
              return { id: String(c), name: c }
            }
            const idVal = c.id !== undefined && c.id !== null ? c.id : (c._id !== undefined && c._id !== null ? c._id : '')
            const name = c.name || c.categoryName || c.title || String(idVal) || '';
            return { id: String(idVal), name }
          }).filter(c => c.id !== '')

          setAllProductCategories(standardizedAll)

          // 2. Initialize selected product categories from profile response, using mapped IDs
          const selectedCats = profile.productCategory || profile.productCategoryIds || profile.productCategories || []
          const parsedSelected = Array.isArray(selectedCats) ? selectedCats : [selectedCats].filter(Boolean)
          
          const initialSelectedIds = parsedSelected.map(sel => {
            const val = typeof sel === 'string' || typeof sel === 'number' ? String(sel) : String(sel.id || sel._id || sel.name || '')
            if (!val) return ''
            
            // Try to find a category in standardizedAll where ID matches
            const matchedById = standardizedAll.find(c => String(c.id) === val)
            if (matchedById) return String(matchedById.id)
            
            // Try to find a category in standardizedAll where Name matches
            const matchedByName = standardizedAll.find(c => c.name.toLowerCase() === val.toLowerCase())
            if (matchedByName) return String(matchedByName.id)

            // Otherwise, return it as is
            return val
          }).filter(Boolean)
          
          setSelectedProductCategoryIds(initialSelectedIds)
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
        freeDeliveryKm: parseFloat(freeDeliveryKm) || 0,
        minOrderValue: parseFloat(minOrderValue) || 0,
        minOrderAmount: parseFloat(minOrderValue) || 0,
        min_order_value: parseFloat(minOrderValue) || 0,
        min_order_amount: parseFloat(minOrderValue) || 0,
        minimum_free_order_amount: parseFloat(minOrderValue) || 0
      }
      await vendorService.updateOrderSettings(payload)
      const updatedUser = {
        ...user,
        orderAcceptanceRange: payload.orderAcceptanceRange,
        delivery_charge_per_km: payload.delivery_charge_per_km,
        freeDeliveryKm: payload.freeDeliveryKm,
        minOrderValue: payload.minOrderValue,
        minOrderAmount: payload.minOrderAmount,
        min_order_value: payload.min_order_value,
        min_order_amount: payload.min_order_amount,
        minimum_free_order_amount: payload.minimum_free_order_amount
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

  const [updatingCoords, setUpdatingCoords] = useState(false)
  const [confirmCoordsOpen, setConfirmCoordsOpen] = useState(false)

  const handleUpdateCoordinates = () => {
    setConfirmCoordsOpen(true)
  }

  const performUpdateCoordinates = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setUpdatingCoords(true)
    const toastId = toast.loading('Detecting current coordinates...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords
          
          setLatitude(lat.toString())
          setLongitude(lng.toString())

          localStorage.setItem('vendor_latitude', lat.toString())
          localStorage.setItem('vendor_longitude', lng.toString())
          localStorage.setItem('user_latitude', lat.toString())
          localStorage.setItem('user_longitude', lng.toString())

          await vendorService.updateLocationCoordinates(lat, lng)
          
          toast.success('Coordinates updated successfully!', { id: toastId })
        } catch (err) {
          console.error('Failed to update coordinates:', err)
          toast.error(err.response?.data?.message || 'Failed to update coordinates on server.', { id: toastId })
        } finally {
          setUpdatingCoords(false)
        }
      },
      (err) => {
        console.error('Geolocation permission denied/failed:', err)
        toast.error('Permission denied or failed to get location.', { id: toastId })
        setUpdatingCoords(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
      formDataToSend.append('address', address)
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
      if (aadharFrontFile) {
        formDataToSend.append('aadharFront', aadharFrontFile)
      }
      if (aadharBackFile) {
        formDataToSend.append('aadharBack', aadharBackFile)
      }

      // Append selected product category IDs (using productCategory and productCategoryIds keys)
      if (selectedProductCategoryIds && selectedProductCategoryIds.length > 0) {
        selectedProductCategoryIds.forEach(id => {
          formDataToSend.append('productCategory', id)
          formDataToSend.append('productCategory[]', id)
          formDataToSend.append('productCategoryIds', id)
          formDataToSend.append('productCategoryIds[]', id)
        })
        formDataToSend.append('productCategoryJson', JSON.stringify(selectedProductCategoryIds))
        formDataToSend.append('productCategoryIdsJson', JSON.stringify(selectedProductCategoryIds))
      } else {
        formDataToSend.append('productCategory', '')
        formDataToSend.append('productCategoryIds', '')
        formDataToSend.append('productCategoryJson', '[]')
        formDataToSend.append('productCategoryIdsJson', '[]')
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
        banner: bannerFile ? URL.createObjectURL(bannerFile) : banner,
        aadharFront: aadharFrontFile ? URL.createObjectURL(aadharFrontFile) : aadharFront,
        aadharBack: aadharBackFile ? URL.createObjectURL(aadharBackFile) : aadharBack,
        city,
        state,
        pincode,
        address,
        productCategory: selectedProductCategoryIds,
        productCategoryIds: selectedProductCategoryIds
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

  const handleSubmitReKyc = async (e) => {
    if (e) e.preventDefault()
    if (!aadharFrontFile && !aadharBackFile) {
      toast.error('Please upload at least one of the Aadhar Front or Back images to update.')
      return
    }
    setSubmittingReKyc(true)
    const toastId = toast.loading('Submitting Re-KYC documents...')
    try {
      const formDataToSend = new FormData()
      if (aadharFrontFile) {
        formDataToSend.append('aadharFront', aadharFrontFile)
      }
      if (aadharBackFile) {
        formDataToSend.append('aadharBack', aadharBackFile)
      }
      
      const res = await vendorService.updateSettings(formDataToSend)
      toast.success('Re-KYC documents submitted successfully! Verification pending.', { id: toastId })
      
      const profile = res.vendor || res.profile || res.data || res
      setReKyc(profile.reKyc === true || profile.reKyc === 'true')
      if (profile.aadharFront) setAadharFront(profile.aadharFront)
      if (profile.aadharBack) setAadharBack(profile.aadharBack)
      
      const updatedUser = {
        ...user,
        aadharFront: profile.aadharFront || user.aadharFront,
        aadharBack: profile.aadharBack || user.aadharBack,
        reKyc: profile.reKyc
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setShowReKycModal(false)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit Re-KYC. Please try again.', { id: toastId })
    } finally {
      setSubmittingReKyc(false)
    }
  }

  // Support ticket handlers
  const startRecording = async () => {
    try {
      if (playingTicketAudio && ticketAudioInstance) {
        ticketAudioInstance.pause()
        setPlayingTicketAudio(false)
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        // Stop stream tracks only after MediaRecorder has completely finished recording
        stream.getTracks().forEach((track) => track.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'ticket_audio.wav', { type: 'audio/wav' })
        setTicketAudioFile(audioFile)
        setTicketAudioUrl(URL.createObjectURL(audioBlob))
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      toast.success('Voice recording started...')
    } catch (err) {
      console.error('Microphone access denied or error:', err)
      toast.error('Microphone access is required to record audio notes.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const deleteRecording = () => {
    if (ticketAudioInstance) {
      ticketAudioInstance.pause()
      setPlayingTicketAudio(false)
      setTicketAudioInstance(null)
    }
    setTicketAudioFile(null)
    setTicketAudioUrl(null)
    setRecordingTime(0)
  }

  const togglePlaybackTicketAudio = () => {
    if (!ticketAudioUrl) return

    if (playingTicketAudio && ticketAudioInstance) {
      ticketAudioInstance.pause()
      setPlayingTicketAudio(false)
    } else {
      if (ticketAudioInstance) {
        ticketAudioInstance.play()
        setPlayingTicketAudio(true)
      } else {
        const audio = new Audio(ticketAudioUrl)
        audio.play()
        setPlayingTicketAudio(true)
        setTicketAudioInstance(audio)
        audio.onended = () => {
          setPlayingTicketAudio(false)
        }
      }
    }
  }

  // Clean up audio references on unmount or ticket change
  useEffect(() => {
    return () => {
      if (ticketAudioInstance) {
        ticketAudioInstance.pause()
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [ticketAudioInstance])

  const handleTicketImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setTicketImageFile(file)
      setTicketImagePreview(URL.createObjectURL(file))
    }
  }

  const removeTicketImage = () => {
    setTicketImageFile(null)
    setTicketImagePreview(null)
  }

  const handleSubmitSupportTicket = async (e) => {
    if (e) e.preventDefault()
    if (!ticketText.trim() && !ticketImageFile && !ticketAudioFile) {
      toast.error('Please enter a description, upload an image, or record a voice note.')
      return
    }

    setIsSubmittingTicket(true)
    const toastId = toast.loading('Submitting your support ticket...')

    try {
      const formData = new FormData()
      if (ticketText.trim()) {
        formData.append('text', ticketText)
      }
      if (ticketImageFile) {
        formData.append('image', ticketImageFile)
      }
      if (ticketAudioFile) {
        formData.append('audio', ticketAudioFile)
      }

      console.log('--- Raising Support Ticket (Vendor) ---')
      console.log('Text description:', ticketText)
      console.log('Image attachment file:', ticketImageFile)
      console.log('Audio voice note file:', ticketAudioFile)

      await vendorService.raiseSupportTicket(formData)
      
      toast.success('Support ticket submitted successfully!', { id: toastId })
      
      setTicketText('')
      setTicketImageFile(null)
      setTicketImagePreview(null)
      setTicketAudioFile(null)
      setTicketAudioUrl(null)
      setRecordingTime(0)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit ticket. Please try again.', { id: toastId })
    } finally {
      setIsSubmittingTicket(false)
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
    { id: 'support', label: 'Support & Tickets', icon: LifeBuoy },
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
  const aadharFrontPreview = aadharFrontFile ? URL.createObjectURL(aadharFrontFile) : getImageUrl(aadharFront)
  const aadharBackPreview = aadharBackFile ? URL.createObjectURL(aadharBackFile) : getImageUrl(aadharBack)

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
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-2 lg:p-3 shadow-sm grid grid-cols-3 lg:flex lg:flex-col gap-1.5 lg:gap-1.5 sticky top-16 lg:top-8 z-20">
                {/* Avatar */}
                <div className="hidden lg:block p-4 text-center border-b border-gray-100 dark:border-gray-800 mb-3">
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
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center lg:justify-start gap-1 lg:gap-2 px-1 py-2.5 lg:px-4 lg:py-3 rounded-2xl transition-all text-[10px] sm:text-xs lg:text-sm font-bold cursor-pointer border-none whitespace-nowrap shrink-0
                        ${isActive
                          ? 'bg-[#6C4CF1] text-white shadow-md shadow-purple-600/25'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <tab.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{tab.label}</span>
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
                          <button type="submit" disabled={saving} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#6C4CF1] hover:bg-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer border-none shadow-md shadow-purple-600/20">
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

                          {/* Re-KYC Card */}
                          {reKyc && (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                  <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Re-KYC Verification Required</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    Your account requires updated KYC verification. Please click the button to upload Aadhar Front and Back documents.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowReKycModal(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-amber-600/20 shrink-0"
                              >
                                Re-KYC
                              </button>
                            </div>
                          )}

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

                          {/* Product Categories (Multi-select) */}
                          <div>
                            <p className="text-[10px] font-black text-[#6C4CF1] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-2">
                              <ClipboardList className="w-3.5 h-3.5" /> Product Categories (Select Multiple)
                            </p>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsProdCategoryDropdownOpen(!isProdCategoryDropdownOpen)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-semibold flex items-center justify-between text-gray-800 dark:text-white"
                              >
                                <div className="flex flex-wrap gap-1.5 max-w-[90%] text-left">
                                  {selectedProductCategoryIds.length > 0 ? (
                                    selectedProductCategoryIds.map(id => {
                                      const cat = allProductCategories.find(c => String(c.id) === String(id))
                                      const displayName = cat ? cat.name : id
                                      return (
                                        <span
                                          key={id}
                                          className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-[#6C4CF1] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide flex items-center gap-1"
                                        >
                                          {displayName}
                                          <span 
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleToggleProductCategory(id)
                                            }}
                                            className="text-gray-400 hover:text-red-500 cursor-pointer ml-1 text-xs"
                                          >
                                            ×
                                          </span>
                                        </span>
                                      )
                                    })
                                  ) : (
                                    <span className="text-gray-400 text-xs font-semibold">Select Product Categories</span>
                                  )}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProdCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>

                              <AnimatePresence>
                                {isProdCategoryDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProdCategoryDropdownOpen(false)} />
                                    <motion.ul
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto no-scrollbar list-none p-2 space-y-1"
                                    >
                                      {allProductCategories.map(cat => {
                                        const isSelected = selectedProductCategoryIds.includes(cat.id)
                                        return (
                                          <li key={cat.id}>
                                            <button
                                              type="button"
                                              onClick={() => handleToggleProductCategory(cat.id)}
                                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-between border-none bg-transparent cursor-pointer ${isSelected
                                                ? 'bg-purple-50 dark:bg-purple-950/20 text-[#6C4CF1]'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                                                }`}
                                            >
                                              <span>{cat.name}</span>
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
                          {/* Address Info */}
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-[#6C4CF1] uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-2"><MapPin className="w-3.5 h-3.5" /> Shop Address & Location</p>
                            
                            <div>
                              <label className={labelCls}>Full Address</label>
                              <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={`${inputCls} h-24 resize-none`}
                                placeholder="Enter your full shop address..."
                              />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 bg-purple-50/10 dark:bg-purple-950/5 border border-purple-100/10 p-4 rounded-2xl font-semibold text-xs text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-400 uppercase text-[10px] font-bold">Latitude:</span>
                                <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold">{latitude || 'Not set'}</span>
                              </div>
                              <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 hidden sm:block" />
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-400 uppercase text-[10px] font-bold">Longitude:</span>
                                <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold">{longitude || 'Not set'}</span>
                              </div>
                            </div>

                            <div>
                              <button
                                type="button"
                                onClick={handleUpdateCoordinates}
                                disabled={updatingCoords}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[#6C4CF1] hover:bg-purple-700 disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-purple-600/10"
                              >
                                <Compass className={`w-4 h-4 ${updatingCoords ? 'animate-spin' : ''}`} />
                                {updatingCoords ? 'Updating Coordinates...' : 'Update Coordinates'}
                              </button>
                            </div>
                          </div>

                          {/* Save Changes button on mobile */}
                          <div className="flex justify-end sm:hidden pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                              type="submit"
                              disabled={saving}
                              className="flex items-center gap-2 px-6 py-3 bg-[#6C4CF1] hover:bg-purple-700 disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-purple-600/20"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {saving ? 'Saving...' : 'Save Changes'}
                            </button>
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
                        <button type="submit" disabled={savingOrderSettings} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#6C4CF1] hover:bg-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer border-none shadow-md shadow-purple-600/20">
                          <Save className="w-3.5 h-3.5" /> {savingOrderSettings ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          <div>
                            <label className={labelCls}>Minimum Order Amount (₹)</label>
                            <input
                              type="number"
                              value={minOrderValue}
                              onChange={e => setMinOrderValue(e.target.value)}
                              className={inputCls}
                              placeholder="e.g. 100"
                              required
                            />
                          </div>
                        </div>

                        {/* Save Changes button on mobile */}
                        <div className="flex justify-end sm:hidden pt-4 border-t border-gray-100 dark:border-gray-800">
                          <button
                            type="submit"
                            disabled={savingOrderSettings}
                            className="flex items-center gap-2 px-6 py-3 bg-[#6C4CF1] hover:bg-purple-700 disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-purple-600/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingOrderSettings ? 'Saving...' : 'Save Changes'}
                          </button>
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

                {activeTab === 'support' && (
                  <motion.div
                    key="support"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                          <LifeBuoy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          Raise a Support Ticket
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">Submit your issue description along with optional image and voice notes.</p>
                      </div>

                      <form onSubmit={handleSubmitSupportTicket} className="p-6 space-y-6">
                        {/* Text Description */}
                        <div className="space-y-2">
                          <label className={labelCls}>Issue Description *</label>
                          <textarea
                            value={ticketText}
                            onChange={(e) => setTicketText(e.target.value)}
                            placeholder="Please describe your issue in detail..."
                            className="w-full p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-800 dark:text-white min-h-[140px] resize-none transition-all"
                          />
                        </div>

                        {/* Image Upload & Voice Note Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Image Attachment Card */}
                          <div className="space-y-2">
                            <label className={labelCls}>Attach Image</label>
                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-500 rounded-2xl p-5 flex flex-col items-center justify-center transition-all bg-gray-50 dark:bg-gray-800/30 min-h-[160px]">
                              {ticketImagePreview ? (
                                <div className="relative w-full h-28 rounded-xl overflow-hidden flex items-center justify-center">
                                  <img src={ticketImagePreview} alt="Ticket Attachment" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={removeTicketImage}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors border-none cursor-pointer"
                                    title="Remove image"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center space-y-2 text-gray-400">
                                  <Camera className="w-8 h-8 mx-auto text-purple-600/60 dark:text-purple-400/60" />
                                  <div className="space-y-1">
                                    <span className="text-xs font-extrabold block text-gray-700 dark:text-gray-300">Drag or upload screenshot</span>
                                    <span className="text-[10px] block text-gray-405">Supports JPG, PNG, WEBP</span>
                                  </div>
                                  <label className="mt-3 inline-block px-4 py-1.5 bg-[#6C4CF1]/10 text-[#6C4CF1] dark:text-purple-400 rounded-xl text-[11px] font-black uppercase cursor-pointer hover:bg-[#6C4CF1]/20 transition-all">
                                    Select File
                                    <input type="file" accept="image/*" className="hidden" onChange={handleTicketImageChange} />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Audio Voice Recording Card */}
                          <div className="space-y-2">
                            <label className={labelCls}>Voice Note</label>
                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/30 min-h-[160px]">
                              {isRecording ? (
                                <div className="text-center space-y-4 w-full">
                                  <div className="flex items-center justify-center gap-1.5 h-6">
                                    {[12, 24, 16, 20, 8].map((h, idx) => (
                                      <span
                                        key={idx}
                                        className="w-1 bg-red-500 rounded-full animate-bounce"
                                        style={{
                                          height: `${h}px`,
                                          animationDelay: `${idx * 0.15}s`,
                                          animationDuration: '0.6s'
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <div className="text-xs font-extrabold text-red-500 animate-pulse tracking-wider">
                                    RECORDING: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all cursor-pointer border-none"
                                  >
                                    <Square className="w-5 h-5 fill-white" />
                                  </button>
                                </div>
                              ) : ticketAudioUrl ? (
                                <div className="text-center space-y-4 w-full px-4">
                                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={togglePlaybackTicketAudio}
                                        className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-purple-600/20 transition-colors border-none cursor-pointer"
                                        title={playingTicketAudio ? 'Pause' : 'Play voice note'}
                                      >
                                        {playingTicketAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                      </button>
                                      <div className="text-left">
                                        <p className="text-xs font-black text-gray-900 dark:text-white">Voice Instruction</p>
                                        <p className="text-[10px] text-gray-400">Audio ready to submit</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={deleteRecording}
                                      className="p-2 hover:bg-red-55 dark:hover:bg-red-500/10 text-red-500 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                      title="Delete voice note"
                                    >
                                      <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                  </div>

                                  <div className="flex gap-2">
                                    <label className="flex-1 py-2 px-3 border border-purple-200 dark:border-gray-700 hover:border-purple-600 text-purple-600 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase text-center cursor-pointer transition-all">
                                      Replace File
                                      <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]
                                          if (file) {
                                            setTicketAudioFile(file)
                                            setTicketAudioUrl(URL.createObjectURL(file))
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center space-y-2 text-gray-400">
                                  <Mic className="w-8 h-8 mx-auto text-purple-600/60 dark:text-purple-400/60" />
                                  <div className="space-y-1">
                                    <span className="text-xs font-extrabold block text-gray-700 dark:text-gray-300">Add Voice Instruction</span>
                                    <span className="text-[10px] block text-gray-405">Record directly or select an audio file</span>
                                  </div>
                                  <div className="flex gap-2 justify-center pt-2">
                                    <button
                                      type="button"
                                      onClick={startRecording}
                                      className="px-4 py-1.5 bg-purple-600 text-white rounded-xl text-[11px] font-black uppercase cursor-pointer hover:bg-purple-750 transition-all border-none"
                                    >
                                      Record
                                    </button>
                                    <label className="px-4 py-1.5 bg-[#6C4CF1]/10 text-[#6C4CF1] dark:text-purple-400 rounded-xl text-[11px] font-black uppercase cursor-pointer hover:bg-[#6C4CF1]/20 transition-all">
                                      Upload File
                                      <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]
                                          if (file) {
                                            setTicketAudioFile(file)
                                            setTicketAudioUrl(URL.createObjectURL(file))
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                          <button
                            type="submit"
                            disabled={isSubmittingTicket}
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#6C4CF1] hover:bg-purple-700 disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                          >
                            {isSubmittingTicket ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Support Ticket'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Geolocation Update Confirmation Modal */}
      <AnimatePresence>
        {confirmCoordsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmCoordsOpen(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-105 dark:border-gray-800 p-8 shadow-2xl w-full max-w-md text-left z-10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-600 animate-pulse" />
                  Update Coordinates?
                </h3>
                <button
                  onClick={() => setConfirmCoordsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4.5 h-4.5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal font-semibold">
                  Are you sure you want to update your shop's coordinates to your current physical location?
                </p>

                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-extrabold leading-relaxed bg-amber-500/10 p-4 rounded-2xl border border-amber-500/10">
                  ⚠️ Note: Please click update coordinates only when you are physically at your shop location to ensure the coordinates are correct. (कृपया कोऑर्डिनेट्स वहीं जाकर अपडेट करें जहां की लोकेशन डालनी है, जैसे आपकी दुकान पर।)
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmCoordsOpen(false)}
                    className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-transparent"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmCoordsOpen(false)
                      performUpdateCoordinates()
                    }}
                    className="flex-1 px-5 py-3 bg-[#6C4CF1] hover:bg-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-purple-600/10"
                  >
                    Confirm Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showReKycModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReKycModal(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl w-full max-w-lg text-left z-10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#6C4CF1]" />
                  Re-KYC Document Upload
                </h3>
                <button
                  onClick={() => setShowReKycModal(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4.5 h-4.5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal font-semibold">
                  Please upload clean, clear photos of the Front and Back of your Aadhar Card for Re-KYC verification.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Aadhar Front Card */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Aadhar Front *</label>
                    <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-850 hover:border-[#6C4CF1] dark:hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center transition-all bg-gray-50 dark:bg-gray-800/50 min-h-[140px]">
                      {aadharFrontPreview ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden">
                          <img src={aadharFrontPreview} alt="Aadhar Front" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-gray-400">
                          <Camera className="w-6 h-6 mx-auto" />
                          <span className="text-xs font-bold block">No front image</span>
                        </div>
                      )}
                      <label className="mt-3 px-4 py-1.5 bg-[#6C4CF1]/10 text-[#6C4CF1] dark:text-purple-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#6C4CF1]/20 transition-all">
                        {aadharFrontFile ? 'Change File' : 'Select File'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setAadharFrontFile(e.target.files[0]) }} />
                      </label>
                    </div>
                  </div>

                  {/* Aadhar Back Card */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Aadhar Back *</label>
                    <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-850 hover:border-[#6C4CF1] dark:hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center transition-all bg-gray-50 dark:bg-gray-800/50 min-h-[140px]">
                      {aadharBackPreview ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden">
                          <img src={aadharBackPreview} alt="Aadhar Back" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-gray-400">
                          <Camera className="w-6 h-6 mx-auto" />
                          <span className="text-xs font-bold block">No back image</span>
                        </div>
                      )}
                      <label className="mt-3 px-4 py-1.5 bg-[#6C4CF1]/10 text-[#6C4CF1] dark:text-purple-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#6C4CF1]/20 transition-all">
                        {aadharBackFile ? 'Change File' : 'Select File'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setAadharBackFile(e.target.files[0]) }} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReKycModal(false)}
                    className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReKyc}
                    disabled={submittingReKyc}
                    className="flex-1 px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-amber-600/20"
                  >
                    {submittingReKyc ? 'Submitting...' : 'Submit KYC'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
    </div>
  )
}
 
export default VendorSettings
