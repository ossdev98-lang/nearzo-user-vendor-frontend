import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Phone, ArrowRight, ArrowLeft, Leaf } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { authService } from '../../services/authService'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await authService.login({ email, password })
      toast.success('Welcome back! Login successful')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Invalid credentials. Please try again.')
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
          <h2 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Welcome to Nearzo</h2>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Your premium neighborhood marketplace. Sourcing freshness, delivering delight.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="p-8 sm:p-12 w-full md:w-1/2 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8">
          <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Logo (only visible on mobile) */}
        <div className="flex flex-col items-center mb-8 mt-4 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain mb-2" />
            <h2 className="text-xl font-bold text-primary">Nearzo</h2>
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="mb-6 mt-4 md:mt-0 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please enter your details to continue</p>
        </div>

        {/* Social Login */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-150 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-sm font-semibold shadow-sm"
          >
            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </motion.button>
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