import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { dummyShops } from '../../components/sections/ShopsSection'
import ShopProductsSection from '../../components/sections/ShopProductsSection'

const ShopPage = () => {
  const { id } = useParams()
  const shop = dummyShops.find(s => s.id === parseInt(id)) || dummyShops[0]
  const [selectedCategory, setSelectedCategory] = useState(null)

  const scrollRef = useRef(null)
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
      }
    }
  }

  // Extended categories for the slider
  const extendedCategories = ['Fruits', 'Vegetables', 'Dairy & Eggs', 'Bakery', 'Meat', 'Beverages', 'Snacks', 'Personal Care', 'Household']
  const categories = ['Home', ...new Set([...shop.categories, ...extendedCategories])]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16">
      {/* Banner Area */}
      <div className="relative w-full h-[250px] sm:h-[350px] bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full z-10">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-start gap-6">
            {/* Store Avatar Thumbnail */}
            <div className="hidden md:block shrink-0">
               <div className="w-40 h-40 bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20">
                 <img src={shop.image} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
               </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                {shop.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-200 mb-4">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                  <Star className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white">{shop.rating}</span>
                </div>
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  <Clock className="w-4.5 h-4.5 text-white" />
                  <span className="font-medium text-white">{shop.time}</span>
                </div>
                <div className="flex items-center gap-1.5 drop-shadow-md">
                  <MapPin className="w-4.5 h-4.5 text-white" />
                  <span className="font-medium text-white">{shop.address}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {shop.categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation (like Apple) */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Left side nav */}
            <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 pr-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0 mr-2">
                {shop.name}
              </span>

              <button className="hidden sm:flex shrink-0 items-center justify-center px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Follow
              </button>

              {/* Slider Section */}
              <div className="relative flex-1 flex items-center min-w-0 ml-2">
                <button 
                  onClick={() => scroll('left')}
                  className="hidden sm:flex absolute left-0 z-10 p-1 bg-gradient-to-r from-white/90 via-white/80 to-transparent dark:from-gray-950/90 dark:via-gray-950/80 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div 
                  ref={scrollRef}
                  className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar scroll-smooth sm:px-8 w-full"
                >
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(cat === 'Home' ? null : cat)}
                      className={`whitespace-nowrap pb-1 transition-colors ${(cat === 'Home' && !selectedCategory) || (cat === selectedCategory)
                          ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => scroll('right')}
                  className="hidden sm:flex absolute right-0 z-10 p-1 bg-gradient-to-l from-white/90 via-white/80 to-transparent dark:from-gray-950/90 dark:via-gray-950/80 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
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
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <div className="relative rounded-2xl overflow-hidden h-[150px] sm:h-[200px] lg:h-[250px]">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 max-w-xl leading-tight">
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
