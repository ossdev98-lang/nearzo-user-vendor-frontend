import API from './api'
import { requestForToken } from './firebase'

export const authService = {
  login: async (credentials) => {
    try {
      const fcmToken = await requestForToken()
      const response = await API.post('/auth/login', { ...credentials, fcmToken })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('role', response.data.user.role || credentials.role)
        } else if (credentials.role) {
          localStorage.setItem('role', credentials.role)
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  googleLogin: async (data) => {
    try {
      const fcmToken = await requestForToken()
      const response = await API.post('/auth/google/login', { ...data, fcmToken })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('role', response.data.user.role || 'user')
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  register: async (userData) => {
    try {
      const fcmToken = await requestForToken()
      
      let payload
      if (userData instanceof FormData) {
        payload = userData
        if (!payload.has('fcmToken')) {
          payload.append('fcmToken', fcmToken)
        }
      } else {
        payload = { ...userData, fcmToken }
      }
      
      const response = await API.post('/auth/register', payload)
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

  getProfile: async () => {
    try {
      const response = await API.get('/auth/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateProfile: async (profileData) => {
    try {
      // Create a copy of the data
      let payload = { ...profileData }
      // If we are passing formData directly, we must NOT use { ...profileData }
      if (profileData instanceof FormData) {
        payload = profileData
      }
      const response = await API.put('/auth/profile', payload)
      // Update local storage user if successful
      if (response.data && response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data.user }))
      } else if (response.data && !response.data.user && response.data.name) {
        // Fallback if the response is directly the user object
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateLocation: async (latitude, longitude) => {
    try {
      const response = await API.put('/auth/location', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
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

  resendOtp: async (email) => {
    try {
      const response = await API.post('/auth/resend-otp', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  resetPassword: async (email, newPassword) => {
    try {
      const response = await API.post('/auth/reset-password', { email, newPassword })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await API.post('/auth/change-password', { currentPassword, newPassword, confirmPassword })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  allowNotification: async (allowNotification) => {
    try {
      const response = await API.put('/auth/allow-notification', { allowNotification })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
