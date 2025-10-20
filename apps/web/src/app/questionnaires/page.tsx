import Link from 'next/link'
import { defaultCategories, type QuestionnaireCategory } from '@/src/data/questionnaires'

// If a generated JSON exists, you can switch to a dynamic import here.
// Example (optional):
// const categories: QuestionnaireCategory[] = require('@/src/data/questionnaires.generated.json')
//   .categories ?? defaultCategories

export default function QuestionnairesIndexPage() {
  const categories: QuestionnaireCategory[] = defaultCategories
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Questionnaires</h1>
      {categories.map(cat => (
        <section key={cat.id} className="space-y-3">
          <h2 className="text-xl font-semibold">{cat.label}</h2>
          <ul className="list-disc pl-6 space-y-1">
            {cat.items.map(it => (
              <li key={it.id}>
                <Link className="underline" href={it.href}>{it.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

