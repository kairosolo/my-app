import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { achievementsList } from '../data/achievementData.js';

const AchievementCard = ({ achievement, isUnlocked }) => {
  const cardClass = isUnlocked ? "achievement-card unlocked" : "achievement-card locked";
  const unlockedStyle = isUnlocked ? { borderLeftColor: achievement.color } : {};

  return (
    <div className={cardClass} style={unlockedStyle}>
      <FontAwesomeIcon icon={achievement.icon} className="achievement-icon" style={{ color: isUnlocked ? achievement.color : '#cbd5e1' }} />
      <div className="achievement-details">
        <h3>{achievement.name}</h3>
        <p>{achievement.description}</p>
      </div>
    </div>
  );
};

const AchievementsPage = () => {
  const { currentUser } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().achievements) {
          setUnlockedAchievements(docSnap.data().achievements);
        }
      }
      setLoading(false);
    };
    fetchAchievements();
  }, [currentUser]);

  if (loading) return <div className="loader">Loading Achievements...</div>;

  const allAchievementKeys = Object.keys(achievementsList);
  const unlockedCount = unlockedAchievements.length;
  const totalCount = allAchievementKeys.length;

  return (
    <div className="layout">
      <main className="container">
        <div className="page-header">
          <Link to="/" className="back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Dashboard
          </Link>
        </div>
        <div className="achievements-header">
          <h1>Your Achievements</h1>
          <p>You have unlocked {unlockedCount} of {totalCount} badges. Keep saving!</p>
        </div>
        <div className="achievements-grid">
          {allAchievementKeys.map(key => (
            <AchievementCard 
              key={key}
              achievement={achievementsList[key]}
              isUnlocked={unlockedAchievements.includes(key)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AchievementsPage;