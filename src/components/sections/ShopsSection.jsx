import React, { useState, useEffect } from 'react'
import { MapPin, Star, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import API from '../../services/api'

export const dummyShops = [
  { id: 1, name: 'Fresh Mart', categories: ['Fruits', 'Vegetables'], image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop', rating: 4.8, time: '10-15 mins', address: '123 Main St' },
  { id: 2, name: 'Dairy Delight', categories: ['Dairy'], image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop', rating: 4.5, time: '15-20 mins', address: '456 Oak Ave' },
  { id: 4, name: "The Baker's Dozen", categories: ['Bakery', 'Snacks'], image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', rating: 4.9, time: '10-20 mins', address: '321 Elm St' },
  { id: 5, name: 'Beverage Bazaar', categories: ['Beverages'], image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop', rating: 4.6, time: '10-15 mins', address: '654 Maple Dr' },
  { id: 6, name: 'Snack Attack', categories: ['Snacks'], image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop', rating: 4.4, time: '15-25 mins', address: '987 Cedar Rd' },
  { id: 7, name: 'Super Grocers', categories: ['Groceries', 'Fruits', 'Vegetables', 'Dairy'], image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', rating: 4.3, time: '25-30 mins', address: '159 Birch Blvd' },
  { id: 8, name: 'Healthy Bites', categories: ['Fruits', 'Snacks'], image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop', rating: 4.7, time: '12-18 mins', address: '753 Walnut St' }
]

export default function ShopsSection({ selectedCategory }) {
  const navigate = useNavigate()
  const { coordinates } = useApp()
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNearbyShops = async () => {
      setLoading(true)
      try {
        const response = await API.get('/vendors/nearby', {
          params: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          }
        })
        if (response.data && response.data.success && Array.isArray(response.data.vendors)) {
          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          
          const mappedShops = response.data.vendors.map(vendor => {
            const categories = vendor.products && vendor.products.length > 0
              ? Array.from(new Set(vendor.products.map(p => p.categoryName).filter(Boolean)))
              : ['Groceries']
            const finalCategories = categories.length > 0 ? categories : ['Groceries']

            const shopCategory = vendor.ShopCategory?.shopCategoryName || vendor.shopCategoryName || 'Groceries'

            const imageUrl = vendor.logo
              ? (vendor.logo.startsWith('http') ? vendor.logo : `${baseUrlForImage}${vendor.logo}`)
              : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'

            const calculatedTime = vendor.distanceKm 
              ? `${Math.round(vendor.distanceKm * 5 + 10)}-${Math.round(vendor.distanceKm * 5 + 15)} mins`
              : '10-20 mins'

            const distanceStr = vendor.distanceKm !== undefined
              ? `${vendor.distanceKm.toFixed(2)} km away`
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
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse">
                <div className="w-full aspect-[4/3] rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-800 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory ? `${selectedCategory} Shops` : 'All Shops Near You'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Explore the best stores delivering to your location
            </p>
          </div>
        </div>

        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl shadow-sm mb-3 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-2 right-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-extrabold text-gray-900 dark:text-white">{shop.rating}</span>
                  </div>
                </div>

                <div className="px-1 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate pr-2">
                      {shop.name}
                    </h3>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mt-1 text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <span>{shop.time}</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <div className="flex items-center gap-1 truncate max-w-[120px] sm:max-w-[100px]">
                      <span className="truncate">{shop.address}</span>
                    </div>
                  </div>
                </div>
              </div>
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
