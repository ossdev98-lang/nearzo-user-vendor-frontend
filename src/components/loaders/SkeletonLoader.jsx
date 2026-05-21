import { motion } from 'framer-motion'

const SkeletonLoader = ({
  variant = 'rectangle',
  width = '100%',
  height = '200px',
  className = '',
  animated = true,
}) => {
  return (
    <motion.div
      className={`rounded-xl bg-gray-200 dark:bg-white/5 overflow-hidden ${className}`}
      style={{ width, height }}
      animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={animated ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {variant === 'text' && (
        <div className="h-full w-full flex flex-col gap-3 p-4">
          <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-gray-300 dark:bg-white/10" />
        </div>
      )}
      {variant === 'circle' && (
        <div className="h-full w-full rounded-full bg-gray-300 dark:bg-white/10 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-full bg-gray-400 dark:bg-white/10" />
        </div>
      )}
      {variant === 'card' && (
        <div className="h-full w-full p-4 flex flex-col gap-3">
          <div className="h-40 w-full rounded-lg bg-gray-300 dark:bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-white/10" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-16 rounded bg-gray-300 dark:bg-white/10" />
            <div className="h-6 w-20 rounded bg-gray-300 dark:bg-white/10" />
          </div>
        </div>
      )}
      {variant === 'rectangle' && <div className="w-full h-full bg-gray-300 dark:bg-white/10" />}
      {variant === 'avatar' && (
        <div className="w-full h-full rounded-full bg-gray-300 dark:bg-white/10" />
      )}
      {variant === 'form' && (
        <div className="h-full w-full p-6 flex flex-col gap-4">
          <div className="h-12 w-full rounded bg-gray-300 dark:bg-white/10" />
          <div className="h-12 w-full rounded bg-gray-300 dark:bg-white/10" />
          <div className="h-12 w-1/2 rounded bg-gray-300 dark:bg-white/10" />
        </div>
      )}
    </motion.div>
  )
}

export default SkeletonLoader