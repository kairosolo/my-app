// The purpose of this is to create mock data
import { collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './config.jsx';

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const users = [
    {
    email: 'juan.delacruz@example.com',
    password: 'password123',
    achievements: ['FIRST_GOAL', 'FIRST_DEPOSIT', 'NOVICE_SAVER', 'PLANNER'],
    goals: [
        { name: 'Gaming PC', target: 45000, deadline: daysAgo(-60), reason: 'To play the latest games and improve my streaming setup.', contributions: [{ amount: 1500, date: daysAgo(90) }, { amount: 1200, date: daysAgo(75) }, { amount: 2000, date: daysAgo(60) }, { amount: 1800, date: daysAgo(45) }, { amount: 2500, date: daysAgo(30) }, { amount: 2200, date: daysAgo(15) }] },
        { name: 'La Union Trip', target: 8000, deadline: daysAgo(-30), reason: 'Surfing trip with friends after the semester ends!', contributions: [{ amount: 500, date: daysAgo(50) }, { amount: 750, date: daysAgo(40) }, { amount: 1000, date: daysAgo(20) }] },
        { name: 'New Shoes', target: 5500, deadline: daysAgo(-15), reason: 'For running and staying fit.', contributions: [{ amount: 2000, date: daysAgo(25) }, { amount: 1500, date: daysAgo(10) }] },
    ],
    },
    {
    email: 'maria.clara@example.com',
    password: 'password123',
    achievements: ['FIRST_GOAL', 'FIRST_DEPOSIT', 'GOAL_SMASHER'],
    goals: [
        { name: 'Concert Ticket', target: 7000, deadline: daysAgo(5), reason: 'To see my favorite band live!', contributions: [{ amount: 3000, date: daysAgo(40) }, { amount: 4000, date: daysAgo(10) }] },
        { name: 'Emergency Fund', target: 15000, deadline: daysAgo(-120), reason: 'For unexpected expenses and peace of mind.', contributions: [{ amount: 1000, date: daysAgo(100) }, { amount: 1000, date: daysAgo(70) }, { amount: 1000, date: daysAgo(40) }, { amount: 1000, date: daysAgo(10) }] },
    ],
    },
    {
    email: 'pedro.penduko@example.com',
    password: 'password123',
    achievements: ['FIRST_GOAL'],
    goals: [
        { name: 'Birthday Gift', target: 3000, deadline: daysAgo(-10), reason: 'A special gift for my mom.', contributions: [] },
    ],
    },
];

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  for (const userData of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      console.log(`✅ Created auth user: ${userData.email}`);
      const newUser = userCredential.user;

      await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user && user.uid === newUser.uid) {
            unsubscribe();
            console.log(`🔒 Auth state confirmed for ${user.email}. Writing data...`);

            try {
              const batch1 = writeBatch(db);
              const userDocRef = doc(db, 'users', user.uid);
              batch1.set(userDocRef, { 
                achievements: userData.achievements,
                fcmTokens: [] 
              });

              const contributionsToCommit = [];

              for (const goalData of userData.goals) {
                const goalDocRef = doc(collection(db, 'goals'));
                const currentAmount = goalData.contributions.reduce((sum, c) => sum + c.amount, 0);
                
                batch1.set(goalDocRef, {
                  userId: user.uid,
                  goalName: goalData.name,
                  targetAmount: goalData.target,
                  currentAmount: currentAmount,
                  deadline: Timestamp.fromDate(goalData.deadline),
                  goalReason: goalData.reason,
                  imageUrl: `https://placehold.co/600x400/EFE8D8/78716C?text=${goalData.name.replace(/\s+/g, '+')}`,
                  createdAt: Timestamp.fromDate(daysAgo(random(100, 120))),
                  isDeleted: false,
                });

                if (goalData.contributions.length > 0) {
                    contributionsToCommit.push({ goalRef: goalDocRef, contributions: goalData.contributions });
                }
              }
              await batch1.commit();
              console.log(`Phase 1/2: Created users and goals for ${user.email}`);

              if (contributionsToCommit.length > 0) {
                  const batch2 = writeBatch(db);
                  for (const item of contributionsToCommit) {
                      for (const contribution of item.contributions) {
                          const contributionDocRef = doc(collection(item.goalRef, 'contributions'));
                          batch2.set(contributionDocRef, {
                              amount: contribution.amount,
                              date: Timestamp.fromDate(contribution.date),
                          });
                      }
                  }
                  await batch2.commit();
                  console.log(`Phase 2/2: Added contributions for ${user.email}`);
              }

              console.log(`✨ Successfully seeded data for ${user.email}`);
              resolve();
            } catch (writeError) {
              console.error(`❌ Firestore write failed for ${user.email}:`, writeError);
              reject(writeError);
            }
          }
        });
      });

      await signOut(auth);
      console.log(`👋 Signed out ${userData.email}. Ready for next user.`);

    } catch (error) {
       if (error.code === 'auth/email-already-in-use') {
        console.warn(`⚠️ User ${userData.email} already exists. Skipping.`);
      } else {
        console.error(`❌ Failed to process user ${userData.email}:`, error);
      }
      await signOut(auth).catch(() => {});
    }
  }

  console.log('🌳 Database seeding complete!');
};