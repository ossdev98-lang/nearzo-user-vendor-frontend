import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { authService } from '../../services/authService'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      toast.success('OTP sent to your email')
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-100/50 dark:border-white/5">
      {/* Left Column */}
      <div className="hidden md:block w-1/2 relative min-h-[550px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/70 to-indigo-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white text-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-16 object-contain mb-6 drop-shadow-xl" />
          </Link>
          <h2 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Reset Password</h2>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Securely recover your account and get back to shopping the freshest groceries.
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="p-8 sm:p-12 w-full md:w-1/2 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
        <div className="absolute top-6 left-6 md:top-8 md:left-8">
          <Link to="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8 mt-4 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain mb-2" />
            <h2 className="text-xl font-bold text-primary">Nearzo</h2>
          </Link>
        </div>

        <div className="mb-6 mt-4 md:mt-0 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive an OTP</p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            required
          />
          <Button type="submit" loading={loading} size="lg" className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold mt-2">
            Send OTP <ArrowRight className="w-4 h-4 inline ml-1" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
