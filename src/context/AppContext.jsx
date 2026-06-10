import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cartService } from '../services/cartService'
import { authService } from '../services/authService'
import { toast } from 'react-hot-toast'
import dummyProduct from '../assets/images/dummyProduct.jpg'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const localCart = localStorage.getItem('cart')
      return localCart ? JSON.parse(localCart) : []
    } catch {
      return []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark'
    } catch {
      return false
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartDeliveryDetails, setCartDeliveryDetails] = useState(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [primaryLocation, setPrimaryLocation] = useState(() => {
    try {
      return localStorage.getItem('user_primary_location') || 'Delivering to'
    } catch {
      return 'Delivering to'
    }
  })
  const [secondaryLocation, setSecondaryLocation] = useState(() => {
    try {
      return localStorage.getItem('user_secondary_location') || 'Your area'
    } catch {
      return 'Your area'
    }
  })
  const [coordinates, setCoordinates] = useState(() => {
    try {
      const lat = localStorage.getItem('user_latitude')
      const lng = localStorage.getItem('user_longitude')
      if (lat && lng) return { latitude: parseFloat(lat), longitude: parseFloat(lng) }
    } catch { }
    return { latitude: 22.760287481529783, longitude: 75.90990165620354 } // Default
  })

  // Synchronize dynamic coordinates to the backend if logged in
  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!isLoggedIn || role === 'vendor') return

    const syncLocationToBackend = async () => {
      try {
        if (coordinates && coordinates.latitude && coordinates.longitude) {
          await authService.updateLocation(coordinates.latitude, coordinates.longitude)
          console.log('Location successfully synchronized to backend:', coordinates)
        }
      } catch (err) {
        console.error('Failed to synchronize location to backend:', err)
      }
    }

    const timer = setTimeout(() => {
      syncLocationToBackend()
    }, 400)

    return () => clearTimeout(timer)
  }, [coordinates])

  // Synchronize dark/light mode with DOM documentElement and localStorage
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      console.error('Failed to update theme in DOM:', e)
    }
  }, [isDarkMode])

  // Synchronize cart with localStorage whenever it changes (only for guest users)
  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('user')
    if (isLoggedIn) return
    try {
      localStorage.setItem('cart', JSON.stringify(cart))
    } catch { }
  }, [cart])

  // Helper to fetch cart from API
  const fetchCart = useCallback(async () => {
    const role = localStorage.getItem('role')
    if (role === 'vendor') return
    try {
      const data = await cartService.getCart()
      if (data && data.success) {
        const backendCart = data.items || data.cart || data.cartItems || data.results || data.data || []
        const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'

        const formatted = backendCart.map(item => {
          const productInfo = item.Product || {}
          let imgUrl = dummyProduct

          if (item.productImage) {
            imgUrl = item.productImage.startsWith('http') ? item.productImage : `${baseUrlForImage}${item.productImage}`
          } else if (item.image) {
            imgUrl = item.image.startsWith('http') ? item.image : `${baseUrlForImage}${item.image}`
          } else if (productInfo.primaryImage) {
            imgUrl = productInfo.primaryImage.startsWith('http') ? productInfo.primaryImage : `${baseUrlForImage}${productInfo.primaryImage}`
          }

          return {
            id: item.id, // Cart entry primary key (e.g. 17)
            vendorProductId: item.vendorProductId || productInfo.id || item.id,
            variantId: item.variantId || 'base',
            name: item.productName || item.name || productInfo.name || 'Product',
            price: Number(item.unitPrice || item.price || productInfo.price || 0),
            quantity: item.quantity || 1,
            image: imgUrl,
            unit: item.variantName || item.unit || productInfo.unit || 'piece',
            shopName: item.shopName || item.Vendor?.shopName || productInfo.Vendor?.shopName || item.Product?.Vendor?.shopName || ''
          }
        })
        setCart(formatted)
        if (data.delivery) {
          setCartDeliveryDetails(data.delivery)
        } else {
          setCartDeliveryDetails(null)
        }
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    }
  }, [])

  // Sync Local Cart to Backend once user logs in
  const syncCartWithBackend = useCallback(async (loggedInUser) => {
    if (!loggedInUser) return
    const role = localStorage.getItem('role')
    if (role === 'vendor') return
    try {
      const localCartStr = localStorage.getItem('cart')
      if (localCartStr) {
        const items = JSON.parse(localCartStr)
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            try {
              const syncPayload = {
                vendorProductId: item.vendorProductId || item.id,
                quantity: item.quantity || 1
              }
              const varId = item.variantId
              if (varId && varId !== 'base' && String(varId) !== String(item.vendorProductId || item.id)) {
                syncPayload.variantId = varId
              }
              await cartService.addToCart(syncPayload)
            } catch (e) {
              console.error('Error syncing cart item to API:', e)
            }
          }
          localStorage.removeItem('cart')
        }
      }
      await fetchCart()
    } catch (err) {
      console.error('Failed to sync/fetch cart:', err)
    }
  }, [fetchCart])

  // Sync cart when user profile/state changes
  useEffect(() => {
    const role = localStorage.getItem('role')
    if (user && role !== 'vendor') {
      syncCartWithBackend(user)
    }
  }, [user, syncCartWithBackend])

  const updateCoordinates = useCallback((lat, lng) => {
    try {
      localStorage.setItem('user_latitude', lat)
      localStorage.setItem('user_longitude', lng)
    } catch { }
    setCoordinates({ latitude: lat, longitude: lng })
  }, [])

  const updateLocation = useCallback((primary, secondary) => {
    try {
      localStorage.setItem('user_primary_location', primary)
      localStorage.setItem('user_secondary_location', secondary)
    } catch { }
    setPrimaryLocation(primary)
    setSecondaryLocation(secondary)
  }, [])

  const addToCart = useCallback(async (itemToAdd) => {
    const isLoggedIn = !!localStorage.getItem('user')

    // Single Shop Cart Enforcement Check
    const existingShopItem = cart.find(item => item.shopName)
    const newShopName = itemToAdd.storeName || itemToAdd.shopName || ''
    if (existingShopItem && newShopName && existingShopItem.shopName.toLowerCase().trim() !== newShopName.toLowerCase().trim()) {
      return false
    }

    if (isLoggedIn) {
      try {
        const payload = {
          vendorProductId: itemToAdd.id,
          quantity: itemToAdd.quantity || 1,
          latitude: coordinates?.latitude || parseFloat(localStorage.getItem('user_latitude')) || 22.760287481529783,
          longitude: coordinates?.longitude || parseFloat(localStorage.getItem('user_longitude')) || 75.90990165620354
        }
        const varId = itemToAdd.variantId
        if (varId && varId !== 'base' && String(varId) !== String(itemToAdd.id)) {
          payload.variantId = varId
        }
        await cartService.addToCart(payload)
        await fetchCart()
        return true
      } catch (err) {
        console.error('Failed to add to cart backend:', err)
        const apiError = err.response?.data
        if (apiError && apiError.success === false) {
          const mainMessage = apiError.message || 'Vendor not available'
          const deliveryDetails = apiError.delivery
          let detailedMessage = mainMessage
          if (deliveryDetails && deliveryDetails.error) {
            const distanceStr = deliveryDetails.distanceKm ? ` (${deliveryDetails.distanceKm} km)` : ''
            detailedMessage = `${mainMessage}: ${deliveryDetails.error}${distanceStr}`
          }
          toast.error(detailedMessage, { id: 'add-to-cart-error' })
          throw apiError
        }
        toast.error('Failed to add to cart. Server error.')
        throw err
      }
    }

    setCart((prev) => {
      const targetVariantId = (itemToAdd.variantId && itemToAdd.variantId !== 'base') ? itemToAdd.variantId : itemToAdd.id
      const existing = prev.find((item) => item.vendorProductId === itemToAdd.id && item.variantId === targetVariantId)
      let updatedCart = []
      if (existing) {
        updatedCart = prev.map((item) =>
          (item.vendorProductId === itemToAdd.id && item.variantId === targetVariantId)
            ? { ...item, quantity: item.quantity + (itemToAdd.quantity || 1) }
            : item
        )
      } else {
        const newId = Date.now()
        updatedCart = [...prev, {
          id: newId,
          vendorProductId: itemToAdd.id,
          variantId: targetVariantId,
          name: itemToAdd.name || 'Product',
          price: Number(itemToAdd.price || 0),
          quantity: itemToAdd.quantity || 1,
          image: itemToAdd.image || '',
          unit: itemToAdd.unit || 'piece',
          shopName: newShopName
        }]
      }
      try {
        localStorage.setItem('cart', JSON.stringify(updatedCart))
      } catch { }
      return updatedCart
    })
    return true
  }, [cart, fetchCart])

  const removeFromCart = useCallback(async (cartId) => {
    const isLoggedIn = !!localStorage.getItem('user')
    if (isLoggedIn) {
      const isTemporaryId = typeof cartId === 'number' && cartId > 1000000000000
      if (!isTemporaryId) {
        try {
          await cartService.removeCartItem(cartId)
        } catch (err) {
          console.error('Failed to delete item from backend cart:', err)
        }
      }
    }
    setCart((prev) => {
      const updatedCart = prev.filter((item) => item.id !== cartId)
      if (!isLoggedIn) {
        try {
          localStorage.setItem('cart', JSON.stringify(updatedCart))
        } catch { }
      }
      return updatedCart
    })
  }, [])

  const updateQuantity = useCallback(async (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId)
      return
    }

    const isLoggedIn = !!localStorage.getItem('user')
    if (isLoggedIn) {
      const isTemporaryId = typeof cartId === 'number' && cartId > 1000000000000
      if (!isTemporaryId) {
        try {
          await cartService.updateCartItem(cartId, quantity)
          await fetchCart()
          return
        } catch (err) {
          console.error('Failed to update quantity on backend:', err)
        }
      }
    }

    setCart((prev) => {
      const updatedCart = prev.map((item) =>
        item.id === cartId ? { ...item, quantity } : item
      )
      if (!isLoggedIn) {
        try {
          localStorage.setItem('cart', JSON.stringify(updatedCart))
        } catch { }
      }
      return updatedCart
    })
  }, [removeFromCart, fetchCart])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const clearCart = useCallback(async () => {
    const isLoggedIn = !!localStorage.getItem('user')
    if (isLoggedIn) {
      try {
        await cartService.clearCart()
      } catch (err) {
        console.error('Failed to clear backend cart:', err)
      }
    } else {
      try {
        localStorage.removeItem('cart')
      } catch { }
    }
    setCart([])
  }, [])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
    clearCart,
    isLoading,
    setIsLoading,
    user,
    setUser,
    searchQuery,
    setSearchQuery,
    isDarkMode,
    toggleDarkMode,
    isCartOpen,
    setIsCartOpen,
    cartDeliveryDetails,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    coordinates,
    updateCoordinates,
    primaryLocation,
    secondaryLocation,
    updateLocation,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export default AppContext