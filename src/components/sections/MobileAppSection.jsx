import { motion } from 'framer-motion'
import { Apple, ChevronRight } from 'lucide-react'
import { FaAndroid } from 'react-icons/fa'
import downloadAppImg from '../../assets/download-app.png'

const MobileAppSection = () => {
  return (
    <section className="section-padding overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Phone Mockup Frame */}
            <div className="relative mx-auto w-[280px] sm:w-[320px]">
              {/* Device Bezel */}
              <div className="relative bg-gray-900 rounded-[45px] p-3 shadow-2xl shadow-purple-900/20 border-[6px] border-gray-800">
                {/* Notch */}
                <div className="absolute top-3 inset-x-0 flex justify-center z-20">
                  <div className="w-28 h-6 bg-gray-900 rounded-b-3xl flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50"></div>
                  </div>
                </div>

                {/* Screen */}
                <div className="bg-white rounded-[32px] overflow-hidden relative w-full h-[600px] border border-gray-700/50">
                  <img
                    src={downloadAppImg}
                    alt="Nearzo Mobile App"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Floating Decoration */}
            <motion.div
              className="absolute -top-4 -left-20 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-8 -right-20 w-32 h-32 bg-fuchsia-200/30 rounded-full blur-2xl"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </motion.div>

          {/* Right Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Fresh Groceries on Your{' '}
              <span className="text-primary">Fingertips</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Download the nearzo app and experience the fastest grocery delivery in town. From fresh produce to daily essentials — everything you need, delivered in minutes.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              {[
                'Lightning fast 10-minute delivery',
                'Real-time order tracking',
                'Exclusive app-only deals',
                'Easy reorder favorites',
                'Multiple secure payment options',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <motion.div
                    className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-black/10"
              >
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400">Download on the</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-black/10"
              >
                <FaAndroid className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400">Get it on</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default MobileAppSection