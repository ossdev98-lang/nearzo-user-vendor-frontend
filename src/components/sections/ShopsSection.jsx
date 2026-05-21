import React from 'react'
import { MapPin, Star, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  const filteredShops = selectedCategory
    ? dummyShops.filter(shop => shop.categories.includes(selectedCategory))
    : dummyShops

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-900">{shop.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {shop.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{shop.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {shop.categories.slice(0, 3).map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-[10px] font-medium uppercase tracking-wider">
                        {cat}
                      </span>
                    ))}
                    {shop.categories.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-[10px] font-medium uppercase tracking-wider">
                        +{shop.categories.length - 3}
                      </span>
                    )}
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
