"use client";
import { useMemo, useState } from 'react'
import Link from 'next/link'
import RequireAuth from '@/src/components/RequireAuth'
import catalog from '@/src/data/questionnaires.catalog.json'
import { addIntake } from '@/src/lib/firestore'

type QField =
  | { type: 'radio'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

type QSchema = { id: string; title: string; fields: QField[]; score?: (payload: Record<string, any>) => Record<string, number> }

// Import detailed schemas/scores when available
import { schema as schemaContextuel } from '@/src/questionnaires/questionnaire-contextuel-mode-de-vie/schema'
import { score as scoreContextuel } from '@/src/questionnaires/questionnaire-contextuel-mode-de-vie/score'
import { schema as schemaSIIN } from '@/src/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin/schema'
import { score as scoreSIIN } from '@/src/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin/score'
import { schema as schemaPlaintes } from '@/src/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis/schema'
import { score as scorePlaintes } from '@/src/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis/score'

// Registry for known schemas (placeholders for 3 questionnaires Mode de vie)
function registry(id: string): QSchema | null {
  if (id === 'questionnaire-contextuel-mode-de-vie') return { ...schemaContextuel, score: scoreContextuel as any }
  if (id === 'questionnaire-dactivite-et-de-depense-energetique-globale-siin' || id === 'questionnaire-dactivite-et-de-depense-energetique-globale-siin-def-pro') return { ...schemaSIIN, id, score: scoreSIIN as any }
  if (id === 'mes-plaintes-actuelles-et-troubles-ressentis') return { ...schemaPlaintes, score: scorePlaintes as any }
  return null
}

function Section({ schema }: { schema: QSchema }) {
  const [payload, setPayload] = useState<Record<string, any>>({})
  const [done, setDone] = useState<string | null>(null)
  const setVal = (id: string, v: any) => setPayload(prev => ({ ...prev, [id]: v }))

  const submit = async () => {
    const score = schema.score ? schema.score(payload) : {}
    await addIntake('QUESTIONNAIRE', { id: schema.id, ...payload, _score: score })
    setDone('Réponses enregistrées. Merci !')
  }

  return (
    <div className="space-y-5">
      {schema.fields.map(f => {
        if (f.type === 'radio') {
          return (
            <div key={f.id}>
              <div className="font-medium mb-2">{f.label}</div>
              <div className="flex flex-wrap gap-2">
                {f.options.map(o => (
                  <button key={o.value} className={`px-3 py-2 rounded border ${payload[f.id]===o.value?'bg-black text-white':'bg-white'}`} onClick={() => setVal(f.id, o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          )
        }
        if (f.type === 'multi') {
          const cur: string[] = payload[f.id] ?? []
          const toggle = (val: string) => setVal(f.id, cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val])
          return (
            <div key={f.id}>
              <div className="font-medium mb-2">{f.label}</div>
              <div className="flex flex-wrap gap-2">
                {f.options.map(o => (
                  <button key={o.value} className={`px-3 py-2 rounded border ${cur.includes(o.value)?'bg-black text-white':'bg-white'}`} onClick={() => toggle(o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          )
        }
        if (f.type === 'likert') {
          const val = Number(payload[f.id] ?? Math.round((f.min+f.max)/2))
          return (
            <div key={f.id}>
              <div className="font-medium mb-2">{f.label}</div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{f.left ?? f.min}</span>
                <input type="range" min={f.min} max={f.max} value={val} onChange={(e)=>setVal(f.id, Number(e.target.value))} className="flex-1" />
                <span className="text-sm text-gray-600">{f.right ?? f.max}</span>
                <span className="inline-block w-10 text-center border rounded py-1">{val}</span>
              </div>
            </div>
          )
        }
        return (
          <div key={f.id}>
            <div className="font-medium mb-2">{f.label}</div>
            <textarea rows={4} className="w-full border rounded px-3 py-2" placeholder={f.placeholder ?? ''} value={payload[f.id]??''} onChange={e=>setVal(f.id, e.target.value)} />
          </div>
        )
      })}
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-black text-white rounded" onClick={submit}>Soumettre</button>
        <Link className="px-3 py-2 border rounded" href="/questionnaires">Retour</Link>
      </div>
      {done && <p className="text-green-700 text-sm">{done}</p>}
    </div>
  )
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const entry = (catalog as any[]).find(e => e.id === id)
  const schema = useMemo(() => registry(id), [id])
  return (
    <RequireAuth>
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">{entry?.label ?? id}</h1>
        {entry?.pdf && <Link className="underline" href={entry.pdf} target="_blank">Télécharger le PDF</Link>}
        {!schema && <p>Formulaire en cours de modélisation. Merci de revenir bientôt.</p>}
        {schema && <Section schema={schema} />}
      </div>
    </RequireAuth>
  )
}
