import { motion } from 'framer-motion'

const testimonialsData = [
  {
    name: 'Priya Sharma',
    role: 'Regular Customer',
    rating: 5,
    text: 'Absolutely love QuickCart! The 10-minute delivery is incredible. Fresh groceries every time. Never going back to traditional shopping.',
    avatar: 'P',
    color: 'from-pink-400 to-rose-400',
  },
  {
    name: 'Rahul Verma',
    role: 'Health Enthusiast',
    rating: 5,
    text: 'The quality of fruits and vegetables is outstanding. Everything is fresh and lasts much longer than store-bought.',
    avatar: 'R',
    color: 'from-blue-400 to-indigo-400',
  },
  {
    name: 'Ananya Patel',
    role: 'Working Professional',
    rating: 4,
    text: 'As a busy professional, nearzo is a lifesaver. Easy ordering, fast delivery, and great prices. Highly recommend!',
    avatar: 'A',
    color: 'from-emerald-400 to-teal-400',
  },
  {
    name: 'Suresh Kumar',
    role: 'Family Man',
    rating: 5,
    text: 'I order groceries for my entire family every week. The variety is amazing and the customer service is top-notch.',
    avatar: 'S',
    color: 'from-amber-400 to-orange-400',
  },
]

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-gray-900 dark:text-white">What Our</span>{' '}
            <span className="text-primary">Customers Say</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            Don't just take our word for it — hear from our happy customers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 rounded-2xl relative group cursor-default"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-gray-100 dark:text-white/10 text-5xl font-serif select-none">
                &ldquo;
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 dark:text-gray-700'
                      }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4">
                {testimonial.text}
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection