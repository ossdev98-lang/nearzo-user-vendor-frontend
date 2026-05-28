import { useState } from 'react'
import { motion } from 'framer-motion'
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
        toast.error('Unable to retrieve your location. Please allow location access.')
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
      toast.error('Location is required. Please wait for it to be fetched.')
      return false
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
        <div className="flex flex-col items-center mb-2 mt-2 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain" />
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="mb-6 mt-2 md:mt-0 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join us to start shopping locally</p>
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
          <Input
            label="Avatar Image (Optional)"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            icon={<User className="w-4 h-4 text-gray-400" />}
          />
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

          {/* Latitude & Longitude Coordinates (Always Visible & Disabled) */}
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Latitude *" 
              name="latitude" 
              value={formData.latitude} 
              disabled={true}
              className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed font-semibold text-sm"
              placeholder={locationLoading ? "Detecting..." : "Auto-filled"} 
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
            <Input 
              label="Longitude *" 
              name="longitude" 
              value={formData.longitude} 
              disabled={true}
              className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed font-semibold text-sm"
              placeholder={locationLoading ? "Detecting..." : "Auto-filled"} 
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>

          {/* Location status / Fetch button */}
          <div className="pt-1">
            {locationLoading ? (
              <div className="flex items-center gap-2 justify-center py-2 text-purple-600 dark:text-purple-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">Auto-fetching coordinates...</span>
              </div>
            ) : (!formData.latitude || !formData.longitude) ? (
              <div className="text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-3">
                <p className="text-xs text-red-500 dark:text-red-400 font-bold mb-2">Location access required to sign up.</p>
                <button 
                  type="button" 
                  onClick={getLocation} 
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md"
                >
                  Allow & Detect Location
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={getLocation} 
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  Detect Location Coordinates Again
                </button>
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
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
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
    </div>
  )
}

export default RegisterPage