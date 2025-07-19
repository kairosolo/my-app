import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';

import AddEnvelopeForm from '../components/AddEnvelopeForm';
import EnvelopeCard from '../components/EnvelopeCard';
import DashboardSummary from '../components/DashboardSummary';

const Dashboard = () => {
  const [envelopes, setEnvelopes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "envelopes"), 
      where("archiveDate", "==", null), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const envelopesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnvelopes(envelopesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching envelopes in real-time: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1200px', margin: 'auto' }}>
      
      {!loading && envelopes.length > 0 && <DashboardSummary envelopes={envelopes} />}

      <AddEnvelopeForm />

      {loading && <div style={{textAlign: 'center', margin: '2rem'}}>Loading your envelopes...</div>}

      {!loading && (
        <div 
          className="envelopes-grid" 
          style={{ 
            display: 'grid', 
            gap: '1.5rem', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            marginTop: '2.5rem',
            alignItems: 'start'
          }}
        >
          {envelopes.map(envelope => (
            <EnvelopeCard key={envelope.id} envelope={envelope} />
          ))}
        </div>
      )}

      {!loading && envelopes.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '3rem', color: 'var(--secondary-text)'}}>
          No envelopes yet. Add one above to get started!
        </p>
      )}
    </div>
  );
};

export default Dashboard;