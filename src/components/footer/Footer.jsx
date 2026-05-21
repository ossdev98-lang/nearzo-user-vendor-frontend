import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaFacebook } from 'react-icons/fa'
import logo from '../../assets/nearzo-logo.png'

const Footer = () => {
  const footerLinks = {
    Company: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
    Categories: ['Fruits & Veggies', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages', 'Snacks'],
    Support: ['Help Center', 'FAQs', 'Delivery Info', 'Returns', 'Privacy Policy', 'Terms'],
    'For Business': ['Become a Seller', 'Advertising', 'Business Account', 'Bulk Orders'],
  }

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
  ]

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 pt-16 pb-8">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img src={logo} alt="Nearzo Logo" className="h-10 object-contain" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your fresh groceries, delivered in minutes. We source the best quality products directly from local farms and markets.
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-emerald-400 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-300 flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-green-400" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8">
          {/* Newsletter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold text-sm mb-1">Subscribe to our newsletter</h4>
              <p className="text-sm text-gray-400">Get weekly deals and fresh recipes delivered to your inbox</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/20 transition-all duration-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-500">
              © 2026 Nearzo. All rights reserved. Fresh delivery, every time.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Cookie Policy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer