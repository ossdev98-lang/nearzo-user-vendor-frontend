import API from './api'

export const orderService = {
  placeOrder: async (payload) => {
    try {
      const response = await API.post('/orders/place', payload)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
  getMyOrders: async () => {
    try {
      const response = await API.get('/orders/my')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
