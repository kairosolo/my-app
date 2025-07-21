import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styles from './AddEnvelopeForm.module.css';

const AddEnvelopeForm = () => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !budget || parseFloat(budget) <= 0) {
      alert('Please enter a valid name and a positive budget amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'envelopes'), {
        name: name.trim(),
        budget: parseFloat(budget),
        balance: parseFloat(budget),
        createdAt: serverTimestamp(),
        archiveDate: null, 
      });

      setName('');
      setBudget('');

    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to add envelope. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Create a New Kahon</h2>
      <div className={styles.formGroup}>
        <label htmlFor="name">Envelope Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Groceries, Rent"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="budget">Budget Amount (₱)</label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g., 500"
          min="0.01"
          step="0.01"
          required
        />
      </div>
      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Envelope'}
      </button>
    </form>
  );
};

export default AddEnvelopeForm;