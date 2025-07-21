import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from './config.jsx';
import { achievementsList } from '../data/achievementData.js';
import toast from 'react-hot-toast';

export const checkAndAwardAchievement = async (userId, achievementId) => {
  if (!userId || !achievementId) return;

  const userDocRef = doc(db, 'users', userId);
  
  try {
    const userDoc = await getDoc(userDocRef);
    let userData = {};

    if (!userDoc.exists()) {
      await setDoc(userDocRef, { achievements: [] });
      userData.achievements = [];
    } else {
      userData = userDoc.data();
    }

    const userAchievements = userData.achievements || [];

    if (userAchievements.includes(achievementId)) {
      return;
    }

    await updateDoc(userDocRef, {
      achievements: arrayUnion(achievementId)
    });

    const achievement = achievementsList[achievementId];
    if (achievement) {
      toast.success(`Achievement Unlocked: ${achievement.name}!`, {
        duration: 5000,
        icon: '🏆',
        style: {
            border: `2px solid ${achievement.color}`,
            fontWeight: 'bold'
        }
      });
    }
  } catch (error) {
    console.error("Error awarding achievement: ", error);
  }
};