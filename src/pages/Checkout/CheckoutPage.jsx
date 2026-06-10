import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ChevronLeft, MapPin, CreditCard, Banknote, ShieldCheck, CheckCircle2, Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { userService } from '../../services/userService'
import { orderService } from '../../services/orderService'

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, user, setIsCartOpen, cartDeliveryDetails } = useApp()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const minOrderVal = cartDeliveryDetails?.minimum_free_order_amount || cartDeliveryDetails?.minOrderValue || cartDeliveryDetails?.minOrderAmount || cartDeliveryDetails?.min_order_value || cartDeliveryDetails?.min_order_amount || 0
  const isMinOrderNotMet = minOrderVal > 0 && cartTotal < minOrderVal
  const [addresses, setAddresses] = useState([])
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [orderNotes, setOrderNotes] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [placedOrderAmount, setPlacedOrderAmount] = useState(0)

  // Voice recording states
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBase64, setAudioBase64] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackAudio, setPlaybackAudio] = useState(null)

  // Timer for recording duration
  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingDuration(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Convert blob to base64
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          setAudioBase64(reader.result)
        }

        // Stop all tracks to release stream
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      toast.success('Recording started...')
    } catch (err) {
      console.error('Error starting audio recording:', err)
      toast.error('Microphone access denied or not supported!')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      toast.success('Recording completed!')
    }
  }

  const handlePlayAudio = () => {
    if (!audioUrl) return
    if (isPlaying && playbackAudio) {
      playbackAudio.pause()
      setIsPlaying(false)
    } else {
      const audio = playbackAudio || new Audio(audioUrl)
      audio.play()
      setIsPlaying(true)
      audio.onended = () => {
        setIsPlaying(false)
      }
      setPlaybackAudio(audio)
    }
  }

  const deleteRecording = () => {
    if (playbackAudio) {
      playbackAudio.pause()
      setPlaybackAudio(null)
    }
    setAudioUrl('')
    setAudioBase64('')
    setAudioBlob(null)
    setIsPlaying(false)
    toast.success('Recording removed')
  }

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await userService.getAddresses()
        if (data && data.addresses) {
          setAddresses(data.addresses)
        } else if (Array.isArray(data)) {
          setAddresses(data)
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setLoadingAddress(false)
      }
    }
    fetchAddresses()
  }, [])

  const selectedAddressId = localStorage.getItem('selectedAddressId')
  const defaultAddress = selectedAddressId 
    ? addresses.find(a => String(a.id) === String(selectedAddressId)) || addresses.find(a => a.isDefault) || addresses[0]
    : addresses.find(a => a.isDefault) || addresses[0]

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!')
      return
    }
    if (!defaultAddress) {
      toast.error('Please select or add a delivery address first!')
      return
    }

    setPlacingOrder(true)
    const toastId = toast.loading('Placing your order...')

    const formData = new FormData()
    formData.append('address', defaultAddress.address || '')
    formData.append('city', defaultAddress.city || '')
    formData.append('state', defaultAddress.state || '')
    formData.append('pincode', defaultAddress.pincode || '')
    
    const lat = localStorage.getItem('user_latitude')
    const lng = localStorage.getItem('user_longitude')
    if (lat) formData.append('latitude', lat)
    if (lng) formData.append('longitude', lng)
    
    formData.append('notes', orderNotes || '')
    
    if (audioBlob) {
      formData.append('audioNote', audioBlob, 'voice_instruction.webm')
    }

    try {
      const data = await orderService.placeOrder(formData)
      if (data && data.success) {
        toast.success('Order placed successfully! 🎉', { id: toastId })
        setPlacedOrderAmount(finalTotal)
        clearCart()
        setShowSuccessModal(true)
        // Automatically redirect to profile page after 15 seconds
        setTimeout(() => {
          setShowSuccessModal(false)
          navigate('/profile')
        }, 15000)
      } else {
        toast.error(data.message || 'Failed to place order', { id: toastId })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      const errorMsg = error.message || 'Error occurred while placing order. Please try again.'
      toast.error(errorMsg, { id: toastId })
    } finally {
      setPlacingOrder(false)
    }
  }

  const deliveryFee = cartDeliveryDetails ? Number(cartDeliveryDetails.deliveryCharge) : 0
  const finalTotal = cartTotal + deliveryFee

  if (cart.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors">Start Shopping</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-[100px] pb-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-colors text-gray-700 dark:text-gray-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Delivery Address
                </h2>
                <button onClick={() => navigate('/profile')} className="text-sm font-bold text-purple-600 hover:underline">
                  Change
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                {loadingAddress ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : defaultAddress ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900 dark:text-white text-base">{user?.name || 'Guest User'}</span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {defaultAddress.addressType === 'office' ? 'Work' : defaultAddress.addressType || 'Home'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      Phone: {user?.phone || '+91 9876543210'}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No delivery address found</p>
                    <button onClick={() => navigate('/profile/addresses')} className="text-sm font-bold text-purple-600 hover:underline">Add New Address</button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-purple-200'}`}>
                  <div className="flex items-center gap-4">
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-base font-bold ${paymentMethod === 'cod' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay when order arrives</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                  </div>
                </label>

                {/* <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-purple-200'}`}>
                  <div className="flex items-center gap-4">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-base font-bold ${paymentMethod === 'online' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Pay Online</p>
                      <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, NetBanking</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                    {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                  </div>
                </label> */}
            </div>
            </div>
            {/* Delivery Instructions & Voice Note */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                Delivery Instructions / Notes (Optional)
              </h2>
              <textarea
                placeholder="e.g. Ring the bell, leave with guard, call upon arrival..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows="3"
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-xl outline-none text-sm text-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all shadow-sm resize-none"
              />

              {/* Voice Note Module */}
              <div className="pt-2 border-t border-dashed border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4.5 h-4.5 text-purple-600 shrink-0" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Voice Instruction</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status: Idle, No Recording */}
                  {!isRecording && !audioUrl && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 text-purple-650 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border-none cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" /> Record voice note
                    </button>
                  )}

                  {/* Status: Active Recording */}
                  {isRecording && (
                    <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-3.5 py-1.5 rounded-xl">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-red-650 tracking-wider font-mono">
                        {formatDuration(recordingDuration)}
                      </span>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-all border-none cursor-pointer"
                      >
                        <Square className="w-3 h-3 fill-white" />
                      </button>
                    </div>
                  )}

                  {/* Status: Completed Recording, Playback Available */}
                  {audioUrl && !isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-100/10 px-3 py-1.5 rounded-xl">
                        <button
                          type="button"
                          onClick={handlePlayAudio}
                          className="w-7 h-7 rounded-lg bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white flex items-center justify-center transition-all border-none cursor-pointer"
                          title={isPlaying ? "Pause playback" : "Play back voice instruction"}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                        </button>
                        <span className="text-[10px] font-bold text-purple-650 uppercase tracking-wider px-1">
                          {isPlaying ? 'Playing...' : 'Voice Note'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={deleteRecording}
                        className="p-2 bg-red-55 hover:bg-red-100 dark:bg-red-950/10 dark:hover:bg-red-950/20 text-red-655 rounded-xl transition-all border-none cursor-pointer"
                        title="Delete voice note"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-28">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Order Summary</h2>
                <button onClick={() => { setIsCartOpen(true); navigate(-1) }} className="text-sm font-bold text-purple-600 hover:underline">Edit Cart</button>
              </div>

              <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 p-1.5 shrink-0 border border-gray-100 dark:border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0 ml-2 pt-0.5">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Details Alert */}
              {isMinOrderNotMet ? (
                <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 rounded-xl">
                  <div className="flex flex-row justify-between items-center gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-350 leading-tight">
                        Yay! You are ₹{minOrderVal - cartTotal} away from FREE delivery
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(-1)}
                      className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border-none bg-transparent cursor-pointer uppercase tracking-wider shrink-0 font-sans"
                    >
                      Add more items
                    </button>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-emerald-100 dark:bg-emerald-950/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (cartTotal / minOrderVal) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                cartDeliveryDetails && (
                  <div className="mb-5 p-3.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl text-xs space-y-1.5 text-purple-700 dark:text-purple-300 font-medium">
                    <div className="flex justify-between items-center">
                      <span>Store Distance:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{cartDeliveryDetails.distanceKm} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Free Delivery Radius:</span>
                      <span className="font-bold text-green-600 dark:text-emerald-400">First {cartDeliveryDetails.freeDeliveryKm} km FREE</span>
                    </div>
                    {cartDeliveryDetails.deliveryCharge > 0 ? (
                      <>
                        <div className="flex justify-between items-center text-red-500 font-bold border-t border-purple-200/40 dark:border-purple-800/40 pt-1.5 mt-0.5">
                          <span>Chargeable Distance:</span>
                          <span>{cartDeliveryDetails.chargeableKm} km</span>
                        </div>
                        <p className="text-[9.5px] text-gray-500 dark:text-gray-400 leading-normal">
                          *Rate: ₹{cartDeliveryDetails.delivery_charge_per_km}/km for the distance beyond the free limit ({cartDeliveryDetails.freeDeliveryKm} km).
                        </p>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-green-600 dark:text-emerald-400 font-bold border-t border-purple-200/40 dark:border-purple-800/40 pt-1.5 mt-0.5">
                        <span>Delivery Status:</span>
                        <span className="bg-green-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded text-[10px]">FREE DELIVERY 🎉</span>
                      </div>
                    )}
                  </div>
                )
              )}

              <div className="space-y-3 text-sm border-t border-dashed border-gray-200 dark:border-gray-800 pt-5 mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Item Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 mb-5">
                <span className="font-bold text-gray-900 dark:text-white text-base">To Pay</span>
                <span className="text-2xl font-extrabold text-purple-600">₹{finalTotal}</span>
              </div>

              <div className="flex items-center gap-2 justify-center text-xs text-gray-500 mb-5">
                <ShieldCheck className="w-4 h-4 text-green-500" /> 100% Safe & Secure Payments
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-base font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Order Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-fadeIn">
          {/* Blur Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => {
              setShowSuccessModal(false)
              navigate('/profile')
            }}
          />

          {/* Modal Container */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative z-[151] border border-gray-100 dark:border-white/5 text-center flex flex-col items-center">
            
            {/* Animated Check Circle */}
            <div className="w-20 h-20 bg-green-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-green-600 dark:text-emerald-400 mb-6 relative">
              <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping"></div>
            </div>

            {/* Congratulations */}
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Order Confirmed! 🎉</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Thank you for shopping with us! Your order has been placed and is being prepared by the store.
            </p>

            {/* Order Details Brief Box */}
            <div className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-left text-xs mb-8 space-y-2.5 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between font-medium">
                <span>Payment Mode:</span>
                <span className="font-bold text-gray-900 dark:text-white uppercase">Cash on Delivery (COD)</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span className="font-black text-purple-600 dark:text-purple-400 text-sm">₹{placedOrderAmount || finalTotal}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-white/10 pt-2 flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Deliver to:</span>
                <span className="font-bold text-gray-800 dark:text-white truncate">
                  {defaultAddress?.address}, {defaultAddress?.city}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/')
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-500/20 text-sm flex items-center justify-center gap-2"
              >
                Continue Shopping
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
