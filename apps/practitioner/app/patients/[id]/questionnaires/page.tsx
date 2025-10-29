'use client''use client'



import { useState, useEffect } from 'react'import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'import { useParams } from 'next/navigation'

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

import { db } from '@/lib/firebase'import { db } from '@/lib/firebase'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'import { Badge } from '@/components/ui/badge'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Progress } from '@/components/ui/progress'import { Progress } from '@/components/ui/progress'

import { import { 

  BarChart,   BarChart, 

  Bar,   Bar, 

  XAxis,   XAxis, 

  YAxis,   YAxis, 

  CartesianGrid,   CartesianGrid, 

  Tooltip,   Tooltip, 

  ResponsiveContainer,  ResponsiveContainer,

  RadarChart,  RadarChart,

  PolarGrid,  PolarGrid,

  PolarAngleAxis,  PolarAngleAxis,

  PolarRadiusAxis,  PolarRadiusAxis,

  Radar,  Radar,

  LineChart,  LineChart,

  Line  Line

} from 'recharts'} from 'recharts'

import { Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'import { Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

import { format } from 'date-fns'import { format } from 'date-fns'

import { fr } from 'date-fns/locale'import { fr } from 'date-fns/locale'



interface QuestionnaireResponse {interface QuestionnaireResponse {

  id: string  id: string

  questionnaireId: string  questionnaireId: string

  patientId: string  patientId: string

  responses: Record<string, any>  responses: Record<string, any>

  score?: {  score?: {

    total: number    total: number

    details: Record<string, number>    details: Record<string, number>

    interpretation?: any    interpretation?: any

  }  }

  completedAt: any  completedAt: any

  createdAt: any  createdAt: any

}}



interface Patient {interface Patient {

  id: string  id: string

  email: string  email: string

  firstName?: string  firstName?: string

  lastName?: string  lastName?: string

  dateOfBirth?: string  dateOfBirth?: string

  role: string  role: string

}}



export default function PatientQuestionnairesPage() {export default function PatientQuestionnairesPage() {

  const params = useParams()  const params = useParams()

  const patientId = params.id as string  const patientId = params.id as string

    

  const [patient, setPatient] = useState<Patient | null>(null)  const [patient, setPatient] = useState<Patient | null>(null)

  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])

  const [loading, setLoading] = useState(true)  const [loading, setLoading] = useState(true)

  const [selectedTab, setSelectedTab] = useState('overview')  const [selectedTab, setSelectedTab] = useState('overview')



  useEffect(() => {  useEffect(() => {

    loadPatientData()    loadPatientData()

  }, [patientId])  }, [patientId])



  const loadPatientData = async () => {  const loadPatientData = async () => {

    try {    try {

      // Charger les infos patient      // Charger les infos patient

      const patientDoc = await getDoc(doc(db, 'users', patientId))      const patientDoc = await getDoc(doc(db, 'users', patientId))

      if (patientDoc.exists()) {      if (patientDoc.exists()) {

        setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient)        setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient)

      }      }



      // Charger les réponses questionnaires      // Charger les réponses questionnaires

      const responsesQuery = query(      const responsesQuery = query(

        collection(db, 'questionnaireResponses'),        collection(db, 'questionnaireResponses'),

        where('userId', '==', patientId)        where('userId', '==', patientId)

      )      )

      const responsesSnapshot = await getDocs(responsesQuery)      const responsesSnapshot = await getDocs(responsesQuery)

      const responsesData = responsesSnapshot.docs.map(doc => ({      const responsesData = responsesSnapshot.docs.map(doc => ({

        id: doc.id,        id: doc.id,

        ...doc.data()        ...doc.data()

      })) as QuestionnaireResponse[]      })) as QuestionnaireResponse[]



      // Trier par date de completion (plus récent en premier)      // Trier par date de completion (plus récent en premier)

      responsesData.sort((a, b) =>       responsesData.sort((a, b) => 

        (b.completedAt?.toDate() || b.createdAt?.toDate())?.getTime() -         (b.completedAt?.toDate() || b.createdAt?.toDate())?.getTime() - 

        (a.completedAt?.toDate() || a.createdAt?.toDate())?.getTime()        (a.completedAt?.toDate() || a.createdAt?.toDate())?.getTime()

      )      )



      setResponses(responsesData)      setResponses(responsesData)

    } catch (error) {    } catch (error) {

      console.error('Erreur lors du chargement:', error)      console.error('Erreur lors du chargement:', error)

    } finally {    } finally {

      setLoading(false)      setLoading(false)

    }    }

  }  }



  const getScoreColor = (score: number, maxScore: number = 21) => {  const getScoreColor = (score: number, maxScore: number = 21) => {

    const percentage = (score / maxScore) * 100    const percentage = (score / maxScore) * 100

    if (percentage <= 33) return 'text-green-600'    if (percentage <= 33) return 'text-green-600'

    if (percentage <= 66) return 'text-yellow-600'    if (percentage <= 66) return 'text-yellow-600'

    return 'text-red-600'    return 'text-red-600'

  }  }



  const getScoreBadgeColor = (level: string) => {  const getScoreBadgeColor = (level: string) => {

    switch (level) {    switch (level) {

      case 'low': return 'bg-green-100 text-green-800'      case 'low': return 'bg-green-100 text-green-800'

      case 'moderate': return 'bg-yellow-100 text-yellow-800'      case 'moderate': return 'bg-yellow-100 text-yellow-800'

      case 'high': return 'bg-red-100 text-red-800'      case 'high': return 'bg-red-100 text-red-800'

      case 'severe': return 'bg-red-200 text-red-900'      case 'severe': return 'bg-red-200 text-red-900'

      default: return 'bg-gray-100 text-gray-800'      default: return 'bg-gray-100 text-gray-800'

    }    }

  }  }



  // Préparer les données pour les graphiques  // Préparer les données pour les graphiques

  const hadResponses = responses.filter(r => r.questionnaireId === 'test-echelle-had-def-my-et-pro')  const hadResponses = responses.filter(r => r.questionnaireId === 'test-echelle-had-def-my-et-pro')

  const hadTrendData = hadResponses.map(response => ({  const hadTrendData = hadResponses.map(response => ({

    date: format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'dd/MM', { locale: fr }),    date: format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'dd/MM', { locale: fr }),

    anxiete: response.score?.details?.anxiety || 0,    anxiete: response.score?.details?.anxiety || 0,

    depression: response.score?.details?.depression || 0,    depression: response.score?.details?.depression || 0,

    dateComplete: response.completedAt?.toDate() || response.createdAt?.toDate()    dateComplete: response.completedAt?.toDate() || response.createdAt?.toDate()

  })).reverse() // Plus ancien au plus récent pour la timeline  })).reverse() // Plus ancien au plus récent pour la timeline



  const latestHAD = hadResponses[0]  const latestHAD = hadResponses[0]

  const radarData = latestHAD ? [  const radarData = latestHAD ? [

    { domain: 'Anxiété', score: latestHAD.score?.details?.anxiety || 0, maxScore: 21 },    { domain: 'Anxiété', score: latestHAD.score?.details?.anxiety || 0, maxScore: 21 },

    { domain: 'Dépression', score: latestHAD.score?.details?.depression || 0, maxScore: 21 }    { domain: 'Dépression', score: latestHAD.score?.details?.depression || 0, maxScore: 21 }

  ] : []  ] : []



  if (loading) {  if (loading) {

    return (    return (

      <div className="flex items-center justify-center min-h-screen">      &lt;div className="flex items-center justify-center min-h-screen"&gt;

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>        &lt;div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"&gt;&lt;/div&gt;

      </div>      &lt;/div&gt;

    )    )

  }  }



  return (  return (

    <div className="container mx-auto p-6 space-y-6">    &lt;div className="container mx-auto p-6 space-y-6"&gt;

      {/* En-tête patient */}      {/* En-tête patient */}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">      &lt;div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"&gt;

        <div className="flex items-center justify-between">        &lt;div className="flex items-center justify-between"&gt;

          <div>          &lt;div&gt;

            <h1 className="text-2xl font-bold text-gray-900">            &lt;h1 className="text-2xl font-bold text-gray-900"&gt;

              {patient?.firstName} {patient?.lastName}              {patient?.firstName} {patient?.lastName}

            </h1>            &lt;/h1&gt;

            <p className="text-gray-600">{patient?.email}</p>            &lt;p className="text-gray-600"&gt;{patient?.email}&lt;/p&gt;

            {patient?.dateOfBirth && (            {patient?.dateOfBirth &amp;&amp; (

              <p className="text-sm text-gray-500 mt-1">              &lt;p className="text-sm text-gray-500 mt-1"&gt;

                Né(e) le {format(new Date(patient.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}                Né(e) le {format(new Date(patient.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}

              </p>              &lt;/p&gt;

            )}            )}

          </div>          &lt;/div&gt;

          <div className="text-right">          &lt;div className="text-right"&gt;

            <div className="flex items-center gap-2 text-sm text-gray-600">            &lt;div className="flex items-center gap-2 text-sm text-gray-600"&gt;

              <Calendar className="h-4 w-4" />              &lt;Calendar className="h-4 w-4" /&gt;

              {responses.length} questionnaire{responses.length > 1 ? 's' : ''} complété{responses.length > 1 ? 's' : ''}              {responses.length} questionnaire{responses.length &gt; 1 ? 's' : ''} complété{responses.length &gt; 1 ? 's' : ''}

            </div>            &lt;/div&gt;

          </div>          &lt;/div&gt;

        </div>        &lt;/div&gt;

      </div>      &lt;/div&gt;



      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">      &lt;Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6"&gt;

        <TabsList className="grid w-full grid-cols-4">        &lt;TabsList className="grid w-full grid-cols-4"&gt;

          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>          &lt;TabsTrigger value="overview"&gt;Vue d'ensemble&lt;/TabsTrigger&gt;

          <TabsTrigger value="had">Échelle HAD</TabsTrigger>          &lt;TabsTrigger value="had"&gt;Échelle HAD&lt;/TabsTrigger&gt;

          <TabsTrigger value="timeline">Évolution</TabsTrigger>          &lt;TabsTrigger value="timeline"&gt;Évolution&lt;/TabsTrigger&gt;

          <TabsTrigger value="details">Détails</TabsTrigger>          &lt;TabsTrigger value="details"&gt;Détails&lt;/TabsTrigger&gt;

        </TabsList>        &lt;/TabsList&gt;



        {/* Vue d'ensemble */}        {/* Vue d'ensemble */}

        <TabsContent value="overview" className="space-y-6">        &lt;TabsContent value="overview" className="space-y-6"&gt;

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">          &lt;div className="grid grid-cols-1 md:grid-cols-3 gap-6"&gt;

            {/* Statistiques générales */}            {/* Statistiques générales */}

            <Card>            &lt;Card&gt;

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">              &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;

                <CardTitle className="text-sm font-medium">Total Questionnaires</CardTitle>                &lt;CardTitle className="text-sm font-medium"&gt;Total Questionnaires&lt;/CardTitle&gt;

                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />                &lt;CheckCircle2 className="h-4 w-4 text-muted-foreground" /&gt;

              </CardHeader>              &lt;/CardHeader&gt;

              <CardContent>              &lt;CardContent&gt;

                <div className="text-2xl font-bold">{responses.length}</div>                &lt;div className="text-2xl font-bold"&gt;{responses.length}&lt;/div&gt;

                <p className="text-xs text-muted-foreground">                &lt;p className="text-xs text-muted-foreground"&gt;

                  Dernière completion il y a {responses.length > 0 ?                   Dernière completion il y a {responses.length &gt; 0 ? 

                    Math.ceil((Date.now() - (responses[0].completedAt?.toDate() || responses[0].createdAt?.toDate())?.getTime()) / (1000 * 60 * 60 * 24)) : 0} jour(s)                    Math.ceil((Date.now() - (responses[0].completedAt?.toDate() || responses[0].createdAt?.toDate())?.getTime()) / (1000 * 60 * 60 * 24)) : 0} jour(s)

                </p>                &lt;/p&gt;

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;



            <Card>            &lt;Card&gt;

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">              &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;

                <CardTitle className="text-sm font-medium">Échelles HAD</CardTitle>                &lt;CardTitle className="text-sm font-medium"&gt;Échelles HAD&lt;/CardTitle&gt;

                <TrendingUp className="h-4 w-4 text-muted-foreground" />                &lt;TrendingUp className="h-4 w-4 text-muted-foreground" /&gt;

              </CardHeader>              &lt;/CardHeader&gt;

              <CardContent>              &lt;CardContent&gt;

                <div className="text-2xl font-bold">{hadResponses.length}</div>                &lt;div className="text-2xl font-bold"&gt;{hadResponses.length}&lt;/div&gt;

                <p className="text-xs text-muted-foreground">                &lt;p className="text-xs text-muted-foreground"&gt;

                  Évaluations anxiété/dépression                  Évaluations anxiété/dépression

                </p>                &lt;/p&gt;

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;



            <Card>            &lt;Card&gt;

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">              &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;

                <CardTitle className="text-sm font-medium">Dernier Score HAD</CardTitle>                &lt;CardTitle className="text-sm font-medium"&gt;Dernier Score HAD&lt;/CardTitle&gt;

                <AlertCircle className="h-4 w-4 text-muted-foreground" />                &lt;AlertCircle className="h-4 w-4 text-muted-foreground" /&gt;

              </CardHeader>              &lt;/CardHeader&gt;

              <CardContent>              &lt;CardContent&gt;

                {latestHAD ? (                {latestHAD ? (

                  <>                  &lt;&gt;

                    <div className="text-2xl font-bold">{latestHAD.score?.total || 0}/42</div>                    &lt;div className="text-2xl font-bold"&gt;{latestHAD.score?.total || 0}/42&lt;/div&gt;

                    <div className="flex gap-2 mt-2">                    &lt;div className="flex gap-2 mt-2"&gt;

                      <Badge className={getScoreBadgeColor(latestHAD.score?.interpretation?.anxiety?.level || 'low')}>                      &lt;Badge className={getScoreBadgeColor(latestHAD.score?.interpretation?.anxiety?.level || 'low')}&gt;

                        A: {latestHAD.score?.details?.anxiety || 0}                        A: {latestHAD.score?.details?.anxiety || 0}

                      </Badge>                      &lt;/Badge&gt;

                      <Badge className={getScoreBadgeColor(latestHAD.score?.interpretation?.depression?.level || 'low')}>                      &lt;Badge className={getScoreBadgeColor(latestHAD.score?.interpretation?.depression?.level || 'low')}&gt;

                        D: {latestHAD.score?.details?.depression || 0}                        D: {latestHAD.score?.details?.depression || 0}

                      </Badge>                      &lt;/Badge&gt;

                    </div>                    &lt;/div&gt;

                  </>                  &lt;/&gt;

                ) : (                ) : (

                  <div className="text-2xl font-bold text-gray-400">N/A</div>                  &lt;div className="text-2xl font-bold text-gray-400"&gt;N/A&lt;/div&gt;

                )}                )}

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;

          </div>          &lt;/div&gt;



          {/* Graphique radar du dernier HAD */}          {/* Graphique radar du dernier HAD */}

          {latestHAD && (          {latestHAD &amp;&amp; (

            <Card>            &lt;Card&gt;

              <CardHeader>              &lt;CardHeader&gt;

                <CardTitle>Profil Psychologique Actuel</CardTitle>                &lt;CardTitle&gt;Profil Psychologique Actuel&lt;/CardTitle&gt;

                <CardDescription>                &lt;CardDescription&gt;

                  Basé sur la dernière évaluation HAD du {format(latestHAD.completedAt?.toDate() || latestHAD.createdAt?.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}                  Basé sur la dernière évaluation HAD du {format(latestHAD.completedAt?.toDate() || latestHAD.createdAt?.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}

                </CardDescription>                &lt;/CardDescription&gt;

              </CardHeader>              &lt;/CardHeader&gt;

              <CardContent>              &lt;CardContent&gt;

                <div className="h-80">                &lt;div className="h-80"&gt;

                  <ResponsiveContainer width="100%" height="100%">                  &lt;ResponsiveContainer width="100%" height="100%"&gt;

                    <RadarChart data={radarData}>                    &lt;RadarChart data={radarData}&gt;

                      <PolarGrid />                      &lt;PolarGrid /&gt;

                      <PolarAngleAxis dataKey="domain" />                      &lt;PolarAngleAxis dataKey="domain" /&gt;

                      <PolarRadiusAxis angle={90} domain={[0, 21]} tick={false} />                      &lt;PolarRadiusAxis angle={90} domain={[0, 21]} tick={false} /&gt;

                      <Radar                      &lt;Radar

                        name="Score"                        name="Score"

                        dataKey="score"                        dataKey="score"

                        stroke="#3b82f6"                        stroke="#3b82f6"

                        fill="#3b82f6"                        fill="#3b82f6"

                        fillOpacity={0.3}                        fillOpacity={0.3}

                        strokeWidth={2}                        strokeWidth={2}

                      />                      /&gt;

                      <Tooltip                       &lt;Tooltip 

                        formatter={(value: any, name: string) => [`${value}/21`, 'Score']}                        formatter={(value: any, name: string) =&gt; [`${value}/21`, 'Score']}

                        labelFormatter={(label: string) => `${label}`}                        labelFormatter={(label: string) =&gt; `${label}`}

                      />                      /&gt;

                    </RadarChart>                    &lt;/RadarChart&gt;

                  </ResponsiveContainer>                  &lt;/ResponsiveContainer&gt;

                </div>                &lt;/div&gt;

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;

          )}          )}

        </TabsContent>        &lt;/TabsContent&gt;



        {/* Onglet HAD détaillé */}        {/* Onglet HAD détaillé */}

        <TabsContent value="had" className="space-y-6">        &lt;TabsContent value="had" className="space-y-6"&gt;

          {hadResponses.length === 0 ? (          {hadResponses.length === 0 ? (

            <Card>            &lt;Card&gt;

              <CardContent className="text-center py-12">              &lt;CardContent className="text-center py-12"&gt;

                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />                &lt;AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" /&gt;

                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation HAD</h3>                &lt;h3 className="text-lg font-medium text-gray-900 mb-2"&gt;Aucune évaluation HAD&lt;/h3&gt;

                <p className="text-gray-600">Ce patient n'a pas encore complété d'échelle HAD.</p>                &lt;p className="text-gray-600"&gt;Ce patient n'a pas encore complété d'échelle HAD.&lt;/p&gt;

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;

          ) : (          ) : (

            <>            &lt;&gt;

              {/* Dernière évaluation détaillée */}              {/* Dernière évaluation détaillée */}

              <Card>              &lt;Card&gt;

                <CardHeader>                &lt;CardHeader&gt;

                  <CardTitle>Dernière Évaluation HAD</CardTitle>                  &lt;CardTitle&gt;Dernière Évaluation HAD&lt;/CardTitle&gt;

                  <CardDescription>                  &lt;CardDescription&gt;

                    Complétée le {format(latestHAD.completedAt?.toDate() || latestHAD.createdAt?.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}                    Complétée le {format(latestHAD.completedAt?.toDate() || latestHAD.createdAt?.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}

                  </CardDescription>                  &lt;/CardDescription&gt;

                </CardHeader>                &lt;/CardHeader&gt;

                <CardContent className="space-y-6">                &lt;CardContent className="space-y-6"&gt;

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                  &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-6"&gt;

                    {/* Anxiété */}                    {/* Anxiété */}

                    <div className="space-y-3">                    &lt;div className="space-y-3"&gt;

                      <div className="flex items-center justify-between">                      &lt;div className="flex items-center justify-between"&gt;

                        <h4 className="font-medium">Anxiété</h4>                        &lt;h4 className="font-medium"&gt;Anxiété&lt;/h4&gt;

                        <span className={`text-lg font-bold ${getScoreColor(latestHAD.score?.details?.anxiety || 0)}`}>                        &lt;span className={`text-lg font-bold ${getScoreColor(latestHAD.score?.details?.anxiety || 0)}`}&gt;

                          {latestHAD.score?.details?.anxiety || 0}/21                          {latestHAD.score?.details?.anxiety || 0}/21

                        </span>                        &lt;/span&gt;

                      </div>                      &lt;/div&gt;

                      <Progress                       &lt;Progress 

                        value={(latestHAD.score?.details?.anxiety || 0) / 21 * 100}                         value={(latestHAD.score?.details?.anxiety || 0) / 21 * 100} 

                        className="h-2"                        className="h-2"

                      />                      /&gt;

                      {latestHAD.score?.interpretation?.anxiety && (                      {latestHAD.score?.interpretation?.anxiety &amp;&amp; (

                        <div className="bg-gray-50 p-3 rounded-lg">                        &lt;div className="bg-gray-50 p-3 rounded-lg"&gt;

                          <div className="flex items-center gap-2 mb-1">                          &lt;div className="flex items-center gap-2 mb-1"&gt;

                            <Badge className={getScoreBadgeColor(latestHAD.score.interpretation.anxiety.level)}>                            &lt;Badge className={getScoreBadgeColor(latestHAD.score.interpretation.anxiety.level)}&gt;

                              {latestHAD.score.interpretation.anxiety.label}                              {latestHAD.score.interpretation.anxiety.label}

                            </Badge>                            &lt;/Badge&gt;

                          </div>                          &lt;/div&gt;

                          <p className="text-sm text-gray-600">                          &lt;p className="text-sm text-gray-600"&gt;

                            {latestHAD.score.interpretation.anxiety.description}                            {latestHAD.score.interpretation.anxiety.description}

                          </p>                          &lt;/p&gt;

                        </div>                        &lt;/div&gt;

                      )}                      )}

                    </div>                    &lt;/div&gt;



                    {/* Dépression */}                    {/* Dépression */}

                    <div className="space-y-3">                    &lt;div className="space-y-3"&gt;

                      <div className="flex items-center justify-between">                      &lt;div className="flex items-center justify-between"&gt;

                        <h4 className="font-medium">Dépression</h4>                        &lt;h4 className="font-medium"&gt;Dépression&lt;/h4&gt;

                        <span className={`text-lg font-bold ${getScoreColor(latestHAD.score?.details?.depression || 0)}`}>                        &lt;span className={`text-lg font-bold ${getScoreColor(latestHAD.score?.details?.depression || 0)}`}&gt;

                          {latestHAD.score?.details?.depression || 0}/21                          {latestHAD.score?.details?.depression || 0}/21

                        </span>                        &lt;/span&gt;

                      </div>                      &lt;/div&gt;

                      <Progress                       &lt;Progress 

                        value={(latestHAD.score?.details?.depression || 0) / 21 * 100}                         value={(latestHAD.score?.details?.depression || 0) / 21 * 100} 

                        className="h-2"                        className="h-2"

                      />                      /&gt;

                      {latestHAD.score?.interpretation?.depression && (                      {latestHAD.score?.interpretation?.depression &amp;&amp; (

                        <div className="bg-gray-50 p-3 rounded-lg">                        &lt;div className="bg-gray-50 p-3 rounded-lg"&gt;

                          <div className="flex items-center gap-2 mb-1">                          &lt;div className="flex items-center gap-2 mb-1"&gt;

                            <Badge className={getScoreBadgeColor(latestHAD.score.interpretation.depression.level)}>                            &lt;Badge className={getScoreBadgeColor(latestHAD.score.interpretation.depression.level)}&gt;

                              {latestHAD.score.interpretation.depression.label}                              {latestHAD.score.interpretation.depression.label}

                            </Badge>                            &lt;/Badge&gt;

                          </div>                          &lt;/div&gt;

                          <p className="text-sm text-gray-600">                          &lt;p className="text-sm text-gray-600"&gt;

                            {latestHAD.score.interpretation.depression.description}                            {latestHAD.score.interpretation.depression.description}

                          </p>                          &lt;/p&gt;

                        </div>                        &lt;/div&gt;

                      )}                      )}

                    </div>                    &lt;/div&gt;

                  </div>                  &lt;/div&gt;

                </CardContent>                &lt;/CardContent&gt;

              </Card>              &lt;/Card&gt;



              {/* Historique HAD */}              {/* Historique HAD */}

              {hadResponses.length > 1 && (              {hadResponses.length &gt; 1 &amp;&amp; (

                <Card>                &lt;Card&gt;

                  <CardHeader>                  &lt;CardHeader&gt;

                    <CardTitle>Historique des Évaluations HAD</CardTitle>                    &lt;CardTitle&gt;Historique des Évaluations HAD&lt;/CardTitle&gt;

                    <CardDescription>{hadResponses.length} évaluations complétées</CardDescription>                    &lt;CardDescription&gt;{hadResponses.length} évaluations complétées&lt;/CardDescription&gt;

                  </CardHeader>                  &lt;/CardHeader&gt;

                  <CardContent>                  &lt;CardContent&gt;

                    <div className="space-y-4">                    &lt;div className="space-y-4"&gt;

                      {hadResponses.slice(1).map((response, index) => (                      {hadResponses.slice(1).map((response, index) =&gt; (

                        <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">                        &lt;div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"&gt;

                          <div>                          &lt;div&gt;

                            <div className="font-medium">                            &lt;div className="font-medium"&gt;

                              {format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'dd MMMM yyyy', { locale: fr })}                              {format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'dd MMMM yyyy', { locale: fr })}

                            </div>                            &lt;/div&gt;

                            <div className="text-sm text-gray-600">                            &lt;div className="text-sm text-gray-600"&gt;

                              {format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'HH:mm', { locale: fr })}                              {format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'HH:mm', { locale: fr })}

                            </div>                            &lt;/div&gt;

                          </div>                          &lt;/div&gt;

                          <div className="flex gap-4 items-center">                          &lt;div className="flex gap-4 items-center"&gt;

                            <div className="text-center">                            &lt;div className="text-center"&gt;

                              <div className="text-sm text-gray-600">Anxiété</div>                              &lt;div className="text-sm text-gray-600"&gt;Anxiété&lt;/div&gt;

                              <div className={`font-bold ${getScoreColor(response.score?.details?.anxiety || 0)}`}>                              &lt;div className={`font-bold ${getScoreColor(response.score?.details?.anxiety || 0)}`}&gt;

                                {response.score?.details?.anxiety || 0}                                {response.score?.details?.anxiety || 0}

                              </div>                              &lt;/div&gt;

                            </div>                            &lt;/div&gt;

                            <div className="text-center">                            &lt;div className="text-center"&gt;

                              <div className="text-sm text-gray-600">Dépression</div>                              &lt;div className="text-sm text-gray-600"&gt;Dépression&lt;/div&gt;

                              <div className={`font-bold ${getScoreColor(response.score?.details?.depression || 0)}`}>                              &lt;div className={`font-bold ${getScoreColor(response.score?.details?.depression || 0)}`}&gt;

                                {response.score?.details?.depression || 0}                                {response.score?.details?.depression || 0}

                              </div>                              &lt;/div&gt;

                            </div>                            &lt;/div&gt;

                            <div className="text-center">                            &lt;div className="text-center"&gt;

                              <div className="text-sm text-gray-600">Total</div>                              &lt;div className="text-sm text-gray-600"&gt;Total&lt;/div&gt;

                              <div className="font-bold">{response.score?.total || 0}</div>                              &lt;div className="font-bold"&gt;{response.score?.total || 0}&lt;/div&gt;

                            </div>                            &lt;/div&gt;

                          </div>                          &lt;/div&gt;

                        </div>                        &lt;/div&gt;

                      ))}                      ))}

                    </div>                    &lt;/div&gt;

                  </CardContent>                  &lt;/CardContent&gt;

                </Card>                &lt;/Card&gt;

              )}              )}

            </>            &lt;/&gt;

          )}          )}

        </TabsContent>        &lt;/TabsContent&gt;



        {/* Onglet évolution temporelle */}        {/* Onglet évolution temporelle */}

        <TabsContent value="timeline" className="space-y-6">        &lt;TabsContent value="timeline" className="space-y-6"&gt;

          {hadTrendData.length > 1 ? (          {hadTrendData.length &gt; 1 ? (

            <Card>            &lt;Card&gt;

              <CardHeader>              &lt;CardHeader&gt;

                <CardTitle>Évolution des Scores HAD</CardTitle>                &lt;CardTitle&gt;Évolution des Scores HAD&lt;/CardTitle&gt;

                <CardDescription>Suivi temporel de l'anxiété et de la dépression</CardDescription>                &lt;CardDescription&gt;Suivi temporel de l'anxiété et de la dépression&lt;/CardDescription&gt;

              </CardHeader>              &lt;/CardHeader&gt;

              <CardContent>              &lt;CardContent&gt;

                <div className="h-80">                &lt;div className="h-80"&gt;

                  <ResponsiveContainer width="100%" height="100%">                  &lt;ResponsiveContainer width="100%" height="100%"&gt;

                    <LineChart data={hadTrendData}>                    &lt;LineChart data={hadTrendData}&gt;

                      <CartesianGrid strokeDasharray="3 3" />                      &lt;CartesianGrid strokeDasharray="3 3" /&gt;

                      <XAxis dataKey="date" />                      &lt;XAxis dataKey="date" /&gt;

                      <YAxis domain={[0, 21]} />                      &lt;YAxis domain={[0, 21]} /&gt;

                      <Tooltip                       &lt;Tooltip 

                        formatter={(value: any, name: string) => [value, name === 'anxiete' ? 'Anxiété' : 'Dépression']}                        formatter={(value: any, name: string) =&gt; [value, name === 'anxiete' ? 'Anxiété' : 'Dépression']}

                        labelFormatter={(label: string) => `Date: ${label}`}                        labelFormatter={(label: string) =&gt; `Date: ${label}`}

                      />                      /&gt;

                      <Line                       &lt;Line 

                        type="monotone"                         type="monotone" 

                        dataKey="anxiete"                         dataKey="anxiete" 

                        stroke="#f59e0b"                         stroke="#f59e0b" 

                        strokeWidth={2}                        strokeWidth={2}

                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}

                        name="Anxiété"                        name="Anxiété"

                      />                      /&gt;

                      <Line                       &lt;Line 

                        type="monotone"                         type="monotone" 

                        dataKey="depression"                         dataKey="depression" 

                        stroke="#3b82f6"                         stroke="#3b82f6" 

                        strokeWidth={2}                        strokeWidth={2}

                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}

                        name="Dépression"                        name="Dépression"

                      />                      /&gt;

                    </LineChart>                    &lt;/LineChart&gt;

                  </ResponsiveContainer>                  &lt;/ResponsiveContainer&gt;

                </div>                &lt;/div&gt;

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;

          ) : (          ) : (

            <Card>            &lt;Card&gt;

              <CardContent className="text-center py-12">              &lt;CardContent className="text-center py-12"&gt;

                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />                &lt;TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" /&gt;

                <h3 className="text-lg font-medium text-gray-900 mb-2">Pas assez de données</h3>                &lt;h3 className="text-lg font-medium text-gray-900 mb-2"&gt;Pas assez de données&lt;/h3&gt;

                <p className="text-gray-600">Au moins 2 évaluations sont nécessaires pour afficher l'évolution.</p>                &lt;p className="text-gray-600"&gt;Au moins 2 évaluations sont nécessaires pour afficher l'évolution.&lt;/p&gt;

              </CardContent>              &lt;/CardContent&gt;

            </Card>            &lt;/Card&gt;

          )}          )}

        </TabsContent>        &lt;/TabsContent&gt;



        {/* Détails complets */}        {/* Détails complets */}

        <TabsContent value="details" className="space-y-6">        &lt;TabsContent value="details" className="space-y-6"&gt;

          <div className="space-y-4">          &lt;div className="space-y-4"&gt;

            {responses.map((response) => (            {responses.map((response) =&gt; (

              <Card key={response.id}>              &lt;Card key={response.id}&gt;

                <CardHeader>                &lt;CardHeader&gt;

                  <div className="flex items-center justify-between">                  &lt;div className="flex items-center justify-between"&gt;

                    <div>                    &lt;div&gt;

                      <CardTitle className="text-lg">{response.questionnaireId}</CardTitle>                      &lt;CardTitle className="text-lg"&gt;{response.questionnaireId}&lt;/CardTitle&gt;

                      <CardDescription>                      &lt;CardDescription&gt;

                        Complété le {format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}                        Complété le {format(response.completedAt?.toDate() || response.createdAt?.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}

                      </CardDescription>                      &lt;/CardDescription&gt;

                    </div>                    &lt;/div&gt;

                    {response.score && (                    {response.score &amp;&amp; (

                      <div className="text-right">                      &lt;div className="text-right"&gt;

                        <div className="text-2xl font-bold">{response.score.total}</div>                        &lt;div className="text-2xl font-bold"&gt;{response.score.total}&lt;/div&gt;

                        <div className="text-sm text-gray-600">Score total</div>                        &lt;div className="text-sm text-gray-600"&gt;Score total&lt;/div&gt;

                      </div>                      &lt;/div&gt;

                    )}                    )}

                  </div>                  &lt;/div&gt;

                </CardHeader>                &lt;/CardHeader&gt;

                <CardContent>                &lt;CardContent&gt;

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4"&gt;

                    {Object.entries(response.responses).map(([key, value]) => (                    {Object.entries(response.responses).map(([key, value]) =&gt; (

                      <div key={key} className="bg-gray-50 p-3 rounded">                      &lt;div key={key} className="bg-gray-50 p-3 rounded"&gt;

                        <div className="font-medium text-sm text-gray-600">{key}</div>                        &lt;div className="font-medium text-sm text-gray-600"&gt;{key}&lt;/div&gt;

                        <div className="text-sm">{String(value)}</div>                        &lt;div className="text-sm"&gt;{String(value)}&lt;/div&gt;

                      </div>                      &lt;/div&gt;

                    ))}                    ))}

                  </div>                  &lt;/div&gt;

                </CardContent>                &lt;/CardContent&gt;

              </Card>              &lt;/Card&gt;

            ))}            ))}

          </div>          &lt;/div&gt;

        </TabsContent>        &lt;/TabsContent&gt;

      </Tabs>      &lt;/Tabs&gt;

    </div>    &lt;/div&gt;

  )  )

}}
