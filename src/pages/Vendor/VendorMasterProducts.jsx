import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  PlusCircle,
  Search,
  ChevronDown,
  Bell,
  Menu,
  X,
  TrendingUp,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Tag
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
import VendorNotificationBell from '../../components/vendor/VendorNotificationBell'
import toast from 'react-hot-toast'

const VendorMasterProducts = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const getProductImage = (prod) => {
    if (!prod) return null;

    // Check standard product image fields first
    let imgPath = prod.image || (prod.images && prod.images[0]) || prod.primaryImage;

    // If not found, check first variant's image as fallback
    if (!imgPath && prod.variants && prod.variants.length > 0) {
      const firstV = prod.variants[0];
      imgPath = firstV.image || (firstV.images && firstV.images[0]);
    }

    if (!imgPath) return null;
    if (typeof imgPath === 'object') {
      imgPath = imgPath.url || imgPath.image || imgPath.path || '';
    }
    if (typeof imgPath !== 'string' || !imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com';
    return `${baseUrlForImage.replace(/\/$/, '')}/${imgPath.replace(/^\//, '')}`;
  }

  const getVariantImage = (variant, parentProduct) => {
    if (!variant) return null;
    let imgPath = variant.image || (variant.images && variant.images[0]);
    if (!imgPath && parentProduct) {
      imgPath = parentProduct.image || (parentProduct.images && parentProduct.images[0]) || parentProduct.primaryImage;
    }
    if (!imgPath) return null;
    if (typeof imgPath === 'object') {
      imgPath = imgPath.url || imgPath.image || imgPath.path || '';
    }
    if (typeof imgPath !== 'string' || !imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com';
    return `${baseUrlForImage.replace(/\/$/, '')}/${imgPath.replace(/^\//, '')}`;
  }

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // States
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [importingProduct, setImportingProduct] = useState(null)
  const [editableVariants, setEditableVariants] = useState([])
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showCategoryReminder, setShowCategoryReminder] = useState(false)

  // Debounce search query to prevent rapid API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 450)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const fetchMasterProducts = async () => {
    setLoading(true)
    try {
      const response = await vendorService.getMasterProducts(page, 8, debouncedSearch)
      if (response) {
        let loadedProducts = []
        if (Array.isArray(response)) {
          loadedProducts = response
          setTotalPages(response.length === 8 ? page + 1 : page)
        } else if (response.products || response.data) {
          loadedProducts = response.products || response.data || []
          setTotalPages(response.totalPages || Math.ceil((response.total || 8) / 8))
        } else {
          loadedProducts = []
        }

        // Fallback to previous page if current page has no products left (e.g. after adding them all)
        if (loadedProducts.length === 0 && page > 1) {
          setPage(prev => Math.max(1, prev - 1))
          return
        }

        setProducts(loadedProducts)
        if (loadedProducts.length === 0 && !debouncedSearch) {
          setShowCategoryReminder(true)
        }
      } else {
        setProducts([])
        if (!debouncedSearch) {
          setShowCategoryReminder(true)
        }
      }
    } catch (err) {
      toast.error('Failed to load master products catalog')
      setProducts([])
      if (!debouncedSearch) {
        setShowCategoryReminder(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMasterProducts()
  }, [page, debouncedSearch])

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/vendor/login')
  }

  const handleOpenImportModal = (product) => {
    const cleanPriceValue = (val) => {
      if (val === undefined || val === null) return 0
      if (typeof val === 'string') {
        return Number(val.replace(/[^0-9.]/g, '')) || 0
      }
      return Number(val) || 0
    }

    // Initialize the variants list for editing using catalog product's variants
    const apiVariants = product.variants || []

    const initialVariants = (apiVariants && apiVariants.length > 0)
      ? apiVariants.map(v => ({
        variantId: v.variantId || v.id,
        name: v.name || 'Default Variant',
        price: cleanPriceValue(v.price),
        discountPrice: cleanPriceValue(v.discountPrice !== undefined && v.discountPrice !== null ? v.discountPrice : v.price),
        isAvailable: false,
        image: v.image || (v.images && v.images[0])
      }))
      : [{
        variantId: 'v-default',
        name: 'Regular',
        price: cleanPriceValue(product.price),
        discountPrice: cleanPriceValue(product.price),
        isAvailable: false,
        image: product.image || (product.images && product.images[0])
      }]

    setEditableVariants(initialVariants)
    setImportingProduct(product)
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()

    const pId = importingProduct.id || importingProduct._id

    // Check if at least one variant checkbox is selected/checked
    const hasCheckedVariant = editableVariants.some(v => v.isAvailable)
    if (!hasCheckedVariant) {
      toast.error('Please select at least one variant to add to store!')
      return
    }

    // Construct payload: { productId, variants: [ { variantId, discountPrice, isAvailable } ] }
    const payload = {
      productId: Number(pId),
      variants: editableVariants.map(v => ({
        variantId: String(v.variantId),
        discountPrice: Number(v.discountPrice),
        isAvailable: v.isAvailable
      }))
    }

    const loadToast = toast.loading('Saving variants and listing item on store...')
    try {
      await vendorService.addProduct(payload)
      toast.success(`${importingProduct.name} imported to your catalog!`, { id: loadToast })
      setProducts(prev => prev.filter(p => (p.id || p._id) !== pId))
      fetchMasterProducts()
      setImportingProduct(null)
      setEditableVariants([])
    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to import product. Please try again.'
      toast.error(errMsg, { id: loadToast })
    }
  }

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" />, active: true },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-50/30 via-[#FAF9FF] to-[#FAF9FF] dark:from-purple-950/10 dark:via-gray-950 dark:to-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">

      {/* 1. Mobile Top Bar */}
      <header className="md:hidden w-full h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100/20 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors border-none bg-transparent"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-extrabold text-base tracking-tight text-purple-650 flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-purple-600 animate-pulse" /> Master Catalog
        </span>
        <VendorNotificationBell />
      </header>

      {/* 2. Sidebar Layout */}
      <AnimatePresence>
        {(isMobileSidebarOpen || true) && (
          <motion.aside
            className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-purple-100/10 dark:border-gray-800 z-50 flex flex-col shrink-0 
              ${isMobileSidebarOpen ? 'block' : 'hidden md:flex'}`}
            initial={isMobileSidebarOpen ? { x: -260 } : false}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Logo */}
            <div className="p-6 pb-6 flex items-center justify-between border-b border-purple-50/10 dark:border-gray-800">
              <Link to="/" className="inline-block hover:scale-105 transition-transform mx-auto md:mx-0">
                <img src={logo} alt="Nearzo Logo" className="h-12 object-contain dark:filter dark:invert" />
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-4 space-y-1 flex-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
                    ${link.active
                      ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-650 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {link.icon} <span>{link.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-650 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl font-bold transition-all text-left mt-4 border-none bg-transparent cursor-pointer text-sm"
              >
                <LogOut className="w-5 h-5" /> <span>Logout</span>
              </button>
            </nav>

            {/* User Info Block */}
            <div className="p-4 border-t border-purple-100/10 dark:border-gray-800 bg-purple-50/10 dark:bg-gray-950/20">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-gray-900 dark:text-white line-clamp-1 text-sm">{user?.shopName || 'Partner Store'}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Dashboard</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 3. Main content */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-10 pb-24 md:pb-10 space-y-4 md:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100/10 dark:border-gray-800 pb-3 sm:pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Master Products Database
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Browse high-quality products curated by the platform, and import them instantly to your store!</p>
          </div>

          {/* Desktop Right Hand Toolbar actions */}
          <div className="hidden sm:flex items-center gap-3">
            <VendorNotificationBell />
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-white/85 dark:bg-gray-900/80 border border-purple-100/10 dark:border-gray-800 rounded-xl hover:bg-gray-50 shadow-sm transition-all cursor-pointer border-none"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs font-bold truncate max-w-[120px]">{user?.shopName || 'Partner'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-purple-100/10 rounded-2xl shadow-xl p-2 z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-655 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider text-left border-none bg-transparent cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Master Catalog List */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-purple-100/10 dark:border-gray-800 rounded-[24px] sm:rounded-[32px] p-3 sm:p-6 md:p-8 shadow-md min-h-[400px] flex flex-col justify-between">

          {/* Search bar inside the catalog container */}
          <div className="mb-4 sm:mb-6 w-full flex items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 sm:p-4 rounded-3xl shadow-sm relative">
            <Search className="absolute left-6 sm:left-7 top-1/2 -translate-y-1/2 w-4 sm:w-4.5 h-4 sm:h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search master products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-855 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-855 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="py-32 text-center flex-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-650/20 border-t-purple-650 rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">Connecting with platform catalog database...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center text-gray-400 max-w-md mx-auto flex-1 flex flex-col items-center justify-center">
              <Package className="w-16 h-16 text-purple-200 dark:text-gray-700 mb-4" />
              <h3 className="font-extrabold text-lg text-gray-950 dark:text-white uppercase tracking-tight">
                {searchQuery ? 'No Match Found' : 'No Master Products'}
              </h3>
              <p className="text-xs text-gray-400 mt-2">
                {searchQuery
                  ? `We couldn't find any master products matching "${searchQuery}". Please try another search term.`
                  : 'No items were retrieved from the master product registry.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id || prod._id}
                    onClick={() => setSelectedProductForDetails(prod)}
                    className="bg-purple-50/10 dark:bg-gray-850/15 border border-purple-100/5 dark:border-gray-800 hover:border-purple-200/20 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all relative overflow-hidden group cursor-pointer"
                  >
                    <div className="space-y-3">
                      {/* Product Representation Media */}
                      <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-purple-100 to-indigo-50 dark:from-purple-950/20 dark:to-purple-900/10 flex items-center justify-center relative overflow-hidden">
                        {getProductImage(prod) ? (
                          <img
                            src={getProductImage(prod)}
                            alt={prod.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-[#6C4CF1] opacity-70 animate-pulse" />
                        )}
                      </div>

                      <div className="space-y-1 text-left">
                        <h4 className="font-extrabold text-xs text-gray-950 dark:text-white line-clamp-1">{prod.name}</h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 h-4 font-semibold">
                          {stripHtml(prod.description) || 'Verified master product catalog listing.'}
                        </p>
                        <div className="flex items-center justify-between border-t border-purple-50/5 pt-2 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Base Price</span>
                            <span className="text-xs font-black text-purple-650">
                              {(() => {
                                const price = (prod.variants && prod.variants.length > 0)
                                  ? prod.variants[0].price
                                  : prod.price;
                                if (price === undefined || price === null || price === '') return 'N/A';
                                return `₹${price}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenImportModal(prod)
                      }}
                      className="w-full mt-3.5 py-2.5 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1 hover:scale-[1.02] border-none cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Store
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && products.length > 0 && (
            <div className="border-t border-purple-100/10 dark:border-gray-800 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-400 font-bold hidden sm:inline">
                Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
                {/* Mobile Pagination Controls */}
                <div className="flex sm:hidden items-center gap-2 justify-between w-full">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 rounded-xl border border-purple-100/10 dark:border-gray-800 text-xs font-black transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-black text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 rounded-xl border border-purple-100/10 dark:border-gray-800 text-xs font-black transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white"
                  >
                    Next
                  </button>
                </div>

                {/* Desktop Pagination Controls */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="w-9 h-9 rounded-xl border border-purple-100/10 dark:border-gray-800 flex items-center justify-center transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white hover:border-[#6C4CF1]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    const isCurrent = page === pageNum
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer border-none
                          ${isCurrent
                            ? 'bg-[#6C4CF1] text-white shadow-sm'
                            : 'bg-transparent text-gray-400 dark:text-gray-305 hover:text-[#6C4CF1] hover:bg-purple-50 dark:hover:bg-purple-950/20'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="w-9 h-9 rounded-xl border border-purple-100/10 dark:border-gray-800 flex items-center justify-center transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white hover:border-[#6C4CF1]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Import to Catalog Modal */}
      <AnimatePresence>
        {importingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop with glassmorphism */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportingProduct(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-800 w-[92%] sm:w-full sm:max-w-md rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl p-4 sm:p-6 relative z-10 space-y-4 sm:space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-[#6C4CF1]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm tracking-tight text-gray-950 dark:text-white uppercase">
                      Configure Variants
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Master Catalog Import</p>
                  </div>
                </div>
                <button
                  onClick={() => setImportingProduct(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-650" />
                </button>
              </div>

              {/* Product Info Card */}
              <div className="bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100/10 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 overflow-hidden flex items-center justify-center shrink-0 border border-purple-100/20">
                  {getProductImage(importingProduct) ? (
                    <img
                      src={getProductImage(importingProduct)}
                      alt={importingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-[#6C4CF1]" />
                  )}
                </div>
                <div className="min-w-0 text-left space-y-0.5">
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">{importingProduct.name}</h4>
                  <span className="inline-block text-[8px] font-black text-purple-650 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {importingProduct.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Variants Form */}
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {editableVariants.map((variant, index) => (
                    <div key={variant.variantId} className="p-3.5 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3 transition-colors hover:border-purple-100/10">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={variant.isAvailable}
                          onChange={(e) => {
                            const checked = e.target.checked
                            const updated = [...editableVariants]
                            updated[index].isAvailable = checked
                            setEditableVariants(updated)
                          }}
                          className="w-6 h-6 text-[#6C4CF1] rounded-md border-gray-300 dark:border-gray-700 focus:ring-[#6C4CF1] cursor-pointer shrink-0 accent-[#6C4CF1]"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-purple-100/20 bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                            {getProductImage(variant) ? (
                              <img src={getProductImage(variant)} alt={variant.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-[#6C4CF1]" />
                            )}
                          </div>
                          <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide truncate">{variant.name}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="text-left">
                          <span className="text-[8px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Base Price</span>
                          <div className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-xs font-black text-gray-500 dark:text-gray-400 border border-transparent">
                            ₹{variant.price}
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-[8px] font-black text-[#6C4CF1] block uppercase tracking-wider mb-1">Store Price (₹)</span>
                          <input
                            type="number"
                            value={variant.discountPrice}
                            onChange={(e) => {
                              const updated = [...editableVariants]
                              updated[index].discountPrice = e.target.value
                              setEditableVariants(updated)
                            }}
                            placeholder="e.g. 250"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-[#6C4CF1]/20 focus:border-[#6C4CF1] text-gray-800 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B3BE8] hover:from-[#5B3BE8] hover:to-[#4A2AD7] text-white rounded-[20px] text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg hover:scale-[1.01] border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Product to Store
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Details Modal dialog overlay */}
      <AnimatePresence>
        {selectedProductForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop with glassmorphism */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForDetails(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-800 w-[92%] sm:w-full sm:max-w-3xl rounded-[24px] sm:rounded-[32px] no-scrollbar shadow-2xl p-6 relative z-10 max-h-[90vh] overflow-y-auto space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-[#6C4CF1]">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm tracking-tight text-gray-955 dark:text-white uppercase">
                      Product Details
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Catalog Information</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProductForDetails(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-650" />
                </button>
              </div>

              {/* Product Info Content - Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Column: Image */}
                <div className="w-full">
                  <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 dark:from-purple-950/20 dark:to-purple-900/10 flex items-center justify-center relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
                    {getProductImage(selectedProductForDetails) ? (
                      <img
                        src={getProductImage(selectedProductForDetails)}
                        alt={selectedProductForDetails.name}
                        className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-[#6C4CF1] opacity-70" />
                    )}
                  </div>
                </div>

                {/* Right Column: Text & Details */}
                <div className="space-y-4 text-left">
                  {/* Name & Category */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-purple-650 uppercase tracking-wider block">
                      {selectedProductForDetails.category || 'General'}
                    </span>
                    <h4 className="font-extrabold text-lg text-gray-955 dark:text-white leading-tight">
                      {selectedProductForDetails.name || 'Unnamed Product'}
                    </h4>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 bg-gray-50/50 dark:bg-gray-950/25 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Description</span>
                    <p className="text-xs text-gray-650 dark:text-gray-300 font-semibold leading-relaxed max-h-40 overflow-y-auto pr-1">
                      {stripHtml(selectedProductForDetails.description) || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Pricing / Variants */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-black">Pricing & Stock</span>
                    {selectedProductForDetails.variants && selectedProductForDetails.variants.length > 0 ? (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {selectedProductForDetails.variants.map((variant, idx) => {
                          const discPrice = variant.discountPrice !== null && variant.discountPrice !== undefined ? variant.discountPrice : variant.price
                          const variantImg = getVariantImage(variant, selectedProductForDetails)
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-purple-50/10 dark:bg-purple-950/5 border border-purple-100/10 rounded-xl gap-3"
                            >
                              <div className="flex items-center gap-3 text-left">
                                {/* Variant Image */}
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                                  {variantImg ? (
                                    <img src={variantImg} alt={variant.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-[#6C4CF1] opacity-70" />
                                  )}
                                </div>

                                <div className="text-left">
                                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">{variant.name}</span>
                                  {variant.unit && (
                                    <span className="text-[9px] text-gray-400 block font-bold">Unit: {variant.unit}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right shrink-0">
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase">Price</span>
                                  <span className="text-xs font-black text-[#6C4CF1]">₹{discPrice}</span>
                                  {Number(variant.price) > Number(discPrice) && (
                                    <span className="text-[9px] text-gray-400 line-through">₹{variant.price}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="p-3.5 bg-purple-50/10 dark:bg-purple-950/5 border border-purple-100/10 rounded-xl flex flex-col justify-center text-left">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</span>
                          <span className="text-sm font-black text-[#6C4CF1]">
                            ₹{selectedProductForDetails.discountPrice !== null && selectedProductForDetails.discountPrice !== undefined ? selectedProductForDetails.discountPrice : (selectedProductForDetails.price || 0)}
                          </span>
                          {Number(selectedProductForDetails.price) > Number(selectedProductForDetails.discountPrice) && (
                            <span className="text-[9px] text-gray-400 line-through">₹{selectedProductForDetails.price}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Reminder Popup Modal */}
      <AnimatePresence>
        {showCategoryReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategoryReminder(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl border border-purple-100/10 text-center z-10 overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={() => setShowCategoryReminder(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-650 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 bg-purple-50 dark:bg-purple-950/30 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-purple-100/20">
                <Tag className="w-10 h-10 text-[#6C4CF1]" />
              </div>

              <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight mb-3">
                Select Product Category First
              </h3>
              <p className="text-xs text-gray-450 dark:text-gray-400 leading-relaxed mb-6">
                Your platform master catalog is currently empty because you have not selected your product categories yet. Please select your product categories under Settings so we can load the appropriate products for you.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowCategoryReminder(false)
                    navigate('/vendor/settings')
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#6C4CF1] to-[#8C6CF5] hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-650/20 transition-all uppercase text-xs tracking-wider cursor-pointer border-none"
                >
                  Go to Settings
                </button>
                <button
                  onClick={() => setShowCategoryReminder(false)}
                  className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-750 text-gray-500 dark:text-gray-300 font-extrabold rounded-2xl transition-all uppercase text-[10px] tracking-wider cursor-pointer border-none"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default VendorMasterProducts
