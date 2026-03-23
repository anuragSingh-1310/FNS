import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Recommendation() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'recommendations'), {
        message,
        created_at: new Date().toISOString()
      });
      setStatus('success');
      setMessage('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('idle');
      handleFirestoreError(err, OperationType.CREATE, 'recommendations');
    }
  };

  return (
    <section className="bg-emerald-900 py-16 text-emerald-50 border-t border-emerald-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <MessageSquarePlus className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
        <h2 className="text-3xl font-serif font-bold mb-4 text-white">What should we bring next?</h2>
        <p className="mb-8 text-emerald-200">We're always looking to expand our inventory with things you love. Let us know what you'd like to see on our shelves!</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Only specify things that can be brought within the campus."
            className="flex-1 px-6 py-4 rounded-2xl text-stone-900 placeholder:text-stone-400 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            required
          />
          <button
            type="submit"
            disabled={status === 'submitting' || status === 'success'}
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-8 py-4 rounded-2xl transition-colors disabled:opacity-70 shadow-lg shadow-emerald-900/50"
          >
            {status === 'success' ? 'Sent!' : 'Recommend'}
          </button>
        </form>
      </div>
    </section>
  );
}
