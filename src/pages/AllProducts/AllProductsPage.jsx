import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../../components/cards/ProductCard'
import { vendorService } from '../../services/vendorService'
import dummyProduct from '../../assets/images/dummyProduct.jpg'

export default function AllProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        const data = await vendorService.getBestSellingProducts()
        let fetchedProducts = []
        if (data && data.success && data.bestSellingProducts) {
          fetchedProducts = data.bestSellingProducts
        } else if (data && data.bestSellingProducts) {
          fetchedProducts = data.bestSellingProducts
        } else if (data && data.success && data.products) {
          fetchedProducts = data.products
        } else if (Array.isArray(data)) {
          fetchedProducts = data
        }

        if (fetchedProducts.length > 0) {
          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          const mapped = fetchedProducts.map(p => {
            const price = parseFloat(p.unitPrice || p.discountPrice || p.price || 0)

            return {
              id: p.vendorProductId || p.id,
              vendorProductId: p.vendorProductId || p.id,
              name: p.productName || p.name,
              storeName: p.shopName || p.Vendor?.shopName || p.storeName || 'Nearzo Store',
              category: p.shopCategoryName || p.categoryName || p.category || 'Groceries',
              price: price,
              unit: p.unit || 'unit',
              discount: p.discount || 0,
              image: p.productImage ? (p.productImage.startsWith('http') ? p.productImage : `${baseUrlForImage}${p.productImage.startsWith('/') ? p.productImage : '/' + p.productImage}`) : (p.image || dummyProduct),
              rating: p.rating || 4.8,
              reviews: p.totalSold ? p.totalSold * 12 : (p.reviews || Math.floor(Math.random() * 200) + 50)
            }
          })
          setProducts(mapped)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching best selling products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBestSelling()
  }, [])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.storeName.toLowerCase().includes(searchTerm.toLowerCase())
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
                All Best Selling <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4CF1] to-purple-600 dark:from-[#9A81F8] dark:to-purple-500">Products</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                Browse our selection of the most popular items at discount prices
              </p>
            </div>
          </div>

          {/* Search bar inside page */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, category, shop..."
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
                <div className="w-full aspect-square rounded-xl bg-gray-200 dark:bg-gray-800 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No matching products</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              We couldn't find any products matching "{searchTerm}".
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
