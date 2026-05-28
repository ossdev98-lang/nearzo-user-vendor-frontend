import React, { useEffect, useState } from 'react'
import groceryGif from '../../assets/gifs/Grocery shopping bag pickup and delivery.gif'
import API from '../../services/api'

// Fallback images for dynamic category names if image is null
const categoryImageFallbacks = {
  Fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
  Dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop',
  Vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&h=200&fit=crop',
  Beverages: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&h=200&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200&h=200&fit=crop',
  Bakery: 'https://images.unsplash.com/photo-1542831371-d531d36971e6?w=200&h=200&fit=crop',
}

export default function CategoryPills({ selected, onSelect }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/shop-categories')
        if (response.data && response.data.success && Array.isArray(response.data.shopCategories)) {
          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          
          const dynamicCategories = response.data.shopCategories.map(c => {
            const finalImage = c.image
              ? `${baseUrlForImage}${c.image}`
              : (categoryImageFallbacks[c.shopCategoryName] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop')
            return {
              name: c.shopCategoryName,
              image: finalImage
            }
          })
          
          // Add 'All' Category to the front
          setCategories([
            { name: 'All', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop' },
            ...dynamicCategories
          ])
        }
      } catch (error) {
        console.error('Error fetching categories from API:', error)
        // Fallback static categories
        setCategories([
          { name: 'All', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop' },
          { name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
          { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&h=200&fit=crop' },
          { name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop' },
          { name: 'Beverages', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&h=200&fit=crop' },
          { name: 'Snacks', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200&h=200&fit=crop' },
          { name: 'Bakery', image: 'https://images.unsplash.com/photo-1542831371-d531d36971e6?w=200&h=200&fit=crop' }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="w-full border-b border-gray-100 bg-white py-4 flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Left GIF */}
          <div className="hidden lg:flex w-28 xl:w-32 flex-shrink-0 items-center justify-center">
            <img src={groceryGif} alt="Grocery Delivery" className="w-full h-auto drop-shadow-sm" />
          </div>

          {/* Categories */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar items-center justify-start lg:justify-center flex-1 py-2 px-1">
            {categories.map((c) => {
              const active = selected === c.name || (!selected && c.name === 'All')
              return (
                <button
                  key={c.name}
                  onClick={() => onSelect && onSelect(c.name === 'All' ? null : c.name)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 min-w-[88px] px-2 py-1 transition-all duration-200 ${active ? 'bg-white shadow-md ring-2 ring-primary/25' : 'bg-white/90'} rounded-xl`}
                >
                  <div className={`w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center ${active ? 'ring-2 ring-primary/30' : ''}`}>
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`text-xs font-medium mt-1 ${active ? 'text-primary' : 'text-gray-700'}`}>{c.name}</div>
                </button>
              )
            })}
          </div>

          {/* Right GIF */}
          <div className="hidden lg:flex w-28 xl:w-32 flex-shrink-0 items-center justify-center">
            <img src={groceryGif} alt="Grocery Delivery" className="w-full h-auto drop-shadow-sm transform -scale-x-100" />
          </div>
        </div>
      </div>
    </div>
  )
}
