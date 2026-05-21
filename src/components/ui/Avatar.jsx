import { motion } from 'framer-motion'

const Avatar = ({ src, alt, fallback, className = '' }) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-full ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            const parent = e.target.parentElement
            const fallbackEl = parent.querySelector('[data-fallback]')
            if (fallbackEl) fallbackEl.style.display = 'flex'
          }}
        />
      ) : null}
      <div
        data-fallback=""
        className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm"
        style={{ display: src ? 'none' : 'flex' }}
      >
        {fallback}
      </div>
    </motion.div>
  )
}

export default Avatar