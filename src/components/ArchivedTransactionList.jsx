import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import styles from './ArchivedTransactionList.module.css';

const ArchivedTransactionList = ({ envelopeId, archiveDate }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!envelopeId || !archiveDate) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, 'transactions'),
          where('envelopeId', '==', envelopeId),
          where('archiveDate', '==', archiveDate),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const transData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(transData);
      } catch (error) {
        console.error("Error fetching archived transactions: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [envelopeId, archiveDate]);

  if (loading) {
    return <p className={styles.statusText}>Loading history...</p>;
  }

  if (transactions.length === 0) {
    return <p className={styles.statusText}>No spending was recorded for this envelope.</p>;
  }

  return (
    <ul className={styles.transactionList}>
      {transactions.map(t => (
        <li key={t.id} className={styles.transactionItem}>
          <span>{t.description}</span>
          <span>- ₱{t.amount.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
};

export default ArchivedTransactionList;