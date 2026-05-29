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
  }
}
