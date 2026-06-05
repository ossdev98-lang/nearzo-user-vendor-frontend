import API from './api'

export const userService = {
  getAddresses: async () => {
    const response = await API.get('/user/addresses')
    return response.data
  },
  addAddress: async (payload) => {
    const response = await API.post('/user/addresses', payload)
    return response.data
  },
  updateAddress: async (id, payload) => {
    const response = await API.put(`/user/addresses/${id}`, payload)
    return response.data
  },
  deleteAddress: async (id) => {
    const response = await API.delete(`/user/addresses/${id}`)
    return response.data
  }

}
