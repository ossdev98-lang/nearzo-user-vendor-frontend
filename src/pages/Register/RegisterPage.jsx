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
} from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import logo from '../../assets/nearzo-logo.png'
import { authService } from '../../services/authService'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      toast.success('Account created successfully! Welcome to Nearzo')
      navigate('/')
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
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-100/50 dark:border-white/5 max-h-[600px] w-full">
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
        className="p-8 sm:p-12 w-full md:w-1/2 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto no-scrollbar h-[600px] relative"
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
        <div className="flex flex-col items-center mb-6 mt-6 md:hidden">
          <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain mb-2" />
            <h2 className="text-xl font-bold text-primary">Nearzo</h2>
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="mb-6 mt-6 md:mt-8 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join us to start shopping locally</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
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