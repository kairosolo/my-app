import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import styles from './TransactionHistory.module.css';
import TransactionItem from './TransactionItem';

const TransactionHistory = ({ envelope }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!envelope || !envelope.id) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('envelopeId', '==', envelope.id),
      where('archiveDate', '==', null),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(transData);
    });

    return () => unsubscribe();
  }, [envelope]);

  return (
    <div className={styles.historyContainer}>
      <h4 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--secondary-text)' }}>History</h4>
      {transactions.length > 0 ? (
        <ul className={styles.historyList}>
          {transactions.map(t => (
            <TransactionItem key={t.id} transaction={t} envelope={envelope} />
          ))}
        </ul>
      ) : (
        <p style={{textAlign: 'center', color: 'var(--secondary-text)', fontSize: '0.9rem'}}>No spending yet.</p>
      )}
    </div>
  );
};

export default TransactionHistory;