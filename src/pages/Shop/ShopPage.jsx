import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, MapPin, Clock, ChevronLeft, ChevronRight, Store } from 'lucide-react'
import ShopProductsSection from '../../components/sections/ShopProductsSection'
import { useApp } from '../../context/AppContext'
import { vendorService } from '../../services/vendorService'
import dummyBanner from '../../assets/images/dummy-banner.jpg'

// Distance calculation removed as it is no longer needed on ShopPage

function formatTimeAMPM(timeString) {
  if (!timeString) return '';
  if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
    return timeString;
  }
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeString;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeString;
}
const ShopPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { coordinates } = useApp()
  const [shopData, setShopData] = useState(null)
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsSectionRef = useRef(null)

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  // Scroll to products section when page changes
  useEffect(() => {
    if (currentPage > 1 && productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  const scrollRef = useRef(null)
  const [isScrollable, setIsScrollable] = useState(false)

  const checkScrollable = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current
      setIsScrollable(scrollWidth > clientWidth)
    }
  }

  useEffect(() => {
    const timer = setTimeout(checkScrollable, 200)
    window.addEventListener('resize', checkScrollable)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkScrollable)
    }
  }, [categoriesList, loading])

  const scroll = (direction) => {
    if (scrollRef.current) {
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true)
      try {
        const data = await vendorService.getShopDetails(id, currentPage, itemsPerPage, selectedCategory || '', searchQuery || '')
        if (data && data.success) {
          console.log('--- SHOP DATA ---', data.shop)
          setShopData(data.shop)
          setCategoriesList(data.categories || [])

          // Set dynamic pagination from backend keys safely
          if (data.pages !== undefined) {
            const parsedPages = Number(data.pages)
            if (!isNaN(parsedPages)) setTotalPages(parsedPages)
          }
          if (data.totalProducts !== undefined) {
            const parsedTotal = Number(data.totalProducts)
            if (!isNaN(parsedTotal)) setTotalProducts(parsedTotal)
          }
          if (data.limit !== undefined) {
            const parsedLimit = Number(data.limit)
            if (!isNaN(parsedLimit) && parsedLimit !== itemsPerPage) {
              setItemsPerPage(parsedLimit)
            }
          }
          if (data.page !== undefined) {
            const parsedPage = Number(data.page)
            if (!isNaN(parsedPage) && parsedPage !== currentPage) {
              setCurrentPage(parsedPage)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching shop details:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchShopDetails()
    }
  }, [id, currentPage, selectedCategory, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-purple-400 animate-spin-reverse"></div>
        </div>
        <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold tracking-wide animate-pulse">Loading shop details...</p>
      </div>
    )
  }

  if (!shopData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Shop not found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
          We couldn't find the store you were looking for. It might have moved or is temporarily closed.
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

  const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'

  const formatImgUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const normalizedPath = path.replace(/\\/g, '/')
    const cleanedPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
    return `${baseUrlForImage}${cleanedPath}`
  }

  const shop = {
    id: shopData.id,
    name: shopData.shopName || 'Nearzo Store',
    banner: formatImgUrl(shopData.banner),
    logo: formatImgUrl(shopData.logo),
    fullAddress: shopData.address || '',
    city: shopData.city || '',
    state: shopData.state || '',
    pincode: shopData.pinCode || shopData.pincode || '',
    openingTime: shopData.openingTime || '',
    closingTime: shopData.closingTime || '',
    workMode: shopData.workMode === true
  }

  const addressParts = [shop.fullAddress, shop.city, shop.state].filter(Boolean);
  const addressString = addressParts.join(', ') + (shop.pincode ? ` - ${shop.pincode}` : '');

  const formattedOpening = formatTimeAMPM(shop.openingTime);
  const formattedClosing = formatTimeAMPM(shop.closingTime);
  let timeString = '';
  if (formattedOpening && formattedClosing) {
    timeString = `${formattedOpening} - ${formattedClosing}`;
  } else if (formattedOpening || formattedClosing) {
    timeString = formattedOpening || formattedClosing;
  }

  const categories = ['Home', ...categoriesList.map(c => c.name)]

  const getProducts = () => {
    let list = []
    const targetCategories = selectedCategory
      ? categoriesList.filter(c => c.name === selectedCategory)
      : categoriesList

    targetCategories.forEach(cat => {
      if (Array.isArray(cat.subCategories)) {
        cat.subCategories.forEach(sub => {
          if (Array.isArray(sub.products)) {
            sub.products.forEach(prod => {
              const discount = prod.discountPrice && prod.discountPrice < prod.price
                ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                : 0

              const getProdImage = () => {
                const inner = prod.Product || {}
                const imgPath = prod.primaryImage || prod.productImage || prod.image || inner.primaryImage || inner.productImage || inner.image
                if (imgPath) return formatImgUrl(imgPath)
                if (prod.variants && prod.variants.length > 0 && prod.variants[0].image) {
                  return formatImgUrl(prod.variants[0].image)
                }
                return ''
              }
              const prodImage = getProdImage()

              list.push({
                id: prod.id,
                name: prod.name,
                storeName: shopData?.shopName || 'Nearzo Store',
                category: cat.name,
                price: prod.discountPrice || prod.price,
                unit: prod.unit || 'piece',
                discount: discount,
                image: prodImage,
                rating: 4.5,
                reviews: 8,
                isNew: false,
                variants: prod.variants || []
              })
            })
          }
        })
      }
    })

    if (searchQuery.trim()) {
      return list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return list
  }

  const products = getProducts()

  const paginatedProducts = totalProducts > products.length
    ? products
    : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getPageNumbers = () => {
    const pages = []
    const range = 1
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* Banner Area */}
      <div className="relative w-full h-[140px] sm:h-[200px] bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <img
          src={shop.banner || dummyBanner}
          alt={shop.name}
          className="w-full h-full object-cover opacity-60"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = dummyBanner;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        <div className="absolute inset-0 w-full z-10 flex items-center">
          <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-start gap-4 sm:gap-6">
            {/* Store Avatar Thumbnail */}
            <div className="shrink-0">
              <div className="w-16 h-16 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-2xl p-1 md:p-1.5 shadow-2xl border border-white/20">
                <img
                  src={shop.logo || shop.banner || dummyBanner}
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-xl"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = dummyBanner;
                  }}
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-lg truncate max-w-[150px] sm:max-w-none">
                  {shop.name}
                </h1>
                <span className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-lg ${shop.workMode ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`}>
                  {shop.workMode ? (
                    <><span className="w-1 h-1 rounded-full bg-white animate-pulse"></span> Open</>
                  ) : (
                    <><span className="w-1 h-1 rounded-full bg-white"></span> Closed</>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-[10px] sm:text-sm text-gray-200">
                {addressString && (
                  <div className="flex items-center gap-1.5 drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-semibold text-gray-100 truncate max-w-[180px] sm:max-w-none">
                      {addressString}
                    </span>
                  </div>
                )}
                {timeString && (
                  <div className="flex items-center gap-1.5 drop-shadow-md">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-semibold text-gray-100 whitespace-nowrap">
                      {timeString}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation (like Apple) */}
      <div className="sticky top-20 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3.5">

            {/* Slider Section */}
            <div className="relative flex-1 flex items-center min-w-0">
              {isScrollable && (
                <button
                  onClick={() => scroll('left')}
                  className="hidden sm:flex absolute left-0 z-10 p-1 bg-gradient-to-r from-white/90 via-white/80 to-transparent dark:from-gray-950/90 dark:via-gray-950/80 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div
                ref={scrollRef}
                className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar scroll-smooth sm:px-8 w-full"
              >
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCategorySelect(cat === 'Home' ? null : cat)}
                    className={`whitespace-nowrap pb-1 transition-colors ${(cat === 'Home' && !selectedCategory) || (cat === selectedCategory)
                      ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {isScrollable && (
                <button
                  onClick={() => scroll('right')}
                  className="hidden sm:flex absolute right-0 z-10 p-1 bg-gradient-to-l from-white/90 via-white/80 to-transparent dark:from-gray-950/90 dark:via-gray-950/80 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Banner Image (like "Discover what's new") */}
      {/* <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <div className="relative rounded-2xl overflow-hidden h-[150px] sm:h-[200px] lg:h-[250px]">
          <img
            src={shop.banner || dummyBanner}
            alt={shop.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = dummyBanner;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 max-w-xl leading-tight">
              Discover what's new at {shop.name}.
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 max-w-md">
              Fresh produce, daily essentials, and exclusive deals waiting for you.
            </p>
          </div>
        </div>
      </div> */}

      {/* Heading instead of banner */}
      <div ref={productsSectionRef} className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Discover what's new at {shop.name}.
        </h2>
      </div>

      {/* Products Section */}
      <div className="pb-8">
        <ShopProductsSection selectedCategory={selectedCategory} products={paginatedProducts} isShopClosed={shop.workMode === false} />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-20">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-gray-250 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-3 py-2 text-gray-450 dark:text-gray-500 font-medium">
                    ...
                  </span>
                )
              }
              const isActive = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'border border-gray-250 dark:border-white/10 text-gray-750 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-gray-250 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  )
}

export default ShopPage
