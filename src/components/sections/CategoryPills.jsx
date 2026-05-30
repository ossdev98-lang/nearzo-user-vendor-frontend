import React, { useEffect, useState } from 'react'
import groceryGif from '../../assets/gifs/Grocery shopping bag pickup and delivery.gif'
import { categoryService } from '../../services/categoryService'
import dummyProduct from '../../assets/images/dummyProduct.jpg'

// Fallback images for dynamic category names if image is null
const categoryImageFallbacks = {
  Fruits: dummyProduct,
  Dairy: dummyProduct,
  Vegetables: dummyProduct,
  Beverages: dummyProduct,
  Snacks: dummyProduct,
  Bakery: dummyProduct,
}

export default function CategoryPills({ selected, onSelect }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getShopCategories()
        if (data && data.success && Array.isArray(data.shopCategories)) {
          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          
          const dynamicCategories = data.shopCategories.map(c => {
            let finalImage = dummyProduct
            if (c.image) {
              const cleaned = c.image.startsWith('/') ? c.image : `/${c.image}`
              finalImage = `${baseUrlForImage}${cleaned}?cb=${Date.now()}`
            } else {
              finalImage = categoryImageFallbacks[c.shopCategoryName] || dummyProduct
            }
            return {
              name: c.shopCategoryName,
              image: finalImage
            }
          })
          
          // Add 'All' Category to the front
          setCategories([
            { name: 'All', image: dummyProduct },
            ...dynamicCategories
          ])
        }
      } catch (error) {
        console.error('Error fetching categories from API:', error)
        // Fallback static categories
        setCategories([
          { name: 'All', image: dummyProduct },
          { name: 'Fruits', image: dummyProduct },
          { name: 'Vegetables', image: dummyProduct },
          { name: 'Dairy', image: dummyProduct },
          { name: 'Beverages', image: dummyProduct },
          { name: 'Snacks', image: dummyProduct },
          { name: 'Bakery', image: dummyProduct }
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
    <div id="categories" className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Left GIF */}
          <div className="hidden xl:flex w-20 xl:w-24 flex-shrink-0 items-center justify-center">
            <img src={groceryGif} alt="Grocery Delivery" className="w-full h-auto drop-shadow-sm" />
          </div>

          {/* Categories */}
          <div className="flex flex-nowrap gap-4 overflow-x-auto no-scrollbar items-center justify-start flex-1 py-2 px-1 scroll-smooth">
            {categories.map((c) => {
              const active = selected === c.name || (!selected && c.name === 'All')
              return (
                <button
                  key={c.name}
                  onClick={() => onSelect && onSelect(c.name === 'All' ? null : c.name)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 w-[calc((100%-48px)/4)] sm:w-[calc((100%-80px)/6)] md:w-[calc((100%-112px)/8)] lg:w-[calc((100%-128px)/9)] px-2 py-1 transition-all duration-200 ${active ? 'bg-white shadow-md ring-2 ring-primary/25' : 'bg-white/90'} rounded-xl`}
                >
                  <div className={`w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${active ? 'ring-2 ring-primary/30' : ''}`}>
                    <img 
                      src={c.image || dummyProduct} 
                      alt={c.name} 
                      className="w-full h-full object-cover" 
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = dummyProduct;
                      }}
                    />
                  </div>
                  <div className={`text-xs font-medium mt-1 ${active ? 'text-primary' : 'text-gray-700'}`}>{c.name}</div>
                </button>
              )
            })}
          </div>

          {/* Right GIF */}
          <div className="hidden xl:flex w-20 xl:w-24 flex-shrink-0 items-center justify-center">
            <img src={groceryGif} alt="Grocery Delivery" className="w-full h-auto drop-shadow-sm transform -scale-x-100" />
          </div>
        </div>
      </div>
    </div>
  )
}
