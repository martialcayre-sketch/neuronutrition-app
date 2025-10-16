/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useMemo, useState } from 'react';

import Button from '../components/ui/Button';
import { auth, db, functions } from '../lib/firebase';

type Practitioner = { uid: string; email: string; displayName?: string };

export default function AdminDebug() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPatients, setPendingPatients] = useState<any[]>([]);
  const [manualPatientUid, setManualPatientUid] = useState('');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setCurrentUser(u);
      try {
        if (u) {
          const snap = await getDoc(doc(db, 'users', u.uid));
          setProfile(snap.exists() ? snap.data() : null);
        } else {
          setProfile(null);
        }
        const res = await getDocs(collection(db, 'users'));
        const list = res.docs
          .map((d) => ({ uid: d.id, ...(d.data() as any) }))
          .filter((x: any) => x.role === 'practitioner') as Practitioner[];
        setPractitioners(list);

        // Load pending patients assigned to current practitioner
        if (u) {
          const qPending = query(
            collection(db, 'users'),
            where('role', '==', 'patient'),
            where('chosenPractitionerId', '==', u.uid),
            where('approvalStatus', '==', 'pending')
          );
          const resPending = await getDocs(qPending);
          setPendingPatients(resPending.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
        } else {
          setPendingPatients([]);
        }
      } catch (e: any) {
        setError(e.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const canApprove = useMemo(
    () => !!currentUser && profile?.role === 'practitioner',
    [currentUser, profile]
  );

  async function approve(patientUid: string, decision: 'approved' | 'rejected') {
    setError(null);
    try {
      const fn = httpsCallable(functions as any, 'approvePatient');
      await fn({ patientUid, decision });
      // Refresh pending list
      if (currentUser) {
        const qPending = query(
          collection(db, 'users'),
          where('role', '==', 'patient'),
          where('chosenPractitionerId', '==', currentUser.uid),
          where('approvalStatus', '==', 'pending')
        );
        const resPending = await getDocs(qPending);
        setPendingPatients(resPending.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'approbation");
    }
  }

  if (loading) return <div className="p-4">Chargement…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Admin Debug</h1>

      <section className="space-y-2">
        <h2 className="font-medium">Auth courant</h2>
        {currentUser ? (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(
              {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                emailVerified: currentUser.emailVerified,
              },
              null,
              2
            )}
          </pre>
        ) : (
          <p className="text-sm">Aucun utilisateur connecté</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Profil Firestore</h2>
        {profile ? (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <p className="text-sm">Aucun profil chargé</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Liste des praticiens</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(practitioners, null, 2)}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Patients en attente (assignés à moi)</h2>
        {canApprove ? (
          <div className="space-y-3">
            {pendingPatients.length === 0 ? (
              <p className="text-sm text-gray-600">Aucun patient en attente.</p>
            ) : (
              <ul className="space-y-2">
                {pendingPatients.map((p) => (
                  <li
                    key={p.uid}
                    className="border rounded p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{p.displayName || p.email || p.uid}</div>
                      <div className="text-xs text-gray-600">{p.uid}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => approve(p.uid, 'approved')}>Approuver</Button>
                      <Button variant="secondary" onClick={() => approve(p.uid, 'rejected')}>
                        Rejeter
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="border rounded p-3 space-y-2">
              <div className="text-sm font-medium">Approbation manuelle par UID</div>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="UID du patient"
                value={manualPatientUid}
                onChange={(e) => setManualPatientUid(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  disabled={!manualPatientUid}
                  onClick={() => approve(manualPatientUid, 'approved')}
                >
                  Approuver
                </Button>
                <Button
                  disabled={!manualPatientUid}
                  variant="secondary"
                  onClick={() => approve(manualPatientUid, 'rejected')}
                >
                  Rejeter
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Connectez-vous en tant que praticien pour approuver des patients.
          </p>
        )}
      </section>

      <div className="flex gap-2">
        <Button onClick={() => auth.signOut()}>Se déconnecter</Button>
      </div>
    </div>
  );
}
