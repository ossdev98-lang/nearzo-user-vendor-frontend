import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'

const LoadingScreen = ({ isVisible }) => {
  const text = "nearzo"
  const letters = Array.from(text)

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.5,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  }

  const mapPinAnimation = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 150,
        delay: 0.6
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white dark:bg-gray-900"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex items-center text-5xl sm:text-7xl font-extrabold tracking-tight text-[#6C4CF1] overflow-hidden p-4"
          >
            {letters.map((letter, index) => (
              <motion.span variants={child} key={index} className="inline-block">
                {letter}
              </motion.span>
            ))}
            <motion.div variants={mapPinAnimation} className="ml-1 -mt-4 sm:-mt-6">
              <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-[#6C4CF1] fill-[#6C4CF1]" />
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-10 flex flex-col items-center gap-3"
          >
            <div className="w-32 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-1/2 h-full bg-[#6C4CF1] rounded-full"
              />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-widest">
              Delivering freshness
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen
