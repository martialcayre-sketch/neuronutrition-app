import { onAuthStateChanged, User } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';

import { auth } from '../lib/firebase';
import type { UserProfile } from '../lib/types';
import { getCurrentUserProfile } from '../services/userService';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [_user, setUser] = useState<User | null>(null);
  const [_profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(u ? await getCurrentUserProfile() : null);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
