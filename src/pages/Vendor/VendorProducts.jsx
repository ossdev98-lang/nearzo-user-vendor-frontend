import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  Bell,
  Menu,
  X,
  FileText,
  Tag,
  TrendingUp,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  PlusCircle,
  Sparkles
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
import VendorNotificationBell from '../../components/vendor/VendorNotificationBell'
import toast from 'react-hot-toast'

const VendorProducts = () => {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [allCategories, setAllCategories] = useState(['all'])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [serverTotalPages, setServerTotalPages] = useState(1)
  const [serverTotalCount, setServerTotalCount] = useState(0)
  const [isServerPaginated, setIsServerPaginated] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [editableVariants, setEditableVariants] = useState([])

  // Form Fields State
  const [prodName, setProdName] = useState('')
  const [prodCategory, setProdCategory] = useState('Fruits')
  const [prodPrice, setProdPrice] = useState('')
  const [prodStock, setProdStock] = useState('')

  // Debounce search query to prevent rapid API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 450)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch categories list once on mount to populate the category filters
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await vendorService.getProducts({ limit: 1000 })
        if (data) {
          const list = Array.isArray(data) 
            ? data 
            : (data.vendorProducts || data.products || data.data || [])
          const cats = ['all', ...new Set(list.map(p => {
            const cat = p.Product?.categoryName || p.category || 'General'
            return cat.trim()
          }).filter(Boolean))]
          setAllCategories(cats)
        }
      } catch (err) {
        console.warn('Failed to load categories list', err)
      }
    }
    loadCategories()
  }, [])

  // Fetch products from catalog API with query params
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        search: debouncedSearch || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        page: currentPage,
        limit: itemsPerPage
      }
      const data = await vendorService.getProducts(params)
      if (data) {
        if (Array.isArray(data)) {
          // Plain array response (backend did not paginate/filter on server)
          setProducts(data)
          setIsServerPaginated(false)
          setServerTotalPages(Math.ceil(data.length / itemsPerPage))
          setServerTotalCount(data.length)
        } else {
          // Paginated response
          const list = data.vendorProducts || data.products || data.data || []
          setProducts(list)
          setIsServerPaginated(true)
          
          const totalCount = data.total || data.count || list.length
          setServerTotalCount(totalCount)
          
          if (data.totalPages !== undefined) {
            setServerTotalPages(data.totalPages)
          } else if (data.total !== undefined) {
            setServerTotalPages(Math.ceil(data.total / itemsPerPage))
          } else {
            // Fallback to client-side pagination if paginated details aren't returned
            setIsServerPaginated(false)
            setServerTotalPages(Math.ceil(list.length / itemsPerPage))
          }
        }
      } else {
        setProducts([])
        setIsServerPaginated(false)
        setServerTotalPages(1)
        setServerTotalCount(0)
      }
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedCategory, debouncedSearch])

  const handleLogout = () => {
    vendorAuthService.logout()
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/vendor/login')
  }

  // Open modal for adding a new product
  const handleOpenAddModal = () => {
    setModalMode('add')
    setProdName('')
    setProdCategory('Fruits')
    setProdPrice('')
    setProdStock('')
    setIsModalOpen(true)
  }

  // Open modal for editing existing product
  const handleOpenEditModal = (product) => {
    setModalMode('edit')
    setEditingProduct(product)
    
    const cleanPriceValue = (val) => {
      if (val === undefined || val === null) return 0
      if (typeof val === 'string') {
        return Number(val.replace(/[^0-9.]/g, '')) || 0
      }
      return Number(val) || 0
    }

    const initialVariants = (product.variants && product.variants.length > 0)
      ? product.variants.map(v => ({
          variantId: v.variantId || v.id,
          name: v.name || 'Default Variant',
          price: cleanPriceValue(v.price),
          discountPrice: cleanPriceValue(v.discountPrice !== undefined && v.discountPrice !== null ? v.discountPrice : v.price),
          isAvailable: v.isAvailable !== false,
          image: v.image || (v.images && v.images[0])
        }))
      : [{
          variantId: 'v-default',
          name: 'Regular',
          price: cleanPriceValue(product.Product?.price || product.price),
          discountPrice: cleanPriceValue(product.discountPrice !== undefined && product.discountPrice !== null ? product.discountPrice : (product.Product?.price || product.price)),
          isAvailable: product.isAvailable !== false && product.stock !== 0,
          image: product.image || (product.images && product.images[0]) || product.Product?.primaryImage
        }]

    setEditableVariants(initialVariants)
    setIsModalOpen(true)
  }

  // Handle Form Submission for Add or Edit
  const handleSubmit = async (e) => {
    e.preventDefault()

    const hasActualVariants = editingProduct?.variants && editingProduct.variants.length > 0
    
    let payload = {}
    if (hasActualVariants) {
      payload = {
        variants: editableVariants.map(v => ({
          variantId: v.variantId,
          discountPrice: Number(v.discountPrice),
          isAvailable: v.isAvailable
        }))
      }
    } else {
      const mainVariant = editableVariants[0] || {}
      payload = {
        discountPrice: Number(mainVariant.discountPrice),
        isAvailable: mainVariant.isAvailable,
        stock: mainVariant.isAvailable ? 100 : 0
      }
    }

    const loadToast = toast.loading('Saving changes...')
    try {
      await vendorService.updateProduct(editingProduct.id, payload)
      toast.success(`${editingProduct.Product?.name || editingProduct.name || 'Product'} updated successfully!`, { id: loadToast })
      
      // Update local state products list
      setProducts(prev => prev.map(p => {
        if (p.id === editingProduct.id) {
          if (hasActualVariants) {
            const updatedVariants = p.variants.map(pv => {
              const matched = editableVariants.find(ev => ev.variantId === pv.variantId)
              if (matched) {
                return {
                  ...pv,
                  discountPrice: Number(matched.discountPrice),
                  isAvailable: matched.isAvailable
                }
              }
              return pv
            })
            return { ...p, variants: updatedVariants }
          } else {
            return {
              ...p,
              discountPrice: Number(payload.discountPrice),
              stock: payload.stock
            }
          }
        }
        return p
      }))
      
      setIsModalOpen(false)
      setEditingProduct(null)
      setEditableVariants([])
    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save changes.'
      toast.error(errMsg, { id: loadToast })
    }
  }

  // Handle Product Deletion
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await vendorService.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product deleted successfully')
    } catch (err) {
      toast.error('Failed to delete product')
    }
  }

  // Helper to resolve product image from server
  const getProductImage = (prod) => {
    if (!prod) return null;
    let imgPath = prod.Product?.primaryImage || (prod.Product?.images && prod.Product.images[0]?.url) || prod.image;
    if (!imgPath) return null;
    if (typeof imgPath === 'object') {
      imgPath = imgPath.url || imgPath.image || imgPath.path || '';
    }
    if (typeof imgPath !== 'string' || !imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com';
    return `${baseUrlForImage.replace(/\/$/, '')}/${imgPath.replace(/^\//, '')}`;
  }

  // Check if the server-returned products actually match the selected category.
  // If the server returned any product that does NOT match the selected category,
  // it means the server did not filter by category, so we must filter client-side.
  const serverDidFilterCategory = selectedCategory === 'all' || products.length === 0 || products.every(product => {
    const category = (product.Product?.categoryName || product.category || 'General').toLowerCase()
    return category === selectedCategory.toLowerCase()
  })

  // Same for search query: check if all returned products match the search query.
  // If not, it means the server did not filter by search, so we must filter client-side.
  const serverDidFilterSearch = !searchQuery || products.length === 0 || products.every(product => {
    const name = (product.Product?.name || product.name || '').toLowerCase()
    const category = (product.Product?.categoryName || product.category || 'General').toLowerCase()
    const query = searchQuery.toLowerCase()
    return name.includes(query) || category.includes(query)
  })

  const shouldFilterLocally = !serverDidFilterCategory || !serverDidFilterSearch

  // Filter products based on search query matching name or category, and selected tab category
  const filteredProducts = shouldFilterLocally
    ? products.filter(product => {
        const name = (product.Product?.name || product.name || '').toLowerCase()
        const category = (product.Product?.categoryName || product.category || 'General').toLowerCase()
        const query = searchQuery.toLowerCase()
        
        const matchesSearch = name.includes(query) || category.includes(query)
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory.toLowerCase()
        
        return matchesSearch && matchesCategory
      })
    : products

  // Pagination calculations
  const totalPages = shouldFilterLocally
    ? Math.ceil(filteredProducts.length / itemsPerPage)
    : serverTotalPages

  const startIndex = (currentPage - 1) * itemsPerPage
  
  const paginatedProducts = shouldFilterLocally
    ? filteredProducts.slice(startIndex, startIndex + itemsPerPage)
    : products

  const totalItemsCount = shouldFilterLocally ? filteredProducts.length : serverTotalCount

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  // Generate unique categories dynamically from catalog
  const uniqueCategories = allCategories.length > 1 ? allCategories : ['all', ...new Set(products.map(p => {
    const cat = p.Product?.categoryName || p.category || 'General'
    return cat.trim()
  }).filter(Boolean))]

  const navLinks = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', path: '/vendor/products', icon: <Package className="w-5 h-5" />, active: true },
    { label: 'Settings', path: '/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">

      {/* 1. Mobile Header */}
      <header className="md:hidden w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors border-none bg-transparent"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-extrabold text-base tracking-tight text-purple-650">Store Products</span>
        <VendorNotificationBell />
      </header>

      {/* 2a. Desktop Sidebar (Static & Robust) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-105 dark:border-gray-800 h-screen sticky top-0 shrink-0 z-35">
        {/* Logo */}
        <div className="p-6 pb-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-12 object-contain dark:filter dark:invert" />
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
                ${link.active
                  ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-650'
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

        {/* Bottom User Info Block */}
        <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-gray-900 dark:text-white line-clamp-1 text-sm">{user?.shopName || 'Sharma General Store'}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Dashboard</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2b. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden"
            />
            <motion.aside
              className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-105 dark:border-gray-800 z-50 flex flex-col shrink-0 md:hidden"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Logo & Close drawer for Mobile */}
              <div className="p-6 pb-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                <Link to="/" className="inline-block hover:scale-105 transition-transform mx-auto">
                  <img src={logo} alt="Nearzo Logo" className="h-12 object-contain dark:filter dark:invert" />
                </Link>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="p-4 space-y-1.5 flex-1">
                {navLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
                      ${link.active
                        ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-650'
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

              {/* Bottom User Info Block */}
              <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-gray-900 dark:text-white line-clamp-1 text-sm">{user?.shopName || 'Sharma General Store'}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Dashboard</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Product Catalog</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Manage your inventory, prices, and catalog categories.</p>
          </div>

          {/* Desktop Right Hand Toolbar actions */}
          <div className="hidden sm:flex items-center gap-3">
            <VendorNotificationBell />
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 shadow-sm transition-all cursor-pointer border-none"
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
                    className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-750 rounded-2xl shadow-xl p-2 z-50"
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider text-left border-none bg-transparent cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CSS rule to hide horizontal scrollbar for categories tabs */}
        <style>{`
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Search & Actions Bar (Clean unified layout with category tabs) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-sm relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-855 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-855 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => navigate('/vendor/master-products')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-[20px] text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] border-none cursor-pointer shrink-0"
            >
              <Plus className="w-4.5 h-4.5" /> Add New Product
            </button>
          </div>

          {/* Dynamic Category Tabs */}
          {uniqueCategories.length > 1 && (
            <div 
              className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {uniqueCategories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black capitalize transition-all border-none cursor-pointer shrink-0
                      ${isActive 
                        ? 'bg-[#6C4CF1] text-white shadow-md shadow-purple-550/20' 
                        : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-850'
                      }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Catalog list container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-purple-650/30 border-t-purple-650 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-400">Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center text-gray-400 max-w-sm mx-auto">
              <Package className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white uppercase tracking-tight">No Products Found</h3>
              <p className="text-xs text-gray-400 mt-2">
                Your store catalog is empty or no products match the selected parameters. Let's add some!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((prod) => {
                  const imgUrl = getProductImage(prod)
                  const name = prod.Product?.name || prod.name || 'Unnamed Product'
                  const category = prod.Product?.categoryName || prod.category || 'General'

                  // Calculate variant metadata
                  const hasVariants = prod.variants && prod.variants.length > 0
                  let priceDisplay = ''
                  let originalPriceDisplay = ''
                  let totalStock = 0
                  let variantCount = 0

                  if (hasVariants) {
                    variantCount = prod.variants.length
                    totalStock = prod.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                    
                    const discountPrices = prod.variants.map(v => v.discountPrice !== null && v.discountPrice !== undefined ? v.discountPrice : v.price)
                    const originalPrices = prod.variants.map(v => v.price)
                    
                    const minDisc = Math.min(...discountPrices)
                    const maxDisc = Math.max(...discountPrices)
                    priceDisplay = minDisc === maxDisc ? `₹${minDisc}` : `₹${minDisc} - ₹${maxDisc}`
                    
                    const minOrig = Math.min(...originalPrices)
                    const maxOrig = Math.max(...originalPrices)
                    originalPriceDisplay = minOrig === maxOrig ? `₹${minOrig}` : `₹${minOrig} - ₹${maxOrig}`
                  } else {
                    const origPrice = prod.price || prod.Product?.price || 0
                    const cleanPrice = typeof origPrice === 'string' ? Number(origPrice.replace(/[^0-9.]/g, '')) || 0 : Number(origPrice)
                    
                    const discPrice = prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice : cleanPrice
                    
                    priceDisplay = `₹${discPrice}`
                    originalPriceDisplay = `₹${cleanPrice}`
                    totalStock = prod.stock || 0
                  }

                  return (
                    <div
                      key={prod.id}
                      className="bg-gray-50/30 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        {/* Product image representation */}
                        <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/20 dark:to-purple-900/10 flex items-center justify-center relative overflow-hidden">
                          {imgUrl ? (
                            <img src={imgUrl} alt={name} className="object-cover w-full h-full" />
                          ) : (
                            <Package className="w-10 h-10 text-[#6C4CF1] opacity-70" />
                          )}
                        </div>

                        <div className="space-y-1.5 text-left">
                          <span className="text-[10px] font-black text-purple-650 uppercase tracking-wider block">
                            {category}
                          </span>
                          <h4 className="font-extrabold text-sm text-gray-950 dark:text-white line-clamp-1" title={name}>{name}</h4>
                          
                          <div className="flex items-start justify-between mt-2">
                            <div className="flex flex-col text-left">
                              {hasVariants ? (
                                <span className="text-[10px] text-gray-400 font-bold mt-0.5">{variantCount} {variantCount === 1 ? 'Variant' : 'Variants'}</span>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-bold mt-0.5">Simple Product</span>
                              )}
                            </div>
                            {/* Actions area with premium Edit button */}
                            <div className="shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenEditModal(prod)
                                }}
                                className="px-4 py-2 bg-purple-50 hover:bg-[#6C4CF1] dark:bg-purple-950/20 text-[#6C4CF1] hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Dynamic Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <span className="text-xs text-gray-400 font-bold">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItemsCount)} of {totalItemsCount} items
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white hover:border-[#6C4CF1]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1
                      const isCurrent = currentPage === pageNum
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer border-none
                            ${isCurrent 
                              ? 'bg-[#6C4CF1] text-white shadow-sm' 
                              : 'bg-transparent text-gray-400 dark:text-gray-300 hover:text-[#6C4CF1] hover:bg-purple-50 dark:hover:bg-purple-950/20'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white hover:border-[#6C4CF1]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Edit/Add Modal dialog overlay */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop with glassmorphism */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false)
                setEditingProduct(null)
                setEditableVariants([])
              }}
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
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Edit Store Pricing</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingProduct(null)
                    setEditableVariants([])
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-650" />
                </button>
              </div>

              {/* Product Info Card */}
              <div className="bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100/10 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 overflow-hidden flex items-center justify-center shrink-0 border border-purple-100/20">
                  {getProductImage(editingProduct) ? (
                    <img
                      src={getProductImage(editingProduct)}
                      alt={editingProduct.Product?.name || editingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-[#6C4CF1]" />
                  )}
                </div>
                <div className="min-w-0 text-left space-y-0.5">
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">{editingProduct.Product?.name || editingProduct.name}</h4>
                  <span className="inline-block text-[8px] font-black text-purple-650 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {editingProduct.Product?.categoryName || editingProduct.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Variants Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {editableVariants.map((variant, index) => (
                    <div key={variant.variantId} className="p-3.5 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3 transition-colors hover:border-purple-100/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-purple-100/20 bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                            {getProductImage(variant) ? (
                              <img src={getProductImage(variant)} alt={variant.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-[#6C4CF1]" />
                            )}
                          </div>
                          <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">{variant.name}</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={variant.isAvailable}
                            onChange={async (e) => {
                              const checked = e.target.checked
                              const updated = [...editableVariants]
                              updated[index].isAvailable = checked
                              setEditableVariants(updated)
                              
                              if (editingProduct?.id) {
                                const loadToast = toast.loading('Updating availability...')
                                try {
                                  await vendorService.updateProductAvailability(editingProduct.id, checked)
                                  toast.success('Availability updated successfully!', { id: loadToast })
                                } catch (err) {
                                  console.error(err)
                                  const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update availability.'
                                  toast.error(errMsg, { id: loadToast })
                                  
                                  // Revert state
                                  const reverted = [...updated]
                                  reverted[index].isAvailable = !checked
                                  setEditableVariants(reverted)
                                }
                              }
                            }}
                            className="w-4.5 h-4.5 text-[#6C4CF1] rounded-lg border-gray-300 dark:border-gray-700 focus:ring-[#6C4CF1] cursor-pointer"
                          />
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider transition-colors ${variant.isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {variant.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </label>
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
                  className="w-full py-4 bg-gradient-to-r from-[#6C4CF1] to-[#5B3BE8] hover:scale-[1.01] text-white rounded-[20px] text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-550/20 mt-4 border-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit className="w-4.5 h-4.5" />
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default VendorProducts
