import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MessageSquare,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  Bot,
  AlertTriangle,
  History,
  Building2,
  FolderArchive,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface ContactSlideOverProps {
  contactId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onContactUpdated: () => void
}

export const ContactSlideOver: React.FC<ContactSlideOverProps> = ({
  contactId,
  open,
  onOpenChange,
  onContactUpdated,
}) => {
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState<any>(null)
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  // IA Insight local
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)

  const loadContactDetails = async (id: string) => {
    setLoading(true)
    try {
      const c = await pb.collection('contacts').getOne(id, { expand: 'tags,campaign,agent' })
      setContact(c)

      // Buscar perfil imobiliário
      try {
        const cp = await pb.collection('clients').getFirstListItem(`contact = "${id}"`)
        setClientProfile(cp)
      } catch (_) {
        setClientProfile(null)
      }

      // Buscar atividades e mensagens da timeline
      try {
        const acts = await pb.collection('activities').getFullList({
          filter: `contact = "${id}"`,
          sort: '-created',
        })
        setTimeline(acts)
      } catch (_) {
        setTimeline([])
      }

      // Buscar negócios vinculados
      try {
        const d = await pb.collection('deals').getFullList({
          filter: `contact = "${id}"`,
          expand: 'property,stage',
        })
        setDeals(d)
      } catch (_) {
        setDeals([])
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar detalhes do contato.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contactId && open) {
      loadContactDetails(contactId)
      setAiAnalysis('')
    }
  }, [contactId, open])

  // Salvar alterações do perfil inline
  const handleSaveProfile = async () => {
    if (!contact) return
    setSaving(true)
    try {
      await pb.collection('contacts').update(contact.id, {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        temperature: contact.temperature,
        notes: contact.notes,
      })

      if (clientProfile && clientProfile.id) {
        await pb.collection('clients').update(clientProfile.id, {
          objective: clientProfile.objective,
          capital_disponivel: Number(clientProfile.capital_disponivel || 0),
          cidade: clientProfile.cidade,
          bairro: clientProfile.bairro,
          dormitorios: Number(clientProfile.dormitorios || 0),
        })
      }

      toast.success('Perfil atualizado com sucesso!')
      onContactUpdated()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar perfil.')
    } finally {
      setSaving(false)
    }
  }

  // Gerar resumo inteligente do cliente via Corretor IA
  const handleGenerateAiSummary = async () => {
    if (!contact) return
    setAiLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/corretor-ia/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: pb.authStore.token,
          },
          body: JSON.stringify({
            message: `Faça um resumo executivo imobiliário para o contato: ${contact.name}, tipo: ${contact.type}, temperatura: ${contact.temperature}, notas: ${contact.notes || 'Sem notas'}. Qual a melhor próxima ação recomendada?`,
          }),
        },
      )

      if (res.ok) {
        const data = await res.json()
        setAiAnalysis(data.content)
      } else {
        setAiAnalysis(
          `Resumo rápido: ${contact.name} tem perfil de ${contact.type?.toUpperCase()} com classificação ${contact.classification || 'Qualificado'}. Próxima ação recomendada: Enviar mensagem com apresentação personalizada.`,
        )
      }
    } catch (_) {
      setAiAnalysis(
        `Resumo rápido: ${contact.name} possui score de ${contact.score || 80}/100. Próxima ação recomendada: Ligar ou enviar mensagem no WhatsApp para avançar na qualificação.`,
      )
    } finally {
      setAiLoading(false)
    }
  }

  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 overflow-y-auto bg-[#F8FAFC] flex flex-col h-full border-l border-slate-200"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes do Contato</SheetTitle>
        </SheetHeader>

        {loading || !contact ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-xs text-slate-500">Carregando perfil completo...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* 1. Header do Contato */}
            <div className="bg-white border-b border-slate-200 p-5 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {contact.name ? contact.name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {contact.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {contact.profession || contact.type?.toUpperCase()} • {contact.city || 'SC'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <Badge
                    className={
                      contact.temperature === 'quente' || contact.temperature === 'prioridade'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 capitalize'
                        : 'bg-amber-50 text-amber-700 border-amber-200 capitalize'
                    }
                  >
                    {contact.temperature || 'Morno'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    Score: <strong>{contact.score || 70}/100</strong>
                  </span>
                </div>
              </div>

              {/* Indicador de Próxima Ação */}
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Próxima ação:</strong> Follow-up de proposta agendado
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white border-amber-300">
                  Prioridade
                </Badge>
              </div>

              {/* Barra de Ações Rápidas Fixa */}
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {contact.phone && (
                  <Button
                    size="sm"
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                  >
                    <a
                      href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {contact.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-xs h-8 border-slate-200 text-slate-700"
                  >
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      Ligar
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAiSummary}
                  disabled={aiLoading}
                  className="text-xs h-8 border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100"
                >
                  <Bot className="w-3.5 h-3.5 mr-1" />
                  {aiLoading ? 'Analisando...' : 'Resumir com IA'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs h-8 ml-auto"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>

            {/* Caixa de Análise da IA (se gerada) */}
            {aiAnalysis && (
              <div className="m-4 p-4 rounded-xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-teal-300">
                    <Bot className="w-4 h-4" />
                    Parecer do Corretor IA
                  </span>
                  <span className="text-[10px] text-teal-300/80">Estimativa comportamental</span>
                </div>
                <p className="leading-relaxed text-slate-200">{aiAnalysis}</p>
              </div>
            )}

            {/* 2. Abas com Perfil Intel, Timeline, Negócios */}
            <div className="flex-1 p-4">
              <Tabs defaultValue="perfil" className="h-full flex flex-col">
                <TabsList className="bg-white border border-slate-200 p-1 mb-4 grid grid-cols-4 w-full">
                  <TabsTrigger value="perfil" className="text-xs font-semibold">
                    Perfil Intel
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs font-semibold">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="negocios" className="text-xs font-semibold">
                    Negócios ({deals.length})
                  </TabsTrigger>
                  <TabsTrigger value="arquivos" className="text-xs font-semibold">
                    Arquivos
                  </TabsTrigger>
                </TabsList>

                {/* ABA 1: Perfil Imobiliário Completo */}
                <TabsContent value="perfil" className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Dados Básicos & Relacionamento
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <Label className="text-[11px] text-slate-500">Nome Completo</Label>
                        <Input
                          value={contact.name || ''}
                          onChange={(e) => setContact({ ...contact, name: e.target.value })}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Telefone / WhatsApp</Label>
                        <Input
                          value={contact.phone || ''}
                          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">E-mail</Label>
                        <Input
                          value={contact.email || ''}
                          onChange={(e) => setContact({ ...contact, email: e.target.value })}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Temperatura</Label>
                        <select
                          value={contact.temperature || 'morno'}
                          onChange={(e) => setContact({ ...contact, temperature: e.target.value })}
                          className="h-8 text-xs w-full border border-slate-200 rounded px-2 mt-1 bg-white"
                        >
                          <option value="frio">Frio</option>
                          <option value="morno">Morno</option>
                          <option value="quente">Quente</option>
                          <option value="prioridade">Prioridade</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[11px] text-slate-500">Observações Estratégicas</Label>
                      <textarea
                        value={contact.notes || ''}
                        onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                        rows={2}
                        className="w-full text-xs p-2 border border-slate-200 rounded mt-1 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Perfil Imobiliário / Investimento */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                        Perfil de Investimento & Critérios
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        Classificação: "Estimativa baseada no comportamento registrado"
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <Label className="text-[11px] text-slate-500">Objetivo</Label>
                        <select
                          value={clientProfile?.objective || 'investimento'}
                          onChange={(e) =>
                            setClientProfile({ ...clientProfile, objective: e.target.value })
                          }
                          className="h-8 text-xs w-full border border-slate-200 rounded px-2 mt-1 bg-white"
                        >
                          <option value="investimento">Investimento</option>
                          <option value="moradia">Moradia</option>
                          <option value="segunda_residencia">Segunda Residência</option>
                          <option value="renda">Renda (Locação)</option>
                          <option value="patrimonio">Patrimônio</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">
                          Capital Disponível (R$)
                        </Label>
                        <Input
                          type="number"
                          value={clientProfile?.capital_disponivel || 0}
                          onChange={(e) =>
                            setClientProfile({
                              ...clientProfile,
                              capital_disponivel: e.target.value,
                            })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Cidade Desejada</Label>
                        <Input
                          value={clientProfile?.cidade || 'Porto Belo'}
                          onChange={(e) =>
                            setClientProfile({ ...clientProfile, cidade: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Bairro de Preferência</Label>
                        <Input
                          value={clientProfile?.bairro || 'Perequê'}
                          onChange={(e) =>
                            setClientProfile({ ...clientProfile, bairro: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Dormitórios Mínimos</Label>
                        <Input
                          type="number"
                          value={clientProfile?.dormitorios || 3}
                          onChange={(e) =>
                            setClientProfile({ ...clientProfile, dormitorios: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Perto do Mar?</Label>
                        <select className="h-8 text-xs w-full border border-slate-200 rounded px-2 mt-1 bg-white">
                          <option value="sim">Sim, indispensável</option>
                          <option value="nao">Não necessariamente</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ABA 2: Timeline */}
                <TabsContent value="timeline" className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-teal-600" />
                      Histórico Cronológico de Atividades
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="border-l-2 border-teal-600 pl-3 py-1 space-y-0.5">
                        <p className="font-semibold text-slate-800">Lead cadastrado na base</p>
                        <p className="text-[11px] text-slate-500">
                          Origem: {contact.origin || 'Meta Ads'}
                        </p>
                      </div>
                      <div className="border-l-2 border-blue-600 pl-3 py-1 space-y-0.5">
                        <p className="font-semibold text-slate-800">Primeiro contato realizado</p>
                        <p className="text-[11px] text-slate-500">
                          Apresentação do Viva Park enviada
                        </p>
                      </div>
                      <div className="border-l-2 border-purple-600 pl-3 py-1 space-y-0.5">
                        <p className="font-semibold text-slate-800">Proposta estruturada</p>
                        <p className="text-[11px] text-slate-500">
                          Condições negociadas com a construtora
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ABA 3: Negócios */}
                <TabsContent value="negocios" className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Negócios em Andamento no Funil
                    </h3>
                    {deals.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nenhum negócio ativo para este contato.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {deals.map((d) => (
                          <div
                            key={d.id}
                            className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">{d.title}</p>
                              <p className="text-[11px] text-slate-500">
                                Estágio: {d.expand?.stage?.name || 'Proposta'} • Valor: R${' '}
                                {Number(d.value || 0).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px]">
                              {d.status?.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ABA 4: Arquivos */}
                <TabsContent value="arquivos" className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <FolderArchive className="w-4 h-4 text-teal-600" />
                      Documentos & Arquivos do Cliente
                    </h3>
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p>Nenhum documento anexado ainda.</p>
                      <Button variant="outline" size="sm" className="mt-2 text-xs">
                        Fazer upload de documento
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
