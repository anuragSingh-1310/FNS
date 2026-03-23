import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Filter, Package, Star } from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../utils/firestoreErrorHandler";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === "All" || p.category === selectedCategory)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "stock-desc") return b.stock - a.stock;
        if (sortBy === "stock-asc") return a.stock - b.stock;
        return 0;
      });
  }, [searchQuery, selectedCategory, sortBy, products]);

  if (isLoading) {
    return <div className="py-24 bg-stone-50 flex items-center justify-center">Loading products...</div>;
  }

  return (
    <div className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Our Products</h2>
          <p className="text-stone-500 text-lg max-w-2xl">Browse our fresh selection of local produce, daily essentials, and neighborhood favorites.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category 
                        ? "bg-emerald-100 text-emerald-800 font-medium" 
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 mb-4">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm text-stone-700"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="stock-desc">Quantity (High to Low)</option>
                <option value="stock-asc">Quantity (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-stone-900 mb-2">No products found</h3>
                <p className="text-stone-500">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setSearchQuery(""); handleCategoryChange("All"); }}
                  className="mt-6 text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 group hover:shadow-xl hover:shadow-stone-200/50 transition-all flex flex-col relative"
                  >
                    {product.tag === 'Most Selling' && (
                      <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-10">
                        <Star className="w-3.5 h-3.5 fill-current" /> Most Selling
                      </div>
                    )}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{product.category}</div>
                      <h3 className="text-lg font-bold text-stone-900 mb-2 leading-tight flex-1">{product.name}</h3>
                      <div className="text-xl font-bold text-emerald-600 mb-4">₹{product.price || 0}</div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                        <span className="text-sm font-medium text-stone-500">Available Quantity</span>
                        <span className={`text-lg font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
