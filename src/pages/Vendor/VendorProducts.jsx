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
  Sparkles,
  Upload
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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [editableVariants, setEditableVariants] = useState([])
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [frontImageFile, setFrontImageFile] = useState(null)
  const [backImageFile, setBackImageFile] = useState(null)
  const [frontImagePreview, setFrontImagePreview] = useState(null)
  const [backImagePreview, setBackImagePreview] = useState(null)
  const [uploadingNonMaster, setUploadingNonMaster] = useState(false)

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFrontImageFile(file)
      setFrontImagePreview(URL.createObjectURL(file))
    }
  }

  const handleBackImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBackImageFile(file)
      setBackImagePreview(URL.createObjectURL(file))
    }
  }

  const handleUploadNonMasterSubmit = async (e) => {
    e.preventDefault()
    if (!frontImageFile || !backImageFile) {
      toast.error('Please upload both Front and Back images!')
      return
    }

    setUploadingNonMaster(true)
    const toastId = toast.loading('Uploading non-master product...')
    const formData = new FormData()
    formData.append('frontImage', frontImageFile)
    formData.append('backImage', backImageFile)

    try {
      const data = await vendorService.uploadNonMasterProduct(formData)
      toast.success(data.message || 'Non-master product uploaded successfully! 🎉', { id: toastId })
      setIsUploadModalOpen(false)
      setFrontImageFile(null)
      setBackImageFile(null)
      setFrontImagePreview(null)
      setBackImagePreview(null)
      fetchProducts()
    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to upload product.'
      toast.error(errMsg, { id: toastId })
    } finally {
      setUploadingNonMaster(false)
    }
  }

  const stripHtml = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
  }

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
  const handleOpenEditModal = async (product) => {
    const pId = product.id || product._id
    const loadToast = toast.loading('Fetching product details...')
    try {
      const response = await vendorService.getVendorProduct(pId)
      const freshProduct = response?.vendorProduct || response?.data || response?.product || response || product

      setModalMode('edit')
      setEditingProduct(freshProduct)

      const cleanPriceValue = (val) => {
        if (val === undefined || val === null) return 0
        if (typeof val === 'string') {
          return Number(val.replace(/[^0-9.]/g, '')) || 0
        }
        return Number(val) || 0
      }

      const rawVariants = freshProduct.variants || freshProduct.Product?.variants || []

      const initialVariants = (rawVariants && rawVariants.length > 0)
        ? rawVariants.map(v => ({
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
          price: cleanPriceValue(freshProduct.Product?.price || freshProduct.price),
          discountPrice: cleanPriceValue(freshProduct.discountPrice !== undefined && freshProduct.discountPrice !== null ? freshProduct.discountPrice : (freshProduct.Product?.price || freshProduct.price)),
          isAvailable: freshProduct.isAvailable !== false && freshProduct.stock !== 0,
          image: freshProduct.image || (freshProduct.images && freshProduct.images[0]) || freshProduct.Product?.primaryImage
        }]

      setEditableVariants(initialVariants)
      setIsModalOpen(true)
      toast.success('Product details loaded!', { id: loadToast })
    } catch (err) {
      console.error('Failed to load product details:', err)
      toast.error('Failed to load details from server, using local copy.', { id: loadToast })

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
    let imgPath = null;

    // Check standard product image fields first
    imgPath = prod.Product?.primaryImage || (prod.Product?.images && prod.Product.images[0]?.url) || prod.image || (prod.Product && (prod.Product.image || (prod.Product.images && prod.Product.images[0]?.url)));

    // If not found, check first variant's image as fallback
    if (!imgPath) {
      const firstVariant = (prod.variants && prod.variants[0]) || (prod.Product?.variants && prod.Product.variants[0]);
      if (firstVariant) {
        imgPath = firstVariant.image || (firstVariant.images && firstVariant.images[0]?.url) || firstVariant.url;
      }
    }

    if (!imgPath) return null;
    if (typeof imgPath === 'object') {
      imgPath = imgPath.url || imgPath.image || imgPath.path || '';
    }
    if (typeof imgPath !== 'string' || !imgPath) return null;
    const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com';
    return `${baseUrlForImage.replace(/\/$/, '')}/${imgPath.replace(/^\//, '')}`;
  }

  const getVariantImage = (variant, parentProduct) => {
    if (!variant) return null;
    let imgPath = variant.image || (variant.images && variant.images[0]?.url) || variant.url;
    if (!imgPath && parentProduct) {
      imgPath = parentProduct.Product?.primaryImage || (parentProduct.Product?.images && parentProduct.Product.images[0]?.url) || parentProduct.image;
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
      <main className="flex-1 p-3.5 sm:p-6 md:p-10 pb-24 md:pb-10 space-y-4 md:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3 sm:pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Product Catalogue</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Manage your product,prices,and variants.</p>
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

        {/* Search & Actions Bar (Clean unified layout with category tabs) */}
        <div className="space-y-3 sm:space-y-4">
          {/* CSS rule to hide horizontal scrollbar for categories tabs */}
          <style>{`
            .scrollbar-none::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 sm:p-4 rounded-3xl shadow-sm relative">
              <Search className="absolute left-6 sm:left-7 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-855 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-855 dark:text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-4 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-[20px] text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] border-none cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Upload Product Name
              </button>
              <button
                onClick={() => navigate('/vendor/master-products')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-4 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-[20px] text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] border-none cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" /> Add New Product
              </button>
            </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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

                    const firstV = prod.variants[0]
                    const discPrice = firstV.discountPrice !== null && firstV.discountPrice !== undefined ? firstV.discountPrice : firstV.price
                    const origPrice = firstV.price

                    priceDisplay = `₹${discPrice}`
                    originalPriceDisplay = `₹${origPrice}`
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
                      onClick={() => setSelectedProductForDetails(prod)}
                      className="bg-gray-50/30 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden cursor-pointer"
                    >
                      <div className="space-y-3 sm:space-y-4">
                        {/* Product image representation */}
                        <div className="aspect-square w-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/20 dark:to-purple-900/10 flex items-center justify-center relative overflow-hidden">
                          {imgUrl ? (
                            <img src={imgUrl} alt={name} className="object-cover w-full h-full" />
                          ) : (
                            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#6C4CF1] opacity-70" />
                          )}
                        </div>

                        <div className="space-y-1 sm:space-y-1.5 text-left">
                          <span className="text-[9px] sm:text-[10px] font-black text-purple-650 uppercase tracking-wider block">
                            {category}
                          </span>
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-950 dark:text-white line-clamp-1" title={name}>{name}</h4>

                          {/* Price Display */}
                          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                            <span className="text-xs sm:text-sm font-black text-[#6C4CF1]">{priceDisplay}</span>
                            {hasVariants && prod.variants[0]?.name && (
                              <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">({prod.variants[0].name})</span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                            <div className="flex flex-col text-left">
                              {hasVariants ? (
                                <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold mt-0.5">{variantCount} {variantCount === 1 ? 'Var' : 'Vars'}</span>
                              ) : (
                                <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold mt-0.5">Simple</span>
                              )}
                            </div>
                            {/* Actions area with premium Edit & Delete buttons */}
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenEditModal(prod)
                                }}
                                className="p-2 sm:px-3 sm:py-2 bg-purple-50 hover:bg-[#6C4CF1] dark:bg-purple-950/20 text-[#6C4CF1] hover:text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-sm"
                                title="Edit Product"
                              >
                                <Edit className="w-3 h-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirmId(prod.id)
                                }}
                                className="p-2 bg-red-50 hover:bg-red-500 dark:bg-red-950/20 text-red-650 hover:text-white rounded-lg sm:rounded-xl transition-all border-none cursor-pointer flex items-center justify-center shadow-sm"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
                  <span className="text-xs text-gray-400 font-bold hidden sm:inline">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItemsCount)} of {totalItemsCount} items
                  </span>

                  <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
                    {/* Mobile Pagination Controls */}
                    <div className="flex sm:hidden items-center gap-2 justify-between w-full">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-black transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-black text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-black transition-all bg-white dark:bg-gray-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-250 hover:bg-[#6C4CF1] hover:text-white"
                      >
                        Next
                      </button>
                    </div>

                    {/* Desktop Pagination Controls */}
                    <div className="hidden sm:flex items-center gap-1">
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
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Edit/Add Modal dialog overlay */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                      <div className="flex items-center gap-3">
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-800 w-[92%] sm:w-full sm:max-w-sm rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl p-6 relative z-10 space-y-5 text-center text-gray-800 dark:text-gray-100"
            >
              {/* Warning/Trash Icon */}
              <div className="mx-auto w-14 h-14 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center text-red-600">
                <Trash2 className="w-7 h-7" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 text-center">
                <h3 className="font-black text-base tracking-tight text-gray-955 dark:text-white uppercase">
                  Delete Product?
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold leading-relaxed">
                  Are you sure you want to delete this product? This action is permanent and cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-[18px] text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const id = deleteConfirmId
                    setDeleteConfirmId(null)
                    await handleDeleteProduct(id)
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-[18px] text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-red-600/10 border-none cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Details Modal dialog overlay */}
      <AnimatePresence>
        {selectedProductForDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                        alt={selectedProductForDetails.Product?.name || selectedProductForDetails.name}
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
                      {selectedProductForDetails.Product?.categoryName || selectedProductForDetails.category || 'General'}
                    </span>
                    <h4 className="font-extrabold text-lg text-gray-955 dark:text-white leading-tight">
                      {selectedProductForDetails.Product?.name || selectedProductForDetails.name || 'Unnamed Product'}
                    </h4>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 bg-gray-50/50 dark:bg-gray-950/25 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-855">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Description</span>
                    <p className="text-xs text-gray-650 dark:text-gray-300 font-semibold leading-relaxed max-h-40 overflow-y-auto pr-1">
                      {stripHtml(selectedProductForDetails.Product?.description || selectedProductForDetails.description) || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Pricing / Variants */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-black">Pricing</span>
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
                            ₹{selectedProductForDetails.discountPrice !== null && selectedProductForDetails.discountPrice !== undefined ? selectedProductForDetails.discountPrice : (selectedProductForDetails.price || selectedProductForDetails.Product?.price || 0)}
                          </span>
                          {Number(selectedProductForDetails.price || selectedProductForDetails.Product?.price) > Number(selectedProductForDetails.discountPrice) && (
                            <span className="text-[9px] text-gray-400 line-through">₹{selectedProductForDetails.price || selectedProductForDetails.Product?.price}</span>
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

      {/* Upload Non-Master Product Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!uploadingNonMaster) {
                  setIsUploadModalOpen(false)
                  setFrontImageFile(null)
                  setBackImageFile(null)
                  setFrontImagePreview(null)
                  setBackImagePreview(null)
                }
              }}
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-800 w-[92%] sm:w-full sm:max-w-md rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl p-6 relative z-10 space-y-5 text-gray-800 dark:text-gray-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-[#6C4CF1]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm tracking-tight text-gray-955 dark:text-white uppercase">
                      Upload Product Name
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Non-Master Product Images</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!uploadingNonMaster) {
                      setIsUploadModalOpen(false)
                      setFrontImageFile(null)
                      setBackImageFile(null)
                      setFrontImagePreview(null)
                      setBackImagePreview(null)
                    }
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-650" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleUploadNonMasterSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Front Image Zone */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest">Front Image</label>
                    <div className="aspect-square relative rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-[#6C4CF1] dark:hover:border-[#6C4CF1] transition-all flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-850/20 cursor-pointer overflow-hidden group">
                      {frontImagePreview ? (
                        <>
                          <img src={frontImagePreview} alt="Front Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFrontImageFile(null)
                              setFrontImagePreview(null)
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-650 text-white rounded-full border-none cursor-pointer flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFrontImageChange}
                            className="hidden"
                          />
                          <PlusCircle className="w-7 h-7 text-gray-400 group-hover:text-[#6C4CF1] transition-colors mb-2" />
                          <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-[#6C4CF1] transition-colors uppercase text-center leading-tight">Front Photo</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Back Image Zone */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest">Back Image</label>
                    <div className="aspect-square relative rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-[#6C4CF1] dark:hover:border-[#6C4CF1] transition-all flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-850/20 cursor-pointer overflow-hidden group">
                      {backImagePreview ? (
                        <>
                          <img src={backImagePreview} alt="Back Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setBackImageFile(null)
                              setBackImagePreview(null)
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-650 text-white rounded-full border-none cursor-pointer flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackImageChange}
                            className="hidden"
                          />
                          <PlusCircle className="w-7 h-7 text-gray-400 group-hover:text-[#6C4CF1] transition-colors mb-2" />
                          <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-[#6C4CF1] transition-colors uppercase text-center leading-tight">Back Photo</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={uploadingNonMaster}
                    onClick={() => {
                      setIsUploadModalOpen(false)
                      setFrontImageFile(null)
                      setBackImageFile(null)
                      setFrontImagePreview(null)
                      setBackImagePreview(null)
                    }}
                    className="w-1/2 py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/80 text-gray-600 dark:text-gray-300 rounded-[20px] text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingNonMaster}
                    className="w-1/2 py-3.5 bg-gradient-to-r from-[#6C4CF1] to-[#5B3BE8] hover:scale-[1.01] text-white rounded-[20px] text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-550/20 border-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingNonMaster ? 'Uploading...' : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VendorProducts
