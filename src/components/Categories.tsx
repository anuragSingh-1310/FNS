import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: 1, name: "Snacks", icon: "🥔", color: "bg-amber-100 text-amber-600" },
  { id: 2, name: "Bakery & Biscuits", icon: "🍪", color: "bg-orange-100 text-orange-600" },
  { id: 3, name: "Confectionery", icon: "🍫", color: "bg-red-100 text-red-600" },
  { id: 4, name: "Beverages", icon: "🥤", color: "bg-blue-100 text-blue-600" },
  { id: 5, name: "🍜 Instant / Ready-to-Eat", icon: "🍜", color: "bg-yellow-100 text-yellow-600" },
];

export default function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}#products`);
    
    // Smooth scroll to products if already on the page
    setTimeout(() => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <section id="departments" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Shop by Department</h2>
            <p className="text-stone-500 text-lg max-w-2xl">Everything you need, organized and easy to find. Freshness guaranteed daily.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            return (
              <motion.div
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group cursor-pointer rounded-3xl border border-stone-100 p-6 hover:shadow-xl hover:shadow-stone-200/50 hover:border-emerald-100 transition-all bg-stone-50/50 hover:bg-white text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${category.color} text-3xl`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900">{category.name}</h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
