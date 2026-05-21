import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative flex flex-col items-center p-6 rounded-2xl glass-card-hover cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <img
            src={category.icon}
            alt={category.name}
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${category.name}&background=22c55e&color=fff&size=64` }}
          />
        </div>
        <motion.div
          className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center border border-gray-100 dark:border-white/10"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          <ArrowRight className="w-3 h-3 text-green-500" />
        </motion.div>
      </div>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
        {category.name}
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{category.count} items</p>
    </motion.div>
  )
}

export default CategoryCard