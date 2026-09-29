import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  GitBranch,
  Plus,
  Flame,
  Clock,
  ArrowRight,
  Settings,
  MoreVertical,
  Calendar,
  Building2,
  DollarSign,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Funis() {
  const [pipelines, setPipelines] = useState<any[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('')
  const [stages, setStages] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Novo Negócio
  const [newDealOpen, setNewDealOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContactId, setNewContactId] = useState('')
  const [newPropertyId, setNewPropertyId] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newStageId, setNewStageId] = useState('')
  const [newNextAction, setNewNextAction] = useState('')
  const [saving, setSaving] = useState(false)

  // Drag and drop state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [pipeRes, contactRes, propRes] = await Promise.all([
        pb.collection('pipelines').getFullList({ sort: 'created' }),
        pb.collection('contacts').getFullList({ sort: 'name' }),
        pb.collection('properties').getFullList({ sort: 'title' }),
      ])

      setPipelines(pipeRes)
      setContacts(contactRes)
      setProperties(propRes)

      const defaultPipe = pipeRes.find((p) => p.is_default) || pipeRes[0]
      const activePipeId = selectedPipelineId || defaultPipe?.id
      setSelectedPipelineId(activePipeId)

      if (activePipeId) {
        await loadPipelineStagesAndDeals(activePipeId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadPipelineStagesAndDeals = async (pipeId: string) => {
    try {
      const stgRes = await pb.collection('stages').getFullList({
        filter: `pipeline = "${pipeId}"`,
        sort: 'order',
      })
      setStages(stgRes)

      const dlRes = await pb.collection('deals').getFullList({
        filter: `pipeline = "${pipeId}"`,
        expand: 'contact,property,stage',
        sort: '-created',
      })
      setDeals(dlRes)

      if (stgRes.length > 0 && !newStageId) {
        setNewStageId(stgRes[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedPipelineId) {
      loadPipelineStagesAndDeals(selectedPipelineId)
    }
  }, [selectedPipelineId])

  useRealtime('deals', () => {
    if (selectedPipelineId) loadPipelineStagesAndDeals(selectedPipelineId)
  })

  // Mover negócio entre etapas (Drag & Drop com auditoria)
  const handleDropToStage = async (targetStageId: string) => {
    if (!draggedDealId) return

    try {
      const dealToMove = deals.find((d) => d.id === draggedDealId)
      if (!dealToMove || dealToMove.stage === targetStageId) return

      const previousStage = dealToMove.stage

      // Atualização otimista
      setDeals((prev) =>
        prev.map((d) => (d.id === draggedDealId ? { ...d, stage: targetStageId } : d)),
      )

      await pb.collection('deals').update(draggedDealId, {
        stage: targetStageId,
        status: 'ativo',
      })

      // Registro de Auditoria
      try {
        await pb.collection('audit_logs').create({
          action: 'deal.stage_changed',
          entity_type: 'deal',
          entity_id: draggedDealId,
          previous: { stage: previousStage },
          new_state: { stage: targetStageId },
        })
      } catch {
        /* intentionally ignored */
      }

      toast.success('Oportunidade movida no funil!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao mover negócio.')
      if (selectedPipelineId) loadPipelineStagesAndDeals(selectedPipelineId)
    } finally {
      setDraggedDealId(null)
    }
  }

  // Criar novo negócio
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactId || !selectedPipelineId) {
      toast.error('Selecione ao menos o cliente.')
      return
    }

    setSaving(true)
    try {
      await pb.collection('deals').create({
        title: newTitle.trim(),
        contact: newContactId,
        property: newPropertyId || null,
        pipeline: selectedPipelineId,
        stage: newStageId || stages[0]?.id,
        value: Number(newValue) || 0,
        status: 'ativo',
        next_action_type: newNextAction.trim() || 'Primeiro contato de alinhamento',
        next_action_at: new Date(Date.now() + 86400000).toISOString(),
      })

      toast.success('Negócio criado com sucesso no funil!')
      setNewDealOpen(false)
      setNewTitle('')
      setNewValue('')
      setNewNextAction('')
      if (selectedPipelineId) loadPipelineStagesAndDeals(selectedPipelineId)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar negócio.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-500">Montando funis de venda...</p>
      </div>
    )
  }

  const activePipe = pipelines.find((p) => p.id === selectedPipelineId)

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Modal Novo Negócio */}
      <Dialog open={newDealOpen} onOpenChange={setNewDealOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Nova Oportunidade no Funil
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
            <div>
              <Label className="text-slate-600">Título do Negócio</Label>
              <Input
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Investimento Viva Park - Dr. Roberto"
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-600">Cliente / Lead Vinculado</Label>
              <select
                required
                value={newContactId}
                onChange={(e) => setNewContactId(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
              >
                <option value="">Selecione o contato...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-600">Imóvel de Interesse (Opcional)</Label>
              <select
                value={newPropertyId}
                onChange={(e) => setNewPropertyId(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
              >
                <option value="">Nenhum imóvel específico</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} - R$ {Number(p.price || 0).toLocaleString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Valor Estimado (R$)</Label>
                <Input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="1850000"
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Etapa Inicial</Label>
                <select
                  value={newStageId}
                  onChange={(e) => setNewStageId(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-slate-600">Próxima Ação Imediata</Label>
              <Input
                value={newNextAction}
                onChange={(e) => setNewNextAction(e.target.value)}
                placeholder="Ex: Agendar videoconferência para apresentar tabela"
                className="text-xs mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewDealOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0F766E] text-white text-xs hover:bg-[#0D5C56]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar Oportunidade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header com Seletor de Múltiplos Funis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pipeline & Kanban de Vendas
            </h1>
            <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-xs">
              {activePipe?.name || 'Comprador'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Arraste os cartões entre as etapas do funil para atualizar a jornada e registrar
            auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor dos 3 Funis Padrão */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            {pipelines.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPipelineId(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  selectedPipelineId === p.id
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => setNewDealOpen(true)}
            className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Kanban Board com Colunas por Etapa */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1200px]">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id)
            const totalStageValue = stageDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0)

            return (
              <div
                key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropToStage(stage.id)}
                className="w-72 bg-slate-100/80 rounded-xl p-3 flex flex-col shrink-0 border border-slate-200/60 max-h-[75vh]"
              >
                {/* Cabeçalho da Etapa */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color || '#0F766E' }}
                    />
                    <h3 className="text-xs font-bold text-slate-800">{stage.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-slate-500 font-mono">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    R$ {(totalStageValue / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Lista de Cards da Etapa */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageDeals.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-[11px] text-slate-400">
                      Nenhum negócio aqui
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => setDraggedDealId(deal.id)}
                        className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-md cursor-grab active:cursor-grabbing transition group select-none space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                            {deal.title}
                          </p>
                          <Badge
                            className={
                              deal.status === 'ganho'
                                ? 'bg-emerald-50 text-emerald-700 text-[9px]'
                                : 'bg-slate-100 text-slate-600 text-[9px]'
                            }
                          >
                            {deal.status}
                          </Badge>
                        </div>

                        {/* Valor e Cliente */}
                        <div className="text-xs flex items-center justify-between">
                          <span className="font-bold text-emerald-700">
                            R$ {Number(deal.value || 0).toLocaleString('pt-BR')}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                            {deal.expand?.contact?.name || 'Cliente'}
                          </span>
                        </div>

                        {/* Indicador de Próxima Ação */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-amber-700 font-medium truncate">
                            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">
                              {deal.next_action_type || 'Aguardando contato'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
