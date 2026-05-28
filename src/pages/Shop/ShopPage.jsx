import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, MapPin, Clock, ChevronLeft, ChevronRight, Store } from 'lucide-react'
import ShopProductsSection from '../../components/sections/ShopProductsSection'
import API from '../../services/api'

const ShopPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shopData, setShopData] = useState(null)
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const scrollRef = useRef(null)
  const [isScrollable, setIsScrollable] = useState(false)

  const checkScrollable = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current
      setIsScrollable(scrollWidth > clientWidth)
    }
  }

  useEffect(() => {
    const timer = setTimeout(checkScrollable, 200)
    window.addEventListener('resize', checkScrollable)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkScrollable)
    }
  }, [categoriesList, loading])
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true)
      try {
        const response = await API.get(`/vendors/${id}/shop`)
        if (response.data && response.data.success) {
          setShopData(response.data.shop)
          setCategoriesList(response.data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching shop details:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchShopDetails()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-purple-400 animate-spin-reverse"></div>
        </div>
        <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold tracking-wide animate-pulse">Loading shop details...</p>
      </div>
    )
  }

  if (!shopData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 pt-[140px] md:pt-20 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Shop not found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
          We couldn't find the store you were looking for. It might have moved or is temporarily closed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-md"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
  
  const shop = {
    id: shopData.id,
    name: shopData.shopName || 'Nearzo Store',
    image: shopData.banner 
      ? `${baseUrlForImage}${shopData.banner}`
      : (shopData.logo ? `${baseUrlForImage}${shopData.logo}` : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop'),
    rating: parseFloat(shopData.rating) > 0 ? parseFloat(shopData.rating).toFixed(1) : '4.5',
    time: '15-25 mins',
    address: shopData.address || `${shopData.city || 'Indore'}, ${shopData.state || 'MP'}`
  }

  const categories = ['Home', ...categoriesList.map(c => c.name)]

  // Helper to extract mapped products
  const getProducts = () => {
    let list = []
    const targetCategories = selectedCategory 
      ? categoriesList.filter(c => c.name === selectedCategory)
      : categoriesList

    targetCategories.forEach(cat => {
      if (Array.isArray(cat.subCategories)) {
        cat.subCategories.forEach(sub => {
          if (Array.isArray(sub.products)) {
            sub.products.forEach(prod => {
              const discount = prod.discountPrice && prod.discountPrice < prod.price
                ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                : 0

              const prodImage = prod.variants && prod.variants.length > 0 && prod.variants[0].image
                ? `${baseUrlForImage}${prod.variants[0].image}`
                : (shopData.logo ? `${baseUrlForImage}${shopData.logo}` : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop')

              list.push({
                id: prod.id,
                name: prod.name,
                storeName: shopData.shopName || 'Nearzo Store',
                category: cat.name,
                price: prod.discountPrice || prod.price,
                unit: prod.unit || 'piece',
                discount: discount,
                image: prodImage,
                rating: 4.5,
                reviews: 8,
                isNew: false,
                variants: prod.variants || []
              })
            })
          }
        })
      }
    })

    // If there is a search query, filter by name
    if (searchQuery.trim()) {
      return list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return list
  }

  const products = getProducts()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-[140px] md:pt-20">
      {/* Banner Area */}
      <div className="relative w-full h-[180px] sm:h-[240px] bg-gray-900 border-b border-gray-200 dark:border-gray-800">
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
               <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 shadow-2xl border border-white/20">
                 <img src={shop.image} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
               </div>
            </div>

            <div className="pb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
                {shop.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-200 mb-3">
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

              {/* Slider Section */}
              <div className="relative flex-1 flex items-center min-w-0 ml-2">
                {isScrollable && (
                  <button 
                    onClick={() => scroll('left')}
                    className="hidden sm:flex absolute left-0 z-10 p-1 bg-gradient-to-r from-white/90 via-white/80 to-transparent dark:from-gray-950/90 dark:via-gray-950/80 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

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

                {isScrollable && (
                  <button 
                    onClick={() => scroll('right')}
                    className="hidden sm:flex absolute right-0 z-10 p-1 bg-gradient-to-l from-white/90 via-white/80 to-transparent dark:from-gray-950/90 dark:via-gray-950/80 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
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
        <ShopProductsSection selectedCategory={selectedCategory} products={products} />
      </div>

    </div>
  )
}

export default ShopPage
