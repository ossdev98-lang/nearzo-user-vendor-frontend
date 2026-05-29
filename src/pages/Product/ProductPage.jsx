import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Star, Heart, Share2, Minus, Plus, ChevronRight, ChevronDown, ChevronUp, Store, FileText, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { productsData } from '../../components/sections/PopularProductsSection'
import { dummyShops } from '../../components/sections/ShopsSection'
import ProductCard from '../../components/cards/ProductCard'
import { vendorService } from '../../services/vendorService'
import { toast } from 'react-hot-toast'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, cart } = useApp()
  const [product, setProduct] = useState(null)
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [variantError, setVariantError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])

  // Collapsible Accordion States
  const [isDescOpen, setIsDescOpen] = useState(true)
  const [isSpecsOpen, setIsSpecsOpen] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      try {
        const data = await vendorService.getProductDetails(id)
        if (data && data.success) {
          const prod = data.product
          const innerProduct = prod.Product || {}

          const basePrice = Number(prod.discountPrice || innerProduct.price || prod.price || 0)
          const originalPrice = Number(innerProduct.price || prod.price || 0)

          const discount = basePrice < originalPrice
            ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
            : 0

          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'

          // Image fallback hierarchy
          let prodImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'
          if (prod.variants && prod.variants.length > 0 && prod.variants[0].image) {
            prodImage = `${baseUrlForImage}${prod.variants[0].image}`
          } else if (innerProduct.primaryImage) {
            prodImage = `${baseUrlForImage}${innerProduct.primaryImage}`
          } else if (prod.shopLogo) {
            prodImage = `${baseUrlForImage}${prod.shopLogo}`
          }

          const formattedProduct = {
            id: prod.id,
            name: innerProduct.name || prod.name || 'Nearzo Product',
            storeName: prod.shopName || prod.Vendor?.shopName || 'Nearzo Store',
            category: innerProduct.categoryName || prod.categoryName || 'General',
            subCategory: innerProduct.subCategoryName || '',
            sku: innerProduct.sku || '',
            weight: innerProduct.weight || '',
            dimensions: innerProduct.dimensions || '',
            price: basePrice,
            originalPrice: originalPrice,
            unit: innerProduct.unit || prod.unit || 'piece',
            discount: discount,
            description: innerProduct.description || prod.description || '',
            image: prodImage,
            rating: parseFloat(prod.Vendor?.rating || 4.5) || 4.5,
            reviews: 12,
            isNew: false,
            variants: prod.variants || []
          }

          setProduct(formattedProduct)
          setActiveImage(formattedProduct.image)

          // Load shop info from Vendor object
          if (prod.Vendor) {
            const formattedShop = {
              id: prod.vendorId,
              name: prod.Vendor.shopName || 'Nearzo Store',
              image: prod.Vendor.banner
                ? `${baseUrlForImage}${prod.Vendor.banner}`
                : (prod.Vendor.logo ? `${baseUrlForImage}${prod.Vendor.logo}` : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop'),
              rating: parseFloat(prod.Vendor.rating) > 0 ? parseFloat(prod.Vendor.rating).toFixed(1) : '4.5',
              time: '15-25 mins',
              address: prod.Vendor.address || `${prod.Vendor.city || 'Indore'}, ${prod.Vendor.state || 'MP'}`
            }
            setShop(formattedShop)
          } else if (prod.vendorId) {
            try {
              const shopData = await vendorService.getShopDetails(prod.vendorId)
              if (shopData && shopData.success) {
                setShop(shopData.shop)
              }
            } catch { }
          }

          // Parse related products
          if (Array.isArray(data.relatedShopProduct) && data.relatedShopProduct.length > 0) {
            const mappedRelated = data.relatedShopProduct.map(relatedProd => {
              const innerProd = relatedProd.Product || {}
              const basePrice = Number(relatedProd.discountPrice || innerProd.price || relatedProd.price || 0)
              const originalPrice = Number(innerProd.price || relatedProd.price || 0)

              const discount = basePrice < originalPrice
                ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
                : 0

              let prodImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'
              if (relatedProd.variants && relatedProd.variants.length > 0 && relatedProd.variants[0].image) {
                prodImage = `${baseUrlForImage}${relatedProd.variants[0].image}`
              } else if (innerProd.primaryImage) {
                prodImage = `${baseUrlForImage}${innerProd.primaryImage}`
              } else if (relatedProd.shopLogo) {
                prodImage = `${baseUrlForImage}${relatedProd.shopLogo}`
              }

              return {
                id: relatedProd.id,
                name: innerProd.name || relatedProd.name || 'Nearzo Product',
                storeName: relatedProd.shopName || relatedProd.Vendor?.shopName || 'Nearzo Store',
                category: innerProd.categoryName || relatedProd.categoryName || 'General',
                price: basePrice,
                originalPrice: originalPrice,
                unit: innerProd.unit || relatedProd.unit || 'piece',
                discount: discount,
                image: prodImage,
                rating: parseFloat(relatedProd.Vendor?.rating || 4.5) || 4.5,
                reviews: 12,
                variants: relatedProd.variants || []
              }
            })
            setRelatedProducts(mappedRelated)
          } else {
            const fallbackRelated = productsData.filter(p => p.storeName === formattedProduct.storeName && p.id !== formattedProduct.id).slice(0, 5)
            setRelatedProducts(fallbackRelated)
          }
        }
      } catch (error) {
        console.error('Error fetching product details, falling back to mock:', error)
        const mockProduct = productsData.find(p => p.id === parseInt(id)) || productsData[0]
        setProduct(mockProduct)
        setActiveImage(mockProduct.image)
        const mockShop = dummyShops.find(s => s.name === mockProduct.storeName) || dummyShops[0]
        setShop(mockShop)
        const fallbackRelated = productsData.filter(p => p.storeName === mockProduct.storeName && p.id !== mockProduct.id).slice(0, 5)
        setRelatedProducts(fallbackRelated)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductDetails()
    }
  }, [id])

  // Extract gallery images
  const getProductImages = () => {
    if (!product) return []
    let list = [product.image]
    if (Array.isArray(product.variants)) {
      product.variants.forEach(v => {
        if (v.image) {
          const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'
          list.push(`${baseUrlForImage}${v.image}`)
        }
      })
    }
    list.push('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80')
    list.push('https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?w=800&q=80')
    return Array.from(new Set(list))
  }

  const images = getProductImages()

  // Dynamic variants
  const variants = product
    ? Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants.map(v => {
        const discountVal = v.discountPrice && Number(v.discountPrice) < Number(v.price)
          ? Math.round(((Number(v.price) - Number(v.discountPrice)) / Number(v.price)) * 100)
          : 0;
        return {
          id: v.variantId,
          label: v.name || v.unit || product.unit || 'Standard Option',
          price: Number(v.discountPrice || v.price || product.price || 0),
          originalPrice: Number(v.price || product.price || 0),
          discount: discountVal,
          isAvailable: v.isAvailable
        }
      })
      : [
        {
          id: 'base',
          label: product.unit || 'piece',
          price: Number(product.price || 0),
          originalPrice: Number(product.originalPrice || product.price || 0),
          discount: product.discount || 0,
          isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
        }
      ]
    : []

  // Read URL query parameter for active variant selected
  useEffect(() => {
    if (product && variants.length > 0) {
      const queryParams = new URLSearchParams(window.location.search)
      const variantIdParam = queryParams.get('variantId')
      if (variantIdParam) {
        const idx = variants.findIndex(v => v.id === variantIdParam)
        if (idx !== -1) {
          setSelectedVariant(idx)
        } else {
          const parsedIdx = parseInt(variantIdParam)
          if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < variants.length) {
            setSelectedVariant(parsedIdx)
          }
        }
      }
    }
  }, [product])

  if (loading || !product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-purple-400 animate-spin-reverse"></div>
        </div>
        <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold tracking-wide animate-pulse">Loading product details...</p>
      </div>
    )
  }

  const currentShop = shop || dummyShops[0]
  const hasVariants = product && Array.isArray(product.variants) && product.variants.length > 0
  const activeOption = hasVariants && selectedVariant !== null ? (variants[selectedVariant] || null) : (!hasVariants ? variants[0] : null)
  const isInCart = activeOption ? cart.some((item) => (item.vendorProductId === product.id || item.id === product.id) && item.unit === activeOption.label) : false
  const existingShopItem = cart.find(item => item.shopName)
  const productShopName = product ? (product.shopName || product.storeName || '') : ''
  const isDifferentShop = existingShopItem && productShopName && existingShopItem.shopName.toLowerCase().trim() !== productShopName.toLowerCase().trim()

  const currentPrice = activeOption ? (activeOption.price || 0) * quantity : Number(product.price || 0) * quantity
  const currentOriginalPrice = activeOption ? (activeOption.originalPrice || currentPrice) * quantity : Number(product.originalPrice || product.price || 0) * quantity
  const currentDiscount = activeOption ? (activeOption.discount || product.discount || 0) : (product.discount || 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-32 sm:pb-20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate(`/shop/${currentShop.id}`)}
            className="hover:text-primary transition-colors font-medium text-gray-700 dark:text-gray-300"
          >
            {currentShop.shopName || currentShop.name}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="truncate">{product.name}</span>
        </nav>

        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Image Gallery */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 lg:h-[540px] lg:sticky lg:top-24">

              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:w-16 shrink-0 pb-2 sm:pb-0 sm:pr-1 lg:h-full">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1 bg-[#F8F9FA] dark:bg-gray-800 border-2 overflow-hidden transition-all ${activeImage === img ? 'border-[#6C4CF1]' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`Variant ${idx}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div
                className="relative w-full h-[360px] sm:h-[480px] lg:h-full bg-[#F8F9FA] dark:bg-gray-800/50 rounded-[24px] overflow-hidden flex items-center justify-center p-6 group cursor-crosshair"
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
                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 zoom-target group-hover:scale-[1.8]"
                />
              </div>

            </div>

            {/* Right: Info */}
            <div className="flex flex-col justify-start lg:max-h-[540px] lg:overflow-y-auto no-scrollbar pr-1">
              <div className="mb-6">
                <button
                  onClick={() => navigate(`/shop/${currentShop.id}`)}
                  className="px-3 py-1 bg-[#6C4CF1]/10 text-[#6C4CF1] hover:bg-[#6C4CF1]/20 transition-all font-bold text-xs rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  {currentShop.shopName || currentShop.name}
                </button>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mt-4 mb-1.5 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= Math.floor(product.rating) ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">{product.rating}</span>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{product.reviews} reviews</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#6C4CF1]">
                    ₹{Number(currentPrice || 0).toFixed(0)}
                  </span>
                  {currentDiscount > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{Number(currentOriginalPrice || 0).toFixed(0)}
                      </span>
                      <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                        {currentDiscount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description || `Experience the freshest and highest quality ${product.name.toLowerCase()} sourced directly from ${currentShop.shopName || currentShop.name}. Perfect for your daily needs and guaranteed to satisfy.`}
                </p>
              </div>

              {/* <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-4"></div> */}

              {/* Variants / Available Options */}
              {hasVariants && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Available Options</h3>
                    {variantError && (
                      <span className="text-xs font-bold text-red-500 animate-pulse">⚠️ Please select an option first!</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v, idx) => {
                      const isUnavailable = v.isAvailable === false || v.isAvailable === 'false' || v.isAvailable === 0 || v.isAvailable === '0'
                      const hasDiscount = Number(v.originalPrice || 0) > Number(v.price || 0)
                      return (
                        <button
                          key={idx}
                          disabled={isUnavailable}
                          onClick={() => {
                            if (isUnavailable) return
                            setSelectedVariant(idx)
                            setVariantError(false)
                          }}
                          style={{ filter: isUnavailable ? 'blur(0.6px)' : 'none' }}
                          className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                            isUnavailable
                              ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600'
                              : selectedVariant === idx
                                ? 'border-[#6C4CF1] bg-[#6C4CF1]/5 text-[#6C4CF1] shadow-sm font-bold'
                                : variantError
                                  ? 'border-red-400 dark:border-red-950 text-red-500 hover:border-red-500'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span>{v.label} -</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{Number(v.price || 0).toFixed(0)}</span>
                            {hasDiscount && (
                              <span className="line-through text-xs text-gray-400 dark:text-gray-500 font-normal">
                                ₹{Number(v.originalPrice || 0).toFixed(0)}
                              </span>
                            )}
                            {isUnavailable && (
                              <span className="text-[11px] font-bold text-red-500 dark:text-red-400 ml-1">
                                (Out of Stock)
                              </span>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* The Buy Box */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl sm:rounded-[24px] p-5 sm:p-6 border border-gray-100 dark:border-gray-800 mb-6">
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

                {isDifferentShop && (
                  <div className="text-red-500 dark:text-red-400 font-semibold text-xs mt-2 bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-3 flex items-start gap-2 mb-4">
                    <span>⚠️</span>
                    <span>Your cart already contains items from <strong>"{existingShopItem.shopName}"</strong>. Clear your cart to order from this shop.</span>
                  </div>
                )}

                <div className="flex flex-row gap-2 sm:gap-3">
                  <button
                    onClick={async () => {
                      if (hasVariants && selectedVariant === null) {
                        setVariantError(true)
                        toast.error('Please select an option first!')
                        return
                      }
                      const option = activeOption || variants[0]
                      setIsAdding(true)
                      try {
                        const success = await addToCart({ ...product, price: currentPrice / quantity, unit: option.label || product.unit, quantity, variantId: option.id })
                        if (success) {
                          toast.success('Added to Cart successfully!')
                        }
                      } catch (err) {
                        toast.error('Failed to add to cart')
                      } finally {
                        setIsAdding(false)
                      }
                    }}
                    disabled={isAdding || isDifferentShop}
                    className={`flex-grow h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg ${
                      isDifferentShop
                        ? 'opacity-40 cursor-not-allowed bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-none hover:shadow-none hover:translate-y-0'
                        : isAdding
                          ? 'opacity-85 cursor-not-allowed bg-purple-500 text-white hover:-translate-y-0.5'
                          : isInCart
                            ? 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'
                            : 'bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white hover:-translate-y-0.5'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-t-2 border-r-2 border-white animate-spin mr-1"></div>
                        <span>Adding...</span>
                      </>
                    ) : isInCart ? (
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
                    onClick={async () => {
                      if (hasVariants && selectedVariant === null) {
                        setVariantError(true)
                        toast.error('Please select an option first!')
                        return
                      }
                      const option = activeOption || variants[0]
                      if (!isInCart) {
                        const success = await addToCart({ ...product, price: currentPrice / quantity, unit: option.label || product.unit, quantity, variantId: option.id });
                        if (!success) return;
                      }
                      navigate('/checkout');
                    }}
                    disabled={isDifferentShop}
                    className={`flex-grow h-12 flex items-center justify-center rounded-xl font-bold text-base transition-all border-2 ${
                      isDifferentShop
                        ? 'opacity-40 cursor-not-allowed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 bg-transparent'
                        : 'border-[#6C4CF1] text-[#6C4CF1] hover:bg-[#6C4CF1]/5 dark:hover:bg-[#6C4CF1]/10 hover:-translate-y-0.5'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Dynamic Accordions / Collapsible Sections */}
              <div className="space-y-3 mt-4">

                {/* 2. Specifications Accordion */}
                {(product.sku || product.weight || product.dimensions || product.category) && (
                  <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                    <button
                      onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Settings className="w-4 h-4 text-primary" />
                        <span>Technical Specifications</span>
                      </span>
                      {isSpecsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {isSpecsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-6 pb-4 pt-2 text-sm border-t border-gray-50 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                            {product.sku && (
                              <div className="py-3 flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">SKU Code</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{product.sku}</span>
                              </div>
                            )}
                            {product.weight && (
                              <div className="py-3 flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Weight</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{product.weight} kg</span>
                              </div>
                            )}
                            {product.dimensions && (
                              <div className="py-3 flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Dimensions</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{product.dimensions}</span>
                              </div>
                            )}
                            {product.category && (
                              <div className="py-3 flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Category</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                                  {product.category} {product.subCategory && ` → ${product.subCategory}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* More from this Shop */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">More from {currentShop.shopName || currentShop.name}</h2>
              <button
                onClick={() => navigate(`/shop/${currentShop.id}`)}
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
