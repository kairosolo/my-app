import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, increment, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, messaging, auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faPlus, faPiggyBank, faSignOutAlt, faHandHoldingDollar, faTrophy, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { requestMessagingPermission } from '../firebase/requestMessagingPermission';
import { onMessage } from 'firebase/messaging';
import AllocationModal from '../components/AllocationModal';
import { checkAndAwardAchievement } from '../firebase/achievementService.js';

const GoalCard = ({ goal, userId, allGoals }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  const handleAddSavings = async (e) => {
    e.preventDefault();
    const amount = Number(amountToAdd);
    if (amount <= 0) { return toast.error('Please enter a positive amount.'); }
    setLoading(true);
    const batch = writeBatch(db);
    const goalRef = doc(db, 'goals', goal.id);
    batch.update(goalRef, { currentAmount: increment(amount) });
    const contributionRef = doc(collection(db, 'goals', goal.id, 'contributions'));
    batch.set(contributionRef, { amount: amount, date: serverTimestamp() });
    try {
      await batch.commit();
      const newCurrentAmount = goal.currentAmount + amount;
      await checkAndAwardAchievement(userId, 'FIRST_DEPOSIT');
      if (newCurrentAmount >= goal.targetAmount) {
        await checkAndAwardAchievement(userId, 'GOAL_SMASHER');
      }
      const totalSaved = allGoals.reduce((sum, g) => {
        return sum + (g.id === goal.id ? newCurrentAmount : g.currentAmount);
      }, 0);
      if (totalSaved >= 1000) {
        await checkAndAwardAchievement(userId, 'NOVICE_SAVER');
      }
      toast.success(`₱${amount} added!`);
      setIsModalOpen(false);
      setAmountToAdd('');
    } catch (error) {
      toast.error('Failed to add savings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="goal-card">
        <Link to={`/goal/${goal.id}`}>
          <img src={goal.imageUrl} alt={goal.goalName} className="goal-card-image" />
          <div className="goal-card-content">
            <h3 className="goal-card-title">{goal.goalName}</h3>
            <p className="goal-card-progress-text">
              <span className="current-amount">₱{goal.currentAmount.toLocaleString()}</span> / ₱{goal.targetAmount.toLocaleString()}
            </p>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress > 100 ? 100 : progress}%` }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </Link>
        <div className="goal-card-footer">
          <button onClick={() => setIsModalOpen(true)} className="button primary-button">
            <FontAwesomeIcon icon={faCoins} /> Add to Alkansya
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Savings to "{goal.goalName}"</h3>
            <form onSubmit={handleAddSavings}>
              <label>Amount (₱)</label>
              <input type="number" placeholder="e.g., 500" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)} autoFocus />
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="button secondary-button">Cancel</button>
                <button type="submit" disabled={loading} className="button primary-button">{loading ? 'Adding...' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const handleLogout = () => { signOut(auth); };

  useEffect(() => {
    if (currentUser) requestMessagingPermission(currentUser.uid);
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      toast.success(`${payload.notification.title}: ${payload.notification.body}`, { duration: 6000 });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'goals'), where('userId', '==', currentUser.uid), where('isDeleted', '!=', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(goalsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <>
      <div className="layout">
        <header className="header">
          <a href="/" className="logo">
            <FontAwesomeIcon icon={faPiggyBank} /> Alkansya
          </a>
          <div className="header-nav">
            <Link to="/analytics" className="nav-link" title="Analytics">
              <FontAwesomeIcon icon={faChartLine} />
              <span>Analytics</span>
            </Link>
            <Link to="/achievements" className="nav-link" title="Achievements">
              <FontAwesomeIcon icon={faTrophy} />
              <span>My Badges</span>
            </Link>
            <button onClick={handleLogout} className="button logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
          </div>
        </header>
        <main className="container">
          <div className="dashboard-header">
            <div>
              <h2>Your Savings Goals</h2>
              <p>Let's check your progress today!</p>
            </div>
            <div className="dashboard-actions">
              {goals.length > 0 && (
                <button onClick={() => setIsAllocationModalOpen(true)} className="button secondary-button">
                  <FontAwesomeIcon icon={faHandHoldingDollar} /> Allocate Funds
                </button>
              )}
              <Link to="/add-goal" className="button primary-button">
                <FontAwesomeIcon icon={faPlus} /> New Goal
              </Link>
            </div>
          </div>
          {loading && <div className="loader">Loading dreams...</div>}
          {!loading && goals.length === 0 && (
            <div className="empty-state">
              <FontAwesomeIcon icon={faPiggyBank} className="empty-state-icon" />
              <h3>No Goals Yet!</h3>
              <p>What dream are we saving for today?</p>
              <Link to="/add-goal" className="button primary-button">Create Your First Goal</Link>
            </div>
          )}
          {!loading && goals.length > 0 && (
            <div className="goals-grid">
              {goals.map((goal) => (<GoalCard key={goal.id} goal={goal} userId={currentUser.uid} allGoals={goals} />))}
            </div>
          )}
        </main>
      </div>
      {isAllocationModalOpen && (<AllocationModal goals={goals} onClose={() => setIsAllocationModalOpen(false)} />)}
    </>
  );
};

export default Dashboard;