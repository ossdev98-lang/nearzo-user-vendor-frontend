export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop offset="0" stop-color="#f6f7f8" stop-opacity="1" />
      <stop offset="0.2" stop-color="#eee" stop-opacity="1" />
      <stop offset="0.5" stop-color="#ddd" stop-opacity="1" />
      <stop offset="0.8" stop-color="#eee" stop-opacity="1" />
      <stop offset="1" stop-color="#f6f7f8" stop-opacity="1" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" rx="5" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" rx="5" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`

export const API_BASE_URL = 'https://instamart-server.vercel.app/api'