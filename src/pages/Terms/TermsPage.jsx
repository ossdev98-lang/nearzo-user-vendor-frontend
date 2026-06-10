import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import logo from '../../assets/nearzo-logo.png'

const TermsPage = () => {
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
              Terms & Conditions
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-extrabold">Nearzo Platform Agreement</p>
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
          className="bg-white dark:bg-gray-900 border border-purple-100/10 dark:border-gray-855 rounded-[2.5rem] p-6 sm:p-10 shadow-xl space-y-6 text-left"
        >
          <div className="space-y-4 leading-relaxed text-sm text-gray-700 dark:text-gray-300">
            <p className="font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Effective Date: {formattedDate} | Last Updated: {formattedDate}
            </p>
            <p>
              Welcome to Nearzo. Nearzo is a hyperlocal commerce and marketplace platform owned, operated, and managed by <strong>OZONESOFT Solutions</strong>, an Indian company ("OZONESOFT Solutions", "Company", "we", "our", or "us").
            </p>
            <p>
              Nearzo enables customers to discover and purchase products from nearby stores, vendors to manage their digital storefronts and receive orders, and delivery partners to facilitate order fulfillment.
            </p>
            <p>
              By accessing, registering, or using the Nearzo website, customer application, vendor application, delivery partner application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms & Conditions. If you do not agree with these Terms, you must not use the Platform.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">1. About the Platform</h3>
            <p>
              Nearzo is a technology platform developed and operated by OZONESOFT Solutions. The Platform provides digital infrastructure that allows customers to discover nearby stores, vendors to showcase products and manage catalogs, and delivery partners to fulfill deliveries.
            </p>
            <p>
              OZONESOFT Solutions does not manufacture, own, stock, store, sell, or distribute products listed by independent vendors. We act primarily as a technology service provider and marketplace facilitator between customers, vendors, and delivery partners.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">2. User Eligibility</h3>
            <p>
              To use Nearzo, you must be at least 18 years of age, provide accurate and complete info, have the legal capacity to enter into contracts, and comply with all applicable laws. Nearzo reserves the right to suspend or terminate accounts that provide false information.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">3. Customer Accounts</h3>
            <p>
              Customers are responsible for maintaining account confidentiality, keeping login credentials secure, providing accurate delivery information, and ensuring availability at the delivery location. You are responsible for all activities conducted through your account.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">4. Vendor Accounts</h3>
            <p>
              Vendors agree to provide accurate business information, maintain updated product catalogs, provide correct pricing, fulfill accepted orders promptly, maintain product quality, and comply with applicable tax and business regulations. Nearzo may suspend vendors that repeatedly cancel orders or violate platform policies.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">5. Delivery Partner Accounts</h3>
            <p>
              Delivery partners agree to maintain valid identification and licenses, deliver orders professionally, follow traffic and safety laws, and maintain customer confidentiality. Nearzo reserves the right to deactivate delivery partners for misconduct.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">6. Orders and Acceptance</h3>
            <p>
              An order placed by a customer constitutes a purchase request. Orders become confirmed only after vendor acceptance and/or successful platform processing. Nearzo reserves the right to reject or cancel orders due to product unavailability, pricing errors, technical issues, or fraud prevention measures.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">7. Pricing and Payments</h3>
            <p>
              Prices displayed on Nearzo may include product price, delivery charges, platform fees, and taxes where applicable. Customers agree to pay all applicable charges at checkout. Payments may be processed through third-party payment providers. Nearzo does not store complete card details.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">8. Cancellations & Refunds</h3>
            <p>
              Customers may cancel orders subject to vendor status and preparation stage. Refunds may be issued in cases of order cancellation, incorrect items, missing items, or damaged products. Refund processing times depend on banking partners. Nearzo reserves the right to investigate refund requests.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">9. Intellectual Property</h3>
            <p>
              All intellectual property including the Nearzo name, logos, branding, software, design elements, and content are owned by OZONESOFT Solutions or its licensors. Users may not copy, reproduce, distribute, or exploit platform content without written permission.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">10. Governing Law & Dispute Resolution</h3>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising out of or relating to these Terms shall first be attempted to be resolved amicably. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts located in <strong>Indore, Madhya Pradesh, India</strong>.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">11. Marketplace Disclaimer</h3>
            <p>
              Products, prices, inventory availability, descriptions, warranties, and product quality are the sole responsibility of the respective vendor listing such products. OZONESOFT Solutions and Nearzo do not guarantee product quality, suitability, or accuracy of vendor-provided details.
            </p>

            <h3 className="text-base font-extrabold text-gray-950 dark:text-white pt-4 border-b border-gray-105 dark:border-gray-800 pb-1">12. Contact Information</h3>
            <p>
              Nearzo Support Team: <strong>support@nearzo.in</strong> | Legal Queries: <strong>legal@nearzo.in</strong> | Website: <strong>www.nearzo.in</strong>
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

export default TermsPage
