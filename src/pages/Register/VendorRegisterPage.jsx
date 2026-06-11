import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Store, User, Mail, Lock, Phone, FileText, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Truck } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { vendorAuthService } from '../../services/vendorAuthService'

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Shop Details' },
  { id: 3, title: 'Documents' },
  { id: 4, title: 'Location' }
]

const VendorRegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    gstNo: '',
    shopRegisterNo: '',
    delivery_option: 'self',
    latitude: '',
    longitude: '',
    aadharFront: null,
    aadharBack: null,
    shopRegisterImage: null
  })
  
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    const val = type === 'file' ? files[0] : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }))
        setLocationLoading(false)
        toast.success('Location fetched successfully')
      },
      (error) => {
        setLocationLoading(false)
        toast.error('Unable to retrieve your location. Please allow location access.')
      }
    )
  }

  // Auto-fetch location when entering step 4
  useEffect(() => {
    if (currentStep === 4 && !formData.latitude && !formData.longitude) {
      getLocation()
    }
  }, [currentStep])

  const validateStep = () => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = 'Owner name is required'
      } else if (formData.ownerName.trim().length < 2) {
        newErrors.ownerName = 'Name must be at least 2 characters'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address'
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Enter a valid 10-digit phone number'
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Must contain at least one uppercase letter'
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Must contain at least one number'
      }
    } else if (currentStep === 2) {
      if (!formData.shopName.trim()) {
        newErrors.shopName = 'Shop name is required'
      } else if (formData.shopName.trim().length < 2) {
        newErrors.shopName = 'Shop name must be at least 2 characters'
      }
    } else if (currentStep === 3) {
      if (!formData.aadharFront) newErrors.aadharFront = 'Aadhar Front is required'
      if (!formData.aadharBack) newErrors.aadharBack = 'Aadhar Back is required'
      if (!formData.shopRegisterImage) newErrors.shopRegisterImage = 'Shop Register Image is required'
    } else if (currentStep === 4) {
      if (!formData.latitude || !formData.longitude) {
        toast.error('Location is required. Please wait for it to be fetched.')
        return false
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    } else {
      if (currentStep !== 4) toast.error('Please fill all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key])
        }
      })

      await vendorAuthService.register(formDataToSend)
      toast.success('Registration successful! Please verify your email.')
      navigate(`/vendor/verify-otp?email=${encodeURIComponent(formData.email)}&type=register`)
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-100/50 dark:border-white/5 max-h-none sm:max-h-[600px] w-full">
      {/* Left Column - Beautiful Grocery Unsplash Image with Centered Nearzo Logo */}
      <div className="hidden md:block w-1/2 relative h-[600px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/70 to-indigo-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white text-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-16 object-contain mb-6 drop-shadow-xl" />
          </Link>
          <h2 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Partner Program</h2>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Join thousands of vendors growing their business with Nearzo.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div 
        className="p-6 sm:p-12 w-full md:w-1/2 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto no-scrollbar h-auto sm:h-[600px] relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors bg-white dark:bg-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Logo (only visible on mobile) */}
        <div className="flex flex-col items-center mb-2 mt-8 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain" />
          </Link>
        </div>

        {/* Welcome Text & Step Indicator */}
        <div className="mb-6 mt-8 md:mt-6 text-center md:text-left pt-2">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{steps[currentStep-1].title}</h2>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full">
              Step {currentStep} of 4
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details to onboard your shop</p>
        </div>

        {/* Form Content Wrapper to take remaining height */}
        <div className="flex-1 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <Input label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} error={errors.ownerName} icon={<User className="w-4 h-4 text-gray-400" />} placeholder="Full Name" />
                  <Input label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} icon={<Mail className="w-4 h-4 text-gray-400" />} placeholder="shop@example.com" />
                  <Input label="Phone Number *" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} icon={<Phone className="w-4 h-4 text-gray-400" />} placeholder="10-digit number" maxLength={10} />
                  <Input label="Password *" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} icon={<Lock className="w-4 h-4 text-gray-400" />} placeholder="Create password" />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <Input label="Shop Name *" name="shopName" value={formData.shopName} onChange={handleChange} error={errors.shopName} icon={<Store className="w-4 h-4 text-gray-400" />} placeholder="E.g. Fresh Mart" />
                  <Input label="GST Number" name="gstNo" value={formData.gstNo} onChange={handleChange} icon={<FileText className="w-4 h-4 text-gray-400" />} placeholder="Optional" />
                  <Input label="Shop Registration No" name="shopRegisterNo" value={formData.shopRegisterNo} onChange={handleChange} icon={<FileText className="w-4 h-4 text-gray-400" />} placeholder="Optional" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Delivery Option *
                    </label>
                    <div className="relative">
                      <div className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 focus-within:border-green-400 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-green-400/10 dark:focus-within:ring-emerald-400/10">
                        <span className="text-gray-400 mr-3">
                          <Truck className="w-4 h-4 text-gray-400" />
                        </span>
                        <select
                          name="delivery_option"
                          value={formData.delivery_option}
                          onChange={handleChange}
                          className="flex-1 outline-none bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none pr-4 cursor-pointer"
                          required
                        >
                          <option value="self" className="dark:bg-gray-900 dark:text-white">Self Delivery</option>
                          <option value="personNeed" className="dark:bg-gray-900 dark:text-white">Need Delivery Person</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Upload Documents *</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Aadhar Front *</label>
                        <input type="file" name="aadharFront" onChange={handleChange} className="text-xs w-full text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" />
                        {errors.aadharFront && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.aadharFront}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Aadhar Back *</label>
                        <input type="file" name="aadharBack" onChange={handleChange} className="text-xs w-full text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" />
                        {errors.aadharBack && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.aadharBack}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Shop Register Image *</label>
                        <input type="file" name="shopRegisterImage" onChange={handleChange} className="text-xs w-full text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" />
                        {errors.shopRegisterImage && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.shopRegisterImage}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-sm text-center">
                    <MapPin className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Store Location</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-4">
                      We need your location to list your shop correctly for nearby customers.
                    </p>
                    
                    {locationLoading ? (
                      <div className="flex flex-col items-center justify-center py-4 text-purple-600">
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                        <span className="text-sm font-semibold">Detecting location...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-550 block">Latitude</label>
                          <div className="flex items-center w-full px-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 text-gray-500 cursor-not-allowed">
                            <input
                              type="text"
                              value={formData.latitude}
                              readOnly
                              className="w-full bg-transparent outline-none text-xs text-gray-600 dark:text-gray-300 font-mono truncate"
                              placeholder="Auto-detecting..."
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-550 block">Longitude</label>
                          <div className="flex items-center w-full px-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 text-gray-500 cursor-not-allowed">
                            <input
                              type="text"
                              value={formData.longitude}
                              readOnly
                              className="w-full bg-transparent outline-none text-xs text-gray-600 dark:text-gray-300 font-mono truncate"
                              placeholder="Auto-detecting..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!locationLoading && (!formData.latitude || !formData.longitude) && (
                      <button 
                        type="button" 
                        onClick={getLocation} 
                        className="mt-4 text-sm bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-md"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={prevStep} 
                className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div /> // Empty div for spacing
            )}

            {currentStep < 4 ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit} 
                loading={loading}
                disabled={locationLoading || !formData.latitude}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 text-sm shadow-md disabled:opacity-50"
              >
                Complete <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 pt-2 border-t border-gray-100 dark:border-gray-800">
          Already have an account?{' '}
          <Link
            to="/vendor/login"
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default VendorRegisterPage
