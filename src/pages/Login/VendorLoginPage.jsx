import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowRight, ArrowLeft, Store, Clock, X } from 'lucide-react'
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
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
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
      const vendorUser = data.vendor || data.user || data.data || {}
      
      // If vendor is not approved, block dashboard access and prompt pending message
      if (vendorUser.isApproved === false) {
        vendorAuthService.logout()
        setIsApprovalModalOpen(true)
        return
      }

      toast.success('Welcome back, Partner! Login successful')
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

      <AnimatePresence>
        {isApprovalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApprovalModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-white/5 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6 relative z-10 text-center space-y-6"
            >
              <div className="flex justify-end absolute top-4 right-4">
                <button
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="pt-4">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-955/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/30">
                  <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Pending Approval</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 px-2 leading-relaxed">
                  Aapka account abhi verification pipeline me hai. Nearzo Admin team ise review kar rahi hai. Approval hote hi aap panel login kar sakenge. Kripya thoda wait karein!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="w-full py-3 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer border-none"
              >
                Got it, Thank you
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VendorLoginPage
