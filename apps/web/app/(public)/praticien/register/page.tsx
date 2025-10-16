'use client';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { auth, db } from '@/lib/firebase/client';

export default function PractitionerRegisterPage() {
  const router = useRouter();
  // Page désactivée: seul le praticien prédéfini peut se connecter.
  if (typeof window !== 'undefined') {
    router.replace('/praticien/login');
  }
  return null;
}
