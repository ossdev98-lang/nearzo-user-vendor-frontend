import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ff] to-[#e0e7ff] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden py-12">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl dark:bg-purple-900/20"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl dark:bg-indigo-900/20"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-fuchsia-200/30 rounded-full mix-blend-multiply filter blur-3xl dark:bg-fuchsia-900/20"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Outlet />
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-8 left-8 flex items-center gap-2 opacity-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-purple-300" />
        </motion.div>
      </div>
      <div className="absolute bottom-8 right-8 flex items-center gap-2 opacity-50">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-6 h-6 rounded-full border-2 border-indigo-300" />
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout