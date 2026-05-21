import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { KeyRound, ArrowLeft, ArrowRight } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { authService } from '../../services/authService'

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const email = searchParams.get('email')

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) return toast.error('Please enter OTP')
    
    setLoading(true)
    try {
      await authService.verifyOtp(email, otp)
      toast.success('OTP verified successfully')
      navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await authService.forgotPassword(email)
      toast.success('OTP resent to your email')
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-100/50 dark:border-white/5">
      <div className="hidden md:block w-1/2 relative min-h-[550px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/70 to-indigo-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white text-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-16 object-contain mb-6 drop-shadow-xl" />
          </Link>
          <h2 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Verify OTP</h2>
          <p className="text-purple-100 text-sm font-light max-w-xs leading-relaxed">
            Please check your email and enter the code to continue.
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-12 w-full md:w-1/2 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
        <div className="absolute top-6 left-6 md:top-8 md:left-8">
          <Link to="/forgot-password" className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8 mt-4 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain mb-2" />
            <h2 className="text-xl font-bold text-primary">Nearzo</h2>
          </Link>
        </div>

        <div className="mb-6 mt-4 md:mt-0 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify OTP</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter the OTP sent to {email}</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Enter OTP"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            icon={<KeyRound className="w-4 h-4 text-gray-400" />}
            required
            maxLength={6}
          />
          <Button type="submit" loading={loading} size="lg" className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold mt-2">
            Verify OTP <ArrowRight className="w-4 h-4 inline ml-1" />
          </Button>
          <div className="text-center mt-4">
            <button type="button" onClick={handleResendOtp} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyOtpPage
