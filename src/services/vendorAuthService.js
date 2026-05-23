import API from './api'

export const vendorAuthService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/vendor/auth/login', credentials)
      const data = response.data
      
      // Always set role to vendor on successful login
      localStorage.setItem('role', 'vendor')
      
      if (data.token || data.accessToken) {
        localStorage.setItem('token', data.token || data.accessToken)
      }
      
      if (data.vendor || data.user || data.data) {
        localStorage.setItem('user', JSON.stringify(data.vendor || data.user || data.data))
      }

      return data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  register: async (vendorData) => {
    try {
      // For registration, vendorData should ideally be FormData because of images (aadharFront, aadharBack, shopRegisterImage)
      const response = await API.post('/vendors/onboard', vendorData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('role', 'vendor')
        if (response.data.vendor) {
          localStorage.setItem('user', JSON.stringify(response.data.vendor))
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
    localStorage.removeItem('role')
  },

  forgotPassword: async (email) => {
    try {
      const response = await API.post('/vendor/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await API.post('/vendor/auth/verify-otp', { email, otp })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await API.post('/vendors/resend-otp', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  resetPassword: async (email, newPassword) => {
    try {
      const response = await API.post('/vendor/auth/reset-password', { email, newPassword })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
