import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product, index, showAddToCart = true }) => {
  const navigate = useNavigate()
  const { addToCart, cart } = useApp()
  const isInCart = cart.some((item) => item.vendorProductId === product.id || item.id === product.id)
  const avgRating = product.rating || 5.0
  const reviewCount = product.reviews || 0
  const originalPrice = product.price / (1 - (product.discount || 0) / 100)

  const handleNavigate = (e) => {
    if (e) e.stopPropagation()
    navigate(`/product/${product.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={handleNavigate}
      className="bg-white rounded-[16px] sm:rounded-[24px] p-2 sm:p-3 shadow-sm hover:shadow-xl transition-all duration-300 relative group cursor-pointer flex flex-col h-full border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
    >
      {/* Image Container */}
      <div className="relative bg-[#F8F9FA] dark:bg-gray-800 rounded-[12px] sm:rounded-[16px] h-[90px] sm:h-[160px] w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[#FF4A55] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{product.discount}% off
            </span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="pt-4 pb-1 px-1 flex flex-col flex-grow">
        {/* Store Name */}
        {product.storeName && (
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            {product.storeName}
          </p>
        )}
        {/* Title */}
        <h3 className="text-[13px] sm:text-[15px] font-semibold text-gray-800 dark:text-white leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.floor(avgRating)
                  ? 'text-[#FFB800] fill-[#FFB800]'
                  : 'text-gray-200 fill-gray-200'
                  }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium ml-1">
            ({reviewCount})
          </span>
        </div>

        <div className="mt-auto">
          {/* Prices */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-3">
            <span className="text-[14px] sm:text-[15px] font-bold text-[#6C4CF1]">
              ₹{(product.price || 0).toFixed(2)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-[11px] sm:text-[12px] text-gray-400 line-through">
                  ₹{originalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#FF4A55]">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Actions - Only shown if explicitly asked */}
          {showAddToCart && (
            <div className="flex items-center justify-center border-t border-gray-100 dark:border-gray-800 pt-3">
              <button
                onClick={handleNavigate}
                className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-full font-bold sm:font-semibold text-[11px] sm:text-sm transition-colors shadow-sm bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white`}
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard