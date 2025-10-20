"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/src/components/RequireAuth";
import { getProfile, upsertProfile } from "@/src/lib/firestore";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  useEffect(() => { (async () => {
    const p = await getProfile().catch(() => null);
    if (p?.displayName) setDisplayName(p.displayName);
  })(); }, []);

  const onSave = async () => {
    setSaved(null);
    await upsertProfile({ displayName });
    setSaved("Enregistré");
  };

  return (
    <RequireAuth>
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-semibold">Profil</h2>
        <input className="w-full border px-3 py-2 rounded" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Nom d’affichage" />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={onSave}>Sauvegarder</button>
        {saved && <p className="text-green-700 text-sm">{saved}</p>}
      </div>
    </RequireAuth>
  );
}

