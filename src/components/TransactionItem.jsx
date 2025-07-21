import React, { useState } from 'react';
import { db } from '../firebase/config';
import { doc, writeBatch } from 'firebase/firestore';
import styles from './TransactionItem.module.css';

const TransactionItem = ({ transaction, envelope }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(transaction.description);
  const [editedAmount, setEditedAmount] = useState(transaction.amount);

  const handleSave = async (e) => {
    e.preventDefault();
    const newAmount = parseFloat(editedAmount);
    if (isNaN(newAmount) || newAmount <= 0 || !editedDescription) {
        alert("Please enter a valid description and amount.");
        return;
    }
    const batch = writeBatch(db);
    const amountDifference = transaction.amount - newAmount;
    const envelopeRef = doc(db, 'envelopes', envelope.id);
    const newBalance = envelope.balance + amountDifference;
    batch.update(envelopeRef, { balance: newBalance });
    const transactionRef = doc(db, 'transactions', transaction.id);
    batch.update(transactionRef, { description: editedDescription, amount: newAmount });
    try {
        await batch.commit();
        setIsEditing(false);
    } catch (error) {
        console.error("Error updating transaction: ", error);
        alert("Failed to update transaction.");
    }
  };

  const handleDelete = async (e) => {
    if (window.confirm(`Delete transaction: "${transaction.description}"? This will add ₱${transaction.amount.toFixed(2)} back to the envelope.`)) {
      const batch = writeBatch(db);
      const envelopeRef = doc(db, 'envelopes', envelope.id);
      const newBalance = envelope.balance + transaction.amount;
      batch.update(envelopeRef, { balance: newBalance });
      const transactionRef = doc(db, 'transactions', transaction.id);
      batch.delete(transactionRef);
      try {
        await batch.commit();
      } catch (error) {
        console.error("Error deleting transaction: ", error);
        alert("Failed to delete transaction.");
      }
    }
  };

  if (isEditing) {
    return (
      <form className={styles.editForm} onSubmit={handleSave}>
        <input
          type="text"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className={`${styles.editInput} ${styles.editInputDescription}`}
          required
          autoFocus
        />
        <div className={styles.editFormBottomRow}>
          <input
            type="number"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e.target.value)}
            className={`${styles.editInput} ${styles.editInputAmount}`}
            step="0.01"
            required
          />
          <div className={styles.controls}>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <li className={styles.item}>
      <span className={styles.description}>{transaction.description}</span>
      <div className={styles.amount}>- ₱{transaction.amount.toFixed(2)}</div>
      <div className={styles.controls}>
        <button onClick={() => setIsEditing(true)}>Edit</button>
        <button onClick={handleDelete} className={styles.deleteButton}>Delete</button>
      </div>
    </li>
  );
};

export default TransactionItem;