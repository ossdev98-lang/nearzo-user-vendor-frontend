import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Package } from 'lucide-react'
import { vendorService } from '../../services/vendorService'
import { toast } from 'react-hot-toast'
import notificationSound from '../../assets/final notification sound .mp3'

const VendorNotificationBell = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsList, setNotificationsList] = useState([])
  const notificationsRef = useRef([])

  useEffect(() => {
    notificationsRef.current = notificationsList
  }, [notificationsList])

  const fetchNotifications = async () => {
    const isLoggedIn = !!localStorage.getItem('token')
    if (!isLoggedIn) return
    try {
      const response = await vendorService.getNotifications()
      
      let rawList = []
      if (Array.isArray(response)) {
        rawList = response
      } else if (response && Array.isArray(response.notifications)) {
        rawList = response.notifications
      } else if (response && Array.isArray(response.data)) {
        rawList = response.data
      }

      const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Just now'
        try {
          const now = new Date()
          const date = new Date(dateString)
          const diffMs = now - date
          if (isNaN(diffMs)) return dateString
          const diffMins = Math.floor(diffMs / 60000)
          if (diffMins < 1) return 'Just now'
          if (diffMins < 60) return `${diffMins} mins ago`
          const diffHours = Math.floor(diffMins / 60)
          if (diffHours < 24) return `${diffHours} hours ago`
          const diffDays = Math.floor(diffHours / 24)
          return `${diffDays} days ago`
        } catch (e) {
          return dateString || 'Just now'
        }
      }

      const mapped = rawList.map((item, idx) => ({
        id: item.id || item._id || idx,
        type: item.type || 'system',
        title: item.title || 'Vendor Update',
        body: item.body || item.message || item.text || 'New notification',
        time: formatTimeAgo(item.createdAt || item.time || item.date),
        unread: item.unread !== undefined ? item.unread : (item.read !== undefined ? !item.read : (item.isRead !== undefined ? !item.isRead : true))
      }))
      
      const prevList = notificationsRef.current
      const prevUnreadCount = prevList.filter(n => n.unread).length
      const newUnreadCount = mapped.filter(n => n.unread).length

      if (prevList.length > 0 && newUnreadCount > prevUnreadCount) {
        try {
          const audio = new Audio(notificationSound)
          audio.play().catch(e => console.log('Autoplay blocked:', e))
        } catch (e) {
          console.error('Audio play failed:', e)
        }
      }

      setNotificationsList(mapped)
    } catch (error) {
      console.error('Failed to fetch vendor notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notificationsList.filter(n => n.unread).length

  const handleMarkAllRead = async () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })))
    try {
      await vendorService.readAllNotifications()
      toast.success('All notifications marked as read')
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const handleNotificationClick = async (id) => {
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
    try {
      await vendorService.readNotification(id)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="w-10 h-10 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center justify-center transition-colors relative border border-purple-100/10 dark:border-gray-800 bg-white dark:bg-gray-900 cursor-pointer"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-[140] bg-black/20 backdrop-blur-[2px] transition-opacity"
              onClick={() => setShowNotifications(false)}
            />

            {/* Desktop Dropdown (md:block hidden) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="hidden md:block absolute right-0 mt-2 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-purple-100/15 dark:border-gray-800/80 rounded-3xl shadow-2xl z-[150] overflow-hidden"
              style={{ right: '0px' }}
            >
              <div className="p-4 border-b border-purple-100/10 dark:border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#6C4CF1]" />
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-black text-[#6C4CF1] hover:text-[#5B3BE8] bg-transparent border-none outline-none cursor-pointer uppercase tracking-wider"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                {notificationsList.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider">
                    No notifications yet
                  </div>
                ) : (
                  notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex gap-3 ${
                        notif.unread
                          ? 'bg-purple-50/50 dark:bg-purple-500/5 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-100/50 dark:bg-purple-950/30 text-[#6C4CF1] flex items-center justify-center shrink-0 border border-purple-250/10">
                        {notif.type === 'order' ? <Package className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {notif.title}
                          </span>
                          {notif.unread && (
                            <span className="w-1.5 h-1.5 bg-[#6C4CF1] rounded-full shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-1 leading-normal text-left">
                          {notif.body}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-2 block font-medium text-left">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Mobile Bottom Sheet (md:hidden) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[32px] border-t border-purple-100/15 dark:border-gray-800 z-[150] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="w-12 h-1.5 bg-gray-205 dark:bg-white/10 rounded-full mx-auto my-3 shrink-0" />

              <div className="px-6 pb-4 border-b border-purple-100/10 dark:border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#6C4CF1]" />
                  <span className="font-extrabold text-base text-gray-900 dark:text-white">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-[#6C4CF1] bg-transparent border-none outline-none cursor-pointer uppercase tracking-wider"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto custom-scrollbar p-4 space-y-2 flex-1">
                {notificationsList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider">
                    No notifications yet
                  </div>
                ) : (
                  notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`p-4 rounded-2xl transition-all flex gap-3 text-left ${
                        notif.unread
                          ? 'bg-purple-50/50 dark:bg-purple-500/5'
                          : 'bg-gray-50/30 dark:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100/50 dark:bg-purple-950/30 text-[#6C4CF1] flex items-center justify-center shrink-0 border border-purple-250/10">
                        {notif.type === 'order' ? <Package className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                            {notif.title}
                          </span>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-[#6C4CF1] rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-1 leading-relaxed">
                          {notif.body}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-2 block font-bold">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VendorNotificationBell
