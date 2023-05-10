import { initializeApp } from 'firebase/app';
import { getAuth, } from 'firebase/auth';
import { getDatabase, } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: "your firebase data here",
  authDomain: "your firebase data here",
  databaseURL: "your firebase data here",
  projectId: "your firebase data here",
  storageBucket: "your firebase data here",
  messagingSenderId: "your firebase data here",
  appId: "your firebase data here"
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getDatabase();
