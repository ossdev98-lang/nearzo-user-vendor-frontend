import { motion } from 'framer-motion'

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    discount: 'bg-red-500 text-white',
    new: 'bg-emerald-500 text-white',
    hot: 'bg-red-500 text-white',
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </motion.span>
  )
}

export default Badge