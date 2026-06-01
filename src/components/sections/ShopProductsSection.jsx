import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../cards/ProductCard'

const ShopProductsSection = ({ selectedCategory, products, isShopClosed }) => {
  const navigate = useNavigate()
  const items = products || []

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {selectedCategory ? `${selectedCategory}` : 'All Products'}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {items.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} showAddToCart={true} isShopClosed={isShopClosed} />
        ))}
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
