import { motion } from 'framer-motion'
import { Leaf, Truck, Clock, Shield, Headphones, CreditCard } from 'lucide-react'

const featuresData = [
  {
    icon: Clock,
    title: '10-Min Delivery',
    description: 'Lightning fast delivery of your fresh groceries in just 10 minutes or less.',
  },
  {
    icon: Leaf,
    title: '100% Fresh & Organic',
    description: 'Farm-fresh produce sourced directly from local organic farms every morning.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Pay with cash, card, UPI, or wallet. Seamless checkout experience.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to help you with any queries or issues.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'If you are not satisfied, we guarantee a full refund or free replacement.',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Enjoy free delivery on all orders above ₹200. No hidden charges.',
  },
]

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-950">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-gray-900 dark:text-white">Why Choose</span>{' '}
            <span className="text-purple-600 dark:text-purple-400">Nearzo?</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            We deliver the freshest groceries with the best quality and fastest speed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <div key={index} className="p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-sm border border-purple-100/50 dark:border-white/5 hover:shadow-2xl hover:border-purple-200 dark:hover:border-purple-800/50 hover:-translate-y-1 transition-all duration-300 text-center group">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-600 transition-colors duration-300"
              >
                <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors duration-300" />
              </motion.div>
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection