import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

const SearchBar = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query, onSearch])

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`flex items-center w-full max-w-lg px-4 py-3 rounded-xl border transition-all duration-300 ${
          isFocused
            ? 'border-green-400 ring-2 ring-green-400/10 bg-white/90 dark:bg-white/10'
            : 'border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-green-300 dark:hover:border-white/20'
        }`}
      >
        <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search fresh groceries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
        />
        {query && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {isFocused && query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-white/10 shadow-xl overflow-hidden z-50"
        >
          <div className="p-3">
            <p className="text-sm text-gray-400">Searching for "{query}"...</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SearchBar