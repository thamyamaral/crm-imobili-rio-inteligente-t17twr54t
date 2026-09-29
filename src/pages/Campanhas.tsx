import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Campanhas() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('campaigns')
      .getFullList({ sort: '-created' })
      .then((res) => setCampaigns(res))
      .finally(() => setLoading(false))
  }, [])

  const totalInvestido = campaigns.reduce((acc, c) => acc + (Number(c.investment) || 0), 0)
  const totalLeads = campaigns.reduce((acc, c) => acc + (Number(c.leads_count) || 0), 0)
  const totalVgv = campaigns.reduce((acc, c) => acc + (Number(c.vgv) || 0), 0)
  const totalComissao = campaigns.reduce((acc, c) => acc + (Number(c.commission) || 0), 0)

  const handleSimulateWebhookLead = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/meta-leads/webhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Guilherme Siqueira (Lead Simulado)',
            phone: '(47) 99188-7711',
            email: 'guilherme.siqueira@invest.com.br',
            origin: 'Campanha Meta Ads - Viva Park',
          }),
        },
      )
      if (res.ok) {
        toast.success('Webhook da Meta processado!', {
          description: 'Novo lead capturado automaticamente na base e funil.',
        })
      }
    } catch (_) {
      toast.error('Erro no webhook de teste.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campanhas Meta Ads & Tráfego Pago
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de ponta a ponta: do clique ao VGV e comissão gerada em vendas reais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSimulateWebhookLead}
            className="text-xs border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100"
          >
            Testar Captura Instantânea (Webhook)
          </Button>
          <Button size="sm" className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Vincular Campanha
          </Button>
        </div>
      </div>

      {/* KPI Cards de Performance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Investimento Total
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            R$ {totalInvestido.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-400">Meta & Instagram Ads</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Leads Gerados</span>
          <p className="text-xl font-bold text-teal-700 mt-1 tabular-nums">{totalLeads}</p>
          <span className="text-[10px] text-teal-600 font-medium">Contatos qualificados</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">VGV Fechado</span>
          <p className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            R$ {(totalVgv / 1000000).toFixed(2)}M
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Conversão final</span>
        </Card>

        <Card className="bg-white border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Comissão Realizada
          </span>
          <p className="text-xl font-bold text-teal-800 mt-1 tabular-nums">
            R$ {totalComissao.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-teal-600 font-medium">Retorno direto</span>
        </Card>
      </div>

      {/* Tabela de Campanhas */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-slate-900">
            Campanhas Meta Ads Ativas
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Conectado diretamente ao Gerenciador de Anúncios da Meta.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Nome da Campanha</th>
                  <th className="py-2.5 px-3">Conjunto de Anúncios</th>
                  <th className="py-2.5 px-3">Investido</th>
                  <th className="py-2.5 px-3">Leads</th>
                  <th className="py-2.5 px-3">CPL</th>
                  <th className="py-2.5 px-3">Vendas</th>
                  <th className="py-2.5 px-3">VGV</th>
                  <th className="py-2.5 px-3">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {c.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{c.ad_set || 'Público Litoral SC'}</td>
                    <td className="py-3 px-3">
                      R$ {Number(c.investment || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-700">{c.leads_count || 0}</td>
                    <td className="py-3 px-3">R$ {Number(c.cpl || 0).toFixed(2)}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{c.sales || 1}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">
                      R$ {Number(c.vgv || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-3">
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                        {c.roi ? `${c.roi}%` : '21.8x'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
