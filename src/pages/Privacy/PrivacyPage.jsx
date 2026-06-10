import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import logo from '../../assets/nearzo-logo.png'

const PrivacyPage = () => {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-50/30 via-[#FAF9FF] to-[#FAF9FF] dark:from-purple-950/10 dark:via-gray-950 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-100 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src={logo} alt="Nearzo Logo" className="h-16 object-contain dark:filter dark:invert" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase flex items-center justify-center gap-2">
              Privacy Policy
              <ShieldCheck className="w-5 h-5 text-purple-600 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-extrabold">Nearzo Privacy Policy</p>
          </div>
        </div>

        {/* Navigation & Go Back */}
        <div className="flex justify-start">
          <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Sign Up
          </Link>
        </div>

        {/* Main Document Body */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-850 rounded-[2.5rem] p-6 sm:p-10 shadow-xl space-y-6 text-left"
        >
          <div className="space-y-4 leading-relaxed text-sm text-gray-700 dark:text-gray-300">
            <p className="font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Effective Date: {formattedDate} | Last Updated: {formattedDate}
            </p>
            <p>
              Welcome to Nearzo ("Nearzo", "we", "our", or "us"). Nearzo is a hyperlocal marketplace platform that connects customers with nearby stores, vendors, delivery partners, and service providers.
            </p>
            <p>
              We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, share, and protect your information when you use the Nearzo mobile application, website, vendor application, delivery partner application, and related services ("Platform").
            </p>

            <h3 className="text-base font-extrabold text-gray-955 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">1. Information We Collect</h3>
            
            <div className="space-y-2">
              <p className="font-bold text-xs text-purple-600 dark:text-purple-400">A. Information Provided by Users</p>
              <p className="text-xs">When you create an account or use our services, we may collect:</p>
              <div className="pl-4 space-y-2">
                <div>
                  <p className="font-semibold text-xs text-gray-800 dark:text-white">Customers</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <li>Name</li>
                    <li>Mobile number</li>
                    <li>Email address</li>
                    <li>Delivery addresses</li>
                    <li>Profile information</li>
                    <li>Payment information</li>
                    <li>Order history</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-gray-800 dark:text-white">Vendors</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <li>Name</li>
                    <li>Mobile number</li>
                    <li>Email address</li>
                    <li>Store information</li>
                    <li>Business registration details</li>
                    <li>GST information</li>
                    <li>Bank account details</li>
                    <li>Store location and address</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-gray-800 dark:text-white">Delivery Partners</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <li>Name</li>
                    <li>Mobile number</li>
                    <li>Email address</li>
                    <li>Vehicle details</li>
                    <li>Driving license details</li>
                    <li>Government-issued identity documents</li>
                    <li>Bank account information</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-xs text-purple-600 dark:text-purple-400">B. Location Information</p>
              <p className="text-xs leading-relaxed">Nearzo may collect Precise GPS location, device location, delivery location, and store location to show nearby stores, process deliveries, optimize delivery routes, and improve service quality.</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-xs text-purple-600 dark:text-purple-400">C. Device Information</p>
              <p className="text-xs leading-relaxed">We may collect: Device type, Device ID, Operating system, App version, Browser information, IP address, and Mobile network information.</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-xs text-purple-600 dark:text-purple-400">D. Transaction Information</p>
              <p className="text-xs leading-relaxed">We collect order details, purchase history, payment details, refund information, wallet transactions, and coupon usage.</p>
            </div>

            <h3 className="text-base font-extrabold text-gray-955 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">2. How We Use Your Information</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>Create and manage accounts</li>
              <li>Process orders and facilitate deliveries</li>
              <li>Enable vendor operations and provide customer support</li>
              <li>Verify user identity and process payments</li>
              <li>Improve platform performance and prevent fraud</li>
              <li>Send notifications, updates, and personalized recommendations</li>
            </ul>

            <h3 className="text-base font-extrabold text-gray-955 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">3. How We Share Information</h3>
            <p className="text-xs">Nearzo may share information with:</p>
            <ul className="list-disc pl-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><strong>Vendors:</strong> Share customer name, delivery address, contact info, and order details to fulfill orders.</li>
              <li><strong>Delivery Partners:</strong> Share customer name, contact number, delivery location, and order information.</li>
              <li><strong>Payment Service Providers:</strong> Share transaction details with secure banking partners to process payments.</li>
              <li><strong>Government Authorities:</strong> When required by law, court order, or regulatory authority request.</li>
            </ul>

            <h3 className="text-base font-extrabold text-gray-955 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">4. Data Security & Retention</h3>
            <p className="text-xs leading-relaxed">
              We implement reasonable security measures including encryption of sensitive information, secure cloud infrastructure, and access controls. We retain information as long as your account remains active or as required by law.
            </p>

            <h3 className="text-base font-extrabold text-gray-955 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">5. Cookies & Rights</h3>
            <p className="text-xs leading-relaxed">
              We use cookies and device identifiers to remember preferences and analyze performance. You may access, update, correct, or request deletion of your account.
            </p>

            <h3 className="text-base font-extrabold text-gray-955 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">6. Contact Us</h3>
            <p className="text-xs">
              Nearzo Support Team: <strong>privacy@nearzo.in</strong> | <strong>support@nearzo.in</strong>
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          © {new Date().getFullYear()} Nearzo Hyperlocal Marketplace platform. Managed by OZONESOFT Solutions. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default PrivacyPage
