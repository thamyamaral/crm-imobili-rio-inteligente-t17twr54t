import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  PieChart as PieIcon,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Financeiro() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [honoraries, setHonoraries] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      pb.collection('commissions').getFullList({ expand: 'deal', sort: '-created' }),
      pb.collection('honoraries').getFullList({ expand: 'client', sort: '-created' }),
      pb.collection('invoices').getFullList({ sort: '-created' }),
    ])
      .then(([commRes, honRes, invRes]) => {
        setCommissions(commRes)
        setHonoraries(honRes)
        setInvoices(invRes)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalComissoesRecebidas = commissions.reduce(
    (acc, c) => acc + (Number(c.received_total) || 0),
    0,
  )
  const totalComissoesPendentes = commissions.reduce(
    (acc, c) => acc + (Number(c.pending_total) || 0),
    0,
  )
  const totalHonorariosPrevistos = honoraries
    .filter((h) => h.status === 'previsto')
    .reduce((acc, h) => acc + (Number(h.value) || 0), 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-500">Consolidando visão financeira...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gestão Financeira & Comissões
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Controle de comissões por venda, divisão com parceiros/captadores, honorários de mentoria
          e emissão de notas.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Comissões Recebidas
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            R$ {totalComissoesRecebidas.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Liquidado em conta</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Comissões a Receber
          </span>
          <p className="text-2xl font-bold text-teal-800 mt-1 tabular-nums">
            R$ {totalComissoesPendentes.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-teal-600 font-medium">
            Parcelas futuras da construtora
          </span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Honorários Previstos
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1 tabular-nums">
            R$ {totalHonorariosPrevistos.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-blue-600 font-medium">
            Mentoria e assessoria patrimonial
          </span>
        </Card>
      </div>

      {/* Abas */}
      <Tabs defaultValue="comissoes" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="comissoes" className="text-xs font-semibold">
            Cronograma de Comissões
          </TabsTrigger>
          <TabsTrigger value="honorarios" className="text-xs font-semibold">
            Honorários de Mentoria
          </TabsTrigger>
          <TabsTrigger value="divisao" className="text-xs font-semibold">
            Divisão com Parceiros (Split)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comissoes">
          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                Parcelas de Comissão Programadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Negócio</th>
                      <th className="py-2.5 px-3">Pagador</th>
                      <th className="py-2.5 px-3">Valor Total</th>
                      <th className="py-2.5 px-3">Recebido</th>
                      <th className="py-2.5 px-3">Pendente</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {c.expand?.deal?.title || 'Investimento Viva Park'}
                        </td>
                        <td className="py-3 px-3">{c.builder_payer || 'Vokkan Urbanismo'}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          R$ {Number(c.total_value || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-emerald-700 font-semibold">
                          R$ {Number(c.received_total || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-amber-700 font-semibold">
                          R$ {Number(c.pending_total || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px]">
                            Em Andamento
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="honorarios">
          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                Honorários de Assessoria & Mentoria Imobiliária
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3">Serviço Prestado</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">Vencimento</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {honoraries.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {h.expand?.client?.name || 'Dr. Rodrigo Mendonça'}
                        </td>
                        <td className="py-3 px-3">{h.service}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          R$ {Number(h.value || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px]">{h.due_date}</td>
                        <td className="py-3 px-3">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] capitalize">
                            {h.status || 'Previsto'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divisao">
          <Card className="bg-white border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Regras de Divisão & Parcerias Ativas
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrativo de split de comissão configurado para as vendas vigentes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-teal-800">Thata Amaral (Corretora e Mentora)</span>
                <p className="text-slate-600">
                  Percentual: <strong>80% da comissão total</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Atendimento, curadoria e fechamento contratual
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-blue-800">Parceiro / Captação</span>
                <p className="text-slate-600">
                  Percentual: <strong>20% da comissão total</strong>
                </p>
                <p className="text-[11px] text-slate-400">Agenciamento e relacionamento inicial</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
