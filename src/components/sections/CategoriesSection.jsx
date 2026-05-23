import { motion } from 'framer-motion'

const categoriesData = [
  { name: 'Fruits', icon: '🍎', count: '120+', gradient: 'from-red-100 to-orange-100' },
  { name: 'Vegetables', icon: '🥦', count: '150+', gradient: 'from-green-100 to-emerald-100' },
  { name: 'Dairy & Eggs', icon: '🥛', count: '80+', gradient: 'from-blue-100 to-indigo-100' },
  { name: 'Meat & Fish', icon: '🥩', count: '60+', gradient: 'from-rose-100 to-red-100' },
  { name: 'Bakery', icon: '🍞', count: '90+', gradient: 'from-amber-100 to-yellow-100' },
  { name: 'Beverages', icon: '🥤', count: '100+', gradient: 'from-cyan-100 to-sky-100' },
  { name: 'Snacks', icon: '🍿', count: '110+', gradient: 'from-purple-100 to-violet-100' },
  { name: 'Groceries', icon: '🛒', count: '200+', gradient: 'from-lime-100 to-green-100' },
]

const CategoriesSection = ({ selectedCategory, onSelect }) => {
  const sampleItems = {
    Fruits: ['Bananas', 'Apples', 'Strawberries'],
    Vegetables: ['Broccoli', 'Spinach', 'Carrots'],
    'Dairy & Eggs': ['Milk', 'Eggs', 'Cheese'],
    'Meat & Fish': ['Chicken', 'Salmon', 'Mutton'],
    Bakery: ['Bread', 'Croissant', 'Bagel'],
    Beverages: ['Orange Juice', 'Coffee', 'Tea'],
    Snacks: ['Chips', 'Cookies', 'Nuts'],
    Groceries: ['Rice', 'Pulses', 'Cooking Oil'],
  }

  return (
    <section className="section-padding" id="categories">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-gray-900 dark:text-white">Shop by</span>{' '}
            <span className="text-primary">Category</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            Explore our wide range of fresh, quality products organized just for you
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {categoriesData.map((category, index) => (
            <div
              key={category.name}
              onClick={() => onSelect && onSelect(category.name)}
              className={`group flex flex-col items-center p-5 sm:p-6 rounded-2xl glass-card-hover text-center cursor-pointer transition-all duration-300 ${selectedCategory === category.name ? 'ring-4 ring-primary/20' : ''}`}
            >
              <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                whileHover={{ rotate: 10, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-3xl">{category.icon}</span>
              </motion.div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{category.count} products</p>
            </div>
          ))}
        </motion.div>

        {/* Selected category preview */}
        {selectedCategory && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-3">From {selectedCategory}</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {(sampleItems[selectedCategory] || []).map((item) => (
                <div key={item} className="min-w-[160px] p-4 rounded-xl bg-secondary flex-shrink-0">
                  <div className="h-32 bg-white/10 rounded-md mb-3 flex items-center justify-center text-2xl">🧾</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{item}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View All */}
        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary-10 hover:text-white transition-all duration-300"
          >
            View All Categories →
          </motion.button>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection