import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const BannerSection = () => {
  return (
    <section className="section-padding overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Promo Banner 1 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative rounded-3xl overflow-hidden h-[300px] sm:h-[350px] cursor-pointer group"
          >
            <div className="absolute inset-0 bg-primary-gradient" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />

            {/* Floating Elements */}
            <motion.div
              className="absolute top-6 left-6 w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm animate-float"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-2xl flex items-center justify-center h-full">🎉</span>
            </motion.div>

            <motion.div
              className="absolute bottom-6 right-6 w-12 h-12 bg-amber-400/30 rounded-full backdrop-blur-sm animate-float-delayed"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />

            <div className="relative z-20 h-full flex flex-col justify-center p-8">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-white text-sm font-medium mb-2 uppercase tracking-wider"
              >
                Limited Time Offer
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white text-3xl sm:text-4xl font-extrabold mb-3 leading-tight"
                style={{ color: '#ffffff' }}
              >
                Buy 2 Get 1 Free
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-white text-sm mb-6 max-w-sm"
              >
                On all fresh fruits and vegetables. Limited period offer.
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-fit bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-10 transition-all duration-300 shadow-lg"
              >
                Shop Now →
              </motion.button>
            </div>
          </motion.div>

          {/* Promo Banner 2 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative rounded-3xl overflow-hidden h-[300px] sm:h-[350px] cursor-pointer group"
          >
            <div className="absolute inset-0 bg-primary-gradient" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />

            <motion.div
              className="absolute top-8 right-8 w-20 h-20 bg-white/15 rounded-full backdrop-blur-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-20 h-full flex flex-col justify-center p-8">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-white text-sm font-medium mb-2 uppercase tracking-wider"
              >
                Fresh & Organic
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white text-3xl sm:text-4xl font-extrabold mb-3 leading-tight"
                style={{ color: '#ffffff' }}
              >
                Premium Organic<br />Groceries
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-white text-sm mb-6 max-w-sm"
              >
                Handpicked organic products from the best farms, delivered fresh to your door.
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-fit bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-10 transition-all duration-300 shadow-lg"
              >
                Explore Now →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default BannerSection