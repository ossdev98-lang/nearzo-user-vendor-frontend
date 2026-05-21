import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Clock, Leaf, Truck } from 'lucide-react'
import { useState } from 'react'

const HeroSection = ({ selectedCategory, onSelect }) => {
  const categories = [
    { name: 'Fruits', icon: '🍎' },
    { name: 'Vegetables', icon: '🥦' },
    { name: 'Dairy & Eggs', icon: '🥛' },
    { name: 'Meat & Fish', icon: '🥩' },
    { name: 'Bakery', icon: '🍞' },
    { name: 'Beverages', icon: '🥤' },
    { name: 'Snacks', icon: '🍿' },
    { name: 'Groceries', icon: '🛒' },
  ]

  const sampleShops = {
    Fruits: ['Fruit Bazaar', 'Tropical Fruits', 'Fresh Picks'],
    Vegetables: ['Green Farm', 'Veggie Market', 'Organic Greens'],
    'Dairy & Eggs': ['Daily Fresh', 'Milk & More', 'Egg House'],
    'Meat & Fish': ['Seafood Hub', 'Butcher\'s Choice'],
    Bakery: ['Bakehouse', 'Morning Bakes'],
    Beverages: ['Liquid Love', 'Juice Corner'],
    Snacks: ['Crunch Corner', 'Snack Shack'],
    Groceries: ['Daily Needs', 'Pantry Plus'],
  }
  const [localSelected, setLocalSelected] = useState(selectedCategory || null)

  const handleSelect = (name) => {
    setLocalSelected(name)
    if (onSelect) onSelect(name)
  }
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-10 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-primary-10 rounded-full filter blur-2xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side content removed as requested */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          />

          {/* Right Side - decorative placeholder (illustration removed as requested) */}
          <div className="relative" aria-hidden="true">
            <div className="w-full max-w-md mx-auto h-64 rounded-3xl glass-card bg-primary-10" />
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 w-[200%] h-32 bg-gradient-to-r from-transparent via-green-500/5 to-transparent"
        />
      </div>
    </section>
  )
}

export default HeroSection