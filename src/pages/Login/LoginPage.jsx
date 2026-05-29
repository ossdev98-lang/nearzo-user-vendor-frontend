import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Phone, ArrowRight, ArrowLeft, Leaf, Loader2 } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { authService } from '../../services/authService'
import { useApp } from '../../context/AppContext'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useApp()

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!latitude || !longitude) {
      toast.error('Location is required for login. Please allow access.')
      getLocation()
      return
    }

    setLoading(true)
    try {
      const data = await authService.googleLogin({
        idToken: credentialResponse.credential,
        latitude: Number(latitude),
        longitude: Number(longitude)
      })
      toast.success('Welcome back! Google Login successful')

      const loggedUser = data.user || data.data || { name: 'User' }
      setUser(loggedUser)

      const localCartStr = localStorage.getItem('cart')
      let hasLocalCart = false
      if (localCartStr) {
        try {
          const items = JSON.parse(localCartStr)
          if (Array.isArray(items) && items.length > 0) hasLocalCart = true
        } catch {}
      }

      if (hasLocalCart) navigate('/checkout')
      else navigate('/')
    } catch (error) {
      toast.error(error.message || 'Google login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude).toFixed(6))
        setLongitude(Number(position.coords.longitude).toFixed(6))
        setLocationLoading(false)
      },
      (error) => {
        setLocationLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied', { duration: 5000 })
        } else {
          toast.error('Unable to retrieve your location. Please try again.')
        }
      }
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email or phone is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/^\d{10}$/.test(email)) {
      newErrors.email = 'Enter a valid email or 10-digit phone number'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!latitude || !longitude) {
      toast.error('Location is required to sign in. Please allow access.')
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
      const role = new URLSearchParams(window.location.search).get('role') || 'user'
      const data = await authService.login({ email, password, role, latitude, longitude })
      toast.success('Welcome back! Login successful')

      const loggedUser = data.user || data.data || { name: 'User' }
      setUser(loggedUser)

      // Redirect to checkout/order page if local cart is not empty
      const localCartStr = localStorage.getItem('cart')
      let hasLocalCart = false
      if (localCartStr) {
        try {
          const items = JSON.parse(localCartStr)
          if (Array.isArray(items) && items.length > 0) {
            hasLocalCart = true
          }
        } catch { }
      }

      if (hasLocalCart) {
        navigate('/checkout')
      } else {
        navigate('/')
      }
    } catch (error) {
      const errorMsg = error.message?.toLowerCase() || ''
      if (errorMsg.includes('verify') || errorMsg.includes('verified') || error.status === 403) {
        toast.error('Please verify your account first.')
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=register`)
      } else {
        toast.error(error.message || 'Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-100/50 dark:border-white/5">
      {/* Left Column - Beautiful Grocery Unsplash Image with Centered Nearzo Logo */}
      <div className="hidden md:block w-1/2 relative min-h-[550px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/70 to-indigo-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white text-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-16 object-contain mb-6 drop-shadow-xl" />
          </Link>
          <h2 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Welcome to NearZo</h2>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Your premium neighborhood marketplace. Sourcing freshness, delivering delight.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="p-6 sm:p-12 w-full md:w-1/2 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8">
          <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please enter your details to continue</p>
        </div>

        {/* Social Login */}
        <div className="mb-6 flex justify-center w-full">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
              />
            </div>
          </GoogleOAuthProvider>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            or email
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
          />

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between -mt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          {/* Location status */}
          <div className="pt-1">
            {locationLoading && (
              <div className="flex items-center gap-2 justify-center py-2 text-purple-600 dark:text-purple-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">Auto-fetching coordinates...</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold"
          >
            Sign In
          </Button>
        </form>

        {/* Signup link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            Create Account <ArrowRight className="w-3.5 h-3.5 inline align-middle ml-0.5" />
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage