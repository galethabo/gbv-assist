// test-firebase.js
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection for gbv1-27388...');
    
    // Test Firestore
    await setDoc(doc(db, 'test', 'connection_test'), {
      timestamp: new Date(),
      project: 'gbv1-27388',
      status: 'connected'
    });
    console.log('✅ Firestore test passed');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

// Test authentication (only if enabled)
export const testAuthConnection = async () => {
  try {
    console.log('Testing Authentication...');
    // Just check if auth object is available
    if (auth) {
      console.log('✅ Auth service available');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
};