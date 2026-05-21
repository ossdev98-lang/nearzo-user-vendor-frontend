import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage'
import VerifyOtpPage from './pages/VerifyOtp/VerifyOtpPage'
import ResetPasswordPage from './pages/ResetPassword/ResetPasswordPage'
import CartPage from './pages/Cart/CartPage'
import ShopPage from './pages/Shop/ShopPage'
import ProductPage from './pages/Product/ProductPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'
import { useApp } from './context/AppContext'
import InstallPWA from './components/common/InstallPWA'

const ProtectedRoute = ({ children }) => {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

const App = () => {
  const location = useLocation()

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
          </Route>

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
    </>
  )
}

export default App