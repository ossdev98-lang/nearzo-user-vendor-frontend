import React, { useState, useEffect } from 'react'
import { MapPin, Star, Clock, ArrowLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { vendorService } from '../../services/vendorService'
import dummyBanner from '../../assets/images/dummy-banner.jpg'

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

export default function AllShopsPage() {
  const navigate = useNavigate()
  const { coordinates } = useApp()
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchAllShops = async () => {
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
              ? (vendor.logo.startsWith('http') ? vendor.logo : `${baseUrlForImage}${vendor.logo.startsWith('/') ? vendor.logo : '/' + vendor.logo}`)
              : dummyBanner

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
        console.error('Error fetching all shops:', error)
        setShops([])
      } finally {
        setLoading(false)
      }
    }

    if (coordinates.latitude && coordinates.longitude) {
      fetchAllShops()
    }
  }, [coordinates.latitude, coordinates.longitude])

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.shopCategory.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-white/5 hover:bg-gray-100 transition-colors text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                All Shops <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Near You</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                Discover all localized stores delivering fresh items directly to you
              </p>
            </div>
          </div>

          {/* Search bar inside page */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm text-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="w-full aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-800 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredShops.map((shop) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="bg-white dark:bg-gray-900 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-purple-950/20 transition-all duration-300 relative group cursor-pointer flex flex-col h-full border border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-500/30 overflow-hidden min-w-0"
              >
                {/* Image Container */}
                <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl h-[100px] sm:h-[150px] w-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = dummyBanner;
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Shop Info */}
                <div className="pt-3 pb-1 px-1 flex flex-col flex-grow">
                  {shop.shopCategory && (
                    <p className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                      {shop.shopCategory}
                    </p>
                  )}

                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white leading-tight line-clamp-2 mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {shop.name}
                  </h3>



                  <div className="mt-auto border-t border-gray-50 dark:border-white/5 pt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>{shop.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      <span className="truncate max-w-[80px]">{shop.address}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No matching shops</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              We couldn't find any shops matching "{searchTerm}".
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
