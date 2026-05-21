import { motion } from 'framer-motion'

const StatCard = ({ stat, label, icon: Icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mb-3 shadow-lg shadow-green-500/20 group hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <motion.h3
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 + index * 0.1 }}
        className="text-3xl font-bold text-gray-900 dark:text-white"
      >
        {stat}
      </motion.h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  )
}

export default StatCard