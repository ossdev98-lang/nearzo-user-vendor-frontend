import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { ShoppingCart } from 'lucide-react'

const EmptyState = ({
  title = 'No items found',
  description = 'Start browsing to add items to your cart',
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          {icon || <ShoppingCart className="w-12 h-12 text-gray-300" />}
        </div>
        <motion.div
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs">😊</span>
        </motion.div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyState