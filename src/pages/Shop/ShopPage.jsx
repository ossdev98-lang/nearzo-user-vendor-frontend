import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Share } from 'lucide-react'
import { dummyShops } from '../../components/sections/ShopsSection'
import ShopProductsSection from '../../components/sections/ShopProductsSection'

const ShopPage = () => {
  const { id } = useParams()
  const shop = dummyShops.find(s => s.id === parseInt(id)) || dummyShops[0]
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Sub-nav categories. For the example, we use the shop's categories.
  const categories = ['HOME', ...shop.categories.map(c => c.toUpperCase())]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16">
      {/* Banner Area */}
      <div className="w-full bg-[#fbfbfd] dark:bg-gray-900 py-16 sm:py-24 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
          {shop.name}
        </h1>
      </div>

      {/* Sub Navigation (like Apple) */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Left side nav */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0 mr-2">
                {shop.name}
              </span>
              
              <button className="hidden sm:flex items-center justify-center px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Follow
              </button>
              
              <button className="hidden sm:block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Share className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat === 'HOME' ? null : shop.categories[idx - 1])}
                    className={`whitespace-nowrap pb-1 transition-colors ${
                      (cat === 'HOME' && !selectedCategory) || (idx > 0 && shop.categories[idx - 1] === selectedCategory)
                        ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side search */}
            <div className="hidden lg:flex items-center ml-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search all ${shop.name}`}
                  className="w-48 xl:w-64 pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Banner Image (like "Discover what's new") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <div className="relative rounded-2xl overflow-hidden h-[300px] sm:h-[400px] lg:h-[500px]">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-xl leading-tight">
              Discover what's new at {shop.name}.
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 max-w-md">
              Fresh produce, daily essentials, and exclusive deals waiting for you.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="pb-20">
        <ShopProductsSection selectedCategory={selectedCategory} />
      </div>

    </div>
  )
}

export default ShopPage
