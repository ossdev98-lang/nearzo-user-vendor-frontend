import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="text-center px-4">
        <div className="relative inline-block mb-8">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mx-auto shadow-2xl shadow-green-200/50">
            <span className="text-5xl">😕</span>
          </div>
          <motion.div
            className="absolute -top-4 -right-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce-slow"
          >
            <span className="text-2xl font-bold text-white">404</span>
          </motion.div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
            >
              Back to Home
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white font-semibold rounded-xl hover:border-green-400 dark:hover:border-emerald-400 hover:bg-green-50 dark:hover:bg-white/5 transition-all duration-300"
            >
              Sign In
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default NotFoundPage