import { useState, useEffect, useCallback } from 'react'

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useIntersectionObserver = (options = {}) => {
  const [element, setElement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const ref = useCallback((node) => {
    if (node) {
      setElement(node)
    }
  }, [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => observer.disconnect()
  }, [element, options])

  return [ref, isVisible]
}

export const useCart = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal, clearCart } =
    useApp()
  return { cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal, clearCart }
}