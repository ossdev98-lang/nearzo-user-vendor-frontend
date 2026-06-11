import API from './api'

export const categoryService = {
  getShopCategories: async () => {
    const response = await API.get('/shop-categories')
    return response.data
  },
  getProductCategories: async () => {
    const response = await API.get('/product-categories')
    return response.data
  }
}
