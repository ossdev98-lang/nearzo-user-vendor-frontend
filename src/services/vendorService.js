import API from './api'

export const vendorService = {
  getNearbyVendors: async (latitude, longitude, shopCategoryId = null, sortBy = 'rating', isTopRated = false) => {
    const params = { latitude, longitude, sortBy }
    if (shopCategoryId) params.shopCategoryId = shopCategoryId
    if (isTopRated) params.isTopRated = true

    const response = await API.get('/vendors/nearby', { params })
    return response.data
  },
  getShopDetails: async (vendorId) => {
    const response = await API.get(`/vendors/${vendorId}/shop`)
    return response.data
  },
  getBestSellingProducts: async () => {
    const response = await API.get('/vendors/products/best-selling')
    return response.data
  },
  getProductDetails: async (productId) => {
    const response = await API.get(`/vendors/products/${productId}`)
    return response.data
  },
  getOriginalProductDetails: async (productId) => {
    const response = await API.get(`/products/${productId}`)
    return response.data
  },
  searchProductsOrShops: async (query, type = 'product', latitude, longitude) => {
    const endpoint = type === 'product' ? `/vendors/products/search?q=${query}` : `/vendors/search?q=${query}`
    const response = await API.get(endpoint, {
      params: { latitude, longitude }
    })
    return response.data
  },

  // Vendor Dashboard Specific APIs
  getOrders: async () => {
    try {
      const response = await API.get('/vendor/orders')
      return response.data
    } catch (error) {
      // Return local orders list fallback if backend lacks specific endpoint
      console.warn('Backend /vendor/orders fallback, returning mock data', error)
      return [
        { id: '#ORD12345', time: '10:30 AM', customer: 'Amit Kumar', price: '₹1,250', status: 'Completed', type: 'completed', notes: 'Leave instruction: Ring the bell twice.', voiceInstruction: '' },
        { id: '#ORD12344', time: '10:05 AM', customer: 'Neha Singh', price: '₹890', status: 'Processing', type: 'processing', notes: 'Call me when near the gate.', voiceInstruction: 'dummy_audio' },
        { id: '#ORD12343', time: '09:45 AM', customer: 'Ravi Patel', price: '₹645', status: 'Packed', type: 'packed', notes: 'Deliver after 5 PM.', voiceInstruction: 'dummy_audio' },
        { id: '#ORD12342', time: '09:20 AM', customer: 'Priya Sharma', price: '₹1,150', status: 'Completed', type: 'completed', notes: 'Please pack carefully.', voiceInstruction: '' }
      ]
    }
  },
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await API.patch(`/vendor/orders/${orderId}/status`, { status })
      return response.data
    } catch (err) {
      try {
        const response = await API.put(`/vendor/orders/${orderId}/status`, { status })
        return response.data
      } catch (err2) {
        const response = await API.put(`/vendor/orders/${orderId}`, { status })
        return response.data
      }
    }
  },
  getProducts: async (params = {}) => {
    try {
      const response = await API.get('/vendor/products', { params })
      return response.data
    } catch (error) {
      console.warn('Backend /vendor/products fallback, returning mock data', error)
      return [
        { id: '1', name: 'Fresh Apples', category: 'Fruits', price: '₹120', stock: 50 },
        { id: '2', name: 'Organic Broccoli', category: 'Vegetables', price: '₹80', stock: 30 },
        { id: '3', name: 'Whole Milk 1L', category: 'Dairy', price: '₹60', stock: 100 },
        { id: '4', name: 'Multigrain Bread', category: 'Bakery', price: '₹45', stock: 25 }
      ]
    }
  },
  addProduct: async (productData) => {
    const response = await API.post('/vendor/products', productData)
    return response.data
  },
  updateProduct: async (productId, productData) => {
    const response = await API.put(`/vendor/products/${productId}`, productData)
    return response.data
  },
  updateProductAvailability: async (productId, isAvailable) => {
    const response = await API.patch(`/vendor/products/${productId}/availability`, { isAvailable })
    return response.data
  },
  deleteProduct: async (productId) => {
    const response = await API.delete(`/vendor/products/${productId}`)
    return response.data
  },
  getOrderStats: async () => {
    const response = await API.get('/vendor/orders/stats')
    return response.data
  },
  getDashboardOrders: async () => {
    const response = await API.get('/vendor/orders/dashboard')
    return response.data
  },
  getProfile: async () => {
    try {
      const response = await API.get('/vendor/auth/profile')
      return response.data
    } catch (error) {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
  },
  updateSettings: async (settingsData) => {
    const response = await API.put('/vendor/auth/profile', settingsData)
    return response.data
  },
  updateNotificationToggle: async (allowNotification) => {
    const response = await API.put('/vendor/auth/allow-notification', { allowNotification })
    return response.data
  },
  updateOrderSettings: async (orderSettings) => {
    const response = await API.put('/vendor/auth/order-acceptance-range', orderSettings)
    return response.data
  },
  getMasterProducts: async (page = 1, limit = 3) => {
    const response = await API.get('/products', {
      params: { page, limit }
    })
    return response.data
  },
  getNotifications: async () => {
    const response = await API.get('/vendor/notifications')
    return response.data
  },
  readNotification: async (id) => {
    const response = await API.put(`/vendor/notifications/${id}/read`)
    return response.data
  },
  readAllNotifications: async () => {
    const response = await API.put('/vendor/notifications/read-all')
    return response.data
  }
}
