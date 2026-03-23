import { ShoppingBasket, Phone, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-xl text-white">
                <ShoppingBasket className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                Friendly Neighborhood
              </span>
            </div>
            <p className="text-stone-500 leading-relaxed max-w-md">
              Your local corner store committed to fresh produce, daily essentials, and a friendly smile. We're always here to make your day a little brighter and your shopping a lot easier.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <div className="flex items-center gap-3 text-stone-600">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">8827672003</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">silentk13.10@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600 mt-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                <span className="italic">Thanks for stopping by!</span>
              </div>
            </div>
          </div>

          <div className="lg:col-start-4">
            <h4 className="font-bold text-stone-900 mb-6 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-4">
              <li><a href="#products" className="text-stone-500 hover:text-emerald-600 transition-colors">Snacks</a></li>
              <li><a href="#products" className="text-stone-500 hover:text-emerald-600 transition-colors">Bakery & Biscuits</a></li>
              <li><a href="#products" className="text-stone-500 hover:text-emerald-600 transition-colors">Confectionery</a></li>
              <li><a href="#products" className="text-stone-500 hover:text-emerald-600 transition-colors">Beverages</a></li>
            </ul>
          </div>

        </div>
        
        <div className="mt-16 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-400 text-sm">
            © {new Date().getFullYear()} Friendly Neighborhood. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
