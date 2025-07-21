import React, { useState, useMemo } from 'react';
import { writeBatch, doc, increment, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const AllocationModal = ({ goals, onClose }) => {
  const [totalAmount, setTotalAmount] = useState('');
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(false);

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [allocations]);

  const remainingAmount = (Number(totalAmount) || 0) - totalAllocated;

  const handleAllocationChange = (goalId, value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    setAllocations(prev => ({ ...prev, [goalId]: sanitizedValue }));
  };

  const handleConfirmAllocation = async () => {
    if (totalAllocated <= 0) {
      return toast.error("You haven't allocated any funds.");
    }
    if (remainingAmount < 0) {
      return toast.error("Your allocations can't be more than your total funds.");
    }

    setLoading(true);
    const batch = writeBatch(db);

    try {
      for (const [goalId, amount] of Object.entries(allocations)) {
        const numericAmount = Number(amount);
        if (numericAmount > 0) {
          const goalRef = doc(db, 'goals', goalId);
          batch.update(goalRef, { currentAmount: increment(numericAmount) });
          const contributionRef = doc(collection(db, 'goals', goalId, 'contributions'));
          batch.set(contributionRef, { amount: numericAmount, date: serverTimestamp() });
        }
      }
      await batch.commit();
      toast.success('Funds allocated successfully!');
      onClose();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content allocation-modal">
        <div className="modal-header">
          <h2>Allocate Your Funds</h2>
          <button onClick={onClose} className="close-button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>How much did you receive?</label>
            <input
              type="text"
              placeholder="e.g., 2000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>
          <div className={`summary-box ${remainingAmount < 0 ? 'error' : ''}`}>
            <strong>Remaining to Allocate: ₱{remainingAmount.toLocaleString()}</strong>
            {remainingAmount < 0 && <p>You've allocated more than your total funds!</p>}
          </div>
          <div className="divider"></div>
          <div className="allocation-list">
            <p className="list-title">Distribute to your goals:</p>
            {goals.map(goal => (
              <div key={goal.id} className="allocation-item">
                <p>{goal.goalName}</p>
                <div className="allocation-input-group">
                  <span>₱</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={allocations[goal.id] || ''}
                    onChange={(e) => handleAllocationChange(goal.id, e.target.value)}
                    disabled={!totalAmount}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button secondary-button">Cancel</button>
          <button
            onClick={handleConfirmAllocation}
            disabled={loading || remainingAmount < 0 || totalAllocated === 0}
            className="button primary-button"
          >
            {loading ? 'Saving...' : 'Confirm Allocation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationModal;