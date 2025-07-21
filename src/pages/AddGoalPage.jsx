import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getCountFromServer } from 'firebase/firestore';
import { db, analytics } from '../firebase/config';
import { logEvent } from "firebase/analytics";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { checkAndAwardAchievement } from '../firebase/achievementService.js';

const AddGoalPage = () => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [goalReason, setGoalReason] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !deadline) {
      return toast.error('Please fill in all required fields.');
    }
    setLoading(true);

    let finalImageUrl = imageUrl; 

    if (!finalImageUrl) {
      const placeholderText = goalName.trim().split(' ').slice(0, 2).join('+');
      if (placeholderText) {
        finalImageUrl = `https://placehold.co/600x400/EFE8D8/78716C?text=${placeholderText}`;
      } else {
        finalImageUrl = `https://placehold.co/600x400/EFE8D8/78716C?text=My+Dream`;
      }
    }

    try {
      await addDoc(collection(db, 'goals'), {
        userId: currentUser.uid,
        goalName,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        imageUrl: finalImageUrl,
        createdAt: serverTimestamp(),
        deadline: new Date(deadline),
        isDeleted: false,
        goalReason: goalReason,
      });

      logEvent(analytics, 'create_goal', { target_amount: Number(targetAmount) });
      await checkAndAwardAchievement(currentUser.uid, 'FIRST_GOAL');
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', currentUser.uid), where('isDeleted', '!=', true));
      const snapshot = await getCountFromServer(goalsQuery);
      if (snapshot.data().count >= 3) {
        await checkAndAwardAchievement(currentUser.uid, 'PLANNER');
      }
      toast.success('Dream goal added to your Alkansya!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add goal.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => new Date().toISOString().split("T")[0];

  return (
    <div className="layout">
      <main className="container">
        <div className="page-form-container">
            <Link to="/" className="back-link">
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
            </Link>
            <div className="card">
                <div className="card-content">
                    <h1>Set a New Savings Goal</h1>
                    <form onSubmit={handleAddGoal} className="page-form">
                        <div className="form-group">
                            <label>Goal Name</label>
                            <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g., New Laptop" required />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Target Amount (₱)</label>
                                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="e.g., 50000" required />
                            </div>
                            <div className="form-group">
                                <label>Target Date</label>
                                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={getTodayString()} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Motivating Image URL (Optional)</label>
                            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                        </div>
                        <div className="form-group">
                            <label>My "Why" (My Motivation)</label>
                            <textarea value={goalReason} onChange={(e) => setGoalReason(e.target.value)} placeholder="Why is this goal important to you?" rows="3" />
                        </div>
                        <button type="submit" disabled={loading} className="button primary-button full-width large">
                            {loading ? 'Saving...' : 'Start Saving for this Dream!'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AddGoalPage;