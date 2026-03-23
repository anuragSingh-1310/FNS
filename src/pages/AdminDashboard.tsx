import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Power, Plus, Trash2, Minus, Star, MessageSquare, ShoppingCart, TrendingUp, Pencil } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [siteStatus, setSiteStatus] = useState('active');
  const [products, setProducts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', image: '', stock: '', price: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // Listen to site status
    const unsubStatus = onSnapshot(doc(db, 'settings', 'site_status'), (docSnap: any) => {
      if (docSnap.exists()) {
        setSiteStatus(docSnap.data().value);
      } else {
        setDoc(docSnap.ref, { value: 'active' }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'settings/site_status'));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/site_status'));

    // Listen to products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    // Listen to recommendations
    const q = query(collection(db, 'recommendations'), orderBy('created_at', 'desc'));
    const unsubRecs = onSnapshot(q, (snapshot) => {
      const recs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecommendations(recs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'recommendations'));

    // Listen to sales
    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sales'));

    return () => {
      unsubStatus();
      unsubProducts();
      unsubRecs();
      unsubSales();
    };
  }, [user]);

  const toggleSiteStatus = async () => {
    try {
      const newStatus = siteStatus === 'active' ? 'blocked' : 'active';
      await updateDoc(doc(db, 'settings', 'site_status'), { value: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/site_status');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check image size (approximate base64 size)
      if (newProduct.image.length > 1000000) {
        alert("Image is too large. Please select a smaller image (under 500KB).");
        return;
      }
      
      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), {
          ...newProduct,
          price: parseFloat(newProduct.price) || 0,
          stock: parseInt(newProduct.stock) || 0,
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...newProduct,
          price: parseFloat(newProduct.price) || 0,
          stock: parseInt(newProduct.stock) || 0,
          created_at: new Date().toISOString()
        });
      }
      setShowAddModal(false);
      setEditingProductId(null);
      setNewProduct({ name: '', category: '', image: '', stock: '', price: '' });
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. It might be too large or you lack permissions.");
    }
  };

  const handleEditProduct = (product: any) => {
    setNewProduct({
      name: product.name || '',
      category: product.category || '',
      image: product.image || '',
      stock: product.stock?.toString() || '0',
      price: product.price?.toString() || '0'
    });
    setEditingProductId(product.id);
    setShowAddModal(true);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recommendations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `recommendations/${id}`);
    }
  };

  const updateStock = async (product: any, change: number) => {
    try {
      const newStock = Math.max(0, product.stock + change);
      await updateDoc(doc(db, 'products', product.id), { stock: newStock });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  const handleSetMostSelling = async (id: string) => {
    try {
      const batch = writeBatch(db);
      
      // Remove tag from current most selling
      const currentMostSelling = products.find(p => p.tag === 'Most Selling');
      if (currentMostSelling) {
        batch.update(doc(db, 'products', currentMostSelling.id), { tag: null });
      }
      
      // Add tag to new product
      batch.update(doc(db, 'products', id), { tag: 'Most Selling' });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleSold = async (product: any) => {
    if (product.stock <= 0) return;
    try {
      const batch = writeBatch(db);
      
      // Decrease stock
      const productRef = doc(db, 'products', product.id);
      batch.update(productRef, { stock: product.stock - 1 });
      
      // Record sale
      const now = new Date();
      let businessDate = new Date(now);
      // If time is before 6 AM, it belongs to the previous day's shift
      if (now.getHours() < 6) {
        businessDate.setDate(businessDate.getDate() - 1);
      }
      const dateString = businessDate.toISOString().split('T')[0];
      
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, {
        productId: product.id,
        productName: product.name,
        price: product.price || 0,
        timestamp: now.toISOString(),
        businessDate: dateString
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  // Process sales data for the chart
  const salesByDate = sales.reduce((acc, sale) => {
    const date = sale.businessDate;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += (sale.price || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(salesByDate)
    .sort()
    .slice(-30) // Last 30 business days
    .map(date => ({
      date,
      revenue: salesByDate[date]
    }));

  if (!user || user.role !== 'admin') {
    return <div className="pt-24 pb-24 min-h-screen bg-stone-50 flex items-center justify-center">Access Denied</div>;
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-900">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <h2 className="text-xl font-bold text-stone-900 mb-6">Site Controls</h2>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="font-bold text-stone-900">Website Status</p>
                  <p className={`text-sm font-medium ${siteStatus === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                    Currently {siteStatus}
                  </p>
                </div>
                <button
                  onClick={toggleSiteStatus}
                  className={`p-3 rounded-xl transition-colors ${siteStatus === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                >
                  <Power className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-stone-900">Recommendations</h2>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {recommendations.length === 0 ? (
                  <p className="text-stone-500 text-center py-4">No recommendations yet.</p>
                ) : (
                  recommendations.map(rec => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 relative group">
                      <p className="text-stone-900 font-medium pr-8">{rec.message}</p>
                      <p className="text-xs text-stone-400 mt-2">{new Date(rec.created_at).toLocaleString()}</p>
                      <button 
                        onClick={() => handleDeleteRecommendation(rec.id)}
                        className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Recommendation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-900">Manage Products</h2>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                  <Plus className="w-5 h-5" /> Add Product
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-sm uppercase tracking-wider">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Stock</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-stone-900">{product.name}</span>
                        </td>
                        <td className="p-4 text-emerald-600 font-bold">₹{product.price || 0}</td>
                        <td className="p-4 text-stone-600">{product.category}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateStock(product, -1)} className="p-1 bg-stone-200 hover:bg-stone-300 rounded text-stone-700">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-6 text-center">{product.stock}</span>
                            <button onClick={() => updateStock(product, 1)} className="p-1 bg-stone-200 hover:bg-stone-300 rounded text-stone-700">
                              <Plus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleSold(product)} 
                              disabled={product.stock <= 0}
                              className={`ml-2 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Sold
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleSetMostSelling(product.id)} className={`p-2 rounded-lg transition-colors ${product.tag === 'Most Selling' ? 'text-amber-500 bg-amber-50' : 'text-stone-400 hover:text-amber-500'}`} title="Mark as Most Selling">
                              <Star className={`w-5 h-5 ${product.tag === 'Most Selling' ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={() => handleEditProduct(product)} className="p-2 text-stone-400 hover:text-emerald-500 rounded-lg transition-colors" title="Edit Product">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition-colors" title="Delete Product">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-stone-500">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Graph Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-stone-900">Monthly Sales (Night Shift)</h2>
              </div>
              <p className="text-sm text-stone-500 mb-6">
                Sales are grouped by business day. A business day starts at 9:00 PM and ends at 6:00 AM the following morning.
              </p>
              
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip 
                        cursor={{ fill: '#f5f5f4' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: number) => [`₹${value}`, 'Revenue']}
                        labelStyle={{ color: '#57534e', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">
                    No sales data available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700">Name</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="mt-1 block w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Category</label>
                    <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="mt-1 block w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500">
                      <option value="">Select a category</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Bakery & Biscuits">Bakery & Biscuits</option>
                      <option value="Confectionery">Confectionery</option>
                      <option value="Beverages">Beverages</option>
                      <option value="🍜 Instant / Ready-to-Eat">🍜 Instant / Ready-to-Eat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Price (₹)</label>
                    <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="mt-1 block w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">Stock Quantity</label>
                  <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="mt-1 block w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">Product Photo {editingProductId && '(Optional)'}</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    required={!editingProductId}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressedBase64 = await compressImage(file);
                          setNewProduct({...newProduct, image: compressedBase64});
                        } catch (err) {
                          console.error("Error compressing image", err);
                          alert("Failed to process image. Please try another one.");
                        }
                      }
                    }} 
                    className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                  />
                  {newProduct.image && (
                    <img src={newProduct.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-stone-200" />
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => { setShowAddModal(false); setEditingProductId(null); setNewProduct({ name: '', category: '', image: '', stock: '', price: '' }); }} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm">{editingProductId ? 'Save Changes' : 'Add Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
