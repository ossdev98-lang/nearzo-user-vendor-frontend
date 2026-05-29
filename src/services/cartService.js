import API from './api'

export const cartService = {
  getCart: async () => {
    const response = await API.get('/cart')
    return response.data
  },
  addToCart: async (payload) => {
    const response = await API.post('/cart', payload)
    return response.data
  },
  updateCartItem: async (cartId, quantity) => {
    const response = await API.put(`/cart/${cartId}`, { quantity })
    return response.data
  },
  removeCartItem: async (cartId) => {
    const response = await API.delete(`/cart/${cartId}`)
    return response.data
  },
  clearCart: async () => {
    const response = await API.delete('/cart')
    return response.data
  }
}
