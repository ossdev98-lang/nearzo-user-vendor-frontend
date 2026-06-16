import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Heart, ArrowLeft, Store, BadgePercent } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { vendorService } from '../../services/vendorService'
import dummyProduct from '../../assets/images/dummyProduct.jpg'

const ProductVariantsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, cart } = useApp()
  const isVendor = localStorage.getItem('role') === 'vendor'
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      try {
        const data = await vendorService.getOriginalProductDetails(id)
        if (data && data.success) {
          const prod = data.product
          const discount = prod.discountPrice && prod.discountPrice < prod.price
            ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
            : 0

          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          const prodImage = prod.variants && prod.variants.length > 0 && prod.variants[0].image
            ? `${baseUrlForImage}${prod.variants[0].image.startsWith('/') ? prod.variants[0].image : '/' + prod.variants[0].image}`
            : (prod.logo ? `${baseUrlForImage}${prod.logo.startsWith('/') ? prod.logo : '/' + prod.logo}` : dummyProduct)

          setProduct({
            id: prod.id,
            name: prod.name,
            storeName: prod.shopName || 'Nearzo Store',
            category: prod.categoryName || 'General',
            price: prod.discountPrice || prod.price,
            unit: prod.unit || 'piece',
            discount: discount,
            image: prodImage,
            rating: 4.5,
            reviews: 12,
            isNew: false,
            variants: prod.variants || []
          })
        }
      } catch (error) {
        console.error('Error fetching product in variants page:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductDetails()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-semibold">Loading product variants...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 flex flex-col items-center justify-center px-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product variants not found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
          We couldn't find variants for the product you were looking for.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-md"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  // Dynamic variants
  const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.map(v => ({
        id: v.variantId,
        label: v.name || v.unit || 'Standard Option',
        price: v.price || product.price,
        image: v.image ? `${baseUrlForImage}${v.image}` : product.image,
        stock: v.stock !== undefined ? v.stock : 10,
        isAvailable: v.isAvailable !== undefined ? v.isAvailable : true
      }))
    : [
        { id: 'v-standard', label: product.unit || 'Standard Pack', price: product.price, image: product.image, stock: 10, isAvailable: true },
        { id: 'v-2x', label: `Double Pack (2x ${product.unit || 'piece'})`, price: product.price * 1.9, image: product.image, stock: 10, isAvailable: true },
        { id: 'v-5x', label: `Family Pack (5x ${product.unit || 'piece'})`, price: product.price * 4.5, image: product.image, stock: 10, isAvailable: true }
      ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to products</span>
        </button>

        {/* Product Brief Banner */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 mb-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 flex items-center justify-center shrink-0">
            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-[11px] rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 mb-1">
              {product.name}
            </h1>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
              <Store className="w-4 h-4" />
              <span>{product.storeName}</span>
            </p>
          </div>
        </div>

         {/* Variants Section */}
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            {isVendor ? 'Product Options' : 'Select an Option to Order'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((variant, idx) => {
              const variantInCart = cart.some(item => item.id === product.id && item.unit === variant.label)
              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Variant Image */}
                  <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl h-44 w-full flex items-center justify-center p-4 overflow-hidden mb-4">
                    <img
                      src={variant.image}
                      alt={variant.label}
                      className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Variant Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 leading-tight">
                        {variant.label}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-black text-[#6C4CF1]">
                          ₹{Number(variant.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto">
                      {/* Add to Cart Button */}
                      {!isVendor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart({
                              ...product,
                              price: Number(variant.price || 0),
                              unit: variant.label,
                              quantity: 1
                            })
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            variantInCart
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white shadow-sm'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>{variantInCart ? 'Added to Cart' : 'Add to Cart'}</span>
                        </button>
                      )}

                      {/* View Details / Order Button */}
                      <button
                        onClick={() => navigate(`/product/${product.id}?variantId=${variant.id || idx}`)}
                        className="w-full py-2.5 rounded-xl font-bold text-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {isVendor ? 'View Details' : 'View Details & Order'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductVariantsPage
