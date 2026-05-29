import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cartService } from '../services/cartService'
import { toast } from 'react-hot-toast'

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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [coordinates, setCoordinates] = useState(() => {
    try {
      const lat = localStorage.getItem('user_latitude')
      const lng = localStorage.getItem('user_longitude')
      if (lat && lng) return { latitude: parseFloat(lat), longitude: parseFloat(lng) }
    } catch { }
    return { latitude: 22.760287481529783, longitude: 75.90990165620354 } // Default
  })

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
    try {
      const data = await cartService.getCart()
      if (data && data.success) {
        const backendCart = data.items || data.cart || data.cartItems || data.results || data.data || []
        const baseUrlForImage = import.meta.env.VITE_API_BASE_URL_FOR_IMAGE || 'https://nearzo-backend-bhk9.onrender.com'

        const formatted = backendCart.map(item => {
          const productInfo = item.Product || {}
          let imgUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'

          if (item.image) {
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
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    }
  }, [])

  // Sync Local Cart to Backend once user logs in
  const syncCartWithBackend = useCallback(async (loggedInUser) => {
    if (!loggedInUser) return
    try {
      const localCartStr = localStorage.getItem('cart')
      if (localCartStr) {
        const items = JSON.parse(localCartStr)
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            try {
              await cartService.addToCart({
                vendorProductId: item.vendorProductId || item.id,
                variantId: item.variantId || 'base',
                quantity: item.quantity || 1
              })
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
    if (user) {
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

  const addToCart = useCallback((itemToAdd) => {
    const isLoggedIn = !!localStorage.getItem('user')

    // Single Shop Cart Enforcement Check
    const existingShopItem = cart.find(item => item.shopName)
    const newShopName = itemToAdd.storeName || itemToAdd.shopName || ''
    if (existingShopItem && newShopName && existingShopItem.shopName.toLowerCase().trim() !== newShopName.toLowerCase().trim()) {
      return false
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.vendorProductId === itemToAdd.id && item.variantId === (itemToAdd.variantId || 'base'))
      let updatedCart = []
      if (existing) {
        updatedCart = prev.map((item) =>
          (item.vendorProductId === itemToAdd.id && item.variantId === (itemToAdd.variantId || 'base'))
            ? { ...item, quantity: item.quantity + (itemToAdd.quantity || 1) }
            : item
        )
      } else {
        const newId = Date.now()
        updatedCart = [...prev, {
          id: newId,
          vendorProductId: itemToAdd.id,
          variantId: itemToAdd.variantId || 'base',
          name: itemToAdd.name || 'Product',
          price: Number(itemToAdd.price || 0),
          quantity: itemToAdd.quantity || 1,
          image: itemToAdd.image || '',
          unit: itemToAdd.unit || 'piece',
          shopName: newShopName
        }]
      }
      if (!isLoggedIn) {
        try {
          localStorage.setItem('cart', JSON.stringify(updatedCart))
        } catch {}
      }
      return updatedCart
    })
    return true
  }, [cart])

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
        } catch {}
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
        } catch {}
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
      } catch {}
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
    coordinates,
    updateCoordinates,
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