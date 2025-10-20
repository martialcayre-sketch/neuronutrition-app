"use client";
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getPublicFormByToken, submitPublicResponse } from '@/src/lib/forms'
import catalog from '@/src/data/questionnaires.catalog.json'

type QField =
  | { type: 'radio'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

type QSchema = { id: string; title: string; fields: QField[] }

function registry(id: string): QSchema | null {
  // Reuse minimal schemas from questionnaires route when available
  if (id === 'questionnaire-contextuel-mode-de-vie') return { id, title: 'Questionnaire contextuel mode de vie', fields: [
    { type: 'radio', id: 'rythme', label: 'Rythme hebdomadaire', options: [ { value: 'stable', label: 'Plutôt stable' }, { value: 'variable', label: 'Très variable' } ]},
    { type: 'likert', id: 'stress', label: 'Niveau de stress perçu', min:0, max:10, left:'Faible', right:'Élevé' },
    { type: 'multi', id: 'contraintes', label: 'Contraintes principales', options: [ { value:'horaires', label:'Horaires' }, { value:'deplacements', label:'Déplacements' }, { value:'familiales', label:'Familiales' }, { value:'autres', label:'Autres' } ]},
  ] }
  if (id.startsWith('questionnaire-dactivite-et-de-depense-energetique-globale-siin')) return { id, title: 'Activité et dépense énergétique (SIIN)', fields: [
    { type:'likert', id:'marche', label:'Marche (heures/sem)', min:0, max:20 },
    { type:'likert', id:'sport_moderé', label:'Sport modéré (heures/sem)', min:0, max:20 },
    { type:'likert', id:'sport_intense', label:'Sport intense (heures/sem)', min:0, max:20 },
  ]}
  if (id === 'mes-plaintes-actuelles-et-troubles-ressentis') return { id, title:'Mes plaintes actuelles et troubles ressentis', fields: [
    { type:'multi', id:'troubles', label:'Troubles ressentis', options:[ {value:'douleur',label:'Douleur'},{value:'fatigue',label:'Fatigue'},{value:'sommeil',label:'Sommeil'},{value:'humeur',label:'Humeur'},{value:'autre',label:'Autre'} ] },
    { type:'likert', id:'intensite', label:'Intensité globale', min:0, max:10, left:'Faible', right:'Forte' }
  ]}
  return null
}

export default function PublicFormPage() {
  const params = useParams<{ token: string }>()
  const token = params.token
  const [link, setLink] = useState<any | null>(null)
  const [payload, setPayload] = useState<Record<string, any>>({})
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => { (async () => setLink(await getPublicFormByToken(token)))() }, [token])
  const schema = useMemo(() => link?.questionnaireId ? registry(link.questionnaireId) : null, [link])
  const entry = useMemo(() => (catalog as any[]).find(e => e.id === link?.questionnaireId), [link])

  const setVal = (id: string, v: any) => setPayload(prev => ({ ...prev, [id]: v }))
  const submit = async () => {
    await submitPublicResponse(token, { id: schema?.id, ...payload })
    setDone('Merci, votre réponse a été enregistrée.')
  }

  if (link === null) return <p>Chargement…</p>
  if (!link) return <p>Ce lien n’est pas valide ou a expiré.</p>
  if (!schema) return <p>Formulaire en cours de modélisation.</p>

  return (
    <div className="container mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-semibold">{entry?.label ?? schema.title}</h1>
      <div className="text-sm text-gray-600">Catégorie: {entry?.category}</div>
      {entry?.pdf && <Link className="underline" href={entry.pdf} target="_blank">Télécharger le PDF</Link>}
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
      </div>
      {done && <p className="text-green-700 text-sm">{done}</p>}
    </div>
  )
}

