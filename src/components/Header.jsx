import React from 'react';
import { NavLink } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, writeBatch, where, query, serverTimestamp, doc } from 'firebase/firestore';
import styles from './Header.module.css';

const Header = () => {

  const handleArchiveMonth = async () => {
    if (window.confirm("Are you sure you want to archive this month? This will save your current progress and create a fresh set of envelopes for the new month.")) {
      try {
        const archiveDate = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const batch = writeBatch(db);

        const activeEnvelopesQuery = query(collection(db, 'envelopes'), where("archiveDate", "==", null));
        const activeTransactionsQuery = query(collection(db, 'transactions'), where("archiveDate", "==", null));
        
        const envelopesSnapshot = await getDocs(activeEnvelopesQuery);
        const transactionsSnapshot = await getDocs(activeTransactionsQuery);

        if (envelopesSnapshot.empty) {
          alert("There are no active envelopes to archive.");
          return;
        }

        envelopesSnapshot.forEach((envelopeDoc) => {
          const envelope = envelopeDoc.data();
          batch.update(envelopeDoc.ref, { archiveDate: archiveDate });
          
          const newEnvelopeRef = doc(collection(db, 'envelopes'));
          batch.set(newEnvelopeRef, {
            name: envelope.name,
            budget: envelope.budget,
            balance: envelope.budget,
            createdAt: serverTimestamp(),
            archiveDate: null
          });
        });

        transactionsSnapshot.forEach((transactionDoc) => {
          batch.update(transactionDoc.ref, { archiveDate: archiveDate });
        });

        await batch.commit();
        alert(`Successfully archived ${archiveDate} and set up your new month!`);

      } catch (error) {
        console.error("Error archiving month:", error);
        alert("An error occurred while archiving the month.");
      }
    }
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}><NavLink to="/">Kahon</NavLink></h1>
      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Dashboard</NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Reports</NavLink>
        <NavLink to="/archives" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Archives</NavLink>
        <button onClick={handleArchiveMonth} className={styles.resetButton}>Archive Month</button>
      </nav>
    </header>
  );
};

export default Header;