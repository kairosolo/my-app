import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './config';

const VAPID_KEY = "BHM7w99sN2VQ-4YIk0Lulws5jPo-HYjFN75LGNKwi_u984lpEZX_b7q_cb8GdevBtg8wUSDf_x87-YUjdG83hHU";

export const requestMessagingPermission = async (userId) => {
  const messaging = getMessaging();
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            fcmTokens: arrayUnion(currentToken)
          });
        } else {
          await setDoc(userDocRef, {
            fcmTokens: [currentToken]
          });
        }
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred while requesting permission:', error);
  }
};