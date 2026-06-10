import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Leaf,
  MapPin,
  Loader2,
  HelpCircle,
  X,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { authService } from '../../services/authService'

import { useEffect } from 'react'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: null,
    latitude: '',
    longitude: ''
  })
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

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
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied.', { duration: 5000 })
        } else {
          toast.error('Unable to retrieve your location. Please try again.')
        }
      }
    )
  }

  // Auto-fetch location on page mount
  useEffect(() => {
    getLocation()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    const val = type === 'file' ? files[0] : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Location is required to register. Please allow access.')
      getLocation()
      newErrors.location = 'Location required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('latitude', formData.latitude)
      formDataToSend.append('longitude', formData.longitude)
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar)
      }

      await authService.register(formDataToSend)
      toast.success('Account created! Please verify your email with the OTP sent to you.')
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=register`)
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputIconMap = {
    fullName: <User className="w-4 h-4 text-gray-400" />,
    email: <Mail className="w-4 h-4 text-gray-400" />,
    phone: <Phone className="w-4 h-4 text-gray-400" />,
    password: <Lock className="w-4 h-4 text-gray-400" />,
    confirmPassword: <Lock className="w-4 h-4 text-gray-400" />,
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
          <h2 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Create Account</h2>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Join Nearzo today and get the freshest local products delivered directly to your doorstep.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div
        className="p-6 sm:p-12 w-full md:w-1/2 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto no-scrollbar h-auto sm:h-[600px] relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
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
        <div className="flex flex-col items-center mb-2 mt-2 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain" />
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="mb-6 mt-2 md:mt-0 flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join us to start shopping locally</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-200 dark:border-white/10 rounded-xl px-3 py-2 bg-purple-50 dark:bg-white/5 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Help
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={<User className="w-4 h-4 text-gray-400" />}
          />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Avatar Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                className="text-xs w-full text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer bg-white dark:bg-gray-900 rounded-lg border border-gray-250 dark:border-white/10 p-2.5"
              />
            </div>
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="1234567890"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<Phone className="w-4 h-4 text-gray-400" />}
            maxLength={10}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 6 chars with uppercase & number"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
          />

          {/* Location status */}
          <div className="pt-1">
            {locationLoading && (
              <div className="flex items-center gap-2 justify-center py-2 text-purple-600 dark:text-purple-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">Auto-fetching coordinates...</span>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 pt-1 pb-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
              required
            />
            <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 select-none">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold"
          >
            Create Account
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5 inline align-middle ml-0.5" />
          </Link>
        </p>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-white/10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-inner">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Need Assistance?</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Registration Help</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-90"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-5 text-sm overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="space-y-4">
                  {/* Step 1: Location */}
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-white/5 font-extrabold text-xs shadow-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">Enable Location Access</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Nearzo connects you to hyper-local stores. For a secure registration, please allow your browser's location access so we can fetch your GPS coordinates.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Password Policy */}
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-white/5 font-extrabold text-xs shadow-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">Password Requirements</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        To keep your account secure, your password must be at least 6 characters long and must include at least one uppercase letter (A-Z) and one digit (0-9).
                      </p>
                    </div>
                  </div>

                  {/* Step 3: OTP Verification */}
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-white/5 font-extrabold text-xs shadow-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">OTP Verification</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Upon submitting the registration form, a secure One-Time Password (OTP) will be instantly sent to your email address for account activation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Got It, Thanks!
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

export default RegisterPage