import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDSAn3XQkywjAW_VIaG9CShfXWQO5ahLaA",
    authDomain: "irctc-53c3a.firebaseapp.com",
    projectId: "irctc-53c3a",
    storageBucket: "irctc-53c3a.firebasestorage.app",
    messagingSenderId: "813262388613",
    appId: "1:813262388613:web:049ac9d907a6a3946498ec",
    measurementId: "G-DZ7XTRXP80"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;