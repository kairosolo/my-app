import React, { useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc, deleteDoc, writeBatch, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import styles from './EnvelopeCard.module.css';
import TransactionHistory from './TransactionHistory';

const EnvelopeCard = ({ envelope }) => {
  const [spendAmount, setSpendAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(envelope.name);
  const [editedBudget, setEditedBudget] = useState(envelope.budget);

  const getProgressBarColor = (percentage) => {
    if (percentage > 50) return styles.progressBarGreen;
    if (percentage > 25) return styles.progressBarYellow;
    return styles.progressBarRed;
  };

  const balancePercentage = envelope.budget > 0 ? (envelope.balance / envelope.budget) * 100 : 0;
  
  const handleSaveEnvelope = async (e) => {
    e.preventDefault();
    const newBudget = parseFloat(editedBudget);
    if (!editedName.trim() || isNaN(newBudget) || newBudget < 0) {
      alert("Please enter a valid name and a non-negative budget amount.");
      return;
    }
    const amountSpent = envelope.budget - envelope.balance;
    const newBalance = newBudget - amountSpent;
    if (newBalance < 0) {
        alert("The new budget cannot be less than the amount already spent (₱" + amountSpent.toFixed(2) + ").");
        return;
    }
    const envelopeRef = doc(db, 'envelopes', envelope.id);
    try {
      await updateDoc(envelopeRef, { name: editedName.trim(), budget: newBudget, balance: newBalance });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating envelope: ", error);
      alert("Failed to update the envelope.");
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(envelope.name);
    setEditedBudget(envelope.budget);
  };

  const handleSpend = async (e) => {
    e.preventDefault();
    const amount = parseFloat(spendAmount);
    if (isNaN(amount) || amount <= 0 || !description) {
      alert('Please enter a valid description and a positive amount.');
      return;
    }
    if (amount > envelope.balance) {
      alert("You can't spend more than the remaining balance!");
      return;
    }
    const batch = writeBatch(db);
    const envelopeRef = doc(db, 'envelopes', envelope.id);
    batch.update(envelopeRef, { balance: envelope.balance - amount });
    const transactionRef = doc(collection(db, 'transactions'));
    batch.set(transactionRef, {
      envelopeId: envelope.id,
      description: description,
      amount: amount,
      createdAt: serverTimestamp(),
      archiveDate: null,
    });
    try {
      await batch.commit();
      setSpendAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error processing transaction: ', error);
      alert('Failed to process transaction.');
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the "${envelope.name}" envelope? This will also delete all of its transaction history and cannot be undone.`)) {
      try {
        const transactionsQuery = query(collection(db, 'transactions'), where('envelopeId', '==', envelope.id));
        const querySnapshot = await getDocs(transactionsQuery);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => { batch.delete(doc.ref); });
        const envelopeRef = doc(db, 'envelopes', envelope.id);
        batch.delete(envelopeRef);
        await batch.commit();
      } catch (error) {
        console.error("Error deleting envelope and its transactions: ", error);
        alert("An error occurred. Failed to delete the envelope and its history.");
      }
    }
  };

  return (
    <div className={`${styles.card} ${isEditing ? styles.editing : ''}`}>
      {isEditing ? (
        <form onSubmit={handleSaveEnvelope} className={styles.editEnvelopeForm}>
          <div className={styles.editHeader}>
            <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className={styles.editNameInput} autoFocus />
            <div className={styles.editControls}>
              <button type="submit" title="Save">💾</button>
              <button type="button" onClick={handleCancelEdit} title="Cancel">❌</button>
            </div>
          </div>
          <div className={styles.editBudgetContainer}>
            <label>Budget:</label>
            <input type="number" value={editedBudget} onChange={(e) => setEditedBudget(e.target.value)} className={styles.editBudgetInput} step="0.01" />
          </div>
        </form>
      ) : (
        <div>
          <div className={styles.cardHeader}>
            <h3>{envelope.name}</h3>
            <div className={styles.cardHeaderControls}>
              <button onClick={() => setIsEditing(true)} className={styles.controlButton} title="Edit Envelope">✏️</button>
              <button onClick={handleDelete} className={`${styles.controlButton} ${styles.deleteButton}`} title="Delete Envelope">🗑️</button>
            </div>
          </div>
          <p className={styles.balance}>₱{envelope.balance?.toFixed(2)}</p>
          <p className={styles.budget}>Budget: ₱{envelope.budget?.toFixed(2)}</p>
          <div className={styles.progressBarContainer}>
            <div
              className={`${styles.progressBar} ${getProgressBarColor(balancePercentage)}`}
              style={{ width: `${balancePercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      <hr className={styles.divider} />
      <div>
        <h4 className={styles.subHeader}>Log a new expense</h4>
        <form onSubmit={handleSpend} className={styles.spendForm}>
          <input type="text" className={styles.spendInput} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What for?" style={{ flexGrow: 2 }} required />
          <input type="number" className={styles.spendInput} value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} placeholder="Amount" min="0.01" step="0.01" required />
          <button type="submit" className={styles.spendButton}>Spend</button>
        </form>
      </div>
      <TransactionHistory envelope={envelope} />
    </div>
  );
};

export default EnvelopeCard;