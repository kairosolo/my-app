import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBullseye, faTrophy, faCalendarCheck, faTrash, faGauge, faPiggyBank, faPenToSquare, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const getDayDifference = (date1, date2) => {
    const startOfDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const startOfDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const timeDiff = startOfDate2.getTime() - startOfDate1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const GoalDetailPage = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const goalRef = doc(db, 'goals', goalId);
    const unsubscribeGoal = onSnapshot(goalRef, (doc) => {
      if (doc.exists() && !doc.data().isDeleted) {
        setGoal({ id: doc.id, ...doc.data() });
      } else {
        toast.error("Goal not found.");
        navigate('/');
      }
      setLoading(false);
    });

    const contributionsQuery = query(collection(db, 'goals', goalId, 'contributions'), orderBy('date', 'desc'));
    const unsubscribeContributions = onSnapshot(contributionsQuery, (snapshot) => {
        setContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeGoal();
      unsubscribeContributions();
    };
  }, [goalId, navigate]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.goalName}"? This action cannot be undone.`)) {
        try {
            const goalRef = doc(db, 'goals', goalId);
            await updateDoc(goalRef, { isDeleted: true });
            toast.success("Goal has been removed.");
            navigate('/');
        } catch (error) {
            toast.error("Failed to delete goal.");
        }
    }
  };

  if (loading) return <div className="loader">Loading your dream...</div>;
  if (!goal) return null;

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const amountRemaining = goal.targetAmount - goal.currentAmount;
  
  let rateToDisplay = 0;
  let rateUnit = 'now';
  let rateLabel = 'Amount needed to meet deadline:';
  
  if (amountRemaining > 0 && goal.deadline) {
    const today = new Date();
    const deadlineDate = goal.deadline.toDate();
    const daysRemaining = getDayDifference(today, deadlineDate);

    if (daysRemaining > 7) { // More than a week away: Show weekly rate
        rateToDisplay = (amountRemaining / daysRemaining) * 7;
        rateUnit = 'week';
        rateLabel = 'To stay on track, save:';
    } else if (daysRemaining > 0) { // 1 to 7 days away: Show daily rate
        rateToDisplay = amountRemaining / daysRemaining;
        rateUnit = 'day';
        rateLabel = 'To stay on track, save:';
    } else { // Deadline is today or has passed: Show total remaining
        rateToDisplay = amountRemaining;
        rateUnit = 'now';
        rateLabel = 'Amount needed to meet deadline:';
    }
  }
  const formatContributionDate = (date) => {
    if (!date) return 'Just now';
    return date.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
  }

  return (
    <div className="layout">
      <main className="container">
        <div className="page-header">
            <Link to="/" className="back-link">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Dashboard
            </Link>
        </div>
        <div className="goal-detail-grid">
            <div className="goal-detail-main">
                <div className="card">
                    <img src={goal.imageUrl} alt={goal.goalName} className="goal-detail-image"/>
                    <div className="card-content">
                        <div className="card-header">
                            <div>
                                <h1>{goal.goalName}</h1>
                                {goal.deadline && (
                                    <p className="deadline-text">
                                        Deadline: {goal.deadline.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                            <div className="card-actions">
                                <Link to={`/goal/${goalId}/edit`} className="icon-button" title="Edit Goal">
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </Link>
                                <button onClick={handleDelete} className="icon-button danger" title="Delete Goal">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                        <p className="goal-card-progress-text large">
                            <span className="current-amount">₱{goal.currentAmount.toLocaleString()}</span> saved
                        </p>
                        <div className="progress-bar-container large">
                            <div className="progress-bar" style={{ width: `${progress > 100 ? 100 : progress}%` }}>
                            {Math.round(progress)}%
                            </div>
                        </div>
                    </div>
                </div>

                {goal.goalReason && (
                  <div className="card why-card">
                    <div className="card-content">
                      <h2>My "Why"</h2>
                      <div className="why-card-content">
                        <FontAwesomeIcon icon={faQuoteLeft} className="why-card-icon" />
                        <p className="why-card-text">{goal.goalReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card">
                    <div className="card-content">
                        <h2>Progress Snapshot</h2>
                        <div className="snapshot-grid">
                            <div className="stat-card">
                                <FontAwesomeIcon icon={faBullseye} className="stat-icon blue"/>
                                <div>
                                    <p>Target</p>
                                    <strong>₱{goal.targetAmount.toLocaleString()}</strong>
                                </div>
                            </div>
                             <div className="stat-card">
                                <FontAwesomeIcon icon={faCalendarCheck} className="stat-icon red"/>
                                <div>
                                    <p>Still Needed</p>
                                    <strong>₱{amountRemaining > 0 ? amountRemaining.toLocaleString() : '0'}</strong>
                                </div>
                            </div>
                            {amountRemaining > 0 && (
                                <div className="stat-card full-width">
                                    <FontAwesomeIcon icon={faGauge} className="stat-icon yellow"/>
                                    <div>
                                        <p>{rateLabel}</p>
                                        <strong>
                                            ₱{rateToDisplay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / {rateUnit}
                                        </strong>
                                    </div>
                                </div>
                            )}
                             {progress >= 100 && (
                                <div className="stat-card full-width success">
                                    <FontAwesomeIcon icon={faTrophy} className="stat-icon"/>
                                    <div>
                                        <strong>Congratulations!</strong>
                                        <p>You've reached your goal!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="goal-detail-sidebar">
                <div className="card">
                    <div className="card-content">
                        <h2>Contribution History</h2>
                        <ul className="contribution-list">
                            {contributions.length > 0 ? (
                                contributions.map(item => (
                                    <li key={item.id} className="contribution-item">
                                        <FontAwesomeIcon icon={faPiggyBank} className="stat-icon green"/>
                                        <div>
                                            <strong>+ ₱{item.amount.toLocaleString()}</strong>
                                            <p>{formatContributionDate(item.date)}</p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="no-contributions">No contributions yet.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default GoalDetailPage;