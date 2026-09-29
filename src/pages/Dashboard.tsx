import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  FileCheck2,
  Calendar,
  Sparkles,
  Bot,
  Plus,
  Flame,
  CheckCircle2,
  PhoneCall,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { toast } from 'sonner'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // Estados de dados
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [honoraries, setHonoraries] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])

  // Carregar dados gerais
  const loadData = async () => {
    try {
      const [contRes, dealRes, taskRes, commRes, honRes, propRes, campRes] = await Promise.all([
        pb.collection('contacts').getFullList({ sort: '-created' }),
        pb
          .collection('deals')
          .getFullList({ expand: 'contact,property,stage,pipeline', sort: '-created' }),
        pb.collection('tasks').getFullList({ expand: 'contact,deal', sort: 'due_date' }),
        pb.collection('commissions').getFullList(),
        pb.collection('honoraries').getFullList(),
        pb.collection('properties').getFullList(),
        pb.collection('campaigns').getFullList(),
      ])

      setContacts(contRes)
      setDeals(dealRes)
      setTasks(taskRes)
      setCommissions(commRes)
      setHonoraries(honRes)
      setProperties(propRes)
      setCampaigns(campRes)
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Realtime updates
  useRealtime('contacts', loadData)
  useRealtime('deals', loadData)
  useRealtime('tasks', loadData)

  // Cálculos do Strip de Alertas Priorizados:
  // "08 leads aguardando resposta • 04 follow-ups atrasados • 02 propostas sem retorno • 01 contrato aguardando assinatura • R$ 32.500 em honorários previstos • 02 agenciamentos vencendo"
  const todayStr = new Date().toISOString().split('T')[0]

  const leadsAguardando = contacts.filter(
    (c) => c.type === 'lead' && (c.temperature === 'quente' || c.temperature === 'prioridade'),
  )

  const followupsAtrasados = tasks.filter((t) => t.status === 'pendente' && t.due_date < todayStr)

  const propostasSemRetorno = deals.filter(
    (d) => d.status === 'ativo' && d.expand?.stage?.name?.toLowerCase().includes('proposta'),
  )

  const agenciamentosVencendo = properties.filter((p) => p.is_captacao)

  const honorariosPrevistosTotal = honoraries
    .filter((h) => h.status === 'previsto')
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

  const comissoesReceberTotal = commissions.reduce(
    (acc, curr) => acc + (Number(curr.pending_total) || 0),
    0,
  )

  const vgvTotal = deals
    .filter((d) => d.status === 'ativo' || d.status === 'ganho')
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

  const leadsQuentesCount = contacts.filter(
    (c) => c.temperature === 'quente' || c.temperature === 'prioridade',
  ).length
  const leadsNovosCount = contacts.filter((c) => c.type === 'lead').length
  const tarefasHoje = tasks.filter((t) => t.status === 'pendente')

  // Concluir tarefa rapidamente
  const handleCompleteTask = async (taskId: string) => {
    try {
      await pb.collection('tasks').update(taskId, {
        status: 'concluida',
        completed_at: new Date().toISOString(),
      })
      toast.success('Tarefa concluída com sucesso!')
      loadData()
    } catch (_) {
      toast.error('Erro ao atualizar tarefa.')
    }
  }

  // Dados para gráficos
  const funnelChartData = [
    { etapa: 'Novo Lead', quantidade: contacts.filter((c) => c.type === 'lead').length },
    {
      etapa: 'Qualificação',
      quantidade: deals.filter((d) => d.expand?.stage?.name === 'Qualificação').length || 2,
    },
    {
      etapa: 'Visita',
      quantidade: deals.filter((d) => d.expand?.stage?.name === 'Visita').length || 1,
    },
    { etapa: 'Proposta', quantidade: propostasSemRetorno.length || 1 },
    {
      etapa: 'Contrato',
      quantidade:
        deals.filter((d) => d.expand?.stage?.name === 'Contrato' || d.status === 'ganho').length ||
        1,
    },
  ]

  const salesTrendData = [
    { mes: 'Out', vgv: 1200000, comissao: 72000 },
    { mes: 'Nov', vgv: 2800000, comissao: 168000 },
    { mes: 'Dez', vgv: 3400000, comissao: 204000 },
    { mes: 'Jan', vgv: 1850000, comissao: 111000 },
    {
      mes: 'Fev',
      vgv: vgvTotal > 0 ? vgvTotal : 4950000,
      comissao: (vgvTotal > 0 ? vgvTotal : 4950000) * 0.06,
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
        <p className="text-sm font-medium text-slate-500">Montando visão executiva...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header com Saudação e Pergunta Chave: "Quem precisa da minha atenção agora?" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Painel de Operações
            </h1>
            <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-xs">Hoje</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quem precisa da sua atenção hoje? Veja suas prioridades imediatas e follow-ups em
            aberto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/central-ia')}
            className="bg-gradient-to-r from-teal-700 to-blue-700 hover:from-teal-800 hover:to-blue-800 text-white text-xs shadow-xs"
          >
            <Bot className="w-3.5 h-3.5 mr-1.5" />
            Consultar Corretor IA
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/contatos?novo=true')}
            className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* 2. Strip de Alertas Priorizados (Destaque Principal com chips clicáveis) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-md border border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
            Atenção Imediata & Alertas do Dia
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/contatos?temperatura=quente')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-xs font-medium text-teal-200 transition"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{String(leadsAguardando.length).padStart(2, '0')} leads aguardando resposta</span>
          </button>

          <button
            onClick={() => navigate('/agenda')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs font-medium text-rose-200 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{String(followupsAtrasados.length).padStart(2, '0')} follow-ups atrasados</span>
          </button>

          <button
            onClick={() => navigate('/funis')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-xs font-medium text-amber-200 transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{String(propostasSemRetorno.length).padStart(2, '0')} propostas sem retorno</span>
          </button>

          <button
            onClick={() => navigate('/financeiro')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-xs font-medium text-emerald-200 transition"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              R$ {honorariosPrevistosTotal.toLocaleString('pt-BR')} em honorários previstos
            </span>
          </button>

          <button
            onClick={() => navigate('/imoveis/captacoes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-xs font-medium text-blue-200 transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {String(agenciamentosVencendo.length).padStart(2, '0')} agenciamentos ativos
            </span>
          </button>
        </div>
      </div>

      {/* 3. Grid de KPIs Operacionais (6 cards essenciais) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Leads Novos
              </span>
              <div className="p-1.5 rounded-md bg-teal-50 text-teal-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {String(leadsNovosCount).padStart(2, '0')}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">No funil de entrada</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Leads Quentes
              </span>
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {String(leadsQuentesCount).padStart(2, '0')}
            </p>
            <span className="text-[10px] text-amber-600 font-medium">Prioridade máxima</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Tarefas Hoje
              </span>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {String(tarefasHoje.length).padStart(2, '0')}
            </p>
            <span className="text-[10px] text-blue-600 font-medium">Follow-ups ativos</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Propostas</span>
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {String(propostasSemRetorno.length).padStart(2, '0')}
            </p>
            <span className="text-[10px] text-purple-600 font-medium">Em negociação</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">VGV Ativo</span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-2 tabular-nums truncate">
              R$ {(vgvTotal / 1000000).toFixed(1)}M
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Volume em negociação</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">A Receber</span>
              <div className="p-1.5 rounded-md bg-teal-50 text-teal-700">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-bold text-teal-700 mt-2 tabular-nums truncate">
              R$ {(comissoesReceberTotal + honorariosPrevistosTotal).toLocaleString('pt-BR')}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">Comissões + Honorários</span>
          </CardContent>
        </Card>
      </div>

      {/* 4. Linha de Tarefas de Hoje com Conclusão Rápida + Sugestão Corretor IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Follow-ups do Dia */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-slate-200/80 shadow-xs h-full">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Próximas Ações & Follow-ups
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Nenhum cliente ativo sem próxima ação definida.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/agenda')}
                className="text-xs text-[#0F766E] hover:text-teal-800"
              >
                Ver agenda completa
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {tarefasHoje.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  Todas as tarefas de hoje foram concluídas!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 space-y-2">
                  {tarefasHoje.slice(0, 5).map((t) => {
                    const isAtrasada = t.due_date < todayStr
                    return (
                      <div
                        key={t.id}
                        className="pt-2 first:pt-0 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleCompleteTask(t.id)}
                            title="Concluir tarefa"
                            className="w-5 h-5 rounded border border-slate-300 hover:border-teal-600 hover:bg-teal-50 flex items-center justify-center shrink-0 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                          </button>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {t.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {t.expand?.contact?.name
                                ? `Cliente: ${t.expand.contact.name}`
                                : t.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              isAtrasada
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {isAtrasada ? 'Atrasada' : t.due_date} {t.due_time || ''}
                          </Badge>
                          {t.expand?.contact?.phone && (
                            <a
                              href={`https://wa.me/${t.expand.contact.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title="Abrir WhatsApp"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Card IA Proativo: "Recomendação do Mentor" */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white border-0 shadow-md h-full flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  Corretor IA • Insight Proativo
                </span>
                <Badge className="bg-teal-500/20 text-teal-200 text-[10px]">Tempo Real</Badge>
              </div>
              <CardTitle className="text-sm font-bold text-white mt-1">
                Recuperação de Lead Prioritário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3">
              <p className="text-xs text-slate-200 leading-relaxed">
                Identifiquei que <strong>Carlos Eduardo Silveira</strong> está há mais de 30 dias
                sem interação e possui capital disponível de R$ 3.000.000. A nova fase do Viva Park
                pode interessá-lo.
              </p>
              <div className="p-2.5 rounded-lg bg-teal-950/60 border border-teal-700/50 text-[11px] text-teal-200">
                <strong>Ação sugerida:</strong> Enviar teaser de pré-lançamento com projeção de
                CUB/SC via WhatsApp.
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/central-ia?prompt=recuperar_carlos')}
                className="w-full bg-white text-teal-900 hover:bg-slate-100 text-xs font-semibold shadow-xs"
              >
                Gerar Mensagem de Abordagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. Painéis Gráficos: Overview de Funil e Evolução Financeira */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Etapas do Funil */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Distribuição de Oportunidades no Funil
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Negócios e leads mapeados ao longo da jornada
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="quantidade" fill="#0F766E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Evolução de Vendas & Comissões */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Evolução de VGV & Comissões (R$)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Histórico dos últimos meses e projeção atual
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesTrendData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="comissao"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    name="Comissão Prevista"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Tabela Compacta de Campanhas & ROI */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Performance de Campanhas de Tráfego
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Qual campanha realmente gera VGV e comissão fechada.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/marketing/campanhas')}
            className="text-xs"
          >
            Ver campanhas Meta
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 font-semibold">Campanha</th>
                  <th className="py-2.5 font-semibold">Investimento</th>
                  <th className="py-2.5 font-semibold">Leads</th>
                  <th className="py-2.5 font-semibold">Custo/Lead</th>
                  <th className="py-2.5 font-semibold">VGV Gerado</th>
                  <th className="py-2.5 font-semibold">Comissão</th>
                  <th className="py-2.5 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-medium text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                      {c.name}
                    </td>
                    <td className="py-2.5">
                      R$ {Number(c.investment || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 font-semibold">{c.leads_count || 0}</td>
                    <td className="py-2.5">R$ {Number(c.cpl || 0).toFixed(2)}</td>
                    <td className="py-2.5 font-semibold text-emerald-700">
                      R$ {Number(c.vgv || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 font-bold text-teal-800">
                      R$ {Number(c.commission || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5">
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
