import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnlrnyof8soV1_yYSCUEVhDHK21yUiTb4",
  authDomain: "registropresenze-d3e75.firebaseapp.com",
  databaseURL: "https://registropresenze-d3e75-default-rtdb.firebaseio.com",
  projectId: "registropresenze-d3e75",
  storageBucket: "registropresenze-d3e75.firebasestorage.app",
  messagingSenderId: "1029731967976",
  appId: "1:1029731967976:web:7b588f8f83e1437e01ba5d",
  measurementId: "G-RPKRT43WGJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);