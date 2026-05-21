import { motion } from 'framer-motion'

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="relative p-6 rounded-2xl glass-card text-center group cursor-pointer"
    >
      <div className="relative mb-4 inline-block">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-green-600 dark:text-emerald-400" />
        </div>
        <motion.div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center border border-gray-100 dark:border-white/10"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          <Icon className="w-2.5 h-2.5 text-green-500" />
        </motion.div>
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-emerald-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

export default FeatureCard