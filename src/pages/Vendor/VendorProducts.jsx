import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
  Store
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/nearzo-logo.png'
import { vendorService } from '../../services/vendorService'
import { vendorAuthService } from '../../services/vendorAuthService'
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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [editingProduct, setEditingProduct] = useState(null)

  // Form Fields State
  const [prodName, setProdName] = useState('')
  const [prodCategory, setProdCategory] = useState('Fruits')
  const [prodPrice, setProdPrice] = useState('')
  const [prodStock, setProdStock] = useState('')

  // Fetch products from catalog API
  const fetchProducts = async () => {
    try {
      const data = await vendorService.getProducts()
      setProducts(data || [])
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

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
    setProdName(product.name)
    setProdCategory(product.category)
    setProdPrice(product.price.replace('₹', ''))
    setProdStock(product.stock.toString())
    setIsModalOpen(true)
  }

  // Handle Form Submission for Add or Edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prodName || !prodPrice || !prodStock) {
      toast.error('Please fill all mandatory fields')
      return
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      price: `₹${prodPrice}`,
      stock: parseInt(prodStock)
    }

    try {
      if (modalMode === 'add') {
        const response = await vendorService.addProduct(payload)
        const newProduct = response.product || { id: Date.now().toString(), ...payload }
        setProducts(prev => [newProduct, ...prev])
        toast.success('Product added successfully!')
      } else {
        await vendorService.updateProduct(editingProduct.id, payload)
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p))
        toast.success('Product updated successfully!')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error('Operation failed')
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

  // Categories list
  const categoriesList = ['all', 'Fruits', 'Vegetables', 'Dairy', 'Bakery']

  // Filter products based on search & category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

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
        <button className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors relative border-none bg-transparent">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>
      </header>

      {/* 2. Sidebar for Desktop & Mobile Overlay Drawer */}
      <AnimatePresence>
        {(isMobileSidebarOpen || true) && (
          <motion.aside
            className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col shrink-0 
              ${isMobileSidebarOpen ? 'block' : 'hidden md:flex'}`}
            initial={isMobileSidebarOpen ? { x: -260 } : false}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Logo & Close drawer for Mobile */}
            <div className="p-6 pb-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
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
                      ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {link.icon} <span>{link.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl font-bold transition-all text-left mt-4 border-none bg-transparent cursor-pointer text-sm"
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
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 3. Main content */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Product Catalog</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Manage your inventory, prices, and catalog categories.</p>
          </div>

          {/* Desktop Right Hand Toolbar actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button className="w-11 h-11 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors relative shadow-sm cursor-pointer border-none bg-transparent">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>
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

        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer
                  ${selectedCategory === cat 
                    ? 'bg-[#6C4CF1] text-white border-[#6C4CF1] shadow-md shadow-purple-650/10' 
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 text-gray-400 dark:text-gray-500'}`}
              >
                {cat === 'all' ? 'All Products' : cat}
              </button>
            ))}
          </div>

          <button 
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-sm relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search catalog products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-855 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-855 dark:text-white"
          />
        </div>

        {/* Catalog list container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm min-h-[300px]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id}
                  className="bg-gray-50/30 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Placeholder image representation */}
                    <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/20 dark:to-purple-900/10 flex items-center justify-center relative">
                      <Package className="w-10 h-10 text-[#6C4CF1] opacity-70" />
                      <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 text-purple-600 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        {prod.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-gray-950 dark:text-white line-clamp-1">{prod.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{prod.price}</span>
                        <span className="text-[10px] font-bold text-green-500">
                          {prod.stock} In Stock
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100/50 dark:border-gray-800 mt-4 pt-3.5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="w-9 h-9 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/20 text-[#6C4CF1] flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Edit/Add Modal dialog overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal content sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2 text-purple-650">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-extrabold text-base tracking-tight text-gray-950 dark:text-white uppercase">
                    {modalMode === 'add' ? 'Add Catalog Item' : 'Edit Catalog Item'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Item Title</label>
                  <input 
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Organic Strawberries Basket"
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                    >
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Bakery">Bakery</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Price (₹)</label>
                    <input 
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">In-Stock Quantity</label>
                  <input 
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-650/20 text-gray-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6C4CF1] hover:bg-[#5B3BE8] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-4 border-none cursor-pointer"
                >
                  {modalMode === 'add' ? 'Confirm and Save' : 'Save Changes'}
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
