import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { ShoppingCart, Star } from 'lucide-react'
import { productsData } from './PopularProductsSection'
import { useNavigate } from 'react-router-dom'

const ShopProductsSection = ({ selectedCategory }) => {
  const navigate = useNavigate()
  const items = selectedCategory ? productsData.filter((p) => p.category === selectedCategory) : productsData
  const { addToCart, cart } = useApp()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {selectedCategory ? `${selectedCategory}` : 'All Products'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((product, index) => {
          const isInCart = cart.some((item) => item.id === product.id)
          const originalPrice = product.price / (1 - product.discount / 100)

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative w-32 h-32 shrink-0 bg-[#fbfbfd] dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-3">
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
                    -{product.discount}%
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0 flex flex-col h-full justify-center">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-0.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {product.unit}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {product.rating}
                    </span>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col">
                    {product.discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(product)
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isInCart
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-primary hover:text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}

export default ShopProductsSection
