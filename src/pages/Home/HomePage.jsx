import { useState } from 'react'
import HeroSection from '../../components/sections/HeroSection'
import CategoriesSection from '../../components/sections/CategoriesSection'
import PopularProductsSection from '../../components/sections/PopularProductsSection'
import FeaturesSection from '../../components/sections/FeaturesSection'
import TestimonialsSection from '../../components/sections/TestimonialsSection'
import MobileAppSection from '../../components/sections/MobileAppSection'
import CategoryPills from '../../components/sections/CategoryPills'
import ShopsSection from '../../components/sections/ShopsSection'
import BannerSection from '../../components/sections/BannerSection'

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-[140px] md:pt-24">
      {/* Category pills (Zepto style) */}
      <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Hero */}
      {/* <HeroSection selectedCategory={selectedCategory} onSelect={setSelectedCategory} /> */}

      {/* Shops based on Category */}
      <ShopsSection selectedCategory={selectedCategory} />

      {/* Best Products */}
      <PopularProductsSection selectedCategory={selectedCategory} />

      {/* Banners */}
      <BannerSection />

      {/* Features */}
      <FeaturesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Mobile App */}
      <MobileAppSection />
    </div>
  )
}

export default HomePage