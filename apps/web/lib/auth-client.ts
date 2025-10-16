'use client';
import { auth, db } from './firebase/client';
import {
  signInWithEmailAndPassword,
  sendEmailVerification as clientSendEmailVerification,
} from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { cookies } from 'next/headers';

async function getEmailByUsername(username: string): Promise<string | null> {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data() as any;
  return data.email ?? null;
}

export async function signInWithEmailOrUsername(identifier: string, password: string) {
  const isEmail = /@/.test(identifier);
  const email = isEmail ? identifier : ((await getEmailByUsername(identifier)) ?? identifier);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  // set cookie via simple fetch to a helper endpoint if needed
  await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return cred;
}

export async function sendEmailVerification() {
  if (!auth.currentUser) throw new Error('No current user');
  await clientSendEmailVerification(auth.currentUser);
}
