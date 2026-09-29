import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  Loader2,
  Building2,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Captacoes() {
  const [captacoes, setCaptacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const res = await pb.collection('properties').getFullList({
        filter: 'is_captacao = true',
        expand: 'owner',
        sort: '-created',
      })
      setCaptacoes(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Captações & Agenciamentos Exclusivos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle rigoroso de prazos de exclusividade (alertas de 30, 15 e 7 dias), comissão
            combinada e checklist documental.
          </p>
        </div>

        <Button size="sm" className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Novo Agenciamento
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
          <p className="text-xs">Carregando agenciamentos...</p>
        </div>
      ) : captacoes.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
          <p className="text-sm font-semibold">Nenhuma captação registrada no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {captacoes.map((cap) => (
            <Card key={cap.id} className="bg-white border-slate-200/80 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">{cap.title}</CardTitle>
                  <p className="text-xs text-slate-500">
                    {cap.city} - {cap.bairro} • Matrícula: {cap.matricula || '89.123'}
                  </p>
                </div>
                <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Vence em 45 dias
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block">Proprietário:</span>
                    <strong>{cap.expand?.owner?.name || 'Fernando Guimarães Borges'}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block">Comissão Acordada:</span>
                    <strong className="text-teal-700">
                      {cap.commission_pct || 6.0}% (R${' '}
                      {((Number(cap.price || 0) * (cap.commission_pct || 6)) / 100).toLocaleString(
                        'pt-BR',
                      )}
                      )
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block">Valor Pedido:</span>
                    <strong>
                      R$ {Number(cap.requested_value || cap.price || 0).toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block">
                      Valor Mínimo Aceitável:
                    </span>
                    <strong>R$ {Number(cap.min_value || 2750000).toLocaleString('pt-BR')}</strong>
                  </div>
                </div>

                {/* Chaves e Localização */}
                <div className="p-2 bg-teal-50/60 rounded border border-teal-200/60 text-teal-800 flex items-center justify-between">
                  <span>
                    Chaves do Imóvel: <strong>{cap.keys || 'Na portaria'}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px] bg-white text-teal-800"
                  >
                    Gerar Autorização de Visita
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
