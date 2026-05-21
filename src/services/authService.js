import API from './api'

export const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    if (userStr) return JSON.parse(userStr)
    return null
  },

  forgotPassword: async (email) => {
    try {
      const response = await API.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await API.post('/auth/verify-otp', { email, otp })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await API.post('/auth/reset-password', { email, otp, newPassword })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
