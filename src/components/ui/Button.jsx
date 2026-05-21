import { motion } from 'framer-motion'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
    xl: 'px-10 py-4 text-lg',
  }

  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm',
    outline: 'btn-outline',
    dark: 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/25',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2 
        font-semibold rounded-xl transition-all duration-300
        cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        />
      ) : icon ? (
        <span className={`${children ? '' : ''}`}>{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}

export default Button