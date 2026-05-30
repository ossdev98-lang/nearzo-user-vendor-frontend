import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../cards/ProductCard'
import { vendorService } from '../../services/vendorService'
import dummyProduct from '../../assets/images/dummyProduct.jpg'

const PopularProductsSection = ({ selectedCategory }) => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
          setProducts([]) // fallback to empty if empty
        }
      } catch (error) {
        console.error('Error fetching best selling products:', error)
        setProducts([]) // fallback to empty on error
      } finally {
        setLoading(false)
      }
    }

    fetchBestSelling()
  }, [])

  const items = selectedCategory ? products.filter((p) => p.category === selectedCategory) : products
  const displayedItems = items.slice(0, 10)

  if (!loading && items.length === 0) {
    return null
  }

  return (
    <section className="pt-16 pb-8 sm:pt-20 sm:pb-10 bg-white dark:bg-gray-900 px-4 sm:px-6">
      <div className="container max-w-[90rem] mx-auto bg-[#EBE4FF] dark:bg-[#292245] rounded-[32px] px-4 sm:px-8 pb-10 pt-0 relative shadow-sm">

        {/* Top U-Shape Cutout for Title */}
        <div className="flex justify-center relative w-full h-[95px] sm:h-[110px] mb-4 sm:mb-8">
          {/* Mathematically smooth SVG curve */}
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
              Best Selling <span className="text-[#6C4CF1] dark:text-[#9A81F8]">Products</span>
            </h2>
            <p className="text-[#6C4CF1] dark:text-[#9A81F8] font-semibold text-[11px] sm:text-sm">
              Up to 69% discount for limited time 🔥
            </p>
          </motion.div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-5 mt-6 sm:mt-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse bg-white p-3 rounded-[24px]">
                <div className="w-full aspect-square rounded-[16px] bg-gray-200 dark:bg-gray-800 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-5 mt-6 sm:mt-8">
            {displayedItems.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* View All Button */}
        {items.length > 10 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => navigate('/all-products')}
              className="px-8 py-3 bg-gradient-to-r from-[#6C4CF1] to-purple-600 hover:from-purple-600 hover:to-[#6C4CF1] text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              View All Products
            </button>
          </div>
        )}

      </div>
    </section>
  )
}

export default PopularProductsSection