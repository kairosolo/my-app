import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const EditGoalPage = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [goalReason, setGoalReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      const docSnap = await getDoc(doc(db, 'goals', goalId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGoalName(data.goalName);
        setTargetAmount(data.targetAmount);
        setImageUrl(data.imageUrl);
        setGoalReason(data.goalReason || '');
        if (data.deadline) {
          setDeadline(data.deadline.toDate().toISOString().split("T")[0]);
        }
      } else {
        toast.error("Could not find goal to edit.");
        navigate('/');
      }
      setLoading(false);
    };
    fetchGoal();
  }, [goalId, navigate]);

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let finalImageUrl = imageUrl;
    
    // If the URL is empty, generate placeholder
    if (!finalImageUrl) {
        const placeholderText = goalName.trim().split(' ').slice(0, 2).join('+');
        finalImageUrl = `https://placehold.co/600x400/EFE8D8/78716C?text=${placeholderText || 'My+Dream'}`;
    }

    try {
      await updateDoc(doc(db, 'goals', goalId), {
        goalName,
        targetAmount: Number(targetAmount),
        imageUrl: finalImageUrl,
        deadline: new Date(deadline),
        goalReason: goalReason,
      });
      toast.success("Goal updated successfully!");
      navigate(`/goal/${goalId}`);
    } catch (error) {
      toast.error("Failed to update goal.");
    } finally {
      setSaving(false);
    }
  };

  const getTodayString = () => new Date().toISOString().split("T")[0];

  if (loading) return <div className="loader">Loading goal...</div>

  return (
    <div className="layout">
      <main className="container">
        <div className="page-form-container">
            <Link to={`/goal/${goalId}`} className="back-link">
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Goal
            </Link>
            <div className="card">
                <div className="card-content">
                    <h1>Edit Your Goal</h1>
                    <form onSubmit={handleUpdateGoal} className="page-form">
                        <div className="form-group">
                            <label>Goal Name</label>
                            <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} required />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Target Amount (₱)</label>
                                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Target Date</label>
                                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={getTodayString()} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Motivating Image URL (Optional)</label>
                            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Leave blank for auto-generated image" />
                        </div>
                        <div className="form-group">
                            <label>My "Why" (My Motivation)</label>
                            <textarea value={goalReason} onChange={(e) => setGoalReason(e.target.value)} placeholder="Why is this goal important to you?" rows="3" />
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={() => navigate(`/goal/${goalId}`)} className="button secondary-button large">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="button primary-button large">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default EditGoalPage;