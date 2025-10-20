"use client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);
  if (!uid) return <p>Veuillez vous connecter.</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Tableau de bord</h2>
      <p>Connecté en tant que {uid}</p>
      <div className="grid gap-3">
        <a className="underline" href="/admin">Espace admin</a>
        <a className="underline" href="#">Questionnaires (HAD/PSQI/DNSM)</a>
        <a className="underline" href="#">Plan 21 jours</a>
      </div>
      <button className="px-3 py-2 border rounded" onClick={() => signOut(auth)}>Se déconnecter</button>
    </div>
  );
}

