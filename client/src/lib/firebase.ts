import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCPmcb1r2o39RSvqqFes5r_xwlf4kdcLUU",
  authDomain: "multi-level-b5601.firebaseapp.com",
  projectId: "multi-level-b5601",
  storageBucket: "multi-level-b5601.appspot.com", // Corrected storage bucket
  messagingSenderId: "25101586540",
  appId: "1:25101586540:web:ef64543c3ffb8f9008c849",
  measurementId: "G-HQ7PR8CB35"
};

// Initialize Firebase only if no apps exist
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Sign-in to select account every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with email/password
export async function signInWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Send the Firebase token to our backend to establish a session
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      credentials: 'include',
      body: JSON.stringify({ username: email })
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with server');
    }

    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in with email/password", error);
    throw error;
  }
}

// Register with email/password
export async function registerWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return userCredential.user;
  } catch (error: any) {
    console.error("Error registering with email/password", error);
    throw error;
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Get the referral code from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');

    // Send the Google user data to our backend
    const response = await fetch(`/api/login/google${referralCode ? `?ref=${referralCode}` : ''}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with server");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

// Initialize auth state observer
export function initAuthStateObserver(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

export { auth, analytics };
