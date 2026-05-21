import { motion } from 'framer-motion'

const Spinner = ({ size = 'md', color = 'green' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2.5',
    lg: 'w-8 h-8 border-3',
    xl: 'w-10 h-10 border-4',
  }

  const colors = {
    green: 'border-green-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent',
    emerald: 'border-emerald-500 border-t-transparent',
  }

  return (
    <motion.div
      className={`inline-block rounded-full ${sizes[size]} ${colors[color]} animate-spin`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export default Spinner