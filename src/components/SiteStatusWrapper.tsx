import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function SiteStatusWrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'active' | 'blocked' | 'loading'>('loading');
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site_status'), (docSnap: any) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data().value as 'active' | 'blocked');
      } else {
        // Initialize if not exists, but only if admin
        if (user?.role === 'admin') {
          setDoc(docSnap.ref, { value: 'active' }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'settings/site_status'));
        }
        setStatus('active');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/site_status');
      setStatus('active'); // Fallback
    });

    return () => unsub();
  }, [user]);

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</div>;
  }

  // Allow access to login page or if user is admin
  if (status === 'blocked' && user?.role !== 'admin' && location.pathname !== '/login') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Hang tight! We’ll be back soon</h1>
        <Link to="/login" className="mt-8 text-emerald-600 font-medium hover:text-emerald-700">Admin Login</Link>
      </div>
    );
  }

  return <>{children}</>;
}
