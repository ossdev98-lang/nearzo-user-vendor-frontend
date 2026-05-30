import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage'
import VerifyOtpPage from './pages/VerifyOtp/VerifyOtpPage'
import ResetPasswordPage from './pages/ResetPassword/ResetPasswordPage'
import BottomNav from './components/navbar/BottomNav'
import CartPage from './pages/Cart/CartPage'
import ShopPage from './pages/Shop/ShopPage'
import ProductPage from './pages/Product/ProductPage'
import ProfilePage from './pages/Profile/ProfilePage'
import NotFoundPage from './pages/NotFound/NotFoundPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import AllShopsPage from './pages/AllShops/AllShopsPage'
import AllProductsPage from './pages/AllProducts/AllProductsPage'
import { useApp } from './context/AppContext'
import InstallPWA from './components/common/InstallPWA'
import LoadingScreen from './components/common/LoadingScreen'
import VendorLoginPage from './pages/Login/VendorLoginPage'
import VendorRegisterPage from './pages/Register/VendorRegisterPage'
import VendorVerifyOTPPage from './pages/Login/VendorVerifyOTPPage'
import VendorForgotPasswordPage from './pages/Login/VendorForgotPasswordPage'
import VendorResetPasswordPage from './pages/Login/VendorResetPasswordPage'
import VendorDashboard from './pages/Vendor/VendorDashboard'

const ProtectedRoute = ({ children }) => {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

const VendorProtectedRoute = ({ children }) => {
  const role = localStorage.getItem('role')
  return role === 'vendor' ? children : <Navigate to="/vendor/login" replace />
}

const App = () => {
  const location = useLocation()
  const [isInitialMount, setIsInitialMount] = useState(true)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    // Keep splash loader on screen for 1.8 seconds on initial app startup
    const timer = setTimeout(() => {
      setIsInitialMount(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Only show loader on the Home page and Login page to avoid annoying the user on every click
    const routesWithLoader = ['/', '/login']

    if (routesWithLoader.includes(location.pathname)) {
      setIsPageLoading(true)
      const timer = setTimeout(() => {
        setIsPageLoading(false)
      }, 1000) // Reduced to 1s for better UX
      return () => clearTimeout(timer)
    } else {
      setIsPageLoading(false)
    }
  }, [location.pathname])

  const showLoader = isInitialMount || isPageLoading

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/all-shops"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AllShopsPage />
                </motion.div>
              }
            />
            <Route
              path="/all-products"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AllProductsPage />
                </motion.div>
              }
            />
            <Route
              path="/shop/:id"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShopPage />
                </motion.div>
              }
            />
            <Route
              path="/product/:id"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductPage />
                </motion.div>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CartPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProfilePage />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:tabId"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProfilePage />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckoutPage />
                  </motion.div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <LoginPage />
                </motion.div>
              }
            />
            <Route
              path="/register"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.5 }}
                >
                  <RegisterPage />
                </motion.div>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <ForgotPasswordPage />
                </motion.div>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <VerifyOtpPage />
                </motion.div>
              }
            />
            <Route
              path="/reset-password"
              element={
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResetPasswordPage />
                </motion.div>
              }
            />
            {/* Vendor Auth Routes */}
            <Route path="/vendor/login" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><VendorLoginPage /></motion.div>} />
            <Route path="/vendor/register" element={<motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.5 }}><VendorRegisterPage /></motion.div>} />
            <Route path="/vendor/forgot-password" element={<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}><VendorForgotPasswordPage /></motion.div>} />
            <Route path="/vendor/verify-otp" element={<motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }}><VendorVerifyOTPPage /></motion.div>} />
            <Route path="/vendor/reset-password" element={<motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }}><VendorResetPasswordPage /></motion.div>} />
          </Route>

          {/* Vendor Dashboard - Outside of MainLayout/AuthLayout */}
          <Route
            path="/vendor/dashboard"
            element={
              <VendorProtectedRoute>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <VendorDashboard />
                </motion.div>
              </VendorProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <NotFoundPage />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
      <InstallPWA />
      <BottomNav />
      <LoadingScreen isVisible={showLoader} />
    </>
  )
}

export default App