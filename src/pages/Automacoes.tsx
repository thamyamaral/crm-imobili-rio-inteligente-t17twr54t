import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Clock,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Automacoes() {
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const res = await pb.collection('automations').getFullList({ sort: '-created' })
      setAutomations(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleStatus = async (auto: any) => {
    const nextStatus = auto.status === 'ativo' ? 'inativo' : 'ativo'
    try {
      await pb.collection('automations').update(auto.id, { status: nextStatus })
      toast.success(`Automação ${nextStatus === 'ativo' ? 'ativada' : 'pausada'} com sucesso!`)
      loadData()
    } catch (_) {
      toast.error('Erro ao atualizar automação.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Motor de Automações & Cadências
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluxos inteligentes no modelo QUANDO → SE → ENTÃO e sequências de follow-up com pausa
            automática ao responder.
          </p>
        </div>

        <Button size="sm" className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nova Automação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((a) => (
          <Card key={a.id} className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">{a.name}</CardTitle>
                <p className="text-xs text-slate-500">
                  Gatilho: <strong className="text-teal-700 capitalize">{a.trigger}</strong>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleStatus(a)}
                className={`text-xs h-7 ${
                  a.status === 'ativo'
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                    : 'text-slate-500'
                }`}
              >
                {a.status === 'ativo' ? (
                  <Pause className="w-3 h-3 mr-1" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                {a.status === 'ativo' ? 'Ativo' : 'Pausado'}
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {/* Estrutura Visual QUANDO -> SE -> ENTÃO */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Badge variant="outline" className="text-[10px] bg-white font-bold text-teal-800">
                    QUANDO
                  </Badge>
                  <span className="truncate">Novo contato é cadastrado na base</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Badge variant="outline" className="text-[10px] bg-white font-bold text-blue-800">
                    SE
                  </Badge>
                  <span className="truncate">Origem for "Campanha Meta Ads"</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-white font-bold text-emerald-800"
                  >
                    ENTÃO
                  </Badge>
                  <span className="truncate">Criar negócio no funil + criar tarefa de 15 min</span>
                </div>
              </div>

              {/* Cadência Programada */}
              {a.cadence && a.cadence.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-600" />
                    Cadência de Mensagens Sequenciais:
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-500 pl-4 border-l-2 border-teal-600/40">
                    {a.cadence.map((step: any, idx: number) => (
                      <p key={idx}>
                        • <strong>+{step.delay_hours}h:</strong> {step.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
