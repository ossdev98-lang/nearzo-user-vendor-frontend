import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Star, Heart, Share2, Minus, Plus, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { productsData } from '../../components/sections/PopularProductsSection'
import { dummyShops } from '../../components/sections/ShopsSection'
import ProductCard from '../../components/cards/ProductCard'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, cart } = useApp()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const product = productsData.find(p => p.id === parseInt(id)) || productsData[0]
  const shop = dummyShops.find(s => s.name === product.storeName) || dummyShops[0]
  const relatedProducts = productsData.filter(p => p.storeName === shop.name && p.id !== product.id).slice(0, 5)

  const isInCart = cart.some((item) => item.id === product.id)
  const originalPrice = product.price / (1 - (product.discount || 0) / 100)

  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(0)

  // Mocking multiple images
  const images = [
    product.image,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    'https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?w=800&q=80',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80'
  ]
  const [activeImage, setActiveImage] = useState(images[0])

  // Mocking variants
  const variants = [
    { label: product.unit, price: product.price },
    { label: `2x ${product.unit}`, price: product.price * 1.9 },
    { label: `5x ${product.unit}`, price: product.price * 4.5 }
  ]

  const currentPrice = variants[selectedVariant].price * quantity
  const currentOriginalPrice = (variants[selectedVariant].price / (1 - (product.discount || 0) / 100)) * quantity

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-32 sm:pb-20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate(`/shop/${shop.id}`)}
            className="hover:text-primary transition-colors font-medium text-gray-700 dark:text-gray-300"
          >
            {shop.name}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="truncate">{product.name}</span>
        </nav>

        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Image Gallery */}
            <div className="flex flex-col-reverse sm:flex-row gap-4">

              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:w-24 shrink-0 pb-2 sm:pb-0 sm:pr-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 sm:w-full sm:h-24 rounded-2xl p-2 bg-[#F8F9FA] dark:bg-gray-800 border-2 overflow-hidden transition-all ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`Variant ${idx}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div
                className="relative w-full aspect-square bg-[#F8F9FA] dark:bg-gray-800 rounded-[24px] overflow-hidden flex items-center justify-center p-8 group cursor-crosshair"
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - left) / width) * 100
                  const y = ((e.clientY - top) / height) * 100
                  const imgElement = e.currentTarget.querySelector('.zoom-target')
                  if (imgElement) {
                    imgElement.style.transformOrigin = `${x}% ${y}%`
                  }
                }}
                onMouseLeave={(e) => {
                  const imgElement = e.currentTarget.querySelector('.zoom-target')
                  if (imgElement) {
                    imgElement.style.transformOrigin = 'center center'
                  }
                }}
              >
                {/* {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-[#FF4A55] text-white text-sm font-bold px-3 py-1 rounded-full z-10 pointer-events-none">
                    -{product.discount}% OFF
                  </span>
                )} */}
                {/* <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <button className="p-2.5 bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-400 hover:text-[#FF4A55] transition-colors pointer-events-auto">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors pointer-events-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div> */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={activeImage}
                    alt={product.name}
                    className="zoom-target w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-[2] transition-transform duration-200 ease-out"
                  />
                </AnimatePresence>
              </div>

            </div>

            {/* Right: Product Details */}
            <div className="flex flex-col py-2 font-sans">

              {/* Brand / Shop */}
              <div className="mb-3">
                <button
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                >
                  {shop.name}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.floor(product.rating)
                        ? 'text-[#FFB800] fill-[#FFB800]'
                        : 'text-gray-200 fill-gray-200 dark:text-gray-700 dark:fill-gray-700'
                        }`}
                    />
                  ))}
                  <span className="text-sm font-bold text-gray-900 dark:text-white ml-2">{product.rating}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <a href="#reviews" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors underline underline-offset-4">
                  {product.reviews} Reviews
                </a>
              </div>

              {/* Price Section */}
              <div className="flex flex-col gap-1 mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-[#6C4CF1]">
                    ₹{currentPrice.toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <div className="flex flex-col justify-center">
                      <span className="text-sm text-gray-400 line-through decoration-1">
                        ₹{currentOriginalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-green-500 uppercase tracking-wider">
                        Save {product.discount}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Description (Moved Up) */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Experience the freshest and highest quality {product.name.toLowerCase()} sourced directly from {shop.name}.
                  Perfect for your daily needs and guaranteed to satisfy. Enjoy our fast delivery service
                  and get this delivered straight to your doorstep.
                </p>
              </div>

              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-6"></div>

              {/* Variants */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Available Options</h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(idx)}
                      className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${selectedVariant === idx
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {v.label} - ₹{v.price.toFixed(0)}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Buy Box */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl sm:rounded-[24px] p-5 sm:p-6 border border-gray-100 dark:border-gray-800 mt-6 sm:mt-auto">
                <div className="flex items-center mb-5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white mr-4 uppercase tracking-wide">Quantity</span>
                  <div className="flex items-center w-[110px] h-10 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-grow text-center font-bold text-sm text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => addToCart({ ...product, price: currentPrice, unit: variants[selectedVariant].label, quantity })}
                    className={`flex-grow h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${isInCart
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white'
                      }`}
                  >
                    {isInCart ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  <button
                    className="flex-grow h-12 flex items-center justify-center rounded-xl font-bold text-base transition-all border-2 border-[#6C4CF1] text-[#6C4CF1] hover:bg-[#6C4CF1]/5 dark:hover:bg-[#6C4CF1]/10"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {/* <div id="reviews" className="mt-12 bg-white dark:bg-gray-900 rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[1, 2].map((review) => (
                <div key={review} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">John Doe</span>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Amazing quality! I always order this and it never disappoints. The packaging was also very secure. Highly recommend!
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">{product.rating}</div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Based on {product.reviews} reviews</p>
              <button className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full font-medium text-gray-900 dark:text-white hover:bg-gray-50 transition-colors">
                Write a Review
              </button>
            </div>
          </div>
        </div> */}

        {/* More from this Shop */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">More from {shop.name}</h2>
              <button
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="text-primary font-bold text-sm hover:text-indigo-600 transition-colors"
              >
                View Shop
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProductPage
