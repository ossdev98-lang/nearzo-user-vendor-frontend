import React, { useState, useEffect } from 'react'
import { MapPin, Star, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { vendorService } from '../../services/vendorService'

export const dummyShops = [
  { id: 1, name: 'Fresh Mart', categories: ['Fruits', 'Vegetables'], image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop', rating: 4.8, time: '10-15 mins', address: '123 Main St' },
  { id: 2, name: 'Dairy Delight', categories: ['Dairy'], image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop', rating: 4.5, time: '15-20 mins', address: '456 Oak Ave' },
  { id: 4, name: "The Baker's Dozen", categories: ['Bakery', 'Snacks'], image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', rating: 4.9, time: '10-20 mins', address: '321 Elm St' },
  { id: 5, name: 'Beverage Bazaar', categories: ['Beverages'], image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop', rating: 4.6, time: '10-15 mins', address: '654 Maple Dr' },
  { id: 6, name: 'Snack Attack', categories: ['Snacks'], image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop', rating: 4.4, time: '15-25 mins', address: '987 Cedar Rd' },
  { id: 7, name: 'Super Grocers', categories: ['Groceries', 'Fruits', 'Vegetables', 'Dairy'], image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', rating: 4.3, time: '25-30 mins', address: '159 Birch Blvd' },
  { id: 8, name: 'Healthy Bites', categories: ['Fruits', 'Snacks'], image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop', rating: 4.7, time: '12-18 mins', address: '753 Walnut St' }
]

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export default function ShopsSection({ selectedCategory }) {
  const navigate = useNavigate()
  const { coordinates } = useApp()
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNearbyShops = async () => {
      setLoading(true)
      try {
        const data = await vendorService.getNearbyVendors(coordinates.latitude, coordinates.longitude)
        if (data && data.success && Array.isArray(data.vendors)) {
          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          
          const mappedShops = data.vendors.map(vendor => {
            const categories = vendor.products && vendor.products.length > 0
              ? Array.from(new Set(vendor.products.map(p => p.categoryName).filter(Boolean)))
              : ['Groceries']
            const finalCategories = categories.length > 0 ? categories : ['Groceries']

            const shopCategory = vendor.ShopCategory?.shopCategoryName || vendor.shopCategoryName || 'Groceries'

            const imageUrl = vendor.logo
              ? (vendor.logo.startsWith('http') ? vendor.logo : `${baseUrlForImage}${vendor.logo}`)
              : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'

            const calculatedDist = calculateDistance(coordinates?.latitude, coordinates?.longitude, vendor.latitude, vendor.longitude);
            const dist = calculatedDist !== null ? calculatedDist : vendor.distanceKm;

            const calculatedTime = dist !== undefined && dist !== null
              ? `${Math.round(dist * 5 + 10)}-${Math.round(dist * 5 + 15)} mins`
              : '10-20 mins'

            const distanceStr = dist !== undefined && dist !== null
              ? `${dist.toFixed(2)} km away`
              : 'Nearby'

            return {
              id: vendor.id,
              name: vendor.shopName || 'Nearzo Store',
              categories: finalCategories,
              shopCategory: shopCategory,
              image: imageUrl,
              rating: vendor.rating || 4.5,
              time: calculatedTime,
              address: distanceStr
            }
          })
          setShops(mappedShops)
        } else {
          setShops([])
        }
      } catch (error) {
        console.error('Error fetching nearby shops:', error)
        setShops([])
      } finally {
        setLoading(false)
      }
    }

    if (coordinates.latitude && coordinates.longitude) {
      fetchNearbyShops()
    }
  }, [coordinates.latitude, coordinates.longitude])

  const filteredShops = selectedCategory
    ? shops.filter(shop => shop.shopCategory && shop.shopCategory.toLowerCase() === selectedCategory.toLowerCase())
    : shops

  if (loading) {
    return (
      <section className="py-8 bg-white dark:bg-gray-900 px-4 sm:px-6">
        <div className="container max-w-[90rem] mx-auto bg-[#EBE4FF] dark:bg-[#292245] rounded-[32px] px-4 sm:px-8 pb-10 pt-0 relative shadow-sm">
          
          <div className="flex justify-center relative w-full h-[95px] sm:h-[110px] mb-4 sm:mb-8">
            <svg 
              className="absolute top-0 w-full max-w-[500px] sm:max-w-[700px] h-full text-white dark:text-gray-900 filter drop-shadow-sm" 
              viewBox="0 0 700 100" 
              preserveAspectRatio="none" 
              fill="currentColor"
            >
              <path d="M0,0 C40,0 60,100 120,100 L580,100 C640,100 660,0 700,0 Z" />
            </svg>
            <div className="relative z-10 pt-5 sm:pt-6 px-6 sm:px-10 text-center flex flex-col items-center">
              <div className="h-8 w-64 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200/50 dark:bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse">
                <div className="w-full aspect-[4/3] rounded-xl sm:rounded-2xl bg-white/50 dark:bg-gray-800/50 mb-3"></div>
                <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/50 dark:bg-gray-800/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-white dark:bg-gray-900 px-4 sm:px-6">
      <div className="container max-w-[90rem] mx-auto bg-[#acbdff] dark:bg-[#292245] rounded-[32px] px-4 sm:px-8 pb-10 pt-0 relative shadow-sm">
        
        <div className="flex justify-center relative w-full h-[95px] sm:h-[110px] mb-4 sm:mb-8">
          <svg 
            className="absolute top-0 w-full max-w-[500px] sm:max-w-[700px] h-full text-white dark:text-gray-900 filter drop-shadow-sm" 
            viewBox="0 0 700 100" 
            preserveAspectRatio="none" 
            fill="currentColor"
          >
            <path d="M0,0 C40,0 60,100 120,100 L580,100 C640,100 660,0 700,0 Z" />
          </svg>
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 pt-5 sm:pt-6 px-6 sm:px-10 text-center flex flex-col items-center"
          >
            <h2 className="text-2xl sm:text-[2.2rem] font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight">
              {selectedCategory ? (
                <>{selectedCategory} <span className="text-[#6C4CF1] dark:text-[#9A81F8]">Shops</span></>
              ) : (
                <>All Shops <span className="text-[#6C4CF1] dark:text-[#9A81F8]">Near You</span></>
              )}
            </h2>
            <p className="text-[#6C4CF1] dark:text-[#9A81F8] font-semibold text-[11px] sm:text-sm">
              Explore the best stores delivering to your location
            </p>
          </motion.div>
        </div>

        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 mt-6 sm:mt-8">
            {filteredShops.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="bg-white rounded-[16px] sm:rounded-[24px] p-2 sm:p-3 shadow-sm hover:shadow-xl transition-all duration-300 relative group cursor-pointer flex flex-col h-full border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden min-w-0"
              >
                {/* Image Container */}
                <div className="relative bg-[#F8F9FA] dark:bg-gray-800 rounded-[12px] sm:rounded-[16px] h-[90px] sm:h-[160px] w-full flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Shop Info */}
                <div className="pt-4 pb-1 px-1 flex flex-col flex-grow">
                  {/* Category */}
                  {shop.shopCategory && (
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                      {shop.shopCategory}
                    </p>
                  )}
                  
                  {/* Title */}
                  <h3 className="text-[13px] sm:text-[15px] font-semibold text-gray-800 dark:text-white leading-tight line-clamp-2 mb-1">
                    {shop.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= Math.floor(shop.rating || 5)
                            ? 'text-[#FFB800] fill-[#FFB800]'
                            : 'text-gray-200 fill-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium ml-1">
                      ({shop.rating || '5.0'})
                    </span>
                  </div>

                  <div className="mt-auto">
                    {/* Time and Distance */}
                    <div className="flex flex-wrap items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 gap-y-2">
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C4CF1]" />
                        <span>{shop.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C4CF1]" />
                        <span className="truncate max-w-[80px] sm:max-w-[100px]">{shop.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No shops found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              We couldn't find any shops in the "{selectedCategory}" category right now. Try selecting another category.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
