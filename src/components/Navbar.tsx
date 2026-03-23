import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { ShoppingBasket, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    clickCountRef.current += 1;
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCountRef.current === 7) {
        navigate('/login');
      } else if (clickCountRef.current < 7) {
        navigate('/');
      }
      clickCountRef.current = 0;
    }, 500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              Friendly Neighborhood
            </span>
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-stone-600 hover:text-emerald-600 font-medium transition-colors">Home</Link>
            
            {user && (
              <div className="flex items-center gap-4 border-l border-stone-200 pl-8">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Admin</Link>
                )}
                <div className="flex items-center gap-2 text-stone-600">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="text-stone-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-stone-200"
        >
          <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-stone-600 font-medium py-2">Home</Link>
            
            {user && (
              <div className="border-t border-stone-100 pt-4 mt-2">
                <div className="space-y-4 flex flex-col">
                  <div className="flex items-center gap-2 text-stone-600 py-2">
                    <UserIcon className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="text-emerald-600 font-medium py-2">Admin Dashboard</Link>
                  )}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-red-600 font-medium py-2">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
