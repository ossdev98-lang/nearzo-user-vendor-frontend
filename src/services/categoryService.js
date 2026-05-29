import API from './api'

export const categoryService = {
  getShopCategories: async () => {
    const response = await API.get('/shop-categories')
    return response.data
  }
}
