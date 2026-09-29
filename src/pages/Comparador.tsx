import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Sparkles,
  Building2,
  Check,
  X,
  Maximize,
  DollarSign,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Comparador() {
  const [properties, setProperties] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('properties')
      .getFullList()
      .then((res) => {
        setProperties(res)
        if (res.length >= 2) {
          setSelectedIds([res[0].id, res[1].id])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedProperties = properties.filter((p) => selectedIds.includes(p.id))

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id))
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id])
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-500">Carregando comparador...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Comparador Executivo de Imóveis (Lado a Lado)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Selecione de 2 a 4 opções para comparar valor por m², condições de pagamento, liquidez e
          potencial de revenda.
        </p>
      </div>

      {/* Seletor Rápido de Imóveis */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-slate-500 font-semibold uppercase text-[10px] my-auto">
          Imóveis Disponíveis:
        </span>
        {properties.map((p) => {
          const isSelected = selectedIds.includes(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggleSelect(p.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.title}
            </button>
          )
        })}
      </div>

      {/* Grid Comparativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedProperties.map((p) => (
          <Card key={p.id} className="bg-white border-slate-200 shadow-xs overflow-hidden">
            <div className="h-40 w-full bg-slate-100 overflow-hidden relative">
              <img
                src={p.images?.[0] || 'https://img.usecurling.com/p/800/600?q=modern%20condo'}
                alt={p.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-white font-bold text-xs">
                R$ {Number(p.price || 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">{p.title}</CardTitle>
              <p className="text-xs text-slate-500">
                {p.city} - {p.bairro}
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Valor do m²:</span>
                <strong>R$ {Number(p.valor_m2 || 0).toLocaleString('pt-BR')}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Área Privativa:</span>
                <strong>{p.area || 0} m²</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Dormitórios / Suítes:</span>
                <strong>
                  {p.dormitorios || 0} dorms ({p.suites || 0} suítes)
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Vagas de Garagem:</span>
                <strong>{p.vagas || 0} vagas</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Correção Contratual:</span>
                <span className="uppercase font-semibold text-teal-700">
                  {p.correction || 'CUB/SC'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Previsão de Entrega:</span>
                <strong>{p.delivery_date || 'Pronto'}</strong>
              </div>
              <div className="pt-2">
                <Button size="sm" className="w-full bg-[#0F766E] text-white text-xs">
                  Apresentar ao Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
