import { motion } from 'framer-motion'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <motion.div
          className={`flex items-center w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
            error
              ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10'
              : 'border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 focus-within:border-green-400 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-green-400/10 dark:focus-within:ring-emerald-400/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {icon && <span className="text-gray-400 mr-3">{icon}</span>}
          <input
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="flex-1 outline-none bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default Input