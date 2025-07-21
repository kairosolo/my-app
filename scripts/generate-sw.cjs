const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const swTemplatePath = path.resolve(__dirname, '../public/firebase-messaging-sw.js');

const swPublicOutputPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js'); 

const swDistOutputPath = path.resolve(__dirname, '../dist/firebase-messaging-sw.js'); 

let swContent = fs.readFileSync(swTemplatePath, 'utf8');

swContent = swContent.replace(/__VITE_FIREBASE_API_KEY__/g, process.env.VITE_FIREBASE_API_KEY || ''); 
swContent = swContent.replace(/__VITE_FIREBASE_AUTH_DOMAIN__/g, process.env.VITE_FIREBASE_AUTH_DOMAIN || '');
swContent = swContent.replace(/__VITE_FIREBASE_PROJECT_ID__/g, process.env.VITE_FIREBASE_PROJECT_ID || '');
swContent = swContent.replace(/__VITE_FIREBASE_STORAGE_BUCKET__/g, process.env.VITE_FIREBASE_STORAGE_BUCKET || '');
swContent = swContent.replace(/__VITE_FIREBASE_MESSAGING_SENDER_ID__/g, process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '');
swContent = swContent.replace(/__VITE_FIREBASE_APP_ID__/g, process.env.VITE_FIREBASE_APP_ID || '');
swContent = swContent.replace(/__VITE_FIREBASE_MEASUREMENT_ID__/g, process.env.VITE_FIREBASE_MEASUREMENT_ID || '');

const distDir = path.dirname(swDistOutputPath);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(swPublicOutputPath, swContent);

fs.writeFileSync(swDistOutputPath, swContent);

console.log('Firebase Messaging Service Worker generated with environment variables.');