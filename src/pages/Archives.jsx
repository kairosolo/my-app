import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, writeBatch } from 'firebase/firestore';
import ArchivedMonthChart from '../components/ArchivedMonthChart';
import ArchivedTransactionList from '../components/ArchivedTransactionList'; 
import styles from './Archives.module.css';

const Archives = () => {
  const [archivedData, setArchivedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleCharts, setVisibleCharts] = useState({});

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const q = query(
          collection(db, "envelopes"), 
          where("archiveDate", "!=", null),
          orderBy("archiveDate", "desc")
        );
        const querySnapshot = await getDocs(q);
        const groupedData = querySnapshot.docs.reduce((acc, doc) => {
          const envelope = { id: doc.id, ...doc.data() };
          const date = envelope.archiveDate;
          if (!acc[date]) acc[date] = [];
          acc[date].push(envelope);
          return acc;
        }, {});
        setArchivedData(groupedData);
      } catch (error) {
        console.error("Error fetching archives: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, []);

  const toggleChartVisibility = (date) => {
    setVisibleCharts(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const handleDeleteArchive = async (date) => {
    if (window.confirm(`Are you sure you want to permanently delete the archive for ${date}? This action cannot be undone.`)) {
      try {
        const batch = writeBatch(db);
        const envelopesQuery = query(collection(db, 'envelopes'), where('archiveDate', '==', date));
        const transactionsQuery = query(collection(db, 'transactions'), where('archiveDate', '==', date));
        const [envelopesSnapshot, transactionsSnapshot] = await Promise.all([getDocs(envelopesQuery), getDocs(transactionsQuery)]);
        envelopesSnapshot.forEach(doc => batch.delete(doc.ref));
        transactionsSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        setArchivedData(prev => {
          const newArchives = { ...prev };
          delete newArchives[date];
          return newArchives;
        });
        alert(`Archive for ${date} has been deleted.`);
      } catch (error) {
        console.error("Error deleting archive:", error);
        alert("Failed to delete archive.");
      }
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading Archives...</h2></div>;

  return (
    <div className={styles.container}>
      {Object.keys(archivedData).length > 0 ? (
        Object.entries(archivedData).map(([date, envelopes]) => {
          const monthBudget = envelopes.reduce((sum, env) => sum + env.budget, 0);
          const monthBalance = envelopes.reduce((sum, env) => sum + env.balance, 0);
          const monthSpent = monthBudget - monthBalance;

          return (
            <div key={date} className={styles.monthSection}>
              <div className={styles.monthHeader}>
                <h2>{date}</h2>
                <div className={styles.monthActions}>
                  <button onClick={() => toggleChartVisibility(date)} className={styles.actionButton}>
                    {visibleCharts[date] ? 'Hide Report' : 'Show Report'}
                  </button>
                  <button onClick={() => handleDeleteArchive(date)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                </div>
              </div>
              <div className={styles.monthSummary}>
                <span>Total Budget: <strong>₱{monthBudget.toFixed(2)}</strong></span>
                <span>Total Spent: <strong>₱{monthSpent.toFixed(2)}</strong></span>
                <span>Ending Balance: <strong>₱{monthBalance.toFixed(2)}</strong></span>
              </div>
              
              {visibleCharts[date] && <ArchivedMonthChart envelopes={envelopes} />}
              
              {/* */}
              <div className={styles.envelopeList}>
                {envelopes.map(env => (
                  <details key={env.id} className={styles.envelopeItem}>
                    <summary className={styles.envelopeSummary}>
                      <span className={styles.envName}>{env.name}</span>
                      <span className={styles.envDetails}>
                        ₱{env.balance.toFixed(2)} / ₱{env.budget.toFixed(2)}
                      </span>
                    </summary>
                    <ArchivedTransactionList envelopeId={env.id} archiveDate={date} />
                  </details>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className={styles.noData}>
          <h2>No Archived Months</h2>
          <p>Use the "Archive Month" button on the dashboard to save your progress.</p>
        </div>
      )}
    </div>
  );
};

export default Archives;