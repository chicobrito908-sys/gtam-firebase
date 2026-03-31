"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingConfig.length === 0;

function resolveApp() {
  const safeConfig = {
    apiKey: firebaseConfig.apiKey ?? "pending-api-key",
    authDomain: firebaseConfig.authDomain ?? "pending-auth-domain",
    projectId: firebaseConfig.projectId ?? "pending-project-id",
    storageBucket: firebaseConfig.storageBucket ?? "pending-storage-bucket",
    messagingSenderId: firebaseConfig.messagingSenderId ?? "pending-messaging-sender-id",
    appId: firebaseConfig.appId ?? "pending-app-id",
  };

  return getApps().length ? getApp() : initializeApp(safeConfig);
}

export const firebaseApp = resolveApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Fallback silencioso quando a persistência local não estiver disponível.
});

export type AuthSession = {
  user: {
    id: string;
    email: string | null;
    user_metadata: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
};

export function toSession(user: User | null): AuthSession | null {
  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.uid,
      email: user.email,
      user_metadata: {
        full_name: user.displayName,
        avatar_url: user.photoURL,
      },
    },
  };
}
