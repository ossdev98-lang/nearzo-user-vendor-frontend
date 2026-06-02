import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowRight, ArrowLeft, Store } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { vendorAuthService } from '../../services/vendorAuthService'
import { useApp } from '../../context/AppContext'

const VendorLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { setUser } = useApp()

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = await vendorAuthService.login({ email, password })
      toast.success('Welcome back, Partner! Login successful')

      const vendorUser = data.vendor || data.user || data.data || { shopName: 'Partner' }
      setUser(vendorUser)

      navigate('/vendor/dashboard')
    } catch (error) {
      const errorMsg = error.message?.toLowerCase() || ''
      if (errorMsg.includes('verify') || errorMsg.includes('verified') || error.status === 403) {
        toast.error('Please verify your account first.')
        navigate(`/vendor/verify-otp?email=${encodeURIComponent(email)}&type=register`)
      } else {
        toast.error(error.message || 'Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-100/50 dark:border-white/5">
      {/* Left Column - Vendor Specific Image */}
      <div className="hidden md:block w-1/2 relative min-h-[550px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 to-red-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white text-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-16 object-contain mb-6 drop-shadow-xl filter brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-extrabold tracking-wide text-white">Nearzo Partners</h2>
          </div>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Grow your business with us. Manage your store, orders, and products effortlessly.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="p-6 sm:p-12 w-full md:w-1/2 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
        <div className="absolute top-6 left-6 md:top-8 md:left-8">
          <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col items-center mb-2 mt-2 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain" />
          </Link>
        </div>

        <div className="mb-8 mt-2 md:mt-0 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Sign In</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access your partner dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="shop@example.com"
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

          <div className="flex items-center justify-between -mt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Remember me</span>
            </label>
            <Link
              to="/vendor/forgot-password"
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

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Want to become a seller?{' '}
          <Link
            to="/vendor/register"
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            Register your shop <ArrowRight className="w-3.5 h-3.5 inline align-middle ml-0.5" />
          </Link>
        </p>
      </div>
    </div>
  )
}

export default VendorLoginPage
