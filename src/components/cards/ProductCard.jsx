import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate()
  const { addToCart, cart } = useApp()
  const isInCart = cart.some((item) => item.id === product.id)
  const avgRating = product.rating || 5.0
  const reviewCount = product.reviews || 0
  const originalPrice = product.price / (1 - product.discount / 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-[24px] p-3 shadow-sm hover:shadow-xl transition-all duration-300 relative group cursor-pointer flex flex-col h-full border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative bg-[#F8F9FA] rounded-[16px] h-[180px] w-full flex items-center justify-center p-4 overflow-hidden">
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
          className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
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
        <h3 className="text-[15px] font-semibold text-gray-800 leading-tight line-clamp-2 mb-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.floor(avgRating)
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
          <div className="flex items-end gap-2 mb-3">
            <span className="text-[15px] font-bold text-[#6C4CF1]">
              ₹{(product.price || 0).toFixed(2)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-[12px] text-gray-400 line-through mb-[2px]">
                  ₹{originalPrice.toFixed(2)}
                </span>
                <span className="text-[11px] font-bold text-[#FF4A55] mb-[2px]">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <button className="text-gray-400 hover:text-[#FF4A55] transition-colors p-1">
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                addToCart(product)
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                isInCart
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isInCart ? 'Added' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard