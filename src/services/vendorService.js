import API from './api'

export const vendorService = {
  getNearbyVendors: async (latitude, longitude, shopCategoryId = null, sortBy = 'rating', isTopRated = false) => {
    const params = { latitude, longitude, sortBy }
    if (shopCategoryId) params.shopCategoryId = shopCategoryId
    if (isTopRated) params.isTopRated = true

    const response = await API.get('/vendors/nearby', { params })
    return response.data
  },
  getShopDetails: async (vendorId, page = 1, limit = 20, category = '', search = '') => {
    const params = {}
    if (page) params.page = page
    if (limit) params.limit = limit
    if (category) params.category = category
    if (search) params.search = search

    const response = await API.get(`/vendors/${vendorId}/shop`, { params })
    return response.data
  },
  getBestSellingProducts: async () => {
    const response = await API.get('/vendors/products/best-selling')
    return response.data
  },
  getProductDetails: async (productId, page = 1, limit = 20) => {
    const params = {}
    if (page) params.page = page
    if (limit) params.limit = limit
    const response = await API.get(`/vendors/products/${productId}`, { params })
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
      throw error.response?.data || error
    }
  },
  updateOrderStatus: async (orderId, status, cancelReason = null) => {
    try {
      const payload = { status }
      if (cancelReason) {
        payload.cancelReason = cancelReason
      }
      const response = await API.patch(`/vendor/orders/${orderId}/status`, payload)
      return response.data
    } catch (err) {
      try {
        const payload = { status }
        if (cancelReason) {
          payload.cancelReason = cancelReason
        }
        const response = await API.put(`/vendor/orders/${orderId}/status`, payload)
        return response.data
      } catch (err2) {
        const payload = { status }
        if (cancelReason) {
          payload.cancelReason = cancelReason
        }
        const response = await API.put(`/vendor/orders/${orderId}`, payload)
        return response.data
      }
    }
  },
  getProducts: async (params = {}) => {
    try {
      const response = await API.get('/vendor/products', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
  getVendorProduct: async (productId) => {
    const response = await API.get(`/vendor/products/${productId}`)
    return response.data
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
  updateLocationCoordinates: async (latitude, longitude) => {
    const response = await API.put('/vendor/auth/location', { latitude, longitude })
    return response.data
  },
  getMasterProducts: async (page = 1, limit = 3, search = '') => {
    const params = { page, limit }
    if (search) params.search = search
    const response = await API.get('/products', { params })
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
  },
  uploadNonMasterProduct: async (formData) => {
    const response = await API.post('/vendor/non-master-products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
